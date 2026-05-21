/**
 * GET /api/documents
 *
 * Returns all documents for the authenticated user.
 * rawTextContent is excluded from this listing query (large field).
 */
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import DocumentModel from "@/models/Document";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  await dbConnect();

  // Explicitly exclude rawTextContent to avoid sending potentially
  // hundreds of KB of text over the wire for a file listing view.
  const documents = await DocumentModel.find({ userId: session.userId })
    .select("-rawTextContent")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ documents }, { status: 200 });
}
