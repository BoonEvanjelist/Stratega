/**
 * GET /api/analytics
 *
 * Retrieves the user's Analytics document.
 * If none exists, returns a default empty structure.
 */
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import AnalyticsModel from "@/models/Analytics";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  await dbConnect();

  let analytics = await AnalyticsModel.findOne({ userId: session.userId }).lean();

  if (!analytics) {
    // Return empty shell if no analytics exist yet
    return NextResponse.json(
      {
        analytics: {
          totalStudyTime: 0,
          sessionHistory: [],
          performanceSummary: { weakTopics: [], aiRecommendations: [] },
        },
      },
      { status: 200 }
    );
  }

  return NextResponse.json({ analytics }, { status: 200 });
}
