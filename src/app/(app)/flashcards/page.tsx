"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, Trash2, Layers, BrainCircuit, Play, FileText, ChevronRight, AlertCircle, X } from "lucide-react";
import DeckPlayer, { CardData } from "@/components/flashcards/DeckPlayer";
import { cn } from "@/lib/utils";

interface FlashcardSetMeta {
  _id: string;
  title: string;
  documentId: string;
  createdAt: string;
  cards: {
    _id: string;
    nextReviewDate: string;
    interval: number;
    repetitions: number;
    easeFactor: number;
  }[];
}

interface DocumentMeta {
  _id: string;
  fileName: string;
}

export default function FlashcardsPage() {
  const [sets, setSets] = useState<FlashcardSetMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Deck Player State
  const [activeSet, setActiveSet] = useState<{ id: string; title: string; cards: CardData[] } | null>(null);
  const [loadingSetId, setLoadingSetId] = useState<string | null>(null);

  // Generate Modal State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Load sets on mount
  const loadSets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/flashcards");
      if (!res.ok) throw new Error("Failed to load flashcard sets");
      const data = await res.json();
      setSets(data.sets || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSets();
  }, [loadSets]);

  // Handle deck launch
  const playDeck = async (setId: string, title: string) => {
    setLoadingSetId(setId);
    setError(null);
    try {
      const res = await fetch(`/api/flashcards/${setId}`);
      if (!res.ok) throw new Error("Failed to load deck data");
      const data = await res.json();
      setActiveSet({ id: setId, title, cards: data.set.cards });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingSetId(null);
    }
  };

  // Handle deck deletion
  const deleteDeck = async (setId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this flashcard deck?")) return;
    
    try {
      const res = await fetch(`/api/flashcards?setId=${setId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete deck");
      setSets((prev) => prev.filter((s) => s._id !== setId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle opening generate modal
  const openGenerateModal = async () => {
    setShowGenerateModal(true);
    setDocsLoading(true);
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDocsLoading(false);
    }
  };

  // Handle generation
  const handleGenerate = async () => {
    if (!selectedDocId) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: selectedDocId, cardCount: 20 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate flashcards");
      
      setShowGenerateModal(false);
      setSelectedDocId(null);
      await loadSets(); // refresh list
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  // Calculate due cards
  const getDueCount = (cards: FlashcardSetMeta["cards"]) => {
    const now = new Date();
    return cards.filter(c => new Date(c.nextReviewDate) <= now).length;
  };

  // ── Render Player ──────────────────────────────────────────────────
  if (activeSet) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
        <DeckPlayer
          setId={activeSet.id}
          title={activeSet.title}
          cards={activeSet.cards}
          onExit={() => { setActiveSet(null); loadSets(); }} // refresh stats on exit
        />
      </div>
    );
  }

  // ── Render Main View ────────────────────────────────────────────────
  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#10b981,#14b8a6)", boxShadow: "0 8px 24px rgba(16,185,129,0.25)" }}>
              <BrainCircuit size={20} className="text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              Flashcards
            </h1>
          </div>
          <p className="text-sm text-slate-400">SM-2 Spaced Repetition Decks</p>
        </div>
        <button
          onClick={openGenerateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.25)" }}
        >
          <Plus size={16} /> New Deck
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
          <span className="text-red-200">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-slate-500 hover:text-slate-300"><X size={14} /></button>
        </div>
      )}

      {/* Decks Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 size={32} className="animate-spin mb-4 text-emerald-500" />
          <p>Loading your decks...</p>
        </div>
      ) : sets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed rounded-3xl" style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}>
          <Layers size={48} className="text-slate-700 mb-4" />
          <h3 className="text-lg font-bold text-slate-300 mb-2">No flashcard decks yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mb-6">
            Generate your first intelligent study deck from any uploaded PDF notes to start practicing.
          </p>
          <button onClick={openGenerateModal} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">
            Generate now →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sets.map((set) => {
            const dueCount = getDueCount(set.cards);
            return (
              <div
                key={set._id}
                onClick={() => playDeck(set._id, set.title)}
                className="group relative flex flex-col p-5 rounded-2xl cursor-pointer transition-all hover:-translate-y-1"
                style={{ background: "var(--bg-card)", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => deleteDeck(set._id, e)}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                    title="Delete Deck"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-white mb-1 truncate pr-8" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  {set.title}
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  {set.cards.length} total cards
                </p>

                <div className="mt-auto flex items-end justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Status</span>
                    {dueCount > 0 ? (
                      <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {dueCount} due for review
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-slate-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-600" />
                        Up to date
                      </span>
                    )}
                  </div>
                  
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    {loadingSetId === set._id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Play size={16} className="ml-0.5" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl p-6 shadow-2xl relative" style={{ background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <button onClick={() => setShowGenerateModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white">
              <X size={16} />
            </button>
            <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Generate Flashcards</h2>
            <p className="text-sm text-slate-400 mb-6">Select a document to act as the knowledge base for this deck.</p>
            
            {docsLoading ? (
              <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-indigo-500" /></div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No documents found. <a href="/upload" className="text-indigo-400 hover:underline">Upload one first.</a>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto mb-6 pr-2">
                {documents.map(doc => (
                  <button
                    key={doc._id}
                    onClick={() => setSelectedDocId(doc._id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl text-left transition-all border",
                      selectedDocId === doc._id
                        ? "bg-indigo-500/10 border-indigo-500/30 text-white"
                        : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10"
                    )}
                  >
                    <FileText size={16} className={selectedDocId === doc._id ? "text-indigo-400" : "text-slate-500"} />
                    <span className="text-sm font-medium truncate flex-1">{doc.fileName}</span>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!selectedDocId || generating}
              className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: selectedDocId && !generating ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.1)" }}
            >
              {generating ? <><Loader2 size={16} className="animate-spin" /> Generating AI Deck...</> : "Generate Deck"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
