/**
 * POST /api/flashcards/generate
 *
 * Generates a set of flashcards from a document's rawTextContent using
 * Gemini via generateObject (structured JSON output).
 *
 * Body:   { documentId: string, cardCount?: number }
 * Returns: { setId: string, title: string, cardCount: number }
 *
 * Security:
 *   - Session auth required
 *   - documentId ownership validated before text is fetched
 *   - JSON schema validated via Zod before persistence
 */
import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import DocumentModel from "@/models/Document";
import FlashcardSetModel from "@/models/FlashcardSet";
import { getSession } from "@/lib/session";
import { FLASHCARD_MODEL, MAX_CONTEXT_CHARS } from "@/lib/ai";

export const runtime    = "nodejs";
export const maxDuration = 120;

// ── Zod schema for structured AI output ──────────────────────────────
// Zod 4 style (z.object / z.array / z.string work identically to v3 here)
const CardSchema = z.object({
  front: z.string().describe("A clear, focused question or concept prompt — max 200 chars"),
  back:  z.string().describe("A definitive explanation or answer — max 600 chars"),
});

const FlashcardOutputSchema = z.object({
  title: z.string().describe("Concise title for this flashcard deck (max 80 chars)"),
  cards: z.array(CardSchema).min(5).max(40),
});

type FlashcardOutput = z.infer<typeof FlashcardOutputSchema>;

// ── Prompt factory ────────────────────────────────────────────────────
function buildGenerationPrompt(fileName: string, text: string, count: number): string {
  const clipped = text.length > MAX_CONTEXT_CHARS
    ? text.slice(0, MAX_CONTEXT_CHARS) + "\n\n[--- Content truncated for length ---]"
    : text;

  return `You are an expert educational content creator specialising in active recall study materials.

Analyse the following academic text and generate exactly ${count} high-quality flashcards.

## Source Document
**File:** ${fileName}

## Content
\`\`\`
${clipped}
\`\`\`

## Flashcard Rules
- Each card must test ONE distinct concept, term, formula, or fact.
- Front: a short, precise question or fill-in-the-blank prompt. Do NOT include the answer.
- Back: a complete, authoritative answer with enough detail to understand without the source.
- Avoid redundant or overlapping cards.
- Prioritise high-yield exam content: definitions, key mechanisms, important dates/names, cause-effect relationships.
- Write in clear, concise academic English.

Generate exactly ${count} cards spread across the breadth of the material.`;
}

// ── Handler ───────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // Auth
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  // Parse body
  let body: { documentId?: string; cardCount?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { documentId, cardCount = 20 } = body;
  const count = Math.min(Math.max(Number(cardCount) || 20, 5), 40);

  if (!documentId || !Types.ObjectId.isValid(documentId)) {
    return NextResponse.json({ error: "Invalid or missing documentId" }, { status: 400 });
  }

  await dbConnect();

  // Fetch document — ownership enforced
  const doc = await DocumentModel.findOne(
    { _id: documentId, userId: session.userId },
    { fileName: 1, rawTextContent: 1 }
  ).lean();

  if (!doc) {
    return NextResponse.json(
      { error: "Document not found or you do not have permission to access it" },
      { status: 404 }
    );
  }

  if (!doc.rawTextContent?.trim()) {
    return NextResponse.json(
      { error: "This document has no extractable text to generate flashcards from." },
      { status: 422 }
    );
  }

  // Generate structured flashcard output via Gemini
  let output: FlashcardOutput;
  try {
    const result = await generateObject({
      model:  FLASHCARD_MODEL,
      schema: FlashcardOutputSchema,
      prompt: buildGenerationPrompt(doc.fileName, doc.rawTextContent, count),
      maxOutputTokens: 4096,
    });
    output = result.object;
  } catch (err) {
    console.error("[flashcards/generate] Gemini error:", err);
    return NextResponse.json(
      { error: "The AI model failed to generate flashcards. Please try again." },
      { status: 502 }
    );
  }

  // Persist to MongoDB
  const now = new Date();
  const flashcardSet = await FlashcardSetModel.create({
    userId:     session.userId,
    documentId: new Types.ObjectId(documentId),
    title:      output.title,
    cards: output.cards.map((c) => ({
      front:          c.front,
      back:           c.back,
      interval:       0,
      easeFactor:     2.5,
      repetitions:    0,
      nextReviewDate: now,
    })),
  });

  return NextResponse.json(
    {
      setId:      String(flashcardSet._id),
      title:      flashcardSet.title,
      cardCount:  flashcardSet.cards.length,
      documentId,
    },
    { status: 201 }
  );
}
