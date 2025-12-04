"use server";

/**
 * @fileOverview A quiz question generation AI agent.
 *
 * - generateQuizQuestions - A function that handles the quiz question generation process.
 * - GenerateQuizQuestionsInput - The input type for the generateQuizQuestions function.
 * - GenerateQuizQuestionsOutput - The return type for the generateQuizQuestions function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const GenerateQuizQuestionsInputSchema = z.object({
    content: z
        .string()
        .describe(
            "The content to generate quiz questions from. This can be text from a PDF, DOCX, PPT, TXT, or plain text."
        ),
    difficulty: z
        .enum(["easy", "medium", "hard"])
        .default("medium")
        .describe("The difficulty level of the quiz questions."),
    numQuestions: z
        .number()
        .min(1)
        .max(10)
        .default(5)
        .describe("The number of quiz questions to generate."),
    quizType: z
        .enum(["qa", "mcq"])
        .default("mcq")
        .describe(
            "The type of quiz to generate: question/answer or multiple choice."
        ),
});
export type GenerateQuizQuestionsInput = z.infer<
    typeof GenerateQuizQuestionsInputSchema
>;

const GenerateQuizQuestionsOutputSchema = z.object({
    questions: z
        .array(
            z.object({
                question: z.string().describe("The quiz question."),
                answer: z
                    .string()
                    .describe("The correct answer to the quiz question."),
                options: z
                    .array(z.string())
                    .optional()
                    .describe(
                        "An array of 4 options for multiple choice questions. The correct answer must be one of these options."
                    ),
            })
        )
        .describe("An array of quiz questions and answers."),
});
export type GenerateQuizQuestionsOutput = z.infer<
    typeof GenerateQuizQuestionsOutputSchema
>;

export async function generateQuizQuestions(
    input: GenerateQuizQuestionsInput
): Promise<GenerateQuizQuestionsOutput> {
    return generateQuizQuestionsFlow(input);
}

const prompt = ai.definePrompt({
    name: "generateQuizQuestionsPrompt",
    input: { schema: GenerateQuizQuestionsInputSchema },
    output: { schema: GenerateQuizQuestionsOutputSchema },
    prompt: `You are an expert quiz creator. Your task is to generate exactly {{numQuestions}} multiple-choice questions based on the provided content. The difficulty of these questions must be '{{difficulty}}'. Each question must have a clear and concise answer found directly within the provided text.

  **Content to Analyze:**
  \`\`\`
  {{{content}}}
  \`\`\`

  **Instructions:**
  1.  Carefully read the content provided.
  2.  Create exactly {{numQuestions}} questions.
  3.  For each question, provide one correct answer based *only* on the information in the content.
  4.  Do not use any external knowledge.
  5.  Ensure the questions match the requested difficulty level: '{{difficulty}}'.
  6.  For each question, you MUST generate an 'options' array containing exactly 4 string options.
  7.  One of the options must be the correct answer. The other three options should be plausible but incorrect distractors.
  8.  The value in the 'answer' field MUST exactly match one of the values in the 'options' array.
  9.  You must provide the output in the required JSON format.

  Generate the quiz now.
`,
});

const generateQuizQuestionsFlow = ai.defineFlow(
    {
        name: "generateQuizQuestionsFlow",
        inputSchema: GenerateQuizQuestionsInputSchema,
        outputSchema: GenerateQuizQuestionsOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
