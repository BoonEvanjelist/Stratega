/**
 * DELETE /api/documents/[id]
 *
 * Deletes a document owned by the authenticated user.
 * Ownership is enforced by filtering on both `_id` AND `userId`,
 * making it impossible for a user to delete another user's document
 * even if they know the ObjectId (IDOR prevention).
 *
 * Params shape in Next.js 16: `{ params: Promise<{ id: string }> }`
 */
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import DocumentModel from "@/models/Document";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ── Auth ──────────────────────────────────────────────────────────────
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  // ── Validate id ───────────────────────────────────────────────────────
  // params is a Promise in Next.js 16 (see route.md docs)
  const { id } = await params;

  if (!id || !Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid document ID" }, { status: 400 });
  }

  await dbConnect();

  // Delete only if the document belongs to the requesting user
  const result = await DocumentModel.deleteOne({
    _id: id,
    userId: session.userId,
  });

  if (result.deletedCount === 0) {
    return NextResponse.json(
      { error: "Document not found or you do not have permission to delete it" },
      { status: 404 }
    );
  }

  return NextResponse.json({ message: "Document deleted" }, { status: 200 });
}
