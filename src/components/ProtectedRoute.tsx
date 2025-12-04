"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
}

export function ProtectedRoute({
    children,
    requireAuth = true,
}: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (requireAuth && !user) {
                router.push("/login");
            } else if (!requireAuth && user) {
                router.push("/get-started");
            }
        }
    }, [user, loading, requireAuth, router]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (requireAuth && !user) {
        return null;
    }

    if (!requireAuth && user) {
        return null;
    }

    return <>{children}</>;
}
