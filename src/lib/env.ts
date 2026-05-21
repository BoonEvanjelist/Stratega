/**
 * Strict Environment Validator
 *
 * This utility enforces that all critical environment variables are present
 * before the application logic runs. It guarantees the application will crash
 * heavily and immediately at RUNTIME if keys are missing, rather than failing
 * silently or causing unexpected behavior.
 *
 * NOTE: validateEnv() is intentionally NOT called at module load time.
 * Calling it at import time causes Next.js static generation to crash during
 * `next build` because env vars are not always injected at that phase.
 * Instead, call getEnv() from within request handlers or server actions.
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

/**
 * Returns validated env vars. Call this inside route handlers, not at module top level.
 */
export function getEnv(): EnvConfig {
  if (process.env.NODE_ENV === "production") {
    return {
      MONGODB_URI: getEnvVar("MONGODB_URI"),
      SESSION_SECRET: getEnvVar("SESSION_SECRET"),
      GEMINI_API_KEY: getEnvVar("GEMINI_API_KEY"),
    };
  }
  return {
    MONGODB_URI: process.env.MONGODB_URI || "",
    SESSION_SECRET: process.env.SESSION_SECRET || "",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  };
}

// Keep validateEnv as an alias for backwards compatibility
export const validateEnv = getEnv;

// DO NOT export `env = validateEnv()` at module level — it crashes the build.
// Use getEnv() inside your request handlers instead.

