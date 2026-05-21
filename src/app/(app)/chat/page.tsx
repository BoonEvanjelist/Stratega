"use client";

import {
  useState, useEffect, useRef, useCallback, useTransition,
} from "react";
import {
  MessageSquareDot, Send, Loader2, FileText, ChevronDown,
  Sparkles, User, Bot, AlertCircle, BookOpen, Trash2,
  RefreshCw, PanelLeftClose, PanelLeftOpen, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  id: string;
}

interface Document {
  _id: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
}

// ── Utility ────────────────────────────────────────────────────────────
function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function formatBytes(b: number): string {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Minimal Markdown renderer ─────────────────────────────────────────
// Converts the subset of Markdown Gemini produces into safe HTML spans.
function renderMarkdown(text: string): string {
  return text
    // Code blocks
    .replace(/```[\w]*\n?([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    // H1
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // H2
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    // H3
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    // Checkboxes
    .replace(/^- \[x\] (.+)$/gim, "<li class=\"checked\">✅ $1</li>")
    .replace(/^- \[ \] (.+)$/gim, "<li class=\"unchecked\">☐ $1</li>")
    // Bullet lists
    .replace(/^[-*] (.+)$/gm, "<li>$1</li>")
    // Numbered lists
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    // Horizontal rule
    .replace(/^---$/gm, "<hr/>")
    // Paragraphs (double newline → <p>)
    .replace(/\n{2,}/g, "</p><p>")
    // Single newlines inside paragraphs
    .replace(/\n/g, "<br/>");
}

// ── Markdown message bubble ────────────────────────────────────────────
function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-3 w-full", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={isUser
          ? { background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }
          : { background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.25)" }}
      >
        {isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-cyan-400" />}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
          isUser
            ? "text-white rounded-tr-sm"
            : "text-slate-200 rounded-tl-sm"
        )}
        style={isUser
          ? { background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.25)" }
          : { background: "var(--bg-card)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <div
            className="prose-stratega"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
          />
        )}
      </div>
    </div>
  );
}

// ── Typing indicator ───────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-3 w-full">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.25)" }}>
        <Bot size={14} className="text-cyan-400" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm"
        style={{ background: "var(--bg-card)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-1.5">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="w-1.5 h-1.5 rounded-full bg-cyan-500"
              style={{ animation: `bounce 1.2s ease-in-out ${delay}ms infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Document selector panel ────────────────────────────────────────────
function DocumentPanel({
  documents,
  selectedId,
  onSelect,
  loading,
}: {
  documents: Document[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={14} className="text-cyan-400" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Document Context
          </span>
        </div>
        <p className="text-[11px] text-slate-600">
          Attach a document so the AI answers from your notes.
        </p>
      </div>

      {/* No context option */}
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "w-full flex items-center gap-2 p-2.5 rounded-xl text-xs transition-all text-left",
          selectedId === null
            ? "text-white"
            : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
        )}
        style={selectedId === null
          ? { background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.25)" }
          : { background: "transparent", border: "1px solid transparent" }}
      >
        <Sparkles size={13} className={selectedId === null ? "text-cyan-400" : "text-slate-600"} />
        <span className="font-medium">General Knowledge</span>
      </button>

      {/* Documents list */}
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-slate-600 py-2">
          <Loader2 size={12} className="animate-spin" />
          <span>Loading documents…</span>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-6">
          <FileText size={24} className="text-slate-700 mx-auto mb-2" />
          <p className="text-xs text-slate-600">No documents uploaded yet.</p>
          <a href="/upload" className="text-xs text-cyan-500 hover:text-cyan-400 mt-1 block transition-colors">
            Upload a PDF →
          </a>
        </div>
      ) : (
        <div className="space-y-1.5 overflow-y-auto flex-1">
          {documents.map((doc) => (
            <button
              key={doc._id}
              onClick={() => onSelect(doc._id)}
              className={cn(
                "w-full flex items-start gap-2 p-2.5 rounded-xl text-xs transition-all text-left",
                selectedId === doc._id
                  ? "text-white"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
              )}
              style={selectedId === doc._id
                ? { background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)" }
                : { background: "transparent", border: "1px solid transparent" }}
            >
              <FileText
                size={13}
                className={cn("flex-shrink-0 mt-0.5", selectedId === doc._id ? "text-indigo-400" : "text-slate-600")}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-left truncate">{doc.fileName}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  {formatBytes(doc.fileSize)}
                  {doc.pageCount > 0 && ` · ${doc.pageCount}p`}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Active badge */}
      {selectedId && (
        <div className="px-2.5 py-2 rounded-lg text-[11px] text-indigo-300"
          style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
          📎 Context active — AI will answer from your document.
        </div>
      )}
    </div>
  );
}

// ── Main chat page ────────────────────────────────────────────────────
export default function ChatPage() {
  const [messages, setMessages]       = useState<ChatMessage[]>([]);
  const [input, setInput]             = useState("");
  const [streaming, setStreaming]     = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [documents, setDocuments]     = useState<Document[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [, startTransition]           = useTransition();

  const bottomRef    = useRef<HTMLDivElement>(null);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const abortRef     = useRef<AbortController | null>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  // Fetch user documents for the selector panel
  useEffect(() => {
    fetch("/api/documents")
      .then((r) => r.json())
      .then((d) => setDocuments(d.documents ?? []))
      .catch(() => {})
      .finally(() => setDocsLoading(false));
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [input]);

  // ── Send message + stream response ──────────────────────────────────
  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || streaming) return;

    setStreamError(null);
    setInput("");

    const userMsg: ChatMessage = { role: "user", content: trimmed, id: uid() };
    const assistantMsg: ChatMessage = { role: "assistant", content: "", id: uid() };

    setMessages((prev) => [...prev, userMsg]);
    setStreaming(true);

    // Build history for the API (last 20 turns to stay within context)
    const history = [...messages, userMsg].slice(-20).map(({ role, content }) => ({ role, content }));

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          ...(selectedDocId ? { documentId: selectedDocId } : {}),
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error ?? "Request failed");
      }

      if (!res.body) throw new Error("No response body");

      // Append the placeholder assistant message first
      setMessages((prev) => [...prev, { ...assistantMsg }]);

      // Stream text chunks via ReadableStream reader
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        // Update the last message (assistant placeholder) in place
        startTransition(() => {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...assistantMsg,
              content: fullText,
            };
            return updated;
          });
        });
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setStreamError((err as Error).message);
      // Remove the empty assistant placeholder on error
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        return last?.content === "" ? prev.slice(0, -1) : prev;
      });
    } finally {
      setStreaming(false);
      abortRef.current = null;
      textareaRef.current?.focus();
    }
  }, [input, messages, streaming, selectedDocId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (streaming) abortRef.current?.abort();
    setMessages([]);
    setStreamError(null);
    setStreaming(false);
  };

  const selectedDoc = documents.find((d) => d._id === selectedDocId);

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div
      className="flex h-full overflow-hidden"
      style={{ background: "var(--bg-base)", minHeight: "100vh" }}
    >
      {/* ── Left sidebar: document selector ─── */}
      <aside
        className="flex-shrink-0 border-r transition-all duration-300 overflow-hidden"
        style={{
          width: sidebarOpen ? 260 : 0,
          borderColor: "rgba(255,255,255,0.07)",
          background: "var(--bg-card)",
        }}
      >
        {sidebarOpen && (
          <DocumentPanel
            documents={documents}
            selectedId={selectedDocId}
            onSelect={setSelectedDocId}
            loading={docsLoading}
          />
        )}
      </aside>

      {/* ── Main chat area ──────────────────── */}
      <main className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b"
          style={{ borderColor: "rgba(255,255,255,0.07)", background: "var(--bg-card)" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((s) => !s)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors"
              style={{ background: "rgba(255,255,255,0.04)" }}
              title={sidebarOpen ? "Hide documents" : "Show documents"}
            >
              {sidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#06b6d4,#3b82f6)" }}>
                <MessageSquareDot size={14} className="text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-sm" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  Stratega AI
                </span>
                {selectedDoc && (
                  <p className="text-[10px] text-indigo-400 truncate max-w-[180px]">
                    📎 {selectedDoc.fileName}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                title="Clear conversation"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </header>

        {/* Message thread */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 scroll-smooth">
          {/* Welcome state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-5 py-12">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#06b6d4,#3b82f6)", boxShadow: "0 12px 30px rgba(6,182,212,0.3)" }}>
                <Sparkles size={28} className="text-white" />
              </div>
              <div className="max-w-sm">
                <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  Ask Stratega AI anything
                </h2>
                <p className="text-sm text-slate-500">
                  {selectedDocId
                    ? "Your document is attached. Ask questions about it or request a summary."
                    : "Select a document on the left to chat from your notes, or ask general study questions."}
                </p>
              </div>
              {/* Suggestion chips */}
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {[
                  "Summarise the key concepts",
                  "Quiz me on this topic",
                  "Create a study plan",
                  "Explain this simply",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="text-xs px-3 py-1.5 rounded-xl text-slate-400 hover:text-white transition-all hover:scale-105"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}

          {/* Typing indicator while streaming but assistant content is still empty */}
          {streaming && (messages[messages.length - 1]?.role !== "assistant" || messages[messages.length - 1]?.content === "") && (
            <TypingIndicator />
          )}

          {/* Stream error */}
          {streamError && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
              <span className="text-red-300">{streamError}</span>
              <button onClick={() => setStreamError(null)} className="ml-auto text-slate-600 hover:text-slate-400">
                <X size={13} />
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div
          className="flex-shrink-0 p-4 border-t"
          style={{ borderColor: "rgba(255,255,255,0.07)", background: "var(--bg-card)" }}
        >
          {/* Context indicator strip */}
          {selectedDoc && (
            <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
              <FileText size={11} className="text-indigo-400 flex-shrink-0" />
              <span className="text-[11px] text-indigo-400 truncate flex-1">{selectedDoc.fileName}</span>
              <button onClick={() => setSelectedDocId(null)} className="text-slate-600 hover:text-slate-400 transition-colors">
                <X size={11} />
              </button>
            </div>
          )}

          <div
            className="flex items-end gap-2 rounded-2xl p-2"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <textarea
              ref={textareaRef}
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={streaming ? "Generating response…" : "Ask anything… (Shift+Enter for new line)"}
              disabled={streaming}
              rows={1}
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none resize-none py-1.5 px-2 leading-relaxed"
              style={{ maxHeight: 160, minHeight: 36 }}
            />

            {streaming ? (
              <button
                onClick={() => abortRef.current?.abort()}
                title="Stop generating"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
              >
                <X size={16} />
              </button>
            ) : (
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                id="btn-send-message"
                title="Send message"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 flex-shrink-0"
                style={{
                  background: input.trim()
                    ? "linear-gradient(135deg,#06b6d4,#3b82f6)"
                    : "rgba(255,255,255,0.06)",
                }}
              >
                <Send size={15} />
              </button>
            )}
          </div>
          <p className="text-[10px] text-slate-700 text-center mt-2">
            Gemini 2.5 Flash · Responses may contain errors · Always verify important information.
          </p>
        </div>
      </main>
    </div>
  );
}
