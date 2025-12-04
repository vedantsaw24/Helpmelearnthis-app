"use client";

import React, { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BookOpen,
    Search,
    Star,
    Clock,
    Users,
    Brain,
    Code,
    Play,
    TrendingUp,
    Database,
    Globe,
    Terminal,
    Target,
} from "lucide-react";
import Link from "next/link";
import { techQuizzes, Quiz } from "@/lib/quizData";
import { useAuth } from "@/contexts/AuthContext";
import { userDataService } from "@/lib/userDataService";

const topicCategories = [
    { id: "all", name: "All Topics", icon: <BookOpen className="h-4 w-4" /> },
    {
        id: "web-development",
        name: "Web Development",
        icon: <Code className="h-4 w-4" />,
    },
    { id: "backend", name: "Backend", icon: <Database className="h-4 w-4" /> },
    {
        id: "frontend",
        name: "Frontend",
        icon: <Globe className="h-4 w-4" />,
    },
    {
        id: "database",
        name: "Database",
        icon: <Database className="h-4 w-4" />,
    },
    {
        id: "tools",
        name: "Development Tools",
        icon: <Terminal className="h-4 w-4" />,
    },
    {
        id: "programming",
        name: "Programming Languages",
        icon: <Code className="h-4 w-4" />,
    },
];

export default function TopicsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
    const [userStats, setUserStats] = useState<any>(null);
    const { user } = useAuth();

    useEffect(() => {
        const loadUserStats = async () => {
            if (!user) return;
            try {
                const profile = await userDataService.getUserProfile(user.uid);
                setUserStats(profile?.stats);
            } catch (error) {
                console.error("Error loading user stats:", error);
            }
        };

        loadUserStats();
    }, [user]);

    const filteredQuizzes = techQuizzes.filter((quiz) => {
        const matchesSearch =
            quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quiz.tags.some((tag) =>
                tag.toLowerCase().includes(searchTerm.toLowerCase())
            );

        const matchesCategory =
            selectedCategory === "all" ||
            quiz.subcategory === selectedCategory ||
            quiz.category === selectedCategory;

        const matchesDifficulty =
            selectedDifficulty === "all" ||
            quiz.difficulty === selectedDifficulty;

        return matchesSearch && matchesCategory && matchesDifficulty;
    });

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "easy":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            case "medium":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
            case "hard":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
        }
    };

    const getRecommendedQuizzes = () => {
        if (!userStats) return techQuizzes.slice(0, 3);

        const userDifficulty =
            userStats.averageScore > 80
                ? "hard"
                : userStats.averageScore > 60
                ? "medium"
                : "easy";

        return techQuizzes
            .filter((quiz) => quiz.difficulty === userDifficulty)
            .slice(0, 3);
    };

    const getPopularQuizzes = () => {
        return [...techQuizzes]
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, 6);
    };

    return (
        <ProtectedRoute requireAuth={true}>
            <div className="container mx-auto max-w-7xl py-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Explore Tech Topics
                        </h1>
                        <p className="text-muted-foreground">
                            Master technology skills with our curated quizzes
                            and learning paths
                        </p>
                    </div>
                    {userStats && (
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-primary">
                                    {userStats.totalQuizzes || 0}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Quizzes Completed
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-primary">
                                    {Math.round(userStats.averageScore || 0)}%
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Average Score
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recommended for You */}
                {userStats && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Recommended for You
                            </CardTitle>
                            <CardDescription>
                                Based on your performance and learning progress
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                {getRecommendedQuizzes().map((quiz) => (
                                    <Card
                                        key={quiz.id}
                                        className="transition-all hover:shadow-md"
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-2xl">
                                                    {quiz.icon}
                                                </span>
                                                <Badge
                                                    className={getDifficultyColor(
                                                        quiz.difficulty
                                                    )}
                                                >
                                                    {quiz.difficulty}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-lg">
                                                {quiz.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <p className="text-sm text-muted-foreground mb-4">
                                                {quiz.description}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        {quiz.estimatedTime}s
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Brain className="h-4 w-4" />
                                                        {quiz.questions.length}{" "}
                                                        questions
                                                    </div>
                                                </div>
                                                <Link href={`/quiz/${quiz.id}`}>
                                                    <Button size="sm">
                                                        <Play className="h-4 w-4 mr-1" />
                                                        Start
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Tabs defaultValue="browse" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="browse">Browse All</TabsTrigger>
                        <TabsTrigger value="popular">Popular</TabsTrigger>
                    </TabsList>

                    <TabsContent value="browse" className="space-y-6">
                        {/* Search and Filters */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col gap-4 md:flex-row">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search topics, technologies, or concepts..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            className="pl-10"
                                        />
                                    </div>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) =>
                                            setSelectedCategory(e.target.value)
                                        }
                                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        aria-label="Select category"
                                    >
                                        {topicCategories.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={selectedDifficulty}
                                        onChange={(e) =>
                                            setSelectedDifficulty(
                                                e.target.value
                                            )
                                        }
                                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        aria-label="Select difficulty level"
                                    >
                                        <option value="all">All Levels</option>
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Results */}
                        <div className="space-y-4">
                            {filteredQuizzes.length === 0 ? (
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center py-12">
                                        <Search className="h-12 w-12 text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">
                                            No quizzes found
                                        </h3>
                                        <p className="text-muted-foreground text-center">
                                            Try adjusting your search criteria
                                            or browse different categories.
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {filteredQuizzes.map((quiz) => (
                                        <Card
                                            key={quiz.id}
                                            className="transition-all hover:shadow-lg hover:scale-[1.02]"
                                        >
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-3xl">
                                                        {quiz.icon}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {quiz.subcategory}
                                                        </Badge>
                                                        <Badge
                                                            className={getDifficultyColor(
                                                                quiz.difficulty
                                                            )}
                                                        >
                                                            {quiz.difficulty}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <CardTitle className="text-xl">
                                                    {quiz.title}
                                                </CardTitle>
                                                <CardDescription>
                                                    {quiz.description}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            {quiz.estimatedTime}{" "}
                                                            sec
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Brain className="h-4 w-4" />
                                                            {
                                                                quiz.questions
                                                                    .length
                                                            }{" "}
                                                            questions
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-4 w-4" />
                                                            {quiz.popularity}%
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-1">
                                                        {quiz.tags
                                                            .slice(0, 3)
                                                            .map((tag) => (
                                                                <Badge
                                                                    key={tag}
                                                                    variant="secondary"
                                                                    className="text-xs"
                                                                >
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                        {quiz.tags.length >
                                                            3 && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-xs"
                                                            >
                                                                +
                                                                {quiz.tags
                                                                    .length -
                                                                    3}{" "}
                                                                more
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <div className="mt-6">
                                                        <Link
                                                            href={`/quiz/${quiz.id}`}
                                                            className="w-full"
                                                        >
                                                            <Button className="w-full">
                                                                <Play className="h-4 w-4 mr-2" />
                                                                Start Quiz
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="popular" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Most Popular Quizzes
                                </CardTitle>
                                <CardDescription>
                                    Trending technology topics that learners
                                    love
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {getPopularQuizzes().map((quiz, index) => (
                                        <Card
                                            key={quiz.id}
                                            className="transition-all hover:shadow-lg"
                                        >
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                                                            {index + 1}
                                                        </div>
                                                        <span className="text-2xl">
                                                            {quiz.icon}
                                                        </span>
                                                    </div>
                                                    <Badge
                                                        className={getDifficultyColor(
                                                            quiz.difficulty
                                                        )}
                                                    >
                                                        {quiz.difficulty}
                                                    </Badge>
                                                </div>
                                                <CardTitle className="text-lg">
                                                    {quiz.title}
                                                </CardTitle>
                                                <CardDescription>
                                                    {quiz.description}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            {quiz.estimatedTime}
                                                            s
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Users className="h-4 w-4" />
                                                            {quiz.popularity}%
                                                            popular
                                                        </div>
                                                    </div>
                                                    <div className="mt-4">
                                                        <Link
                                                            href={`/quiz/${quiz.id}`}
                                                            className="w-full"
                                                        >
                                                            <Button className="w-full">
                                                                <Play className="h-4 w-4 mr-2" />
                                                                Start Quiz
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </ProtectedRoute>
    );
}
