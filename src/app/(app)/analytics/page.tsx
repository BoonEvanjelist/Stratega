"use client";

import { useState, useEffect } from "react";
import { Loader2, TrendingUp, AlertTriangle, Lightbulb, RefreshCw, Activity, CheckCircle2, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";

interface AnalyticsData {
  totalStudyTime: number;
  sessionHistory: { date: string; focusBlockDuration: number }[];
  performanceSummary: {
    weakTopics: string[];
    aiRecommendations: string[];
  };
}

interface FlashcardSetMeta {
  cards: {
    easeFactor: number;
  }[];
}

const PIE_COLORS = ["#10b981", "#f43f5e"];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [flashcardStats, setFlashcardStats] = useState({ pass: 0, fail: 0 });
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      const [anRes, fcRes] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/flashcards")
      ]);

      if (anRes.ok) {
        const data = await anRes.json();
        setAnalytics(data.analytics);
      }

      if (fcRes.ok) {
        const data = await fcRes.json();
        const sets: FlashcardSetMeta[] = data.sets || [];
        
        let pass = 0;
        let fail = 0;
        sets.forEach(set => {
          set.cards.forEach(c => {
            if (c.easeFactor >= 2.3) pass++;
            else fail++;
          });
        });
        
        // If no cards, mock some data for the chart to look nice, or keep 0
        setFlashcardStats({ pass, fail });
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const runEvaluation = async () => {
    setEvaluating(true);
    setError(null);
    try {
      const res = await fetch("/api/analytics/evaluate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Evaluation failed");
      
      setAnalytics(data.analytics);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-pink-500" />
      </div>
    );
  }

  // Format chart data
  // Default to a 7-day mock if no history exists for a better visual, 
  // but let's use actual history if available.
  const chartData = analytics?.sessionHistory.length ? 
    analytics.sessionHistory.map(s => ({
      name: new Date(s.date).toLocaleDateString("en-US", { weekday: 'short' }),
      minutes: s.focusBlockDuration
    })) : 
    [
      { name: "Mon", minutes: 0 }, { name: "Tue", minutes: 0 }, { name: "Wed", minutes: 0 },
      { name: "Thu", minutes: 0 }, { name: "Fri", minutes: 0 }, { name: "Sat", minutes: 0 },
      { name: "Sun", minutes: 0 },
    ];

  const pieData: { name: string, value: number, color?: string }[] = (flashcardStats.pass === 0 && flashcardStats.fail === 0)
    ? [{ name: "No Data", value: 1, color: "#334155" }]
    : [
        { name: "Pass (Good/Easy)", value: flashcardStats.pass },
        { name: "Struggling (Hard)", value: flashcardStats.fail }
      ];

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#ec4899,#f43f5e)", boxShadow: "0 8px 24px rgba(236,72,153,0.25)" }}>
              <TrendingUp size={20} className="text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              Analytics
            </h1>
          </div>
          <p className="text-sm text-slate-400">Study performance and AI diagnostics</p>
        </div>
        <button
          onClick={runEvaluation}
          disabled={evaluating}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.25)" }}
        >
          {evaluating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Run Diagnostic
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl text-sm flex items-center gap-2 text-red-200" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertTriangle size={16} className="text-red-400" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Charts */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Study Time Chart */}
          <div className="p-6 rounded-3xl" style={{ background: "var(--bg-card)", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-white text-lg">Study Time (Minutes)</h3>
              <div className="text-sm font-medium text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full">
                Total: {analytics?.totalStudyTime || 0}m
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1e293b", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
                    itemStyle={{ color: "#ec4899" }}
                    cursor={{ fill: "rgba(255,255,255,0.02)" }}
                  />
                  <Bar dataKey="minutes" fill="url(#colorMinutes)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  <defs>
                    <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#ec4899" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Flashcard Pass/Fail Chart */}
          <div className="p-6 rounded-3xl flex flex-col md:flex-row items-center gap-8" style={{ background: "var(--bg-card)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex-1 w-full">
              <h3 className="font-bold text-white text-lg mb-2">Flashcard Retention</h3>
              <p className="text-sm text-slate-400 mb-6">Your memory performance based on SM-2 reviews.</p>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    <span className="text-sm font-medium text-slate-300">Mastered (Pass)</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">{flashcardStats.pass}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle size={18} className="text-rose-500" />
                    <span className="text-sm font-medium text-slate-300">Struggling (Fail)</span>
                  </div>
                  <span className="text-sm font-bold text-rose-400">{flashcardStats.fail}</span>
                </div>
              </div>
            </div>
            
            <div className="h-48 w-48 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1e293b", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }}
                    itemStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: AI Diagnostics */}
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-3xl h-full flex flex-col" style={{ background: "rgba(99, 102, 241, 0.05)", border: "1px solid rgba(99, 102, 241, 0.2)", backdropFilter: "blur(12px)" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-500/20">
                <Activity size={16} className="text-indigo-400" />
              </div>
              <h3 className="font-bold text-indigo-300 text-lg">AI Diagnostic Feed</h3>
            </div>

            {(!analytics?.performanceSummary?.weakTopics?.length) ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
                <Lightbulb size={32} className="text-indigo-300 mb-3" />
                <p className="text-sm text-indigo-200">No weak topics identified yet.</p>
                <p className="text-xs text-indigo-300/60 mt-2">Study more flashcards or run a diagnostic!</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
                
                {/* Weak Topics */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400/80 mb-3">Flagged Weak Topics</h4>
                  <div className="flex flex-col gap-2">
                    {analytics.performanceSummary.weakTopics.map((topic, i) => (
                      <div key={i} className="flex items-start gap-2 bg-indigo-950/40 p-3 rounded-xl border border-indigo-500/20">
                        <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-medium text-indigo-100">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400/80 mb-3">Study Action Plan</h4>
                  <div className="flex flex-col gap-3">
                    {analytics.performanceSummary.aiRecommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        {/* Rendering simple markdown explicitly for safety, or just standard text formatting */}
                        <div 
                          className="text-sm text-indigo-200/90 leading-relaxed prose-stratega prose-sm"
                          dangerouslySetInnerHTML={{ 
                            __html: rec.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-100 font-semibold">$1</strong>') 
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
