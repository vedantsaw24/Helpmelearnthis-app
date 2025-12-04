import { NextRequest } from "next/server";

// Rate limiting storage (in production, use Redis or a database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitConfig {
    windowMs: number; // Time window in milliseconds
    maxRequests: number; // Maximum requests per window
    keyGenerator?: (req: NextRequest, userId?: string) => string; // Custom key generator
    skipSuccessfulRequests?: boolean; // Don't count successful requests
    skipFailedRequests?: boolean; // Don't count failed requests
}

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
}

/**
 * Rate limiter class for managing API request limits
 */
export class RateLimiter {
    constructor(private config: RateLimitConfig) {}

    /**
     * Check if a request should be allowed
     */
    checkLimit(key: string): RateLimitResult {
        const now = Date.now();
        const windowStart = now - this.config.windowMs;

        // Clean up expired entries
        this.cleanup(windowStart);

        const entry = rateLimitStore.get(key);

        if (!entry || entry.resetTime <= now) {
            // First request in window or window has reset
            const resetTime = now + this.config.windowMs;
            rateLimitStore.set(key, { count: 1, resetTime });

            return {
                success: true,
                limit: this.config.maxRequests,
                remaining: this.config.maxRequests - 1,
                resetTime,
            };
        }

        if (entry.count >= this.config.maxRequests) {
            // Rate limit exceeded
            return {
                success: false,
                limit: this.config.maxRequests,
                remaining: 0,
                resetTime: entry.resetTime,
                retryAfter: Math.ceil((entry.resetTime - now) / 1000),
            };
        }

        // Increment count
        entry.count++;
        rateLimitStore.set(key, entry);

        return {
            success: true,
            limit: this.config.maxRequests,
            remaining: this.config.maxRequests - entry.count,
            resetTime: entry.resetTime,
        };
    }

    /**
     * Generate rate limit key based on request
     */
    generateKey(req: NextRequest, userId?: string): string {
        if (this.config.keyGenerator) {
            return this.config.keyGenerator(req, userId);
        }

        // Default: use user ID if available, otherwise IP
        if (userId) {
            return `user:${userId}`;
        }

        // Get IP address
        const ip =
            req.headers.get("x-forwarded-for") ||
            req.headers.get("x-real-ip") ||
            "unknown";

        return `ip:${ip}`;
    }

    /**
     * Clean up expired rate limit entries
     */
    private cleanup(cutoff: number): void {
        for (const [key, entry] of rateLimitStore.entries()) {
            if (entry.resetTime <= cutoff) {
                rateLimitStore.delete(key);
            }
        }
    }
}

/**
 * Pre-configured rate limiters for different use cases
 */
export const rateLimiters = {
    // Strict rate limiting for AI API calls
    aiGeneration: new RateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 10, // 10 AI requests per 15 minutes per user
    }),

    // General API rate limiting
    general: new RateLimiter({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 30, // 30 requests per minute per user
    }),

    // Authentication rate limiting
    auth: new RateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5, // 5 auth attempts per 15 minutes per IP
    }),

    // File upload rate limiting
    fileUpload: new RateLimiter({
        windowMs: 5 * 60 * 1000, // 5 minutes
        maxRequests: 3, // 3 file uploads per 5 minutes per user
    }),
};

/**
 * Rate limiting middleware for Next.js API routes
 */
export function withRateLimit(
    handler: (req: NextRequest, ...args: any[]) => Promise<Response>,
    limiter: RateLimiter,
    getUserId?: (req: NextRequest) => Promise<string | null>
) {
    return async (req: NextRequest, ...args: any[]): Promise<Response> => {
        try {
            // Get user ID if available
            const userId = getUserId ? await getUserId(req) : null;

            // Generate rate limit key
            const key = limiter.generateKey(req, userId || undefined);

            // Check rate limit
            const result = limiter.checkLimit(key);

            if (!result.success) {
                return new Response(
                    JSON.stringify({
                        error: "Rate limit exceeded",
                        message: `Too many requests. Try again in ${result.retryAfter} seconds.`,
                        retryAfter: result.retryAfter,
                    }),
                    {
                        status: 429,
                        headers: {
                            "Content-Type": "application/json",
                            "X-RateLimit-Limit": result.limit.toString(),
                            "X-RateLimit-Remaining":
                                result.remaining.toString(),
                            "X-RateLimit-Reset": new Date(
                                result.resetTime
                            ).toISOString(),
                            "Retry-After":
                                result.retryAfter?.toString() || "60",
                        },
                    }
                );
            }

            // Call the original handler
            const response = await handler(req, ...args);

            // Add rate limit headers to successful responses
            response.headers.set("X-RateLimit-Limit", result.limit.toString());
            response.headers.set(
                "X-RateLimit-Remaining",
                result.remaining.toString()
            );
            response.headers.set(
                "X-RateLimit-Reset",
                new Date(result.resetTime).toISOString()
            );

            return response;
        } catch (error) {
            console.error("Rate limiting error:", error);
            // On error, allow the request through but log the issue
            return handler(req, ...args);
        }
    };
}

/**
 * Rate limiting for server actions
 */
export async function checkServerActionRateLimit(
    userId: string | null,
    action: string,
    limiter: RateLimiter = rateLimiters.aiGeneration
): Promise<{ allowed: boolean; message?: string; retryAfter?: number }> {
    try {
        const key = userId ? `user:${userId}:${action}` : `anonymous:${action}`;
        const result = limiter.checkLimit(key);

        if (!result.success) {
            return {
                allowed: false,
                message: `Rate limit exceeded for ${action}. Try again in ${result.retryAfter} seconds.`,
                retryAfter: result.retryAfter,
            };
        }

        return { allowed: true };
    } catch (error) {
        console.error("Server action rate limiting error:", error);
        // On error, allow the action
        return { allowed: true };
    }
}
