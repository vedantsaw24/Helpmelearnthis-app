"use server";

import { generateQuizQuestions } from "@/ai/flows/generate-quiz-questions";
import { adaptQuizDifficulty } from "@/ai/flows/adapt-quiz-difficulty";
import type { Difficulty } from "@/lib/types";
import { z } from "zod";
import { checkServerActionRateLimit, rateLimiters } from "@/lib/rate-limiter";
import { extractTextFromUpload, sanitizeQuestions } from "@/lib/file-extract";

// Fallback question generation for when AI fails (fill-in-the-blank + generic)
function generateFallbackQuestions(
    content: string,
    numQuestions: number,
    difficulty: Difficulty
) {
    const text = content.replace(/\s+/g, " ").trim();
    const sentences = text
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 30);

    const STOP = new Set([
        "the",
        "and",
        "for",
        "from",
        "with",
        "that",
        "this",
        "these",
        "those",
        "into",
        "onto",
        "about",
        "your",
        "their",
        "there",
        "here",
        "have",
        "has",
        "had",
        "will",
        "would",
        "could",
        "should",
        "a",
        "an",
        "to",
        "of",
        "in",
        "on",
        "is",
        "are",
        "was",
        "were",
        "be",
        "as",
        "by",
        "or",
        "it",
        "at",
        "we",
        "you",
        "they",
        "he",
        "she",
        "them",
        "his",
        "her",
        "our",
        "its",
        "but",
        "not",
    ]);

    function candidateTokens(s: string) {
        const hyphenated =
            s.match(/\b[A-Za-z][A-Za-z0-9]*-[A-Za-z0-9-]+\b/g) || [];
        const words = s
            .split(/[^A-Za-z0-9-]+/)
            .filter(Boolean)
            .filter((w) => w.length >= 5 && !STOP.has(w.toLowerCase()));
        const all = Array.from(new Set([...hyphenated, ...words]));
        return all.sort((a, b) => {
            const ha = a.includes("-") ? 1 : 0;
            const hb = b.includes("-") ? 1 : 0;
            if (hb !== ha) return hb - ha;
            return b.length - a.length;
        });
    }

    const globalPool = Array.from(
        new Set(
            text
                .toLowerCase()
                .split(/[^a-z0-9-]+/)
                .filter((w) => w.length >= 4 && !STOP.has(w))
        )
    );

    const out: { question: string; answer: string; options: string[] }[] = [];

    for (const s of sentences) {
        if (out.length >= numQuestions) break;
        const cands = candidateTokens(s);
        if (cands.length === 0) continue;
        const answer = cands[0];
        const re = new RegExp(
            `\\b${answer.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`
        );
        const masked = s.replace(re, "_____");
        if (masked === s) continue;

        const localDistractors = cands
            .slice(1)
            .filter((w) => w.toLowerCase() !== answer.toLowerCase());
        const pool = [
            ...localDistractors,
            ...globalPool.filter((w) => w !== answer.toLowerCase()),
        ];
        const options: string[] = [answer];
        for (const w of pool) {
            if (options.length >= 4) break;
            if (!options.some((o) => o.toLowerCase() === w.toLowerCase())) {
                options.push(w);
            }
        }
        while (options.length < 4) options.push(`Option ${options.length + 1}`);

        out.push({
            question: `Fill in the blank: ${masked}`,
            answer,
            options,
        });
    }

    while (out.length < numQuestions) {
        const level =
            difficulty === "easy"
                ? "basic"
                : difficulty === "medium"
                ? "intermediate"
                : "advanced";
        const answer =
            difficulty === "easy"
                ? "fundamental concepts"
                : difficulty === "medium"
                ? "key ideas and relationships"
                : "deeper implications and applications";
        const options = [
            answer,
            "surface details",
            "unrelated facts",
            "stylistic choices",
        ];
        out.push({
            question: `At a ${level} level, what should a learner focus on?`,
            answer,
            options,
        });
    }

    return out.slice(0, numQuestions);
}

// Main server action to generate a quiz
export async function generateQuizAction(
    _prevState: { type: string; message?: string },
    formData: FormData
) {
    try {
        // Rate limit per anonymous/user action
        const rate = await checkServerActionRateLimit(
            null,
            "generateQuiz",
            rateLimiters.aiGeneration
        );
        if (!rate.allowed) {
            return {
                type: "error",
                message:
                    rate.message || "Rate limit exceeded. Please try later.",
                retryAfter: rate.retryAfter,
            } as const;
        }

        // Parse inputs
        const rawContent = (formData.get("content") as string) || "";
        const difficultyRaw = (
            (formData.get("difficulty") as string) || "medium"
        ).toLowerCase();
        const numRaw = (formData.get("numQuestions") as string) || "5";
        const file = formData.get("file") as File | null;

        const difficulty: Difficulty = ["easy", "medium", "hard"].includes(
            difficultyRaw
        )
            ? (difficultyRaw as Difficulty)
            : "medium";

        let numQuestions = Number.parseInt(numRaw, 10);
        if (!Number.isFinite(numQuestions)) numQuestions = 5;
        numQuestions = Math.max(1, Math.min(10, numQuestions));

        let fileText = "";
        if (
            file &&
            typeof (file as any).arrayBuffer === "function" &&
            (file as any).size > 0
        ) {
            fileText = await extractTextFromUpload(file);
        }
        const content = [rawContent, fileText]
            .filter(Boolean)
            .join("\n")
            .trim();

        // Validate minimal content length (words)
        const wordCount = content.split(/\s+/).filter(Boolean).length;
        if (wordCount < 5) {
            const hadFile = !!file && ((file as any).size ?? 0) > 0;
            return {
                type: "error",
                message: hadFile
                    ? "We couldn't extract text from the uploaded file. Please try a different file, re-upload, or convert it to TXT/PDF/DOCX/PPTX."
                    : "Please provide at least 5 words of content or a non-empty file.",
            } as const;
        }

        // Try AI flow first
        let result: any;
        try {
            result = await generateQuizQuestions({
                content,
                numQuestions,
                difficulty,
                quizType: "mcq",
            });
        } catch (e) {
            // Fallback on any AI failure
            const fallback = generateFallbackQuestions(
                content,
                numQuestions,
                difficulty
            );
            result = { questions: fallback };
        }

        const cleaned = sanitizeQuestions(result.questions || [], numQuestions);
        if (!cleaned.length) {
            return {
                type: "error",
                message:
                    "Could not generate a quiz. Please try different content.",
            } as const;
        }

        return {
            type: "success",
            questions: cleaned,
            quizType: "mcq",
        } as const;
    } catch (error) {
        console.error(error);
        return {
            type: "error",
            message: "An unexpected error occurred while generating the quiz.",
        } as const;
    }
}

export async function adaptDifficultyAction(
    userPerformance: number,
    currentDifficulty: Difficulty,
    userId?: string
) {
    try {
        // Check rate limit for difficulty adaptation
        const rateLimitCheck = await checkServerActionRateLimit(
            userId || null,
            "adaptDifficulty",
            rateLimiters.general
        );

        if (!rateLimitCheck.allowed) {
            return {
                type: "error",
                message: rateLimitCheck.message || "Rate limit exceeded",
                retryAfter: rateLimitCheck.retryAfter,
            } as const;
        }

        const result = await adaptQuizDifficulty({
            userPerformance,
            currentDifficulty,
        });
        return { type: "success", data: result } as const;
    } catch (error) {
        console.error(error);
        return {
            type: "error",
            message: "Failed to adapt difficulty.",
        } as const;
    }
}
