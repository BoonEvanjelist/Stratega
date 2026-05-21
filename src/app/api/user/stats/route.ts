/**
 * GET /api/user/stats
 *
 * Aggregates real-time stats for the dashboard from MongoDB.
 * Returns: totalStudyTime, cardsReviewed, documentsCount, avgScore, streak
 */
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import AnalyticsModel from "@/models/Analytics";
import FlashcardSetModel from "@/models/FlashcardSet";
import DocumentModel from "@/models/Document";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  await dbConnect();

  // Run all queries in parallel for performance
  const [user, analytics, flashcardSets, documents] = await Promise.all([
    User.findById(session.userId).select("studyStreak lastActiveDate name email").lean(),
    AnalyticsModel.findOne({ userId: session.userId }).lean(),
    FlashcardSetModel.find({ userId: session.userId }).select("cards").lean() as Promise<Array<{ cards: Array<{ easeFactor: number }> }>>,
    DocumentModel.find({ userId: session.userId }).select("_id").lean(),
  ]);

  // Total cards reviewed (all cards across all sets)
  const totalCards = flashcardSets.reduce((sum, set) => sum + (set.cards?.length || 0), 0);

  // Average ease factor as a proxy for score (0–5 scale → percentage)
  let avgScore = 0;
  if (totalCards > 0) {
    const totalEase = flashcardSets.reduce(
      (sum, set) => sum + set.cards.reduce((s: number, c: { easeFactor: number }) => s + c.easeFactor, 0),
      0
    );
    // easeFactor max meaningful value ≈ 3.0, map to 0-100%
    avgScore = Math.min(100, Math.round((totalEase / totalCards / 3.0) * 100));
  }

  // Check if streak is still valid (was active today or yesterday)
  const studyStreak = user?.studyStreak || 0;

  // Study time in hours from analytics
  const totalStudyMinutes = analytics?.totalStudyTime || 0;
  const studyHours = (totalStudyMinutes / 60).toFixed(1);

  // Recent session history (last 7 days) for chart
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const recentSessions = (analytics?.sessionHistory || [])
    .filter((s: { date: Date | string }) => new Date(s.date) >= sevenDaysAgo)
    .map((s: { date: Date | string; focusBlockDuration: number }) => ({
      date: s.date,
      minutes: s.focusBlockDuration,
    }));

  return NextResponse.json({
    stats: {
      studyHours: `${studyHours}h`,
      studyHoursRaw: parseFloat(studyHours),
      cardsReviewed: totalCards,
      documentsCount: documents.length,
      avgScore: `${avgScore}%`,
      avgScoreRaw: avgScore,
      studyStreak,
      userName: user?.name || session.name,
      userEmail: user?.email || session.email,
      recentSessions,
    },
  }, { status: 200 });
}
