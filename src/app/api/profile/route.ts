/**
 * GET  /api/profile   — returns the current user's profile data
 * PATCH /api/profile  — updates name / password
 */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

// ── GET — fetch profile ─────────────────────────────────────────────────
export async function GET() {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  await dbConnect();

  const user = await User.findById(session.userId)
    .select("-password")
    .lean();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user }, { status: 200 });
}

// ── PATCH — update name / password ─────────────────────────────────────
export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let body: { name?: string; currentPassword?: string; newPassword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  await dbConnect();

  const user = await User.findById(session.userId).select("+password");
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // -- name update --
  if (body.name) {
    const trimmed = body.name.trim();
    if (trimmed.length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    }
    user.name = trimmed;
  }

  // -- password change --
  if (body.currentPassword || body.newPassword) {
    if (!body.currentPassword || !body.newPassword) {
      return NextResponse.json(
        { error: "Both currentPassword and newPassword are required" },
        { status: 400 }
      );
    }
    const match = await bcrypt.compare(body.currentPassword, user.password);
    if (!match) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }
    if (body.newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
    }
    user.password = await bcrypt.hash(body.newPassword, 12);
  }

  await user.save();

  const updated = await User.findById(session.userId).select("-password").lean();
  return NextResponse.json({ user: updated, message: "Profile updated successfully" }, { status: 200 });
}
