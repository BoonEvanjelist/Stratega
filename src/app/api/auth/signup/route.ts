/**
 * POST /api/auth/signup
 *
 * Validates input with Zod, checks for duplicate email, hashes the
 * password with bcryptjs, persists the new User document, then creates
 * a signed session cookie and returns 201.
 */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { createSession } from "@/lib/session";
import { SignupSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    // ── 1. Parse body ────────────────────────────────────────────────
    const body = await request.json();

    // ── 2. Validate with Zod ─────────────────────────────────────────
    const parsed = SignupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }
    const { name, email, password } = parsed.data;

    // ── 3. Connect to database ───────────────────────────────────────
    await dbConnect();

    // ── 4. Check for duplicate email ─────────────────────────────────
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // ── 5. Hash password ─────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 12);

    // ── 6. Create user document ──────────────────────────────────────
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // ── 7. Create session cookie ─────────────────────────────────────
    await createSession(
      (newUser._id as unknown as string).toString(),
      newUser.email,
      newUser.name
    );

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: { id: newUser._id, name: newUser.name, email: newUser.email },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[signup] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
