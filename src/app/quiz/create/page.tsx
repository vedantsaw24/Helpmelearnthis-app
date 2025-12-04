"use client";

import React from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { QuizContainer } from "@/components/quiz-container";

export default function CreateQuizPage() {
    return (
        <ProtectedRoute requireAuth={true}>
            <div className="container mx-auto max-w-4xl py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Create New Quiz
                    </h1>
                    <p className="text-muted-foreground">
                        Upload content or enter a topic to generate personalized
                        quiz questions
                    </p>
                </div>
                <QuizContainer />
            </div>
        </ProtectedRoute>
    );
}
