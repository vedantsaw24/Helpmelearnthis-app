"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userDataService, UserProfile } from "@/lib/userDataService";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { User, Mail, Settings, Shield } from "lucide-react";

export default function ProfilePage() {
    const { user } = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Force loading to false after a short delay
        const forceLoad = setTimeout(() => {
            setLoading(false);
        }, 1000);

        const loadUserProfile = async () => {
            if (!user) {
                setLoading(false);
                clearTimeout(forceLoad);
                return;
            }

            try {
                // Set default profile immediately for faster loading
                const defaultProfile: UserProfile = {
                    uid: user.uid,
                    email: user.email || "",
                    displayName: user.displayName || "User",
                    photoURL: user.photoURL,
                    createdAt: new Date(),
                    lastActive: new Date(),
                    stats: {
                        totalQuizzes: 0,
                        totalQuestions: 0,
                        correctAnswers: 0,
                        averageScore: 0,
                        totalTimeSpent: 0,
                        streakDays: 0,
                        longestStreak: 0,
                    },
                    preferences: {
                        preferredDifficulty: "medium",
                        favoriteTopics: [],
                        studyReminders: true,
                    },
                };

                setUserProfile(defaultProfile);
                setLoading(false);
                clearTimeout(forceLoad);

                // Try to load actual profile in background with timeout
                try {
                    const profilePromise = Promise.race([
                        userDataService.getUserProfile(user.uid),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error("Timeout")), 2000)
                        ),
                    ]);

                    const profile =
                        (await profilePromise) as UserProfile | null;
                    if (profile) {
                        setUserProfile(profile);
                    }
                } catch (profileError) {
                    console.log(
                        "Profile loading timed out or failed, using defaults"
                    );
                }
            } catch (error) {
                console.error("Error loading user profile:", error);
                setLoading(false);
                clearTimeout(forceLoad);
            }
        };

        loadUserProfile();

        return () => {
            clearTimeout(forceLoad);
        };
    }, [user]);

    const handleSaveProfile = async () => {
        if (!userProfile || !user) return;

        setSaving(true);
        try {
            await userDataService.updateUserProfile(user.uid, userProfile);
            console.log("Profile updated successfully");
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setSaving(false);
        }
    };

    const updatePreference = (
        key: keyof UserProfile["preferences"],
        value: any
    ) => {
        if (!userProfile) return;
        setUserProfile({
            ...userProfile,
            preferences: {
                ...userProfile.preferences,
                [key]: value,
            },
        });
    };

    if (loading) {
        return (
            <ProtectedRoute requireAuth={true}>
                <div className="container mx-auto max-w-4xl py-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-muted rounded w-1/4"></div>
                        <div className="space-y-4">
                            <div className="h-32 bg-muted rounded"></div>
                            <div className="h-48 bg-muted rounded"></div>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!userProfile) {
        return (
            <ProtectedRoute requireAuth={true}>
                <div className="container mx-auto max-w-4xl py-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Not Found</CardTitle>
                            <CardDescription>
                                Unable to load your profile. Please try again
                                later.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requireAuth={true}>
            <div className="container mx-auto max-w-4xl py-8 space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Profile Settings</h1>
                </div>

                {/* Profile Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Profile Information
                        </CardTitle>
                        <CardDescription>
                            Your personal information and account details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage
                                    src={userProfile.photoURL || undefined}
                                />
                                <AvatarFallback>
                                    {userProfile.displayName
                                        ?.charAt(0)
                                        ?.toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold">
                                    {userProfile.displayName || "User"}
                                </h3>
                                <p className="text-muted-foreground flex items-center gap-1">
                                    <Mail className="h-4 w-4" />
                                    {userProfile.email}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">
                                        Member since{" "}
                                        {new Date(
                                            userProfile.createdAt
                                        ).toLocaleDateString()}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="displayName">
                                    Display Name
                                </Label>
                                <Input
                                    id="displayName"
                                    value={userProfile.displayName || ""}
                                    onChange={(e) =>
                                        setUserProfile({
                                            ...userProfile,
                                            displayName: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    value={userProfile.email}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Learning Preferences */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Learning Preferences
                        </CardTitle>
                        <CardDescription>
                            Customize your learning experience
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Preferred Difficulty</Label>
                            <Select
                                value={
                                    userProfile.preferences.preferredDifficulty
                                }
                                onValueChange={(
                                    value: "easy" | "medium" | "hard"
                                ) =>
                                    updatePreference(
                                        "preferredDifficulty",
                                        value
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="easy">Easy</SelectItem>
                                    <SelectItem value="medium">
                                        Medium
                                    </SelectItem>
                                    <SelectItem value="hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">
                                    Study Reminders
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Get notifications to keep your learning
                                    streak
                                </p>
                            </div>
                            <Switch
                                checked={userProfile.preferences.studyReminders}
                                onCheckedChange={(checked) =>
                                    updatePreference("studyReminders", checked)
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Statistics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Your Statistics
                        </CardTitle>
                        <CardDescription>
                            Your learning progress and achievements
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold">
                                    {userProfile.stats.totalQuizzes}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Quizzes Completed
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">
                                    {userProfile.stats.averageScore}%
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Average Score
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">
                                    {userProfile.stats.streakDays}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Current Streak
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">
                                    {Math.round(
                                        userProfile.stats.totalTimeSpent
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Minutes Studied
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>
        </ProtectedRoute>
    );
}
