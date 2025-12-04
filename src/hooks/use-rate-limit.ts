"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState, useCallback } from "react";

interface RateLimitState {
    isLimited: boolean;
    retryAfter?: number;
    message?: string;
}

export function useRateLimit() {
    const { user } = useAuth();
    const [rateLimitState, setRateLimitState] = useState<RateLimitState>({
        isLimited: false,
    });

    const checkRateLimit = useCallback(
        async (action: string) => {
            // This would typically make a request to check rate limits
            // For now, we'll handle it in the server actions
            return !rateLimitState.isLimited;
        },
        [rateLimitState.isLimited]
    );

    const handleRateLimitError = useCallback((error: any) => {
        if (error.retryAfter) {
            setRateLimitState({
                isLimited: true,
                retryAfter: error.retryAfter,
                message: error.message,
            });

            // Reset after retry period
            setTimeout(() => {
                setRateLimitState({ isLimited: false });
            }, error.retryAfter * 1000);
        }
    }, []);

    const resetRateLimit = useCallback(() => {
        setRateLimitState({ isLimited: false });
    }, []);

    // Helper to add user ID to FormData for server actions
    const addUserIdToFormData = useCallback(
        (formData: FormData) => {
            if (user?.uid) {
                formData.append("userId", user.uid);
            }
            return formData;
        },
        [user?.uid]
    );

    return {
        isRateLimited: rateLimitState.isLimited,
        retryAfter: rateLimitState.retryAfter,
        rateLimitMessage: rateLimitState.message,
        checkRateLimit,
        handleRateLimitError,
        resetRateLimit,
        addUserIdToFormData,
    };
}
