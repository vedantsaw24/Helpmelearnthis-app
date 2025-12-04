"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { resetPassword } = useAuth();
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast({
                title: "Error",
                description: "Please enter your email address",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            await resetPassword(email);
            setEmailSent(true);
            toast({
                title: "Success",
                description: "Password reset email sent! Check your inbox.",
            });
        } catch (error: any) {
            console.error("Password reset error:", error);
            toast({
                title: "Error",
                description: error.message || "Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute requireAuth={false}>
            <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-background px-4">
                <Card className="mx-auto w-full max-w-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl">
                            Reset Password
                        </CardTitle>
                        <CardDescription>
                            {emailSent
                                ? "We've sent you a password reset link"
                                : "Enter your email to reset your password"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {emailSent ? (
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Check your email for a link to reset your
                                    password. If it doesn't appear within a few
                                    minutes, check your spam folder.
                                </p>
                                <div className="space-y-2">
                                    <Button
                                        className="w-full"
                                        onClick={() => setEmailSent(false)}
                                    >
                                        Send another email
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        asChild
                                    >
                                        <Link href="/login">Back to login</Link>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleResetPassword}>
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="some@thing.com"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={loading}
                                    >
                                        {loading
                                            ? "Sending..."
                                            : "Send reset email"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        asChild
                                    >
                                        <Link href="/login">Back to login</Link>
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
