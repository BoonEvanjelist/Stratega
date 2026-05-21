/**
 * POST /api/auth/login
 *
 * Validates credentials, compares bcrypt hash, creates a session cookie.
 *
 * DELETE /api/auth/login
 *
 * Deletes the session cookie (logout).
 */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { createSession, deleteSession } from "@/lib/session";
import { LoginSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { email, password } = parsed.data;

    await dbConnect();

    // Find user — explicitly include password field (excluded by default)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      // Generic message — don't reveal whether email exists
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Compare hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Update last active date and streak (simple increment logic)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActive = user.lastActiveDate
      ? new Date(user.lastActiveDate)
      : null;
    if (lastActive) lastActive.setHours(0, 0, 0, 0);

    const isConsecutiveDay =
      lastActive &&
      today.getTime() - lastActive.getTime() === 24 * 60 * 60 * 1000;

    await User.findByIdAndUpdate(user._id, {
      lastActiveDate: new Date(),
      studyStreak: isConsecutiveDay ? user.studyStreak + 1 : 1,
    });

    // Create session
    await createSession(
      (user._id as unknown as string).toString(),
      user.email,
      user.name
    );

    return NextResponse.json(
      { message: "Logged in successfully", user: { name: user.name, email: user.email } },
      { status: 200 }
    );
  } catch (err) {
    console.error("[login] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  await deleteSession();
  return NextResponse.json({ message: "Logged out" }, { status: 200 });
}
