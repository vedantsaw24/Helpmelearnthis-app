"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { userDataService } from "@/lib/userDataService";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (
        email: string,
        password: string,
        displayName?: string
    ) => Promise<void>;
    logout: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if auth is available (client-side only)
        if (!auth) {
            console.log(
                "⚠️ Firebase Auth not available - auth persistence disabled"
            );
            setLoading(false);
            return;
        }

        console.log("🔐 Setting up authentication state listener...");

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log(
                "🔄 Auth state changed:",
                user
                    ? `✅ User logged in: ${user.email}`
                    : "❌ No user logged in"
            );

            setUser(user);
            setLoading(false); // Set loading false immediately when auth state is determined

            if (user) {
                try {
                    // Create or update user profile in Firestore (async, don't block UI)
                    await userDataService.createUserProfile(user);
                    console.log("✅ User profile synchronized with database");
                } catch (error) {
                    console.error(
                        "⚠️ Failed to sync user profile (app will still work):",
                        error
                    );
                }
            }
        });

        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string) => {
        if (!auth) {
            console.error("Authentication service not initialized");
            throw new Error("Authentication service is currently unavailable");
        }
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            console.error("Firebase sign-in error:", {
                code: error.code,
                message: error.message,
                timestamp: new Date().toISOString(),
            });

            // Map Firebase error codes to user-friendly messages
            let userMessage = "Sign-in failed. Please try again.";
            if (error.code === "auth/invalid-email") {
                userMessage = "Please enter a valid email address.";
            } else if (error.code === "auth/user-disabled") {
                userMessage = "This account has been disabled.";
            } else if (
                error.code === "auth/user-not-found" ||
                error.code === "auth/wrong-password" ||
                error.code === "auth/invalid-credential"
            ) {
                userMessage = "Invalid email or password.";
            } else if (error.code === "auth/too-many-requests") {
                userMessage =
                    "Too many failed attempts. Please try again later.";
            }

            const userError = new Error(userMessage);
            throw userError;
        }
    };

    const signUp = async (
        email: string,
        password: string,
        displayName?: string
    ) => {
        if (!auth) {
            console.error("Authentication service not initialized");
            throw new Error("Authentication service is currently unavailable");
        }
        try {
            const result = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            if (displayName && result.user) {
                await updateProfile(result.user, { displayName });
            }
        } catch (error: any) {
            console.error("Firebase sign-up error:", {
                code: error.code,
                message: error.message,
                timestamp: new Date().toISOString(),
            });

            // Map Firebase error codes to user-friendly messages
            let userMessage = "Account creation failed. Please try again.";
            if (error.code === "auth/email-already-in-use") {
                userMessage = "An account with this email already exists.";
            } else if (error.code === "auth/invalid-email") {
                userMessage = "Please enter a valid email address.";
            } else if (error.code === "auth/weak-password") {
                userMessage =
                    "Password is too weak. Please choose a stronger password.";
            } else if (error.code === "auth/operation-not-allowed") {
                userMessage = "Account creation is currently disabled.";
            }

            const userError = new Error(userMessage);
            throw userError;
        }
    };

    const logout = async () => {
        if (!auth) {
            console.error("Authentication service not initialized");
            throw new Error("Authentication service is currently unavailable");
        }
        try {
            await signOut(auth);
        } catch (error: any) {
            console.error("Firebase sign-out error:", {
                code: error.code,
                message: error.message,
                timestamp: new Date().toISOString(),
            });
            throw new Error("Sign-out failed. Please try again.");
        }
    };

    const signInWithGoogle = async () => {
        if (!auth) {
            console.error("Authentication service not initialized");
            throw new Error("Authentication service is currently unavailable");
        }
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error: any) {
            console.error("Firebase Google sign-in error:", {
                code: error.code,
                message: error.message,
                timestamp: new Date().toISOString(),
            });

            // Map Firebase error codes to user-friendly messages
            let userMessage = "Google sign-in failed. Please try again.";
            if (error.code === "auth/popup-closed-by-user") {
                userMessage = "Sign-in was cancelled.";
            } else if (error.code === "auth/popup-blocked") {
                userMessage =
                    "Pop-up was blocked. Please allow pop-ups and try again.";
            } else if (error.code === "auth/cancelled-popup-request") {
                userMessage = "Sign-in was cancelled.";
            } else if (
                error.code === "auth/account-exists-with-different-credential"
            ) {
                userMessage =
                    "An account with this email already exists using a different sign-in method.";
            }

            const userError = new Error(userMessage);
            throw userError;
        }
    };

    const resetPassword = async (email: string) => {
        if (!auth) {
            console.error("Authentication service not initialized");
            throw new Error("Authentication service is currently unavailable");
        }
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error: any) {
            console.error("Firebase password reset error:", {
                code: error.code,
                message: error.message,
                timestamp: new Date().toISOString(),
            });

            // Map Firebase error codes to user-friendly messages
            let userMessage =
                "Failed to send password reset email. Please try again.";
            if (error.code === "auth/user-not-found") {
                userMessage = "No account found with this email address.";
            } else if (error.code === "auth/invalid-email") {
                userMessage = "Please enter a valid email address.";
            } else if (error.code === "auth/too-many-requests") {
                userMessage =
                    "Too many requests. Please wait before trying again.";
            }

            const userError = new Error(userMessage);
            throw userError;
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        signIn,
        signUp,
        logout,
        signInWithGoogle,
        resetPassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
