export interface Question {
    question: string;
    answer: string;
    correctAnswer?: string;
    options?: string[];
}

export interface QuizAnswer {
    questionIndex: number;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
}

export type Difficulty = "easy" | "medium" | "hard";
export type QuizType = "mcq";

export interface QuizSettings {
    numQuestions: number;
    difficulty: Difficulty;
    content: string;
    quizType: QuizType;
}

export type AppState = "setup" | "loading" | "quiz" | "results";
