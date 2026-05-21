/**
 * GET  /api/flashcards/[setId]  — fetch full card set (including front/back)
 *                                 for the deck player
 */
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import FlashcardSetModel from "@/models/FlashcardSet";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ setId: string }> }
) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { setId } = await params;

  if (!setId || !Types.ObjectId.isValid(setId)) {
    return NextResponse.json({ error: "Invalid setId" }, { status: 400 });
  }

  await dbConnect();

  const set = await FlashcardSetModel.findOne({
    _id: setId,
    userId: session.userId,
  }).lean();

  if (!set) {
    return NextResponse.json(
      { error: "Set not found or you do not have permission to access it" },
      { status: 404 }
    );
  }

  return NextResponse.json({ set }, { status: 200 });
}
