"use client";

import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CardData {
  _id: string;
  front: string;
  back: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReviewDate: string;
}

interface DeckPlayerProps {
  setId: string;
  title: string;
  cards: CardData[];
  onExit: () => void;
}

// Quality buttons shown below the flipped card
const QUALITY_BUTTONS = [
  { quality: 1, label: "Blackout", sub: "Didn't know",  color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)"   },
  { quality: 2, label: "Hard",     sub: "Almost",        color: "#f97316", bg: "rgba(249,115,22,0.1)",  border: "rgba(249,115,22,0.3)"  },
  { quality: 3, label: "Okay",     sub: "With effort",   color: "#eab308", bg: "rgba(234,179,8,0.1)",   border: "rgba(234,179,8,0.3)"   },
  { quality: 4, label: "Good",     sub: "After pause",   color: "#22c55e", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.3)"   },
  { quality: 5, label: "Easy",     sub: "Instantly",     color: "#06b6d4", bg: "rgba(6,182,212,0.1)",   border: "rgba(6,182,212,0.3)"   },
] as const;

export default function DeckPlayer({ setId, title, cards, onExit }: DeckPlayerProps) {
  const [index, setIndex]           = useState(0);
  const [isFlipped, setIsFlipped]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]             = useState(false);
  const [scores, setScores]         = useState<Record<string, number>>({});

  const card = cards[index];
  const progress = Math.round(((index) / cards.length) * 100);

  const flip = useCallback(() => setIsFlipped((f) => !f), []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); flip(); }
  }, [flip]);

  const submitQuality = useCallback(async (quality: number) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await fetch("/api/flashcards/review", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setId, cardId: card._id, quality }),
      });
      setScores((s) => ({ ...s, [card._id]: quality }));
    } catch { /* non-critical — we still advance */ }

    const next = index + 1;
    if (next >= cards.length) {
      setDone(true);
    } else {
      setIndex(next);
      setIsFlipped(false);
    }
    setSubmitting(false);
  }, [submitting, setId, card, index, cards.length]);

  // ── Done screen ────────────────────────────────────────────────────
  if (done) {
    const avg = Object.values(scores).reduce((a, b) => a + b, 0) / (Object.values(scores).length || 1);
    const grade = avg >= 4.5 ? "Excellent" : avg >= 3.5 ? "Good" : avg >= 2.5 ? "Needs Work" : "Keep Practicing";
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
          style={{ background: "linear-gradient(135deg,#10b981,#14b8a6)", boxShadow: "0 16px 40px rgba(16,185,129,0.3)" }}>
          🎉
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-white mb-1" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            Session Complete!
          </h2>
          <p className="text-slate-400">{cards.length} cards reviewed · Average: <span className="text-emerald-400 font-semibold">{grade}</span></p>
        </div>
        <div className="grid grid-cols-5 gap-2 w-full max-w-sm">
          {QUALITY_BUTTONS.map(({ quality, label, color }) => {
            const count = Object.values(scores).filter((q) => q === quality).length;
            return (
              <div key={quality} className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm" style={{ background: `${color}18`, color }}>{count}</div>
                <span className="text-[10px] text-slate-600">{label}</span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setIndex(0); setIsFlipped(false); setDone(false); setScores({}); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition-all"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <RotateCcw size={14} /> Restart
          </button>
          <button onClick={onExit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
            Back to Sets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <button onClick={onExit} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors">
          <ChevronLeft size={16} /> Sets
        </button>
        <span className="text-sm font-semibold text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{title}</span>
        <span className="text-sm text-slate-500">{index + 1} / {cards.length}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-white/5">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, background: "linear-gradient(90deg,#6366f1,#06b6d4)" }} />
      </div>

      {/* 3D card */}
      <div className="card-scene w-full" style={{ height: 300 }}
        onClick={flip} onKeyDown={handleKeyDown} tabIndex={0} role="button" aria-label="Flip card">
        <div className={cn("card-3d", isFlipped && "is-flipped")} style={{ height: 300 }}>
          {/* Front face */}
          <div className="card-face" style={{ background: "var(--bg-card)", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400 mb-4">Question</span>
            <p className="text-xl font-bold text-white leading-relaxed" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{card.front}</p>
            <div className="flex items-center gap-1.5 mt-6 text-slate-600 text-xs">
              <Eye size={12} /> <span>Click to reveal answer</span>
            </div>
          </div>
          {/* Back face */}
          <div className="card-face card-face-back" style={{ background: "linear-gradient(145deg,#0f1729,#111827)", border: "1px solid rgba(99,102,241,0.25)", boxShadow: "0 8px 32px rgba(99,102,241,0.15)" }}>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400 mb-4">Answer</span>
            <p className="text-base text-slate-200 leading-relaxed">{card.back}</p>
          </div>
        </div>
      </div>

      {/* Hint: only show tap-to-flip on front */}
      {!isFlipped && (
        <p className="text-xs text-slate-600">Space / Enter to flip</p>
      )}

      {/* Quality buttons — only after flip */}
      {isFlipped && (
        <div className="w-full">
          <p className="text-center text-xs text-slate-500 mb-3">How well did you know this?</p>
          <div className="grid grid-cols-5 gap-2">
            {QUALITY_BUTTONS.map(({ quality, label, sub, color, bg, border }) => (
              <button key={quality} onClick={(e) => { e.stopPropagation(); submitQuality(quality); }}
                disabled={submitting}
                className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                style={{ background: bg, border: `1px solid ${border}` }}>
                <span className="text-sm font-bold" style={{ color }}>{label}</span>
                <span className="text-[10px] text-slate-600">{sub}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation (skip) */}
      <div className="flex items-center gap-4">
        <button onClick={() => { setIndex((i) => Math.max(0, i - 1)); setIsFlipped(false); }}
          disabled={index === 0}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30">
          <ChevronLeft size={16} />
        </button>
        <span className="text-xs text-slate-700">skip</span>
        <button onClick={() => { const n = index + 1; if (n >= cards.length) setDone(true); else { setIndex(n); setIsFlipped(false); } }}
          disabled={index >= cards.length - 1}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
