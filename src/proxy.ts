/**
 * proxy.ts — Route protection for Stratega
 *
 * Runs on every request before rendering.  Reads the session JWT from
 * the HttpOnly cookie and redirects unauthenticated users away from
 * protected routes.
 *
 * NOTE: In Next.js 16, `middleware.ts` is deprecated and renamed to
 * `proxy.ts`.  The exported function must be named `proxy`.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";

// ── Route classification ─────────────────────────────────────────────
// Any path prefix in this list requires an authenticated session.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/upload",
  "/chat",
  "/flashcards",
  "/timetable",
  "/analytics",
  "/profile",
];

// These are public — authenticated users visiting them get bounced to /dashboard.
const AUTH_ROUTES = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Read the session token from the cookie (does NOT touch DB — optimistic check)
  const token = request.cookies.get("stratega_session")?.value;
  const session = await decrypt(token);

  // 1. Unauthenticated user tries to visit a protected page → /login
  if (isProtected && !session?.userId) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated user tries to visit /login or /signup → /dashboard
  if (isAuthRoute && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }

  return NextResponse.next();
}

// ── Matcher — exclude static files and Next.js internals ─────────────
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
