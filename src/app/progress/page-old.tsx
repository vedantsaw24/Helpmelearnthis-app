"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
    userDataService,
    UserProfile,
    QuizSession,
    StudySession,
} from "@/lib/userDataService";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import {
    Calendar,
    Clock,
    Target,
    TrendingUp,
    Award,
    BookOpen,
} from "lucide-react";

export default function ProgressPage() {
    const { user } = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [quizSessions, setQuizSessions] = useState<QuizSession[]>([]);
    const [studySessions, setStudySessions] = useState<StudySession[]>([]);
    const [loading, setLoading] = useState(true);

    // Helper function for consistent date formatting (yyyy/mm/dd)
    const formatDate = (date: any): string => {
        try {
            let dateObj: Date;
            if (date?.toDate) {
                dateObj = date.toDate();
            } else if (date instanceof Date) {
                dateObj = date;
            } else if (typeof date === "string" || typeof date === "number") {
                dateObj = new Date(date);
            } else {
                return "Unknown";
            }

            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, "0");
            const day = String(dateObj.getDate()).padStart(2, "0");
            return `${year}/${month}/${day}`;
        } catch (error) {
            return "Unknown";
        }
    };

    useEffect(() => {
        // Force loading to false after a very short delay to prevent slow loading
        const forceLoad = setTimeout(() => {
            console.log("Progress page: Forcing load completion");
            setLoading(false);
        }, 1500); // Reduced from 3000ms to 1500ms

        const loadProgressData = async () => {
            if (!user) {
                setLoading(false);
                clearTimeout(forceLoad);
                return;
            }

            try {
                console.log("Loading progress data for:", user.uid);

                // Set loading false immediately and show defaults
                setLoading(false);
                clearTimeout(forceLoad);

                // Set empty defaults immediately
                setQuizSessions([]);
                setStudySessions([]);

                // Create minimal default profile
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

                // Try to load actual data in background with shorter timeouts
                try {
                    const profilePromise = Promise.race([
                        userDataService.getUserProfile(user.uid),
                        new Promise((_, reject) =>
                            setTimeout(
                                () => reject(new Error("Profile timeout")),
                                2000
                            )
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

                // Load quiz sessions with timeout
                try {
                    const sessionsPromise = Promise.race([
                        userDataService.getUserQuizSessions(user.uid, 10), // Reduced from 20 to 10
                        new Promise((_, reject) =>
                            setTimeout(
                                () => reject(new Error("Sessions timeout")),
                                2000
                            )
                        ),
                    ]);

                    const sessions = (await sessionsPromise) as QuizSession[];
                    setQuizSessions(sessions || []);
                } catch (sessionError) {
                    console.log(
                        "Quiz sessions loading timed out, using empty array"
                    );
                    setQuizSessions([]);
                }

                // Skip study sessions for now as they might be causing the delay
                setStudySessions([]);
            } catch (error) {
                console.error("Error in loadProgressData:", error);
                setLoading(false);
                clearTimeout(forceLoad);
                setQuizSessions([]);
                setStudySessions([]);
            }
        };

        loadProgressData();

        return () => {
            clearTimeout(forceLoad);
        };
    }, [user]);

    if (loading) {
        return (
            <ProtectedRoute requireAuth={true}>
                <div className="container mx-auto max-w-6xl py-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-muted rounded w-1/4"></div>
                        <div className="grid gap-6 md:grid-cols-3">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-32 bg-muted rounded"
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    // Prepare chart data with safety checks and consistent date formatting
    const scoreData = (quizSessions || [])
        .slice(0, 10)
        .reverse()
        .map((session, index) => ({
            quiz: index + 1,
            score: session.score,
            date: formatDate(session.completedAt),
        }));

    const studyTimeData = (studySessions || []).map((session) => ({
        date: new Date(session.date).toLocaleDateString("en-US", {
            weekday: "short",
        }),
        time: session.totalTime,
        quizzes: session.quizzesCompleted,
    }));

    const difficultyData = (quizSessions || []).reduce((acc, session) => {
        acc[session.difficulty] = (acc[session.difficulty] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(difficultyData).map(
        ([difficulty, count]) => ({
            name: difficulty,
            value: count,
            color:
                difficulty === "easy"
                    ? "#10B981"
                    : difficulty === "medium"
                    ? "#F59E0B"
                    : "#EF4444",
        })
    );

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const getImprovementTrend = () => {
        if (quizSessions.length < 2) return { trend: "neutral", percentage: 0 };

        const recent = quizSessions.slice(0, 5);
        const older = quizSessions.slice(5, 10);

        if (recent.length === 0 || older.length === 0)
            return { trend: "neutral", percentage: 0 };

        const recentAvg =
            recent.reduce((sum, s) => sum + s.score, 0) / recent.length;
        const olderAvg =
            older.reduce((sum, s) => sum + s.score, 0) / older.length;

        const percentage = Math.round(
            ((recentAvg - olderAvg) / olderAvg) * 100
        );

        return {
            trend: percentage > 5 ? "up" : percentage < -5 ? "down" : "neutral",
            percentage: Math.abs(percentage),
        };
    };

    const improvement = getImprovementTrend();

    return (
        <ProtectedRoute requireAuth={true}>
            <div className="container mx-auto max-w-6xl py-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Progress Tracking
                    </h1>
                    <p className="text-muted-foreground">
                        Monitor your learning journey and identify areas for
                        improvement
                    </p>
                </div>

                {/* Overview Stats */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Quizzes
                            </CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {userProfile?.stats.totalQuizzes || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {userProfile?.stats.totalQuestions || 0}{" "}
                                questions answered
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
                                    userProfile?.stats.averageScore || 0
                                )}`}
                            >
                                {userProfile?.stats.averageScore?.toFixed(1) ||
                                    0}
                                %
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                <TrendingUp
                                    className={`h-3 w-3 mr-1 ${
                                        improvement.trend === "up"
                                            ? "text-green-600"
                                            : improvement.trend === "down"
                                            ? "text-red-600"
                                            : "text-gray-400"
                                    }`}
                                />
                                {improvement.trend === "up" &&
                                    `+${improvement.percentage}% from last 5`}
                                {improvement.trend === "down" &&
                                    `-${improvement.percentage}% from last 5`}
                                {improvement.trend === "neutral" &&
                                    "Stable performance"}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Study Streak
                            </CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">
                                {userProfile?.stats.streakDays || 0} days
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Longest: {userProfile?.stats.longestStreak || 0}{" "}
                                days
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Study Time
                            </CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {userProfile?.stats.totalTimeSpent || 0}min
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Avg:{" "}
                                {Math.round(
                                    (userProfile?.stats.totalTimeSpent || 0) /
                                        Math.max(
                                            userProfile?.stats.totalQuizzes ||
                                                1,
                                            1
                                        )
                                )}
                                min per quiz
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="performance" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="performance">
                            Performance
                        </TabsTrigger>
                        <TabsTrigger value="activity">Activity</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                        <TabsTrigger value="insights">Insights</TabsTrigger>
                    </TabsList>

                    <TabsContent value="performance" className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Score Progression</CardTitle>
                                    <CardDescription>
                                        Your quiz scores over time
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer
                                        width="100%"
                                        height={300}
                                    >
                                        <LineChart data={scoreData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="quiz" />
                                            <YAxis domain={[0, 100]} />
                                            <Tooltip />
                                            <Line
                                                type="monotone"
                                                dataKey="score"
                                                stroke="#3B82F6"
                                                strokeWidth={2}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Difficulty Distribution
                                    </CardTitle>
                                    <CardDescription>
                                        Quiz difficulty preferences
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer
                                        width="100%"
                                        height={300}
                                    >
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                dataKey="value"
                                                label={({ name, value }) =>
                                                    `${name}: ${value}`
                                                }
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell
                                                        key={index}
                                                        fill={entry.color}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="activity" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Weekly Study Activity</CardTitle>
                                <CardDescription>
                                    Your study time and quiz activity over the
                                    past 7 days
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={studyTimeData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar
                                            dataKey="time"
                                            fill="#3B82F6"
                                            name="Study Time (min)"
                                        />
                                        <Bar
                                            dataKey="quizzes"
                                            fill="#10B981"
                                            name="Quizzes Completed"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quiz History</CardTitle>
                                <CardDescription>
                                    Detailed view of your recent quiz sessions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {quizSessions.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-8">
                                            No quiz history available. Start
                                            taking quizzes to see your progress!
                                        </p>
                                    ) : (
                                        quizSessions.map((session, index) => (
                                            <div
                                                key={session.id || index}
                                                className="flex items-center justify-between p-4 border rounded-lg"
                                            >
                                                <div className="space-y-1">
                                                    <p className="font-medium">
                                                        {session.title}
                                                    </p>
                                                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                        <span className="flex items-center">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            {formatDate(
                                                                session.completedAt
                                                            )}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            {Math.round(
                                                                session.timeSpent /
                                                                    60
                                                            )}
                                                            min
                                                        </span>
                                                        <Badge
                                                            variant="secondary"
                                                            className={
                                                                session.difficulty ===
                                                                "easy"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : session.difficulty ===
                                                                      "medium"
                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                    : "bg-red-100 text-red-800"
                                                            }
                                                        >
                                                            {session.difficulty}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div
                                                        className={`text-lg font-bold ${getScoreColor(
                                                            session.score
                                                        )}`}
                                                    >
                                                        {session.score}%
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {session.correctAnswers}
                                                        /
                                                        {session.questionsCount}{" "}
                                                        correct
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="insights" className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Performance Insights</CardTitle>
                                    <CardDescription>
                                        Key metrics and recommendations
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm">
                                                Accuracy Rate
                                            </span>
                                            <span className="text-sm font-medium">
                                                {userProfile?.stats
                                                    .totalQuestions
                                                    ? Math.round(
                                                          (userProfile.stats
                                                              .correctAnswers /
                                                              userProfile.stats
                                                                  .totalQuestions) *
                                                              100
                                                      )
                                                    : 0}
                                                %
                                            </span>
                                        </div>
                                        <Progress
                                            value={
                                                userProfile?.stats
                                                    .totalQuestions
                                                    ? (userProfile.stats
                                                          .correctAnswers /
                                                          userProfile.stats
                                                              .totalQuestions) *
                                                      100
                                                    : 0
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm">
                                                Consistency Score
                                            </span>
                                            <span className="text-sm font-medium">
                                                {userProfile?.stats
                                                    .streakDays || 0 > 0
                                                    ? "Good"
                                                    : "Needs Improvement"}
                                            </span>
                                        </div>
                                        <Progress
                                            value={Math.min(
                                                (userProfile?.stats
                                                    .streakDays || 0) * 14.3,
                                                100
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Recommendations</CardTitle>
                                    <CardDescription>
                                        Personalized tips to improve your
                                        learning
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {userProfile?.stats.averageScore &&
                                            userProfile.stats.averageScore <
                                                70 && (
                                                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                                    <p className="text-sm">
                                                        💡 Try reviewing
                                                        incorrect answers and
                                                        taking quizzes on easier
                                                        difficulty first.
                                                    </p>
                                                </div>
                                            )}

                                        {userProfile?.stats.streakDays ===
                                            0 && (
                                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                <p className="text-sm">
                                                    🎯 Build a study habit by
                                                    taking at least one quiz
                                                    daily.
                                                </p>
                                            </div>
                                        )}

                                        {userProfile?.stats.totalQuizzes &&
                                            userProfile.stats.totalQuizzes <
                                                5 && (
                                                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                    <p className="text-sm">
                                                        🚀 Take more quizzes to
                                                        unlock detailed
                                                        analytics and insights.
                                                    </p>
                                                </div>
                                            )}

                                        {!userProfile?.stats.totalQuizzes && (
                                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                                <p className="text-sm">
                                                    ✨ Welcome! Take your first
                                                    quiz to start tracking your
                                                    progress.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </ProtectedRoute>
    );
}
