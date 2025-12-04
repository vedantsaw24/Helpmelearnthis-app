"use client";

import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Trophy, ArrowRight } from "lucide-react";
import { userDataService } from "@/lib/userDataService";
import Link from "next/link";

interface RecentSessionsProps {
    userId: string;
}

export default function RecentSessions({ userId }: RecentSessionsProps) {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSessions = async () => {
            try {
                const recentSessions =
                    await userDataService.getRecentQuizSessions(userId, 3);
                setSessions(recentSessions);
            } catch (error) {
                console.error("Error loading recent sessions:", error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            loadSessions();
        }
    }, [userId]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 animate-pulse"
                            >
                                <div className="h-10 w-10 bg-muted rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-muted rounded w-3/4" />
                                    <div className="h-3 bg-muted rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                </CardTitle>
                <CardDescription>Your latest quiz attempts</CardDescription>
            </CardHeader>
            <CardContent>
                {sessions.length === 0 ? (
                    <div className="text-center py-8">
                        <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            No activity yet
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            Start taking quizzes to see your activity here
                        </p>
                        <Link href="/topics">
                            <Button>
                                Browse Topics
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sessions.map((session, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-3 border rounded-lg"
                            >
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Trophy className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">
                                        {session.title}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Score: {session.score}% •{" "}
                                        {session.topic}
                                    </p>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {new Date(
                                        session.completedAt?.toDate?.() ||
                                            new Date()
                                    ).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                        <Link href="/progress">
                            <Button variant="outline" className="w-full">
                                View All Activity
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
