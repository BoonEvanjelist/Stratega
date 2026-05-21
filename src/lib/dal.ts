/**
 * Data Access Layer (DAL) — Stratega
 *
 * Centralises session verification so every server component,
 * server action, and route handler can call verifySession()
 * without duplicating auth logic.
 *
 * Uses React's `cache()` to de-duplicate calls within a single
 * render pass (per the Next.js 16 auth guide recommendation).
 */
import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "@/lib/session";

export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await getSession();

  if (!session?.userId) {
    redirect("/login");
  }

  return session;
});
