"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import {
  CalendarDays, Plus, Loader2, CheckCircle2, Circle,
  Clock, BookOpenText, ChevronDown, ChevronUp,
  Trash2, AlertCircle, Sparkles, Trophy, Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────
interface StudyPlanDay {
  _id: string;
  dayNumber: number;
  date: string;
  topicToCover: string;
  isCompleted: boolean;
}

interface Timetable {
  _id: string;
  subjectName: string;
  examDate: string;
  totalDays: number;
  studyPlan: StudyPlanDay[];
  createdAt: string;
}

// ── Utility helpers ────────────────────────────────────────────────────
function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const t = new Date();
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
}

function isPast(dateStr: string): boolean {
  const d = new Date(dateStr);
  d.setHours(23, 59, 59, 0);
  return d < new Date();
}

// ── Subject colour palette (cycles) ──────────────────────────────────
const SUBJECT_COLORS = [
  { color: "#6366f1", bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.25)" },
  { color: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.25)" },
  { color: "#06b6d4", bg: "rgba(6,182,212,0.12)",   border: "rgba(6,182,212,0.25)" },
  { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.25)" },
  { color: "#ec4899", bg: "rgba(236,72,153,0.12)",  border: "rgba(236,72,153,0.25)" },
  { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)",  border: "rgba(139,92,246,0.25)" },
];

function subjectColor(index: number) {
  return SUBJECT_COLORS[index % SUBJECT_COLORS.length];
}

// ── Study Plan Card ────────────────────────────────────────────────────
function PlanCard({
  plan,
  colorIndex,
  onToggle,
}: {
  plan: Timetable;
  colorIndex: number;
  onToggle: (timetableId: string, dayId: string, current: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { color, bg, border } = subjectColor(colorIndex);
  const remaining = daysUntil(plan.examDate);
  const completed = plan.studyPlan.filter((d) => d.isCompleted).length;
  const pct = Math.round((completed / plan.studyPlan.length) * 100);
  const todayDay = plan.studyPlan.find((d) => isToday(d.date));

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{ background: "var(--bg-card)", border: `1px solid rgba(255,255,255,0.07)` }}
    >
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              <BookOpenText size={18} style={{ color }} />
            </div>
            <div>
              <h3 className="font-bold text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                {plan.subjectName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Exam: {formatDate(plan.examDate)}
              </p>
            </div>
          </div>

          {/* Days remaining badge */}
          <div
            className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold"
            style={{
              background: remaining <= 3 ? "rgba(239,68,68,0.12)" : remaining <= 7 ? "rgba(245,158,11,0.12)" : bg,
              border: `1px solid ${remaining <= 3 ? "rgba(239,68,68,0.3)" : remaining <= 7 ? "rgba(245,158,11,0.3)" : border}`,
              color: remaining <= 3 ? "#f87171" : remaining <= 7 ? "#fbbf24" : color,
            }}
          >
            {remaining > 0 ? `${remaining}d left` : remaining === 0 ? "Today!" : "Past"}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500">{completed}/{plan.studyPlan.length} sessions</span>
            <span className="font-semibold" style={{ color }}>{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}60` }}
            />
          </div>
        </div>

        {/* Today's task highlight */}
        {todayDay && (
          <div
            className="flex items-start gap-2 p-3 rounded-xl mb-3"
            style={{ background: bg, border: `1px solid ${border}` }}
          >
            <Sparkles size={13} style={{ color }} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-0.5" style={{ color }}>
                Today's Task
              </p>
              <p className="text-xs text-slate-300">{todayDay.topicToCover}</p>
            </div>
          </div>
        )}

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-300 transition-colors"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? "Hide schedule" : `Show all ${plan.studyPlan.length} sessions`}
        </button>
      </div>

      {/* Expanded day list */}
      {expanded && (
        <div className="px-5 pb-5 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="pt-4 space-y-1.5">
            {plan.studyPlan.map((day) => {
              const today = isToday(day.date);
              const past = isPast(day.date);

              return (
                <button
                  key={day._id}
                  onClick={() => onToggle(plan._id, day._id, day.isCompleted)}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200",
                    today ? "ring-1" : "",
                    day.isCompleted ? "opacity-60" : "hover:bg-white/[0.03]"
                  )}
                  style={{
                    background: today ? bg : "transparent",
                    ...(today ? { "--tw-ring-color": color, ringColor: color } as React.CSSProperties : {}),
                  }}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {day.isCompleted ? (
                      <CheckCircle2 size={16} style={{ color }} />
                    ) : (
                      <Circle size={16} className={cn(past && !day.isCompleted ? "text-slate-700" : "text-slate-600")} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-xs font-medium leading-snug",
                        day.isCompleted ? "line-through text-slate-600" : "text-slate-300"
                      )}
                    >
                      {day.topicToCover}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      {today ? "Today · " : ""}
                      {formatDate(day.date)}
                    </p>
                  </div>
                  {today && !day.isCompleted && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0" style={{ background: bg, color }}>
                      NOW
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Timetable Page ────────────────────────────────────────────────
export default function TimetablePage() {
  const [plans, setPlans] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGenerating, startGenerate] = useTransition();

  // Form state
  const [subjectName, setSubjectName] = useState("");
  const [examDate, setExamDate] = useState("");

  // Compute today's min date for the date picker (tomorrow minimum)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  // ── Fetch plans ─────────────────────────────────────────────────────
  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/timetable");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load plans");
      setPlans(data.plans ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  // ── Generate plan ────────────────────────────────────────────────────
  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!subjectName.trim() || !examDate) {
      setFormError("Please fill in both fields.");
      return;
    }

    startGenerate(async () => {
      const res = await fetch("/api/timetable/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectName: subjectName.trim(), examDate }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.issues
          ? Object.values(data.issues as Record<string, string[]>).flat()[0]
          : data.error;
        setFormError(msg ?? "Failed to generate plan");
        return;
      }
      setSubjectName("");
      setExamDate("");
      await fetchPlans();
    });
  }

  // ── Toggle day completion ────────────────────────────────────────────
  async function handleToggle(timetableId: string, dayId: string, current: boolean) {
    // Optimistic UI update
    setPlans((prev) =>
      prev.map((p) =>
        p._id !== timetableId
          ? p
          : {
              ...p,
              studyPlan: p.studyPlan.map((d) =>
                d._id === dayId ? { ...d, isCompleted: !current } : d
              ),
            }
      )
    );

    const res = await fetch("/api/timetable", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timetableId, dayId, isCompleted: !current }),
    });

    if (!res.ok) {
      // Revert on failure
      setPlans((prev) =>
        prev.map((p) =>
          p._id !== timetableId
            ? p
            : {
                ...p,
                studyPlan: p.studyPlan.map((d) =>
                  d._id === dayId ? { ...d, isCompleted: current } : d
                ),
              }
        )
      );
    }
  }

  // ── Stats (computed) ──────────────────────────────────────────────────
  const totalSessions = plans.reduce((s, p) => s + p.studyPlan.length, 0);
  const completedSessions = plans.reduce((s, p) => s + p.studyPlan.filter((d) => d.isCompleted).length, 0);
  const todaySessions = plans.flatMap((p) => p.studyPlan.filter((d) => isToday(d.date)));

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ background: "var(--bg-base)" }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <CalendarDays size={16} className="text-amber-400" />
          <span className="text-xs text-amber-400 font-semibold uppercase tracking-widest">Study Planner</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
          Smart Timetable
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Generate AI-structured study plans for each exam. Check off daily tasks as you go.
        </p>
      </div>

      {/* ── Stats row ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Active Plans",    value: plans.length,                   icon: BookOpenText, color: "#6366f1" },
          { label: "Total Sessions",  value: totalSessions,                  icon: Target,       color: "#06b6d4" },
          { label: "Completed",       value: completedSessions,              icon: CheckCircle2, color: "#10b981" },
          { label: "Due Today",       value: todaySessions.length,           icon: Clock,        color: "#f59e0b" },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Generate form ────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="card-stratega p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#f59e0b,#fb923c)", boxShadow: "0 6px 16px rgba(245,158,11,0.3)" }}>
                <Plus size={16} className="text-white" />
              </div>
              <span className="font-bold text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>New Study Plan</span>
            </div>

            {formError && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4 text-xs" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <AlertCircle size={13} className="text-red-400 flex-shrink-0" />
                <span className="text-red-300">{formError}</span>
              </div>
            )}

            <form onSubmit={handleGenerate} id="generate-plan-form" className="space-y-4">
              {/* Subject name */}
              <div>
                <label htmlFor="subjectName" className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  Subject
                </label>
                <input
                  id="subjectName"
                  type="text"
                  placeholder="e.g. Organic Chemistry"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  required
                  className="w-full px-3.5 py-3 rounded-xl text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>

              {/* Exam date */}
              <div>
                <label htmlFor="examDate" className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  Exam Date
                </label>
                <input
                  id="examDate"
                  type="date"
                  min={minDateStr}
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-3 rounded-xl text-sm text-slate-100 outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    colorScheme: "dark",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>

              <button
                id="btn-generate-plan"
                type="submit"
                disabled={isGenerating}
                className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg,#f59e0b,#fb923c)",
                  boxShadow: "0 8px 24px rgba(245,158,11,0.3)",
                }}
              >
                {isGenerating ? (
                  <><Loader2 size={15} className="animate-spin" /> Generating…</>
                ) : (
                  <><Sparkles size={15} /> Generate Plan</>
                )}
              </button>
            </form>

            {/* Tips */}
            <div className="mt-5 p-3.5 rounded-xl text-xs text-slate-500 space-y-1.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <p className="font-semibold text-slate-400">💡 How it works</p>
              <p>Sessions are distributed evenly from today through your exam date, with a full revision day and a light-review rest day at the end.</p>
            </div>
          </div>
        </div>

        {/* ── Right: Plans list ──────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Today's summary bar */}
          {todaySessions.length > 0 && (
            <div
              className="p-4 rounded-2xl flex items-center gap-4"
              style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.08))", border: "1px solid rgba(99,102,241,0.2)" }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                <Trophy size={17} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {todaySessions.filter((d) => d.isCompleted).length}/{todaySessions.length} tasks done today
                </p>
                <p className="text-xs text-slate-400">
                  {todaySessions.filter((d) => !d.isCompleted).length > 0
                    ? "Tick off today's sessions to keep your streak alive!"
                    : "All done for today! 🎉 Amazing work."}
                </p>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 size={32} className="text-amber-400 animate-spin" />
              <p className="text-slate-500 text-sm">Loading your plans…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && plans.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4 card-stratega">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#f59e0b,#fb923c)", boxShadow: "0 12px 30px rgba(245,158,11,0.3)" }}>
                <CalendarDays size={28} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-lg" style={{ fontFamily: "Space Grotesk, sans-serif" }}>No plans yet</p>
                <p className="text-slate-500 text-sm mt-1 max-w-xs">Add a subject and exam date on the left to generate your first AI study plan.</p>
              </div>
            </div>
          )}

          {/* Plan cards */}
          {!loading && plans.map((plan, i) => (
            <PlanCard
              key={plan._id}
              plan={plan}
              colorIndex={i}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
