/**
 * GET  /api/timetable        — fetch all timetables for the authenticated user
 * PATCH /api/timetable       — toggle `isCompleted` for a specific study plan day
 */
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Timetable from "@/models/Timetable";
import { getSession } from "@/lib/session";

// ── Auth helper (route-handler safe — no React cache) ────────────────
async function requireAuth() {
  const session = await getSession();
  if (!session?.userId) {
    return { session: null, error: NextResponse.json({ error: "Unauthorised" }, { status: 401 }) };
  }
  return { session, error: null };
}

// ── GET — list all plans ──────────────────────────────────────────────
export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  await dbConnect();

  const plans = await Timetable.find({ userId: session!.userId })
    .sort({ examDate: 1 })
    .lean();

  return NextResponse.json({ plans }, { status: 200 });
}

// ── PATCH — toggle a single day's isCompleted ─────────────────────────
export async function PATCH(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  let body: { timetableId: string; dayId: string; isCompleted: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { timetableId, dayId, isCompleted } = body;

  if (!timetableId || !dayId || typeof isCompleted !== "boolean") {
    return NextResponse.json(
      { error: "timetableId, dayId, and isCompleted are required" },
      { status: 400 }
    );
  }

  if (!Types.ObjectId.isValid(timetableId) || !Types.ObjectId.isValid(dayId)) {
    return NextResponse.json({ error: "Invalid ObjectId" }, { status: 400 });
  }

  await dbConnect();

  // Only update documents owned by the authenticated user (prevents IDOR)
  const updated = await Timetable.findOneAndUpdate(
    {
      _id: timetableId,
      userId: session!.userId,
      "studyPlan._id": dayId,
    },
    { $set: { "studyPlan.$.isCompleted": isCompleted } },
    { new: true }
  );

  if (!updated) {
    return NextResponse.json(
      { error: "Timetable or day not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { message: "Updated", plan: updated },
    { status: 200 }
  );
}
