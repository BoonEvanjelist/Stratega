/**
 * POST /api/analytics/session
 *
 * Called when the Pomodoro timer completes a focus session.
 * Appends to sessionHistory and increments totalStudyTime.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import AnalyticsModel from "@/models/Analytics";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

const SessionSchema = z.object({
  focusBlockDuration: z.number().min(1).max(300), // minutes
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = SessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { focusBlockDuration } = parsed.data;

  await dbConnect();

  // Upsert analytics record, push new session, increment total time
  const analytics = await AnalyticsModel.findOneAndUpdate(
    { userId: session.userId },
    {
      $push: {
        sessionHistory: {
          date: new Date(),
          focusBlockDuration,
        },
      },
      $inc: { totalStudyTime: focusBlockDuration },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return NextResponse.json({ message: "Session logged", totalStudyTime: analytics.totalStudyTime }, { status: 200 });
}
