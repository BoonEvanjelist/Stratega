/**
 * GET  /api/flashcards         — list all sets for the user (cards excluded)
 * DELETE /api/flashcards?setId — delete a set (ownership-checked)
 */
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import FlashcardSetModel from "@/models/FlashcardSet";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

// ── GET — list all sets (lightweight: exclude card bodies) ────────────
export async function GET() {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  await dbConnect();

  // Include card _ids and SM-2 metadata for due-count calculation;
  // exclude only the large text fields (front/back) from the index view.
  const sets = await FlashcardSetModel.find({ userId: session.userId })
    .select("-cards.front -cards.back")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ sets }, { status: 200 });
}

// ── DELETE — remove a set entirely ────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const setId = searchParams.get("setId");

  if (!setId || !Types.ObjectId.isValid(setId)) {
    return NextResponse.json({ error: "Invalid or missing setId" }, { status: 400 });
  }

  await dbConnect();

  const result = await FlashcardSetModel.deleteOne({
    _id: setId,
    userId: session.userId,   // IDOR guard
  });

  if (result.deletedCount === 0) {
    return NextResponse.json(
      { error: "Set not found or you do not have permission to delete it" },
      { status: 404 }
    );
  }

  return NextResponse.json({ message: "Flashcard set deleted" }, { status: 200 });
}
