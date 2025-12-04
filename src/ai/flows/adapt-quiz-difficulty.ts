'use server';

/**
 * @fileOverview Dynamically adjusts quiz difficulty based on user performance.
 *
 * - adaptQuizDifficulty - A function that adjusts the quiz difficulty.
 * - AdaptQuizDifficultyInput - The input type for the adaptQuizDifficulty function.
 * - AdaptQuizDifficultyOutput - The return type for the adaptQuizDifficulty function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptQuizDifficultyInputSchema = z.object({
  userPerformance: z
    .number()
    .describe(
      'The user performance score, as a percentage (0-100), on the current quiz. '
    ),
  currentDifficulty: z
    .string()
    .describe(
      'The current difficulty level of the quiz: easy, medium, or hard.'
    ),
});
export type AdaptQuizDifficultyInput = z.infer<typeof AdaptQuizDifficultyInputSchema>;

const AdaptQuizDifficultyOutputSchema = z.object({
  newDifficulty: z
    .string()
    .describe(
      'The new difficulty level of the quiz, adjusted based on user performance: easy, medium, or hard.'
    ),
  reasoning: z
    .string()
    .describe(
      'The reasoning behind the difficulty adjustment decision, explaining why the difficulty was increased or kept the same.'
    ),
});
export type AdaptQuizDifficultyOutput = z.infer<typeof AdaptQuizDifficultyOutputSchema>;

export async function adaptQuizDifficulty(
  input: AdaptQuizDifficultyInput
): Promise<AdaptQuizDifficultyOutput> {
  return adaptQuizDifficultyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptQuizDifficultyPrompt',
  input: {schema: AdaptQuizDifficultyInputSchema},
  output: {schema: AdaptQuizDifficultyOutputSchema},
  prompt: `You are an AI quiz master responsible for dynamically adjusting the quiz difficulty based on the user\'s performance. You should only increase the difficulty if the user's performance on the previous quiz indicates they are ready for a greater challenge.

  Here\'s the information about the user\'s performance:
  - User Performance: {{userPerformance}}%
  - Current Difficulty: {{currentDifficulty}}

  Based on this information, determine the new difficulty level and provide a brief reasoning for your decision.

  Output:
  - If the user performance is greater than 80% AND the current difficulty is not \'hard\', increase the difficulty to the next level (easy -> medium, medium -> hard).
  - Otherwise, maintain the current difficulty level.
  - Only increase the difficulty by one level at a time. Do not jump from easy to hard, for example.
  - The difficulty should only be one of \'easy\', \'medium\', or \'hard\'.
`,
});

const adaptQuizDifficultyFlow = ai.defineFlow(
  {
    name: 'adaptQuizDifficultyFlow',
    inputSchema: AdaptQuizDifficultyInputSchema,
    outputSchema: AdaptQuizDifficultyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
