import { NextRequest } from "next/server";
import { auth } from "@/lib/firebase";
import { getAuth } from "firebase-admin/auth";

/**
 * Extract user ID from Firebase Auth token in the request
 */
export async function getUserIdFromRequest(
    req: NextRequest
): Promise<string | null> {
    try {
        // Try to get the Authorization header
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        const token = authHeader.split("Bearer ")[1];
        if (!token) {
            return null;
        }

        // Verify the token with Firebase Admin (you'll need to set up Firebase Admin)
        // For now, we'll use a simpler approach with client-side auth state
        // In production, you should verify the token server-side

        return null; // We'll get user ID differently for server actions
    } catch (error) {
        console.error("Error extracting user ID from request:", error);
        return null;
    }
}

/**
 * Get current user ID from Auth context (for server actions)
 */
export async function getCurrentUserId(): Promise<string | null> {
    try {
        // This will be called from server actions where we have access to the user context
        // We'll pass the user ID directly from the client
        return null;
    } catch (error) {
        console.error("Error getting current user ID:", error);
        return null;
    }
}

/**
 * Rate limit key generators for different scenarios
 */
export const keyGenerators = {
    // User-based key (preferred when user is authenticated)
    userBased: (req: NextRequest, userId?: string) => {
        if (userId) return `user:${userId}`;
        return ipBased(req);
    },

    // IP-based key (fallback for anonymous users)
    ipBased: (req: NextRequest) => {
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0] ||
            req.headers.get("x-real-ip") ||
            req.headers.get("cf-connecting-ip") || // Cloudflare
            req.headers.get("x-client-ip") ||
            "unknown";
        return `ip:${ip.trim()}`;
    },

    // Combined key (user + IP for extra security)
    combined: (req: NextRequest, userId?: string) => {
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0] ||
            req.headers.get("x-real-ip") ||
            "unknown";
        return userId ? `user:${userId}:ip:${ip.trim()}` : `ip:${ip.trim()}`;
    },

    // Action-based key (different limits for different actions)
    actionBased: (action: string) => (req: NextRequest, userId?: string) => {
        const base = userId ? `user:${userId}` : ipBased(req);
        return `${base}:action:${action}`;
    },
};

// Helper function for IP-based keys
function ipBased(req: NextRequest): string {
    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0] ||
        req.headers.get("x-real-ip") ||
        "unknown";
    return `ip:${ip.trim()}`;
}
