/**
 * POST /api/ai/chat
 *
 * Streaming chat endpoint using the Vercel AI SDK + Gemini 2.5 Flash.
 *
 * Body:
 *   messages   — CoreMessage[] (role: "user" | "assistant", content: string)
 *   documentId — optional string; if provided, document text is injected as
 *                a system-level context block so the model answers from it.
 *
 * Response: text/plain SSE stream via StreamTextResult.toTextStreamResponse()
 *
 * Security:
 *   - Auth required (getSession)
 *   - documentId ownership checked before text is fetched
 *   - Context truncated to MAX_CONTEXT_CHARS to prevent prompt injection floods
 */
import { NextRequest } from "next/server";
import { streamText, type ModelMessage } from "ai";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import DocumentModel from "@/models/Document";
import { getSession } from "@/lib/session";
import { CHAT_MODEL, MAX_CONTEXT_CHARS } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60; // 60 s max per chat turn

// ── System prompt builder ─────────────────────────────────────────────
function buildSystemPrompt(documentContext?: string): string {
  const persona = `You are Stratega AI, an expert academic tutor and study coach embedded in a student productivity platform. Your role is to help students understand complex material, quiz themselves, create study plans, and build genuine comprehension — not just surface knowledge.

Behaviour guidelines:
- Be encouraging, concise, and pedagogically sound.
- Use the Socratic method when appropriate — ask clarifying questions rather than dumping answers.
- Format responses in Markdown: use headings, bullet points, code blocks, and bold text for key terms.
- When giving definitions, always follow with a real-world example or analogy.
- If you're unsure about something, say so honestly. Never fabricate facts.`;

  if (!documentContext) {
    return `${persona}

The student has not attached a specific document yet. Answer general study and academic questions to the best of your knowledge.`;
  }

  const clipped =
    documentContext.length > MAX_CONTEXT_CHARS
      ? documentContext.slice(0, MAX_CONTEXT_CHARS) +
        "\n\n[--- Content truncated for length ---]"
      : documentContext;

  return `${persona}

## 📄 Active Document Context
The student has attached a document. Base your answers primarily on this material. If the answer is not in the document, say so and offer to answer from general knowledge.

\`\`\`
${clipped}
\`\`\`

Remember: cite specific sections or phrases from the document when relevant. Help the student understand this material deeply.`;
}

// ── Handler ───────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // Auth
  const session = await getSession();
  if (!session?.userId) {
    return new Response(JSON.stringify({ error: "Unauthorised" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Parse body
  let messages: ModelMessage[];
  let documentId: string | undefined;

  try {
    const body = await request.json();
    messages = body.messages ?? [];
    documentId = body.documentId;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(
      JSON.stringify({ error: "messages must be a non-empty array" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Optional document context fetch
  let documentContext: string | undefined;

  if (documentId && Types.ObjectId.isValid(documentId)) {
    await dbConnect();
    const doc = await DocumentModel.findOne(
      { _id: documentId, userId: session.userId },
      { rawTextContent: 1 }
    ).lean();

    if (doc?.rawTextContent) {
      documentContext = doc.rawTextContent;
    }
  }

  // Stream response
  try {
    const result = streamText({
      model: CHAT_MODEL,
      system: buildSystemPrompt(documentContext),
      messages,
      maxOutputTokens: 2048,
      temperature: 0.7,
      onError: ({ error }) => {
        console.error("[chat/stream] Gemini error:", error);
      },
    });

    // toTextStreamResponse() returns a Web API Response with
    // Content-Type: text/plain; charset=utf-8 — the client reads
    // this as an async ReadableStream of text chunks.
    return result.toTextStreamResponse();
  } catch (err) {
    console.error("[chat] Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "The AI model is currently unavailable. Please try again." }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}
