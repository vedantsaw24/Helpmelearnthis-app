"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Brain,
    Trophy,
    Clock,
    Target,
    TrendingUp,
    Play,
    BarChart3,
    Settings,
    Plus,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
    totalQuizzes: number;
    averageScore: number;
    totalTimeSpent: number;
    streakDays: number;
}

export function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        totalQuizzes: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        streakDays: 0,
    });

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <div className="container mx-auto max-w-4xl py-4 px-4 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        {getGreeting()},{" "}
                        {user?.displayName ||
                            user?.email?.split("@")[0] ||
                            "there"}
                    </p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Link href="/quiz/create" className="block">
                    <Button className="w-full h-auto py-3 px-4">
                        <div className="flex flex-col items-center gap-2">
                            <Plus className="h-5 w-5" />
                            <span className="text-sm">Create Quiz</span>
                        </div>
                    </Button>
                </Link>
                <Link href="/progress" className="block">
                    <Button
                        variant="outline"
                        className="w-full h-auto py-3 px-4"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            <span className="text-sm">Progress</span>
                        </div>
                    </Button>
                </Link>
                <Link href="/settings" className="block">
                    <Button
                        variant="outline"
                        className="w-full h-auto py-3 px-4"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <Settings className="h-5 w-5" />
                            <span className="text-sm">Settings</span>
                        </div>
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Quizzes
                        </CardTitle>
                        <Brain className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.totalQuizzes}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Quizzes completed
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Average Score
                        </CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div
                            className={`text-2xl font-bold ${getScoreColor(
                                stats.averageScore
                            )}`}
                        >
                            {stats.averageScore}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Across all quizzes
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Time Spent
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Math.floor(stats.totalTimeSpent / 60)}h
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total study time
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Current Streak
                        </CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {stats.streakDays} days
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.streakDays === 0
                                ? "Start your streak today!"
                                : "Keep it up!"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="achievements">Achievements</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Getting Started</CardTitle>
                            <CardDescription>
                                Ready to create your first quiz?
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center py-8">
                                <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">
                                    No quizzes yet
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    Create your first quiz to start tracking
                                    your progress
                                </p>
                                <Link href="/quiz/create">
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Your First Quiz
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="achievements" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Achievements</CardTitle>
                            <CardDescription>
                                Track your learning milestones
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4 p-4 border rounded-lg opacity-50">
                                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                        <Brain className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            First Quiz
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Complete your first quiz
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4 p-4 border rounded-lg opacity-50">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                        <TrendingUp className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            Streak Keeper
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Build a 7-day streak
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4 p-4 border rounded-lg opacity-50">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                        <Clock className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            Dedicated Learner
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Study for 1 hour total
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
