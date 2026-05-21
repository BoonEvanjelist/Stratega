/**
 * POST /api/ai/summary
 *
 * Generates an advanced Markdown study guide for a specific document.
 * The result is cached back onto the Document record so subsequent calls
 * for the same document return the stored summary instantly.
 *
 * Body:  { documentId: string, forceRegenerate?: boolean }
 * Returns: { summary: string, documentId: string, cached: boolean }
 */
import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import DocumentModel from "@/models/Document";
import { getSession } from "@/lib/session";
import { SUMMARY_MODEL, MAX_CONTEXT_CHARS } from "@/lib/ai";

export const runtime = "nodejs";
// Allow up to 5 min for large documents — Gemini can be slow on big context
export const maxDuration = 300;

// ── Prompt factory ────────────────────────────────────────────────────
function buildSummaryPrompt(fileName: string, text: string): string {
  // Truncate if over cap — prefer tail-trimming to preserve intro sections
  const clipped =
    text.length > MAX_CONTEXT_CHARS
      ? text.slice(0, MAX_CONTEXT_CHARS) +
        "\n\n[--- Content truncated for length ---]"
      : text;

  return `You are an expert academic tutor and study guide author. Your task is to transform raw study material into a premium, exam-ready Markdown study guide.

## Source Document
**File:** ${fileName}

## Raw Content
\`\`\`
${clipped}
\`\`\`

## Instructions
Generate a highly scannable, structured Markdown study guide from the content above. Your response must be a well-organised Markdown document with these exact sections:

---

# 📚 Study Guide: [Infer a title from the content]

## 🎯 Core Concepts
List the 5–10 most important concepts or theories. For each, provide:
- **Concept Name** — a crisp one-sentence definition
- A 2–3 sentence explanation of why it matters

## 📖 Key Definitions
A glossary table with the most important terms:

| Term | Definition |
|------|-----------|
| ... | ... |

## 🔑 High-Yield Summary Checklist
A numbered checklist of facts, formulas, or principles a student MUST know for an exam. Format each as a markdown checkbox:
- [ ] Item 1
- [ ] Item 2

## 💡 Common Exam Questions & Model Answers
List 3–5 probable exam questions with concise model answers.

## 🔗 Concept Map (Text)
Describe how the main concepts connect to each other using short "A → B because C" arrows.

---

Rules:
- Write in clear, academic English appropriate for university-level students.
- Be precise, factual, and base everything strictly on the provided source material.
- Do NOT add information not present in the source.
- Use bold text, tables, and lists heavily — this guide must be skimmable in 5 minutes.`;
}

// ── Handler ───────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // Auth
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  // Parse body
  let body: { documentId?: string; forceRegenerate?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { documentId, forceRegenerate = false } = body;

  if (!documentId || !Types.ObjectId.isValid(documentId)) {
    return NextResponse.json({ error: "Invalid or missing documentId" }, { status: 400 });
  }

  await dbConnect();

  // Fetch document — ownership enforced
  const doc = await DocumentModel.findOne({
    _id: documentId,
    userId: session.userId,
  });

  if (!doc) {
    return NextResponse.json(
      { error: "Document not found or you do not have permission to access it" },
      { status: 404 }
    );
  }

  // Return cached summary if available and not force-regenerating
  if (doc.parsedSummary && !forceRegenerate) {
    return NextResponse.json(
      { summary: doc.parsedSummary, documentId, cached: true },
      { status: 200 }
    );
  }

  if (!doc.rawTextContent?.trim()) {
    return NextResponse.json(
      { error: "This document has no extractable text content to summarise." },
      { status: 422 }
    );
  }

  // Generate summary
  let summary: string;
  try {
    const result = await generateText({
      model: SUMMARY_MODEL,
      prompt: buildSummaryPrompt(doc.fileName, doc.rawTextContent),
      maxOutputTokens: 4096,
    });
    summary = result.text;
  } catch (err) {
    console.error("[summary] Gemini error:", err);
    return NextResponse.json(
      { error: "The AI model failed to generate a summary. Please try again." },
      { status: 502 }
    );
  }

  // Cache result back on the document
  await DocumentModel.findByIdAndUpdate(documentId, {
    $set: { parsedSummary: summary },
  });

  return NextResponse.json(
    { summary, documentId, cached: false },
    { status: 200 }
  );
}
