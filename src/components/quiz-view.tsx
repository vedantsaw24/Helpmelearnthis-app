"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ChevronsRight, CheckCircle, XCircle, Clock } from "lucide-react";
import type { Question, Difficulty, QuizType } from "@/lib/types";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useTimeTracker } from "@/hooks/use-time-tracker";
import { userDataService } from "@/lib/userDataService";

interface QuizViewProps {
    questions: Question[];
    difficulty: Difficulty;
    quizType: QuizType;
    quizTitle?: string;
    quizTopic?: string;
    onQuizComplete: (
        score: number,
        userAnswers?: any[],
        timeSpent?: number
    ) => void;
}

type AnswerState = "unanswered" | "answered";

export function QuizView({
    questions,
    difficulty,
    quizType,
    quizTitle = "Quiz",
    quizTopic = "General",
    onQuizComplete,
}: QuizViewProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState("");
    const [answerState, setAnswerState] = useState<AnswerState>("unanswered");
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [userAnswers, setUserAnswers] = useState<any[]>([]);
    const [questionStartTime, setQuestionStartTime] = useState<number>(
        Date.now()
    );

    const { start, stop, getElapsedTime, getFormattedTime, isActive } =
        useTimeTracker();

    // Safety check for empty questions
    if (!questions || questions.length === 0) {
        return (
            <Card className="max-w-4xl mx-auto mt-8">
                <CardContent className="p-8 text-center">
                    <p className="text-lg text-muted-foreground">
                        No questions available for this quiz.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    // Additional safety check for current question
    if (!currentQuestion) {
        return (
            <Card className="max-w-4xl mx-auto mt-8">
                <CardContent className="p-8 text-center">
                    <p className="text-lg text-muted-foreground">
                        Question not found.
                    </p>
                </CardContent>
            </Card>
        );
    }
    const progress = useMemo(
        () => (currentQuestionIndex / questions.length) * 100,
        [currentQuestionIndex, questions.length]
    );

    // Start timer when component mounts
    useEffect(() => {
        start();
        setQuestionStartTime(Date.now());
    }, []);

    // Update question start time when moving to next question
    useEffect(() => {
        setQuestionStartTime(Date.now());
    }, [currentQuestionIndex]);

    const handleAnswerSelect = (selectedAnswer: string) => {
        if (answerState !== "unanswered") return;
        setSelectedOption(selectedAnswer);
    };

    const handleAnswerSubmit = () => {
        if (!selectedOption) return;

        const questionTimeSpent = Math.floor(
            (Date.now() - questionStartTime) / 1000
        );
        const correct =
            selectedOption.trim().toLowerCase() ===
            currentQuestion.answer.trim().toLowerCase();

        if (correct) {
            setScore((s) => s + 1);
            setIsCorrect(true);
        } else {
            setIsCorrect(false);
        }

        // Store the user's answer with time tracking
        const answerRecord = {
            questionIndex: currentQuestionIndex,
            question: currentQuestion.question,
            selectedAnswer: selectedOption,
            correctAnswer: currentQuestion.answer,
            isCorrect: correct,
            timeSpent: questionTimeSpent,
        };

        setUserAnswers((prev) => [...prev, answerRecord]);
        setAnswerState("answered");
    };

    const handleNextQuestion = async () => {
        if (answerState === "unanswered") return;
        setIsAnimating(true);

        setTimeout(async () => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex((i) => i + 1);
                setSelectedOption("");
                setAnswerState("unanswered");
                setIsCorrect(null);
                setIsAnimating(false);
            } else {
                // Quiz is complete - save results and pass data to parent
                const totalTimeSpent = stop();

                // Save quiz result to localStorage
                try {
                    const quizResult = {
                        id: `quiz_${Date.now()}`,
                        title: quizTitle,
                        topic: quizTopic,
                        difficulty,
                        score: Math.round((score / questions.length) * 100),
                        totalQuestions: questions.length,
                        correctAnswers: score,
                        timeSpent: totalTimeSpent,
                        completedAt: new Date(),
                        questions: questions.map((q, idx) => ({
                            id: `q_${idx}`,
                            question: q.question,
                            options: q.options || [],
                            correctAnswer: q.answer,
                            userAnswer: userAnswers[idx]?.selectedAnswer || "",
                            timeSpent: userAnswers[idx]?.timeSpent || 0,
                            isCorrect: userAnswers[idx]?.isCorrect || false,
                        })),
                        userAnswers: userAnswers,
                    };

                    await userDataService.saveQuizResult(quizResult);
                } catch (error) {
                    console.error("Error saving quiz result:", error);
                }

                onQuizComplete(score, userAnswers, totalTimeSpent);
                setIsAnimating(false);
            }
        }, 300); // Match animation duration
    };

    return (
        <div
            className={cn(
                "animate-fade-in px-4 sm:px-0",
                isAnimating && "animate-slide-out-to-left"
            )}
        >
            <Card
                className={cn(
                    "w-full max-w-2xl mx-auto transition-all",
                    isAnimating && "opacity-0"
                )}
            >
                <CardHeader className="px-4 sm:px-6 pb-3 sm:pb-6">
                    <div className="flex justify-between items-center mb-2">
                        <CardTitle className="text-lg sm:text-xl">
                            Question {currentQuestionIndex + 1}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{getFormattedTime()}</span>
                            </div>
                            <div>
                                Score: {score}/{questions.length}
                            </div>
                        </div>
                    </div>
                    <Progress value={progress} className="w-full h-2" />
                    <CardDescription className="pt-4 text-base sm:text-lg font-semibold text-foreground leading-relaxed">
                        {currentQuestion.question}
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                    {quizType === "mcq" ? (
                        <div className="grid grid-cols-1 gap-2 sm:gap-3">
                            {currentQuestion.options?.map((option, index) => {
                                const isSelected = selectedOption === option;
                                const isAnswered = answerState === "answered";
                                const isTheCorrectAnswer =
                                    currentQuestion.answer === option;

                                return (
                                    <Button
                                        key={index}
                                        variant={
                                            isSelected
                                                ? isAnswered
                                                    ? isCorrect
                                                        ? "default"
                                                        : "destructive"
                                                    : "default"
                                                : "outline"
                                        }
                                        className={cn(
                                            "w-full justify-start h-auto py-3 sm:py-4 px-4 text-left whitespace-normal transition-colors min-h-12 text-sm sm:text-base",
                                            // Correct answer styling (always green)
                                            isAnswered &&
                                                isTheCorrectAnswer &&
                                                "bg-green-600 hover:bg-green-700 text-white border-green-600 dark:bg-green-700 dark:hover:bg-green-800",
                                            // Wrong answer styling (red for selected wrong answer)
                                            isAnswered &&
                                                !isTheCorrectAnswer &&
                                                isSelected &&
                                                "bg-red-600 hover:bg-red-700 text-white border-red-600 dark:bg-red-700 dark:hover:bg-red-800",
                                            // Selected but not answered yet (blue/primary color with good contrast)
                                            !isAnswered &&
                                                isSelected &&
                                                "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white",
                                            // Default outline style for unselected options
                                            !isSelected &&
                                                "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground"
                                        )}
                                        onClick={() =>
                                            handleAnswerSelect(option)
                                        }
                                        disabled={answerState === "answered"}
                                    >
                                        {option}
                                    </Button>
                                );
                            })}
                        </div>
                    ) : null}

                    {answerState === "unanswered" && selectedOption && (
                        <Button
                            type="button"
                            onClick={handleAnswerSubmit}
                            className="w-full mt-4 h-12 sm:h-11 text-base font-medium"
                        >
                            Submit Answer
                        </Button>
                    )}

                    {answerState === "answered" && (
                        <Button
                            type="button"
                            onClick={handleNextQuestion}
                            className="w-full mt-4 h-12 sm:h-11 text-base font-medium"
                        >
                            {currentQuestionIndex === questions.length - 1
                                ? "Finish Quiz"
                                : "Next Question"}
                            <ChevronsRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}

                    {answerState === "answered" && isCorrect === true && (
                        <div className="mt-4 flex items-center rounded-md border border-green-500 bg-green-50 p-4 text-green-700 animate-fade-in dark:bg-green-900/20 dark:text-green-400">
                            <CheckCircle className="mr-2 h-5 w-5" />
                            <div>
                                <p className="font-bold">Correct!</p>
                            </div>
                        </div>
                    )}

                    {answerState === "answered" && isCorrect === false && (
                        <div className="mt-4 flex items-center rounded-md border border-red-500 bg-red-50 p-4 text-red-700 animate-fade-in dark:bg-red-900/20 dark:text-red-400">
                            <XCircle className="mr-2 h-5 w-5" />
                            <div>
                                <p className="font-bold">Incorrect.</p>
                                <p>
                                    The correct answer is:{" "}
                                    {currentQuestion.answer}
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
