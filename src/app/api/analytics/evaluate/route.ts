/**
 * POST /api/analytics/evaluate
 *
 * Scans the user's flashcards for struggling topics (low easeFactor) and 
 * runs an AI analysis to extract specific "Weak Topics" and actionable study tips.
 * Updates and returns the user's Analytics record.
 */
import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import FlashcardSetModel from "@/models/FlashcardSet";
import AnalyticsModel from "@/models/Analytics";
import { getSession } from "@/lib/session";
import { SUMMARY_MODEL } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

const DiagnosticsSchema = z.object({
  weakTopics: z.array(z.string()).describe("List of 3-5 distinct, highly specific conceptual weak topics (e.g., 'Mitochondrial DNA Replication', not just 'Biology')."),
  aiRecommendations: z.array(z.string()).describe("List of 3 actionable, markdown-formatted study tips tailored specifically to improving the identified weak topics."),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  await dbConnect();

  // 1. Gather struggling cards
  // We identify struggling cards as those with easeFactor < 2.3 (meaning they were marked Hard/Blackout)
  const sets = await FlashcardSetModel.find({ userId: session.userId }).lean();
  const strugglingCards = sets.flatMap((set) =>
    set.cards
      .filter((c) => c.easeFactor < 2.3)
      .map((c) => ({ front: c.front, back: c.back, ease: c.easeFactor }))
  );

  if (strugglingCards.length === 0) {
    return NextResponse.json(
      { error: "Not enough data yet. Keep practicing flashcards to generate diagnostics!" },
      { status: 422 }
    );
  }

  // 2. Build the AI Prompt
  // We cap at the worst 50 cards to save context window and focus on the biggest gaps
  const worstCards = strugglingCards
    .sort((a, b) => a.ease - b.ease)
    .slice(0, 50);

  const contextData = worstCards
    .map((c, i) => `[Card ${i + 1}] Q: ${c.front} | A: ${c.back}`)
    .join("\n");

  const prompt = `You are a Principal AI Study Analyst. Below are flashcards that a student is actively struggling to remember.

## Struggling Flashcards
${contextData}

## Instructions
1. Analyse these cards to identify underlying conceptual gaps.
2. Output a strictly formatted JSON object containing:
   - "weakTopics": 3 to 5 highly specific conceptual topics the student is failing at.
   - "aiRecommendations": 3 actionable, tailored study recommendations using Markdown formatting (e.g., bold text, bullet points). Do NOT just say "review more". Give specific pedagogical strategies for these exact topics.`;

  // 3. Generate Evaluation
  try {
    const { object } = await generateObject({
      model: SUMMARY_MODEL,
      schema: DiagnosticsSchema,
      prompt,
      maxOutputTokens: 2048,
    });

    // 4. Update Analytics Document
    // Upsert the Analytics record for this user
    const analytics = await AnalyticsModel.findOneAndUpdate(
      { userId: session.userId },
      {
        $set: {
          "performanceSummary.weakTopics": object.weakTopics,
          "performanceSummary.aiRecommendations": object.aiRecommendations,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ analytics }, { status: 200 });
  } catch (err) {
    console.error("[analytics/evaluate] AI Error:", err);
    return NextResponse.json(
      { error: "AI Evaluation failed. Please try again later." },
      { status: 502 }
    );
  }
}
