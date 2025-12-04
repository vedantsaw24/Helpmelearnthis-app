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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { userDataService, UserProfile } from "@/lib/userDataService";
import {
    TrendingUp,
    Target,
    Clock,
    Award,
    BookOpen,
    Brain,
    Zap,
} from "lucide-react";

export default function ProgressPage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
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

                    const recentResults =
                        await userDataService.getRecentQuizResults(4);
                    setRecentQuizzes(recentResults);
                } catch (error) {
                    console.error("Error loading progress data:", error);
                }
            }
            setLoading(false);
        };

        loadData();
    }, [user]);

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case "easy":
                return "bg-green-500";
            case "medium":
                return "bg-yellow-500";
            case "hard":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString();
    };

    if (loading) {
        return (
            <ProtectedRoute requireAuth={true}>
                <div className="container mx-auto px-4 py-6 max-w-6xl">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="h-20 bg-gray-300 rounded"
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!profile) {
        return (
            <ProtectedRoute requireAuth={true}>
                <div className="container mx-auto px-4 py-6 max-w-6xl">
                    <div className="text-center py-12">
                        <h1 className="text-2xl font-bold">No Progress Data</h1>
                        <p className="text-muted-foreground mt-2">
                            Complete a quiz to see your progress!
                        </p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    const stats = profile.stats;
    const unlockedAchievements = stats.achievements.filter((a) => a.unlockedAt);

    return (
        <ProtectedRoute requireAuth={true}>
            <div className="container mx-auto px-4 py-6 max-w-6xl">
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        Your Progress
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Track your learning journey and achievements
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    <Card className="p-3 sm:p-4">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                                        Quizzes
                                    </p>
                                    <p className="text-lg sm:text-2xl font-bold">
                                        {stats.totalQuizzes}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="p-3 sm:p-4">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                                        Accuracy
                                    </p>
                                    <p className="text-lg sm:text-2xl font-bold">
                                        {stats.averageScore}%
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="p-3 sm:p-4">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                                        Avg Time
                                    </p>
                                    <p className="text-lg sm:text-2xl font-bold">
                                        {Math.round(
                                            stats.totalTimeSpent /
                                                stats.totalQuestions
                                        )}
                                        s
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="p-3 sm:p-4">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                                        Streak
                                    </p>
                                    <p className="text-lg sm:text-2xl font-bold">
                                        {stats.streak} days
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Level Progress */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Brain className="h-5 w-5" />
                                    Learning Level
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">
                                                {stats.level}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {stats.xp} /{" "}
                                                {stats.level * 1000} XP
                                            </p>
                                        </div>
                                        <Badge variant="secondary">
                                            Level {stats.level}
                                        </Badge>
                                    </div>
                                    <Progress
                                        value={(stats.xp % 1000) / 10}
                                        className="w-full"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Quizzes */}
                        <Card className="mt-6">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <TrendingUp className="h-5 w-5" />
                                    Recent Quizzes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {recentQuizzes.map((quiz) => (
                                        <div
                                            key={quiz.id}
                                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">
                                                    {quiz.title}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDate(
                                                        quiz.completedAt
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 ml-2">
                                                <Badge
                                                    variant="outline"
                                                    className={`${getDifficultyColor(
                                                        quiz.difficulty
                                                    )} text-white border-0`}
                                                >
                                                    {quiz.difficulty}
                                                </Badge>
                                                <div className="text-right">
                                                    <p className="font-bold text-lg">
                                                        {quiz.score}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Achievements */}
                    <div>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Award className="h-5 w-5" />
                                    Achievements
                                </CardTitle>
                                <CardDescription>
                                    Unlock new badges as you learn
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {stats.achievements.map((achievement) => (
                                        <div
                                            key={achievement.id}
                                            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                                                achievement.unlockedAt
                                                    ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                                                    : "bg-muted/30"
                                            }`}
                                        >
                                            <Award
                                                className={`h-5 w-5 mt-0.5 ${
                                                    achievement.unlockedAt
                                                        ? "text-green-600 dark:text-green-400"
                                                        : "text-muted-foreground"
                                                }`}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className={`font-medium text-sm ${
                                                        achievement.unlockedAt
                                                            ? "text-green-700 dark:text-green-300"
                                                            : "text-muted-foreground"
                                                    }`}
                                                >
                                                    {achievement.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {achievement.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
