import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error(
        "Missing Google AI API Key! Please set GEMINI_API_KEY in your .env.local file"
    );
}

export const ai = genkit({
    plugins: [
        googleAI({
            apiKey: apiKey,
        }),
    ],
    model: "googleai/gemini-1.5-flash-latest",
});
