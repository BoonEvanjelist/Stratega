/**
 * PATCH /api/flashcards/review
 *
 * Applies the SM-2 algorithm to a single card and persists the updated
 * spaced repetition parameters back to MongoDB.
 *
 * Body:  { setId: string, cardId: string, quality: 0|1|2|3|4|5 }
 *
 * Security:
 *   - Session auth required
 *   - setId is filtered on both _id AND userId (IDOR protection)
 *   - cardId validated as a valid ObjectId before Mongo positional update
 */
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import FlashcardSetModel from "@/models/FlashcardSet";
import { getSession } from "@/lib/session";
import { sm2 } from "@/lib/sm2";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest) {
  // Auth
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  // Parse body
  let body: { setId?: string; cardId?: string; quality?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { setId, cardId, quality } = body;

  // Validate setId
  if (!setId || !Types.ObjectId.isValid(setId)) {
    return NextResponse.json({ error: "Invalid or missing setId" }, { status: 400 });
  }

  // Validate cardId
  if (!cardId || !Types.ObjectId.isValid(cardId)) {
    return NextResponse.json({ error: "Invalid or missing cardId" }, { status: 400 });
  }

  // Validate quality score (must be integer 0–5)
  if (
    quality === undefined ||
    quality === null ||
    !Number.isInteger(quality) ||
    quality < 0 ||
    quality > 5
  ) {
    return NextResponse.json(
      { error: "quality must be an integer between 0 and 5" },
      { status: 400 }
    );
  }

  await dbConnect();

  // Fetch current card state — ownership checked via userId
  const set = await FlashcardSetModel.findOne(
    { _id: setId, userId: session.userId },
    { "cards.$": 1 }  // positional projection: only the matching card
  )
    .where("cards._id")
    .equals(cardId)
    .lean();

  if (!set || !set.cards || set.cards.length === 0) {
    return NextResponse.json(
      { error: "Card not found or you do not have permission to update it" },
      { status: 404 }
    );
  }

  const card = set.cards[0];

  // Run SM-2
  const updated = sm2({
    quality:     quality as 0 | 1 | 2 | 3 | 4 | 5,
    repetitions: card.repetitions,
    easeFactor:  card.easeFactor,
    interval:    card.interval,
  });

  // Atomic positional update on the matched sub-document
  await FlashcardSetModel.updateOne(
    { _id: setId, "cards._id": cardId },
    {
      $set: {
        "cards.$.interval":       updated.interval,
        "cards.$.easeFactor":     updated.easeFactor,
        "cards.$.repetitions":    updated.repetitions,
        "cards.$.nextReviewDate": updated.nextReviewDate,
      },
    }
  );

  return NextResponse.json(
    {
      cardId,
      updated: {
        interval:       updated.interval,
        easeFactor:     updated.easeFactor,
        repetitions:    updated.repetitions,
        nextReviewDate: updated.nextReviewDate,
      },
    },
    { status: 200 }
  );
}
