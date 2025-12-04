# 🛡️ Rate Limiting Implementation Guide

This guide shows you how to implement comprehensive rate limiting in your Next.js app to protect your Gemini API from abuse.

## 📋 Overview

The rate limiting system includes:

-   **In-memory rate limiting** for development
-   **User-based and IP-based rate limiting**
-   **Different limits for different actions**
-   **Client-side integration with React hooks**
-   **Graceful error handling**

## 🚀 Quick Start

### 1. Basic Server Action Rate Limiting

Your `generateQuizAction` is already updated with rate limiting:

```typescript
// In your component
import { useRateLimit } from "@/hooks/use-rate-limit";

function MyComponent() {
    const { addUserIdToFormData, handleRateLimitError } = useRateLimit();

    const handleSubmit = async (formData: FormData) => {
        // Add user ID for tracking
        const formDataWithUser = addUserIdToFormData(formData);

        const result = await generateQuizAction(null, formDataWithUser);

        if (result.retryAfter) {
            handleRateLimitError(result);
            // Show user-friendly message
        }
    };
}
```

### 2. Display Rate Limit Status

```typescript
import { RateLimitStatus } from "@/components/rate-limit-status";

function MyForm() {
    return (
        <div>
            <RateLimitStatus />
            {/* Your form */}
        </div>
    );
}
```

## ⚙️ Configuration

### Rate Limit Presets

```typescript
// Current configurations
rateLimiters = {
  // AI Generation: 10 requests per 15 minutes per user
  aiGeneration: 10 requests / 15 minutes

  // General API: 30 requests per minute per user
  general: 30 requests / 1 minute

  // Authentication: 5 attempts per 15 minutes per IP
  auth: 5 requests / 15 minutes

  // File Upload: 3 uploads per 5 minutes per user
  fileUpload: 3 requests / 5 minutes
}
```

### Custom Rate Limiter

```typescript
import { RateLimiter } from "@/lib/rate-limiter";

const customLimiter = new RateLimiter({
    windowMs: 10 * 60 * 1000, // 10 minutes
    maxRequests: 5, // 5 requests max
    keyGenerator: (req, userId) => `custom:${userId || "anon"}`, // Custom key
});
```

## 🔧 Implementation Details

### 1. Server Actions (Current Implementation)

```typescript
// actions.ts
export async function generateQuizAction(prevState: any, formData: FormData) {
    const userId = (formData.get("userId") as string) || null;

    // Check rate limit
    const rateLimitCheck = await checkServerActionRateLimit(
        userId,
        "generateQuiz",
        rateLimiters.aiGeneration
    );

    if (!rateLimitCheck.allowed) {
        return {
            type: "error",
            message: rateLimitCheck.message,
            retryAfter: rateLimitCheck.retryAfter, // seconds
        };
    }

    // Your existing logic...
}
```

### 2. API Routes (Next.js App Router)

```typescript
// api/your-endpoint/route.ts
import { withRateLimit, rateLimiters } from "@/lib/rate-limiter";

const handler = async (req: NextRequest) => {
    // Your API logic
    return Response.json({ success: true });
};

export const POST = withRateLimit(
    handler,
    rateLimiters.general,
    getUserIdFromRequest
);
```

### 3. Client-Side Integration

```typescript
"use client";
import { useRateLimit } from "@/hooks/use-rate-limit";

function QuizGenerator() {
    const { isRateLimited, addUserIdToFormData, handleRateLimitError } =
        useRateLimit();

    const handleSubmit = async (formData: FormData) => {
        if (isRateLimited) {
            toast.error("Rate limit exceeded. Please wait.");
            return;
        }

        const formDataWithUser = addUserIdToFormData(formData);
        const result = await generateQuizAction(null, formDataWithUser);

        if (result.retryAfter) {
            handleRateLimitError(result);
        }
    };

    return (
        <form action={handleSubmit}>
            <RateLimitStatus />
            <Button disabled={isRateLimited}>Generate Quiz</Button>
        </form>
    );
}
```

## 🔒 Security Features

### 1. Multiple Rate Limiting Strategies

-   **Per User**: Authenticated users tracked by UID
-   **Per IP**: Anonymous users tracked by IP address
-   **Per Action**: Different limits for different operations
-   **Combined**: User + IP for extra security

### 2. Rate Limit Headers

API responses include standard rate limit headers:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 2024-01-01T12:00:00Z
Retry-After: 45
```

### 3. Graceful Degradation

-   **Client-side caching** of rate limit state
-   **Progressive disclosure** of features based on limits
-   **User-friendly error messages** with retry timers

## 📈 Monitoring & Analytics

### Track Rate Limit Events

```typescript
// Add to your analytics
function trackRateLimit(userId: string, action: string, retryAfter: number) {
    analytics.track("Rate Limit Hit", {
        userId,
        action,
        retryAfter,
        timestamp: new Date().toISOString(),
    });
}
```

### Rate Limit Metrics

Monitor these metrics:

-   **Rate limit hit rate** by user/IP
-   **Peak usage patterns** by time of day
-   **Most limited actions** to adjust limits
-   **User behavior** after hitting limits

## 🚀 Production Considerations

### 1. Upgrade to Redis/Database

For production, replace in-memory storage:

```typescript
// redis-rate-limiter.ts
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

export class RedisRateLimiter {
    async checkLimit(key: string): Promise<RateLimitResult> {
        const current = await redis.incr(key);
        if (current === 1) {
            await redis.expire(key, this.config.windowMs / 1000);
        }
        // ... implementation
    }
}
```

### 2. Environment-Based Limits

```typescript
// config/rate-limits.ts
const rateLimits = {
    development: {
        aiGeneration: { windowMs: 60000, maxRequests: 100 }, // Very lenient
    },
    production: {
        aiGeneration: { windowMs: 900000, maxRequests: 10 }, // Strict
    },
};

export const getCurrentLimits = () =>
    rateLimits[process.env.NODE_ENV as keyof typeof rateLimits] ||
    rateLimits.production;
```

### 3. Advanced Features

-   **Burst allowance** for occasional heavy usage
-   **User tier-based limits** (premium users get more)
-   **Dynamic adjustment** based on system load
-   **Whitelist trusted IPs** (your own services)

## ⚡ Performance Tips

1. **Cleanup expired entries** regularly
2. **Use background cleanup** for better performance
3. **Cache user authentication** to avoid repeated lookups
4. **Batch rate limit checks** for bulk operations

## 🧪 Testing Rate Limits

```typescript
// test-rate-limits.ts
describe("Rate Limiting", () => {
    it("should block after exceeding limit", async () => {
        // Make 10 requests quickly
        for (let i = 0; i < 10; i++) {
            await generateQuizAction(null, formData);
        }

        // 11th request should be blocked
        const result = await generateQuizAction(null, formData);
        expect(result.retryAfter).toBeDefined();
    });
});
```

## 🔧 Customization Examples

### Different Limits by User Type

```typescript
const getUserRateLimit = (user: User) => {
    if (user.isPremium) {
        return { windowMs: 900000, maxRequests: 50 }; // 50 per 15 min
    }
    return { windowMs: 900000, maxRequests: 10 }; // 10 per 15 min
};
```

### Time-Based Dynamic Limits

```typescript
const getTimeBasedLimit = () => {
    const hour = new Date().getHours();
    const isPeakHours = hour >= 9 && hour <= 17; // 9 AM - 5 PM

    return isPeakHours
        ? { windowMs: 900000, maxRequests: 5 } // Stricter during peak
        : { windowMs: 900000, maxRequests: 15 }; // More lenient off-peak
};
```

---

## 🎯 Current Status

✅ **Implemented:**

-   Server action rate limiting for `generateQuizAction`
-   Client-side React hooks for rate limit handling
-   Rate limit status display component
-   Basic in-memory rate limiting

🔜 **Next Steps:**

1. Test the implementation with your current setup
2. Add rate limiting to other server actions if needed
3. Consider upgrading to Redis for production
4. Add rate limit monitoring/analytics

This implementation will protect your Gemini API from abuse while providing a smooth user experience!
