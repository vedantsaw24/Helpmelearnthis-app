"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { userDataService, UserProfile } from "@/lib/userDataService";
import { User, Save, Mail, Calendar, Edit3, Trophy, Zap } from "lucide-react";

export default function ProfilePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [displayName, setDisplayName] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
            if (user) {
                try {
                    let userProfile = await userDataService.getUserProfile(
                        user.uid
                    );
                    if (!userProfile) {
                        userProfile = await userDataService.createUserProfile(
                            user
                        );
                    }
                    setProfile(userProfile);
                    setDisplayName(userProfile.displayName);
                } catch (error) {
                    console.error("Error loading profile:", error);
                }
            }
            setLoading(false);
        };
        loadProfile();
    }, [user]);

    const handleSave = async () => {
        if (!user || !profile) return;
        setSaving(true);
        try {
            const updatedProfile = await userDataService.updateUserProfile(
                user.uid,
                {
                    ...profile,
                    displayName: displayName,
                }
            );
            setProfile(updatedProfile);
            setEditing(false);
            toast({
                title: "Profile updated",
                description: "Your profile has been updated successfully.",
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update profile.",
            });
        }
        setSaving(false);
    };

    const getInitials = (name: string) =>
        name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    const formatDate = (date: Date) =>
        new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    if (loading) {
        return (
            <ProtectedRoute requireAuth={true}>
                <div className="container mx-auto px-4 py-6 max-w-4xl">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!profile) {
        return (
            <ProtectedRoute requireAuth={true}>
                <div className="container mx-auto px-4 py-6 max-w-4xl">
                    <div className="text-center py-12">
                        <h1 className="text-2xl font-bold">
                            Profile not found
                        </h1>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requireAuth={true}>
            <div className="container mx-auto px-4 py-6 max-w-4xl">
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        My Profile
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your account information
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Profile Information
                                    </CardTitle>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditing(!editing)}
                                    >
                                        <Edit3 className="h-4 w-4 mr-2" />
                                        {editing ? "Cancel" : "Edit"}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage
                                            src={profile.photoURL}
                                            alt={profile.displayName}
                                        />
                                        <AvatarFallback className="text-xl">
                                            {getInitials(profile.displayName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        {editing ? (
                                            <div className="space-y-3">
                                                <div>
                                                    <Label
                                                        htmlFor="displayName"
                                                        className="text-sm font-medium"
                                                    >
                                                        Display Name
                                                    </Label>
                                                    <Input
                                                        id="displayName"
                                                        value={displayName}
                                                        onChange={(e) =>
                                                            setDisplayName(
                                                                e.target.value
                                                            )
                                                        }
                                                        className="mt-1"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <h2 className="text-2xl font-bold">
                                                    {profile.displayName}
                                                </h2>
                                                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                                    <Mail className="h-4 w-4" />
                                                    <span>{profile.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>
                                                        Joined{" "}
                                                        {formatDate(
                                                            profile.createdAt
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {editing && (
                                    <div className="flex gap-2 pt-4">
                                        <Button
                                            onClick={handleSave}
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Save Changes
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setEditing(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="h-5 w-5" />
                                    Stats
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="text-center p-4 rounded-lg bg-muted/30">
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {profile.stats.totalQuizzes}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Quizzes
                                        </div>
                                    </div>
                                    <div className="text-center p-4 rounded-lg bg-muted/30">
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {profile.stats.averageScore}%
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Average Score
                                        </div>
                                    </div>
                                    <div className="text-center p-4 rounded-lg bg-muted/30">
                                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                            Level {profile.stats.level}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {profile.stats.xp} XP
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
