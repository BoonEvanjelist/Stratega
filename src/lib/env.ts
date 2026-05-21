/**
 * Strict Environment Validator
 *
 * This utility enforces that all critical environment variables are present
 * before the application logic runs. It guarantees the application will crash
 * heavily and immediately during the build or startup phase if keys are missing,
 * rather than failing silently or causing unexpected behavior during runtime.
 */

interface EnvConfig {
  MONGODB_URI: string;
  SESSION_SECRET: string;
  GEMINI_API_KEY: string;
}

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value || value.trim().length === 0) {
    throw new Error(`[CRITICAL] Missing or empty environment variable: ${key}`);
  }
  return value;
}

export function validateEnv(): EnvConfig {
  // We strictly validate only in production so as not to aggressively block
  // simple local UI tweaks if a developer hasn't configured a full .env yet,
  // but for Stratega, these 3 are inherently required for most backend features anyway.
  if (process.env.NODE_ENV === "production") {
    return {
      MONGODB_URI: getEnvVar("MONGODB_URI"),
      SESSION_SECRET: getEnvVar("SESSION_SECRET"),
      GEMINI_API_KEY: getEnvVar("GEMINI_API_KEY"),
    };
  }

  // Best-effort for development mode
  return {
    MONGODB_URI: process.env.MONGODB_URI || "",
    SESSION_SECRET: process.env.SESSION_SECRET || "",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  };
}

export const env = validateEnv();
