"use client";

import React, { useState, useCallback, useEffect } from "react";
import type { AppState, Question, Difficulty, QuizType } from "@/lib/types";
import { ContentSetup } from "./content-setup";
import { QuizView } from "./quiz-view";
import { QuizResults } from "./quiz-results";
import { useAuth } from "@/contexts/AuthContext";
import { userDataService } from "@/lib/userDataService";
import { useSearchParams } from "next/navigation";
import { getQuizById } from "@/lib/quizData";

export function QuizContainer() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const [appState, setAppState] = useState<AppState>("setup");
    const [questions, setQuestions] = useState<Question[]>([]);
    const [difficulty, setDifficulty] = useState<Difficulty>("medium");
    const [score, setScore] = useState(0);
    const [quizTitle, setQuizTitle] = useState("");
    const [quizTopic, setQuizTopic] = useState("");
    const [startTime, setStartTime] = useState<number>(0);

    // Pre-fill from URL params (e.g., from topics page)
    useEffect(() => {
        const topic = searchParams?.get("topic");
        const difficultyParam = searchParams?.get("difficulty") as Difficulty;
        const quizId = searchParams?.get("quizId");

        // If we have a quiz ID, load that specific quiz
        if (quizId) {
            const quiz = getQuizById(quizId);
            if (quiz) {
                const formattedQuestions: Question[] = quiz.questions.map(
                    (q, index) => ({
                        id: q.id,
                        question: q.question,
                        options: q.options,
                        answer: q.correctAnswer, // Map correctAnswer to answer
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation,
                        category: quiz.subcategory || quiz.category,
                        difficulty: q.difficulty,
                        type: "mcq" as QuizType,
                    })
                );

                setQuestions(formattedQuestions);
                setDifficulty(quiz.difficulty);
                setQuizTitle(quiz.title);
                setQuizTopic(quiz.subcategory || quiz.category);
                setStartTime(Date.now());
                setAppState("quiz");
            }
        } else {
            // Use URL params for custom quiz setup
            if (topic) setQuizTopic(topic);
            if (
                difficultyParam &&
                ["easy", "medium", "hard"].includes(difficultyParam)
            ) {
                setDifficulty(difficultyParam);
            }
        }
    }, [searchParams]);

    const handleQuizStart = useCallback(
        (
            newQuestions: Question[],
            newDifficulty: Difficulty,
            title?: string,
            topic?: string
        ) => {
            setQuestions(newQuestions);
            setDifficulty(newDifficulty);
            setScore(0);
            setQuizTitle(title || "Custom Quiz");
            setQuizTopic(topic || "General");
            setStartTime(Date.now());
            setAppState("quiz");
        },
        []
    );

    const handleQuizComplete = useCallback(
        async (finalScore: number, userAnswers?: any[]) => {
            setScore(finalScore);

            // Save quiz session to Firestore
            if (user && questions.length > 0 && userAnswers) {
                try {
                    const endTime = Date.now();
                    const timeSpent = Math.round((endTime - startTime) / 1000); // in seconds
                    const correctAnswers = userAnswers.filter(
                        (answer) => answer.isCorrect
                    ).length;
                    const scorePercentage = Math.round(
                        (correctAnswers / questions.length) * 100
                    );

                    await userDataService.saveQuizSession({
                        userId: user.uid,
                        title: quizTitle,
                        topic: quizTopic,
                        difficulty,
                        questionsCount: questions.length,
                        correctAnswers,
                        score: scorePercentage,
                        timeSpent,
                        completedAt: new Date(),
                        questions: userAnswers.map((answer, index) => ({
                            question: questions[index]?.question || "",
                            userAnswer: answer.selectedAnswer || "",
                            correctAnswer:
                                questions[index]?.answer ||
                                questions[index]?.correctAnswer ||
                                "",
                            isCorrect: answer.isCorrect || false,
                            timeSpent: answer.timeSpent || 0,
                        })),
                    });

                    // Update user streak
                    await userDataService.updateUserStreak(user.uid);
                } catch (error) {
                    console.error("Error saving quiz session:", error);
                }
            }

            setAppState("results");
        },
        [user, questions, startTime, quizTitle, quizTopic, difficulty]
    );

    const handleRestart = useCallback(() => {
        setAppState("setup");
        setQuestions([]);
    }, []);

    switch (appState) {
        case "setup":
            return <ContentSetup onQuizStart={handleQuizStart} />;
        case "quiz":
            return (
                <QuizView
                    questions={questions}
                    difficulty={difficulty}
                    quizType={"mcq"}
                    onQuizComplete={handleQuizComplete}
                />
            );
        case "results":
            return (
                <QuizResults
                    score={score}
                    total={questions.length}
                    initialDifficulty={difficulty}
                    onRestart={handleRestart}
                />
            );
        case "loading":
        default:
            return null; // Loading state is handled inside ContentSetup
    }
}
