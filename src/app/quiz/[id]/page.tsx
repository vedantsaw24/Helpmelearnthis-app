"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Clock,
    CheckCircle,
    XCircle,
    RotateCcw,
    ArrowLeft,
    Trophy,
    Brain,
} from "lucide-react";
import { getQuizById, Quiz, QuizQuestion } from "@/lib/quizData";
import { useAuth } from "@/contexts/AuthContext";
import { userDataService } from "@/lib/userDataService";
import Link from "next/link";

interface QuizAnswer {
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
}

export default function QuizPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const quizId = params.id as string;

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string>("");
    const [answers, setAnswers] = useState<QuizAnswer[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());
    const [quizStartTime, setQuizStartTime] = useState(Date.now());
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const loadQuiz = async () => {
            const quizData = getQuizById(quizId);
            if (quizData) {
                setQuiz(quizData);
                setQuizStartTime(Date.now());
                setQuestionStartTime(Date.now());
                // Set initial time for first question (default 30 seconds if not specified)
                setTimeLeft(quizData.questions[0]?.timeLimit || 30);
            }
        };
        loadQuiz();
    }, [quizId]);

    useEffect(() => {
        if (!quiz || showResults) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentQuestionIndex, showResults, quiz]);

    const handleTimeUp = () => {
        if (selectedAnswer) {
            handleAnswerSubmit();
        } else {
            // Auto-submit with no answer
            const currentQuestion = quiz!.questions[currentQuestionIndex];
            const newAnswer: QuizAnswer = {
                questionId: currentQuestion.id,
                selectedAnswer: "",
                isCorrect: false,
                timeSpent: Date.now() - questionStartTime,
            };
            setAnswers((prev) => [...prev, newAnswer]);
            nextQuestion();
        }
    };

    const handleAnswerSelect = (answer: string) => {
        if (!isSubmitted) {
            setSelectedAnswer(answer);
        }
    };

    const handleAnswerSubmit = () => {
        if (!selectedAnswer || !quiz) return;

        const currentQuestion = quiz.questions[currentQuestionIndex];
        const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

        const newAnswer: QuizAnswer = {
            questionId: currentQuestion.id,
            selectedAnswer,
            isCorrect,
            timeSpent: Date.now() - questionStartTime,
        };

        setAnswers((prev) => [...prev, newAnswer]);
        setIsSubmitted(true);

        // Auto-advance after 2 seconds
        setTimeout(() => {
            nextQuestion();
        }, 2000);
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < quiz!.questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setSelectedAnswer("");
            setIsSubmitted(false);
            setQuestionStartTime(Date.now());
            setTimeLeft(
                quiz!.questions[currentQuestionIndex + 1]?.timeLimit || 30
            );
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = async () => {
        if (!quiz || !user) return;

        const correctAnswers = answers.filter((a) => a.isCorrect).length;
        const score = Math.round(
            (correctAnswers / quiz.questions.length) * 100
        );
        const totalTimeSpent = Math.round((Date.now() - quizStartTime) / 1000);

        // Save quiz session
        try {
            await userDataService.saveQuizSession({
                userId: user.uid,
                title: quiz.title,
                topic: quiz.subcategory || quiz.category,
                difficulty: quiz.difficulty,
                questionsCount: quiz.questions.length,
                correctAnswers,
                score,
                timeSpent: totalTimeSpent,
                completedAt: new Date(),
                questions: answers.map((answer, index) => ({
                    question: quiz.questions[index].question,
                    userAnswer: answer.selectedAnswer,
                    correctAnswer: quiz.questions[index].correctAnswer,
                    isCorrect: answer.isCorrect,
                    timeSpent: Math.round(answer.timeSpent / 1000),
                })),
            });
        } catch (error) {
            console.error("Error saving quiz session:", error);
        }

        setShowResults(true);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const getScoreMessage = (score: number) => {
        if (score >= 90) return "Excellent! You're a master! 🏆";
        if (score >= 80) return "Great job! Well done! 🎉";
        if (score >= 70) return "Good work! Keep it up! 👍";
        if (score >= 60) return "Not bad! Room for improvement! 📚";
        return "Keep practicing! You'll get there! 💪";
    };

    if (!quiz) {
        return (
            <ProtectedRoute requireAuth={true}>
                <div className="container mx-auto max-w-4xl py-8">
                    <Card>
                        <CardContent className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold mb-2">
                                    Quiz not found
                                </h2>
                                <p className="text-muted-foreground mb-4">
                                    The requested quiz could not be found.
                                </p>
                                <Link href="/topics">
                                    <Button>
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Topics
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </ProtectedRoute>
        );
    }

    if (showResults) {
        const correctAnswers = answers.filter((a) => a.isCorrect).length;
        const score = Math.round(
            (correctAnswers / quiz.questions.length) * 100
        );
        const totalTime = Math.round((Date.now() - quizStartTime) / 60000); // minutes

        return (
            <ProtectedRoute requireAuth={true}>
                <div className="container mx-auto max-w-4xl py-8">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <Trophy className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-3xl">
                                Quiz Complete!
                            </CardTitle>
                            <CardDescription className="text-lg">
                                {getScoreMessage(score)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="text-center">
                                    <div
                                        className={`text-4xl font-bold ${getScoreColor(
                                            score
                                        )}`}
                                    >
                                        {score}%
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Final Score
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-primary">
                                        {correctAnswers}/{quiz.questions.length}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Correct Answers
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-primary">
                                        {totalTime}m
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Time Taken
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">
                                    Question Review
                                </h3>
                                {quiz.questions.map((question, index) => {
                                    const answer = answers[index];
                                    return (
                                        <Card
                                            key={question.id}
                                            className="border-l-4 border-l-gray-200"
                                        >
                                            <CardContent className="pt-4">
                                                <div className="flex items-start gap-3">
                                                    {answer?.isCorrect ? (
                                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                                    ) : (
                                                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="font-medium mb-2">
                                                            {question.question}
                                                        </p>
                                                        <div className="space-y-1 text-sm">
                                                            <p>
                                                                <span className="text-muted-foreground">
                                                                    Your answer:
                                                                </span>{" "}
                                                                <span
                                                                    className={
                                                                        answer?.isCorrect
                                                                            ? "text-green-600"
                                                                            : "text-red-600"
                                                                    }
                                                                >
                                                                    {answer?.selectedAnswer ||
                                                                        "No answer"}
                                                                </span>
                                                            </p>
                                                            {!answer?.isCorrect && (
                                                                <p>
                                                                    <span className="text-muted-foreground">
                                                                        Correct
                                                                        answer:
                                                                    </span>{" "}
                                                                    <span className="text-green-600">
                                                                        {
                                                                            question.correctAnswer
                                                                        }
                                                                    </span>
                                                                </p>
                                                            )}
                                                            {question.explanation && (
                                                                <p className="text-muted-foreground mt-2">
                                                                    💡{" "}
                                                                    {
                                                                        question.explanation
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    onClick={() => window.location.reload()}
                                    className="flex-1"
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Retake Quiz
                                </Button>
                                <Link href="/topics" className="flex-1">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Topics
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </ProtectedRoute>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    return (
        <ProtectedRoute requireAuth={true}>
            <div className="container mx-auto max-w-4xl py-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <Link href="/topics">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Topics
                            </Button>
                        </Link>
                        <div className="flex items-center gap-4">
                            <Badge variant="outline">{quiz.difficulty}</Badge>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {timeLeft}s
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold">{quiz.title}</h1>
                            <span className="text-sm text-muted-foreground">
                                {currentQuestionIndex + 1} of{" "}
                                {quiz.questions.length}
                            </span>
                        </div>
                        <Progress value={progress} className="w-full" />
                    </div>
                </div>

                {/* Question */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <Brain className="h-5 w-5 text-primary" />
                            <Badge variant="secondary" className="text-xs">
                                Question {currentQuestionIndex + 1}
                            </Badge>
                        </div>
                        <CardTitle className="text-xl leading-relaxed">
                            {currentQuestion.question}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3">
                            {currentQuestion.options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(option)}
                                    disabled={isSubmitted}
                                    className={`
                                        p-4 text-left rounded-lg border-2 dark:border-gray-500 transition-all
                                        ${
                                            selectedAnswer === option
                                                ? isSubmitted
                                                    ? option ===
                                                      currentQuestion.correctAnswer
                                                        ? "border-green-500 bg-green-50 text-green-800"
                                                        : "border-red-500 bg-red-50 text-red-800"
                                                    : "border-primary bg-primary/5 dark:bg-primary/10"
                                                : isSubmitted &&
                                                  option ===
                                                      currentQuestion.correctAnswer
                                                ? "border-green-500 bg-green-50 text-green-800"
                                                : "border-gray-200 hover:border-gray-300"
                                        }
                                        ${
                                            isSubmitted
                                                ? "cursor-not-allowed"
                                                : "cursor-pointer hover:shadow-sm"
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`
                                            w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium
                                            ${
                                                selectedAnswer === option
                                                    ? isSubmitted
                                                        ? option ===
                                                          currentQuestion.correctAnswer
                                                            ? "border-green-500 bg-green-500 text-white"
                                                            : "border-red-500 bg-red-500 text-white"
                                                        : "border-primary bg-primary text-white dark:text-black"
                                                    : isSubmitted &&
                                                      option ===
                                                          currentQuestion.correctAnswer
                                                    ? "border-green-500 bg-green-500 text-white"
                                                    : "border-gray-300"
                                            }
                                        `}
                                        >
                                            {String.fromCharCode(65 + index)}
                                        </div>
                                        <span className="flex-1">{option}</span>
                                        {isSubmitted && (
                                            <>
                                                {option ===
                                                    currentQuestion.correctAnswer && (
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                )}
                                                {selectedAnswer === option &&
                                                    option !==
                                                        currentQuestion.correctAnswer && (
                                                        <XCircle className="h-5 w-5 text-red-600" />
                                                    )}
                                            </>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {!isSubmitted && (
                            <Button
                                onClick={handleAnswerSubmit}
                                disabled={!selectedAnswer}
                                className="w-full mt-6"
                            >
                                Submit Answer
                            </Button>
                        )}

                        {isSubmitted && currentQuestion.explanation && (
                            <Card className="mt-4 border-blue-200 bg-blue-50">
                                <CardContent className="pt-4">
                                    <div className="flex items-start gap-2">
                                        <span className="text-lg">💡</span>
                                        <div>
                                            <p className="font-medium text-blue-900 mb-1">
                                                Explanation
                                            </p>
                                            <p className="text-blue-800 text-sm">
                                                {currentQuestion.explanation}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
