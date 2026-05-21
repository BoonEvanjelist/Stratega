/**
 * Shared Vercel AI SDK Google provider instance.
 *
 * Using the singleton pattern prevents creating a new provider object
 * on every request in the serverless environment.
 *
 * REQUIRED env var:  GEMINI_API_KEY
 */
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const rawKey = process.env.GEMINI_API_KEY;

if (!rawKey && process.env.NODE_ENV === "production") {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

export const gemini = createGoogleGenerativeAI({
  apiKey: rawKey ?? "missing-key-check-env",
});

/**
 * Upgraded to gemini-2.5-pro for maximum intelligence and quality.
 * Pro model offers superior reasoning, longer context, and better
 * structured output — ideal for academic study assistance.
 */
export const CHAT_MODEL      = gemini("gemini-2.5-pro-preview-05-06");
export const SUMMARY_MODEL   = gemini("gemini-2.5-pro-preview-05-06");
export const FLASHCARD_MODEL = gemini("gemini-2.5-pro-preview-05-06");

/**
 * Gemini 2.5 Pro has a 1M token context window (~750K words).
 * We cap at 200K chars (~50K tokens) — much higher than Flash
 * since Pro handles large contexts with better comprehension.
 */
export const MAX_CONTEXT_CHARS = 200_000;

