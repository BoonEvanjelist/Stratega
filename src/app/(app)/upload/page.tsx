"use client";

import { useState, useEffect, useRef, useCallback, useTransition } from "react";
import {
  Upload, FileText, Trash2, AlertCircle, CheckCircle2,
  Loader2, CloudUpload, BookOpen, FileWarning, X,
  CalendarDays, HardDrive, FilePlus2, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────
interface UploadedDocument {
  _id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  pageCount: number;
  createdAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ── Drag-and-drop dropzone ────────────────────────────────────────────
interface DropzoneProps {
  onFile: (file: File) => void;
  uploading: boolean;
  uploadProgress: UploadProgress | null;
}

type UploadProgress =
  | { stage: "reading"; pct: number }
  | { stage: "uploading" }
  | { stage: "parsing" }
  | { stage: "done" }
  | { stage: "error"; message: string };

function Dropzone({ onFile, uploading, uploadProgress }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const validateAndSubmit = useCallback(
    (file: File) => {
      setDragError(null);
      if (file.type !== "application/pdf") {
        setDragError("Only PDF files are accepted.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setDragError("File exceeds the 10 MB limit.");
        return;
      }
      onFile(file);
    },
    [onFile]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSubmit(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if actually leaving the zone (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSubmit(file);
    // Reset input so re-uploading same file works
    e.target.value = "";
  };

  const stageLabel = (() => {
    if (!uploadProgress) return null;
    switch (uploadProgress.stage) {
      case "reading":   return `Reading file… ${uploadProgress.pct}%`;
      case "uploading": return "Uploading to server…";
      case "parsing":   return "Extracting text from PDF…";
      case "done":      return "Upload complete!";
      case "error":     return uploadProgress.message;
    }
  })();

  const isError = uploadProgress?.stage === "error";
  const isDone  = uploadProgress?.stage === "done";

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !uploading && inputRef.current?.click()}
      className={cn(
        "relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer select-none",
        "min-h-[280px] p-8 text-center",
        isDragging
          ? "border-indigo-500 scale-[1.01]"
          : dragError || isError
          ? "border-red-500/50"
          : isDone
          ? "border-emerald-500/50"
          : "border-white/10 hover:border-indigo-500/40",
        uploading && "pointer-events-none"
      )}
      style={{
        background: isDragging
          ? "rgba(99,102,241,0.08)"
          : dragError || isError
          ? "rgba(239,68,68,0.04)"
          : isDone
          ? "rgba(16,185,129,0.04)"
          : "rgba(255,255,255,0.02)",
        boxShadow: isDragging ? "inset 0 0 40px rgba(99,102,241,0.06)" : undefined,
      }}
      role="button"
      aria-label="Upload PDF"
      id="pdf-dropzone"
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={handleInputChange}
        disabled={uploading}
        id="pdf-file-input"
        aria-label="Select PDF file"
      />

      {/* Ambient glow blob when dragging */}
      {isDragging && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ background: "radial-gradient(circle at center, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />
      )}

      {/* Content */}
      {uploading ? (
        <>
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 0 32px rgba(99,102,241,0.4)" }}
            >
              <Loader2 size={28} className="text-white animate-spin" />
            </div>
          </div>
          <div>
            <p className="font-semibold text-slate-200" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              {isError ? "Upload failed" : isDone ? "Processed!" : "Processing…"}
            </p>
            <p className={cn("text-sm mt-1", isError ? "text-red-400" : "text-slate-400")}>
              {stageLabel}
            </p>
          </div>
        </>
      ) : isDone ? (
        <>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>
          <div>
            <p className="font-semibold text-emerald-400" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Upload complete!</p>
            <p className="text-sm text-slate-500 mt-1">Click or drop another PDF to upload more.</p>
          </div>
        </>
      ) : (
        <>
          <div
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
              isDragging ? "scale-110" : ""
            )}
            style={{
              background: isDragging
                ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                : "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.25)",
              boxShadow: isDragging ? "0 0 32px rgba(99,102,241,0.4)" : undefined,
            }}
          >
            <CloudUpload size={28} className={isDragging ? "text-white" : "text-indigo-400"} />
          </div>

          <div>
            <p className="font-bold text-slate-200 text-lg" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              {isDragging ? "Drop your PDF here" : "Drag & drop your PDF"}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              or <span className="text-indigo-400 font-medium">click to browse</span> — max 10 MB
            </p>
          </div>

          <div className="flex items-center gap-4 mt-1">
            {[
              { icon: FileText, label: "PDF only" },
              { icon: HardDrive, label: "Max 10 MB" },
              { icon: BookOpen,  label: "Text extracted" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-slate-600">
                <Icon size={12} />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Validation error */}
          {dragError && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle size={14} className="text-red-400" />
              <span className="text-red-300">{dragError}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Document card ─────────────────────────────────────────────────────
function DocumentCard({
  doc,
  onDelete,
  deleting,
}: {
  doc: UploadedDocument;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-2xl transition-all duration-200",
        deleting && "opacity-50 pointer-events-none scale-[0.98]"
      )}
      style={{
        background: "var(--bg-card)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}>
        <FileText size={18} className="text-indigo-400" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-200 truncate" title={doc.fileName}>
          {doc.fileName}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
          <span className="flex items-center gap-1 text-[11px] text-slate-500">
            <HardDrive size={10} />
            {formatBytes(doc.fileSize)}
          </span>
          {doc.pageCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <BookOpen size={10} />
              {doc.pageCount} {doc.pageCount === 1 ? "page" : "pages"}
            </span>
          )}
          <span className="flex items-center gap-1 text-[11px] text-slate-500">
            <CalendarDays size={10} />
            {formatDate(doc.createdAt)}
          </span>
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(doc._id)}
        disabled={deleting}
        title="Delete document"
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
        id={`btn-delete-doc-${doc._id}`}
      >
        {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function UploadPage() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploading, startUpload] = useTransition();

  // ── Fetch documents ─────────────────────────────────────────────────
  const fetchDocuments = useCallback(async () => {
    setLoadingDocs(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load documents");
      setDocuments(data.documents ?? []);
    } catch (err) {
      setFetchError((err as Error).message);
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  // ── Upload handler ──────────────────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    setUploadProgress({ stage: "reading", pct: 0 });

    startUpload(async () => {
      // Stage 1: read file into FormData (browsers do this synchronously
      // but showing "reading" stage gives instant feedback)
      setUploadProgress({ stage: "reading", pct: 50 });
      const form = new FormData();
      form.append("file", file);
      setUploadProgress({ stage: "uploading" });

      let res: Response;
      try {
        res = await fetch("/api/upload", { method: "POST", body: form });
      } catch {
        setUploadProgress({ stage: "error", message: "Network error — check your connection and try again." });
        return;
      }

      // Stage 3: server is now parsing the PDF (we can only tell after response)
      setUploadProgress({ stage: "parsing" });
      const data = await res.json();

      if (!res.ok) {
        setUploadProgress({ stage: "error", message: data.error ?? "Upload failed." });
        return;
      }

      setUploadProgress({ stage: "done" });
      await fetchDocuments();

      // Auto-reset success state after 3 s
      setTimeout(() => setUploadProgress(null), 3000);
    });
  }, [fetchDocuments]);

  // ── Delete handler ─────────────────────────────────────────────────
  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Failed to delete document.");
        return;
      }
      setDocuments((prev) => prev.filter((d) => d._id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  // ── Stats ─────────────────────────────────────────────────────────
  const totalSize  = documents.reduce((s, d) => s + d.fileSize, 0);
  const totalPages = documents.reduce((s, d) => s + d.pageCount, 0);

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ background: "var(--bg-base)" }}>
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Upload size={16} className="text-indigo-400" />
          <span className="text-xs text-indigo-400 font-semibold uppercase tracking-widest">
            Document Ingestion
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
          Upload Notes
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload your PDF textbooks and notes. We extract and index the text so AI can answer questions from your documents.
        </p>
      </div>

      {/* ── Stats row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Documents",   value: documents.length,            icon: FileText,   color: "#6366f1" },
          { label: "Total Size",  value: formatBytes(totalSize),      icon: HardDrive,  color: "#06b6d4" },
          { label: "Pages",       value: totalPages,                  icon: BookOpen,   color: "#10b981" },
          { label: "AI Ready",    value: documents.length,            icon: Sparkles,   color: "#f59e0b" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card-stratega p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 font-medium">{label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                <Icon size={14} style={{ color }} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Left: Dropzone ─────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="card-stratega p-5">
            <div className="flex items-center gap-2 mb-4">
              <FilePlus2 size={16} className="text-indigo-400" />
              <span className="font-bold text-white text-sm" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                Add Document
              </span>
            </div>

            <Dropzone
              onFile={handleFile}
              uploading={isUploading || (uploadProgress?.stage !== "done" && uploadProgress?.stage !== null && uploadProgress !== null)}
              uploadProgress={uploadProgress}
            />

            {/* Upload tips */}
            <div className="mt-4 p-3.5 rounded-xl text-xs text-slate-500 space-y-1.5"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <p className="font-semibold text-slate-400">💡 Tips</p>
              <p>Text-based PDFs work best. Scanned image PDFs have no extractable text.</p>
              <p>Lecture slides, textbook chapters, and research papers all work great.</p>
            </div>
          </div>
        </div>

        {/* ── Right: Documents list ──────────────────────────── */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              Your Library
            </h2>
            <span className="text-xs text-slate-500">
              {documents.length} {documents.length === 1 ? "document" : "documents"}
            </span>
          </div>

          {/* Loading */}
          {loadingDocs && (
            <div className="flex items-center justify-center py-20 gap-3">
              <Loader2 size={24} className="text-indigo-400 animate-spin" />
              <p className="text-slate-500 text-sm">Loading your library…</p>
            </div>
          )}

          {/* Fetch error */}
          {!loadingDocs && fetchError && (
            <div className="flex items-center gap-3 p-4 rounded-2xl"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{fetchError}</p>
            </div>
          )}

          {/* Empty state */}
          {!loadingDocs && !fetchError && documents.length === 0 && (
            <div className="card-stratega flex flex-col items-center justify-center py-16 text-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                <FileWarning size={28} className="text-indigo-400" />
              </div>
              <div>
                <p className="font-bold text-white text-lg" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  No documents yet
                </p>
                <p className="text-slate-500 text-sm mt-1 max-w-xs">
                  Upload your first PDF on the left — we'll extract the text so your AI tutor can use it.
                </p>
              </div>
            </div>
          )}

          {/* Document list */}
          {!loadingDocs && !fetchError && documents.length > 0 && (
            <div className="space-y-3">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc._id}
                  doc={doc}
                  onDelete={handleDelete}
                  deleting={deletingId === doc._id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
