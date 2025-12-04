"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

export default function GetStartedPage() {
    const router = useRouter();
    const { user } = useAuth();

    // Automatically redirect authenticated users to dashboard
    useEffect(() => {
        if (user) {
            router.replace("/");
        }
    }, [user, router]);

    // This is a protected page - user must be authenticated
    return (
        <ProtectedRoute requireAuth={true}>
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        </ProtectedRoute>
    );
}
