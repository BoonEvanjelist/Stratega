/**
 * POST /api/upload
 *
 * Accepts a multipart/form-data request with a single "file" field
 * containing a PDF.  Guards:
 *   - Auth: session cookie required
 *   - MIME:  must be application/pdf
 *   - Size:  max 10 MB
 *
 * Uses pdf-parse v2 (class-based API) to extract text server-side.
 * The parser is called inside a try/finally to guarantee destroy() is
 * called even on failure, preventing pdfjs-dist worker memory leaks.
 *
 * NOTE: Next.js 16 route handlers read multipart bodies via the
 * standard Web API request.formData() — no body-parser config needed.
 */
import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import dbConnect from "@/lib/dbConnect";
import DocumentModel from "@/models/Document";
import { getSession } from "@/lib/session";

// ── Constants ─────────────────────────────────────────────────────────
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME  = "application/pdf";

// Force this route to run on the Node.js runtime (pdfjs-dist requirement)
export const runtime = "nodejs";

// ── POST handler ──────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // ── 1. Auth ──────────────────────────────────────────────────────────
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  // ── 2. Parse multipart form ───────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid multipart request — expected a form upload" },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "No file found. Include a 'file' field in the form data" },
      { status: 400 }
    );
  }

  // ── 3. MIME validation ────────────────────────────────────────────────
  if (file.type !== ALLOWED_MIME) {
    return NextResponse.json(
      { error: `Only PDF files are accepted (got: ${file.type || "unknown"})` },
      { status: 415 }
    );
  }

  // ── 4. Size guard ─────────────────────────────────────────────────────
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File exceeds the 10 MB limit (got: ${(file.size / 1024 / 1024).toFixed(1)} MB)` },
      { status: 413 }
    );
  }

  // ── 5. Convert to Uint8Array (Web API → pdfjs-dist compatible) ─────────
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array  = new Uint8Array(arrayBuffer);

  // ── 6. PDF text extraction ────────────────────────────────────────────
  let rawTextContent: string;
  let pageCount = 0;
  const parser = new PDFParse({ data: uint8Array });

  try {
    const textResult = await parser.getText();
    rawTextContent = textResult.text ?? "";
    pageCount = textResult.pages?.length ?? 0;

    if (!rawTextContent.trim()) {
      // Could be a scanned/image-only PDF — still store it, flag in text
      rawTextContent = "[No extractable text found. This PDF may contain only scanned images.]";
    }
  } catch (parseErr) {
    console.error("[upload] pdf-parse error:", parseErr);
    return NextResponse.json(
      { error: "Failed to parse PDF. The file may be corrupted, password-protected, or not a valid PDF." },
      { status: 422 }
    );
  } finally {
    // Always release pdfjs-dist worker resources
    await parser.destroy().catch(() => {});
  }

  // ── 7. Persist to MongoDB ─────────────────────────────────────────────
  await dbConnect();

  const doc = await DocumentModel.create({
    userId: session.userId,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    pageCount,
    rawTextContent,
  });

  return NextResponse.json(
    {
      message: "Document uploaded and parsed successfully",
      document: {
        id:        doc._id,
        fileName:  doc.fileName,
        fileSize:  doc.fileSize,
        pageCount: doc.pageCount,
        createdAt: doc.createdAt,
      },
    },
    { status: 201 }
  );
}
