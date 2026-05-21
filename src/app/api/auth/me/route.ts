/**
 * GET /api/auth/me
 *
 * Returns the current session payload (userId, name, email).
 * Used by client components to get the logged-in user info.
 */
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      userId: session.userId,
      name: session.name,
      email: session.email,
    },
  }, { status: 200 });
}
