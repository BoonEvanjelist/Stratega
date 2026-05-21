"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flame, Clock, BookOpenCheck, Upload, MessageSquareDot,
  CalendarDays, TrendingUp, Bell, ChevronRight, Sparkles,
  Zap, BarChart3, Trophy, Loader2, Target, Brain, ArrowRight,
} from "lucide-react";
import PomodoroTimer from "@/components/productivity/PomodoroTimer";

/* ─── types ─────────────────────────────────────────── */
interface Stats {
  studyHours: string;
  cardsReviewed: number;
  documentsCount: number;
  avgScore: string;
  studyStreak: number;
  userName: string;
}

/* ─── Neon glow helper ──────────────────────────────── */
const CARD_STYLE: React.CSSProperties = {
  background: "linear-gradient(145deg,#111827,#0d1320)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
  transition: "border-color 0.25s, box-shadow 0.25s, transform 0.25s",
};

function glowHover(color: string) {
  return {
    onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => {
      e.currentTarget.style.borderColor = color;
      e.currentTarget.style.boxShadow = `0 0 28px ${color}40, 0 8px 32px rgba(0,0,0,0.4)`;
      e.currentTarget.style.transform = "translateY(-2px)";
    },
    onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
      e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
      e.currentTarget.style.boxShadow = "none";
      e.currentTarget.style.transform = "translateY(0)";
    },
  };
}

/* ─── Stat card ──────────────────────────────────────── */
function StatCard({
  label, value, sub, icon: Icon, color, loading,
}: {
  label: string; value: string | number; sub: string;
  icon: React.ElementType; color: string; loading: boolean;
}) {
  return (
    <div style={{ ...CARD_STYLE, padding: "20px 20px 18px" }} {...glowHover(color)}>
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 72 }}>
          <Loader2 size={20} color="#334155" className="animate-spin" />
        </div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
            <div style={{
              width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center",
              background: `${color}1a`,
            }}>
              <Icon size={15} color={color} />
            </div>
          </div>
          <p style={{ fontFamily: "Space Grotesk,sans-serif", fontSize: 28, fontWeight: 800, color: "#f1f5f9", margin: 0, lineHeight: 1.1 }}>
            {value}
          </p>
          <p style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{sub}</p>
          {/* Color accent line */}
          <div style={{ marginTop: 14, height: 2, borderRadius: 2, background: `linear-gradient(90deg,${color},transparent)`, opacity: 0.5 }} />
        </>
      )}
    </div>
  );
}

/* ─── Streak widget ──────────────────────────────────── */
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function StreakWidget({ streak }: { streak: number }) {
  const today = new Date().getDay();
  const dayIdx = today === 0 ? 6 : today - 1;
  const active = DAYS.map((_, i) => {
    const diff = dayIdx - i;
    return diff >= 0 && diff < streak;
  });

  return (
    <div style={{ ...CARD_STYLE, padding: "22px 22px 20px", height: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Flame size={17} color="#f97316" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>Study Streak</span>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 8,
          background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.25)",
        }}>
          <Trophy size={11} color="#fb923c" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#fdba74" }}>{streak} days</span>
        </div>
      </div>

      {/* Day bubbles */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        {DAYS.map((day, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
              background: active[i] ? "linear-gradient(135deg,#f97316,#fb923c)" : "rgba(255,255,255,0.04)",
              border: active[i] ? "1px solid rgba(249,115,22,0.4)" : "1px solid rgba(255,255,255,0.06)",
              boxShadow: active[i] ? "0 0 14px rgba(249,115,22,0.5)" : "none",
              transition: "all 0.2s",
            }}>
              {active[i]
                ? <Flame size={14} color="#fff" />
                : <span style={{ fontSize: 11, fontWeight: 600, color: "#334155" }}>{day}</span>
              }
            </div>
            <span style={{ fontSize: 10, color: "#334155", fontWeight: 500 }}>{day}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: "#475569" }}>Weekly goal</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#fb923c" }}>{Math.min(streak, 7)}/7 days</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 3, transition: "width 1s ease",
            width: `${Math.min((streak / 7) * 100, 100)}%`,
            background: "linear-gradient(90deg,#f97316,#fb923c)",
            boxShadow: "0 0 8px rgba(249,115,22,0.6)",
          }} />
        </div>
      </div>

      <p style={{ fontSize: 11, color: "#475569", marginTop: 12 }}>
        {streak >= 7
          ? "🏆 Weekly goal achieved! Outstanding!"
          : `🔥 ${7 - Math.min(streak, 7)} more days to earn a Streak Shield`}
      </p>
    </div>
  );
}

/* ─── Quick Access panel ─────────────────────────────── */
const ACCESS_ITEMS = [
  { label: "Flashcard Decks",   href: "/flashcards", color: "#10b981", icon: BookOpenCheck,    desc: "Review your spaced-repetition cards" },
  { label: "Study Timetable",   href: "/timetable",  color: "#f59e0b", icon: CalendarDays,     desc: "Check today's schedule" },
  { label: "Upload Notes",      href: "/upload",      color: "#6366f1", icon: Upload,           desc: "Add new PDFs or slides" },
  { label: "AI Tutor Chat",     href: "/chat",        color: "#06b6d4", icon: MessageSquareDot, desc: "Ask anything about your notes" },
];

function QuickAccessPanel() {
  return (
    <div style={{ ...CARD_STYLE, padding: "22px 22px 20px", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Target size={16} color="#818cf8" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>Quick Access</span>
        </div>
        <Link href="/analytics" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#6366f1", textDecoration: "none", fontWeight: 500 }}>
          Analytics <ChevronRight size={12} />
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {ACCESS_ITEMS.map((item) => (
          <Link key={item.label} href={item.href} style={{ textDecoration: "none" }}>
            <div
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 11,
                border: "1px solid transparent", transition: "all 0.18s", cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${item.color}0d`;
                e.currentTarget.style.borderColor = `${item.color}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "transparent";
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                background: `${item.color}1a`, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <item.icon size={15} color={item.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</p>
                <p style={{ fontSize: 11, color: "#475569", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.desc}</p>
              </div>
              <ChevronRight size={13} color="#334155" style={{ flexShrink: 0 }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─── Quick Actions grid ─────────────────────────────── */
const ACTIONS = [
  {
    label: "Upload Notes",  href: "/upload",      icon: Upload,
    color: "#6366f1", glow: "rgba(99,102,241,0.5)",
    bg: "linear-gradient(135deg,rgba(99,102,241,0.15),rgba(99,102,241,0.05))",
    border: "rgba(99,102,241,0.25)",
    desc: "Drag & drop PDFs, slides, or docs. AI extracts key concepts instantly.",
  },
  {
    label: "AI Chat",       href: "/chat",        icon: MessageSquareDot,
    color: "#06b6d4", glow: "rgba(6,182,212,0.5)",
    bg: "linear-gradient(135deg,rgba(6,182,212,0.15),rgba(6,182,212,0.05))",
    border: "rgba(6,182,212,0.25)",
    desc: "Ask your AI tutor anything about your uploaded notes. Real-time answers.",
  },
  {
    label: "Flashcards",    href: "/flashcards",  icon: BookOpenCheck,
    color: "#10b981", glow: "rgba(16,185,129,0.5)",
    bg: "linear-gradient(135deg,rgba(16,185,129,0.15),rgba(16,185,129,0.05))",
    border: "rgba(16,185,129,0.25)",
    desc: "Auto-generated spaced repetition decks. Study smarter, not harder.",
  },
  {
    label: "Timetable",     href: "/timetable",   icon: CalendarDays,
    color: "#f59e0b", glow: "rgba(245,158,11,0.5)",
    bg: "linear-gradient(135deg,rgba(245,158,11,0.15),rgba(245,158,11,0.05))",
    border: "rgba(245,158,11,0.25)",
    desc: "AI-scheduled sessions around your deadlines and Pomodoro preferences.",
  },
];

function QuickActionsPanel() {
  return (
    <div style={{ ...CARD_STYLE, padding: "22px 22px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
        <Zap size={16} color="#818cf8" />
        <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>Quick Actions</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {ACTIONS.map((a) => (
          <Link key={a.label} href={a.href} style={{ textDecoration: "none" }}>
            <div
              style={{
                padding: "16px 14px", borderRadius: 13,
                background: a.bg, border: `1px solid ${a.border}`,
                cursor: "pointer", transition: "all 0.22s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 22px ${a.glow}, 0 4px 20px rgba(0,0,0,0.3)`;
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.borderColor = a.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = a.border;
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10, marginBottom: 10,
                background: `${a.color}25`, display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 12px ${a.glow}`,
              }}>
                <a.icon size={18} color={a.color} />
              </div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px" }}>{a.label}</p>
              <p style={{ fontSize: 11, color: "#64748b", margin: 0, lineHeight: 1.4 }}>{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─── Activity panel ─────────────────────────────────── */
function ActivityPanel({ stats, loading }: { stats: Stats | null; loading: boolean }) {
  const items = [
    { icon: BookOpenCheck, label: "Flashcards in library", value: stats?.cardsReviewed ?? 0, color: "#10b981", unit: "cards" },
    { icon: Upload,         label: "Notes uploaded",        value: stats?.documentsCount ?? 0, color: "#6366f1", unit: "docs" },
    { icon: Flame,          label: "Study streak",          value: stats?.studyStreak ?? 0,    color: "#f97316", unit: "days" },
    { icon: TrendingUp,     label: "Average score",         value: stats?.avgScore ?? "—",     color: "#f59e0b", unit: "" },
  ];

  return (
    <div style={{ ...CARD_STYLE, padding: "22px 22px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BarChart3 size={16} color="#818cf8" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>Your Activity</span>
        </div>
        <Link href="/analytics" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#6366f1", textDecoration: "none", fontWeight: 500 }}>
          View all <ArrowRight size={12} />
        </Link>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
          <Loader2 size={24} color="#334155" className="animate-spin" />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map(({ icon: Icon, label, value, color, unit }) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 11,
              border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)",
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}1a`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={15} color={color} />
              </div>
              <span style={{ flex: 1, fontSize: 12, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", flexShrink: 0 }}>
                {value}{unit ? <span style={{ fontSize: 11, color: "#475569", marginLeft: 3 }}>{unit}</span> : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────── */
export default function DashboardPage() {
  const [greeting, setGreeting] = useState("Hello");
  const [currentTime, setCurrentTime] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tick = () => {
      const h = new Date().getHours();
      setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
      setCurrentTime(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch("/api/user/stats")
      .then((r) => r.json())
      .then((d) => { if (d.stats) setStats(d.stats); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const firstName = stats?.userName?.split(" ")[0] || "Student";

  return (
    <div style={{ minHeight: "100vh", padding: "28px 28px 40px", background: "#080b14", position: "relative" }}>

      {/* Ambient background glow */}
      <div style={{ position: "fixed", top: -200, right: -100, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.06) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: -100, left: 100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(6,182,212,0.04) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* ── Top bar ─────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, position: "relative", zIndex: 1 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Sparkles size={13} color="#818cf8" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.1em" }}>Dashboard</span>
          </div>
          <h1 style={{ fontFamily: "Space Grotesk,sans-serif", fontSize: 28, fontWeight: 800, color: "#f1f5f9", margin: "0 0 6px", lineHeight: 1.2 }}>
            {greeting}, {firstName} 👋
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
            {stats?.studyStreak && stats.studyStreak > 0
              ? `You're on a ${stats.studyStreak}-day streak! Keep it going! 🔥`
              : "Ready to dominate your studies today?"}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 10,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
            fontSize: 13, color: "#64748b",
          }}>
            <Clock size={13} color="#6366f1" />
            <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#94a3b8" }}>{currentTime}</span>
          </div>
          <button style={{
            width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
            cursor: "pointer", color: "#64748b", position: "relative",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#f1f5f9"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
          >
            <Bell size={15} />
          </button>
        </div>
      </div>

      {/* ── AI Recommendation Banner ─────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", borderRadius: 14, marginBottom: 24,
        background: "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.08))",
        border: "1px solid rgba(99,102,241,0.22)",
        boxShadow: "0 0 30px rgba(99,102,241,0.08)",
        position: "relative", zIndex: 1,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0,
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          boxShadow: "0 0 18px rgba(99,102,241,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Brain size={18} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", margin: "0 0 2px" }}>AI Recommendation</p>
          <p style={{ fontSize: 12, color: "#64748b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {stats?.cardsReviewed === 0
              ? "Upload your first notes and generate AI flashcards to get personalised study recommendations."
              : "Run an AI diagnostic on your Analytics page to identify weak topics and build a custom study plan."}
          </p>
        </div>
        <Link
          href={stats?.cardsReviewed === 0 ? "/upload" : "/analytics"}
          style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#818cf8", textDecoration: "none", flexShrink: 0 }}
        >
          {stats?.cardsReviewed === 0 ? "Upload" : "Analyse"} <ArrowRight size={13} />
        </Link>
      </div>

      {/* ── Stats row ────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20, position: "relative", zIndex: 1 }}>
        <StatCard label="Study Hours"    value={stats?.studyHours || "0.0h"} sub="All time"           icon={Clock}         color="#6366f1" loading={loading} />
        <StatCard label="Cards Reviewed" value={stats?.cardsReviewed || 0}   sub="Total flashcards"   icon={BookOpenCheck} color="#10b981" loading={loading} />
        <StatCard label="Notes Uploaded" value={stats?.documentsCount || 0}  sub="Documents"          icon={Upload}        color="#06b6d4" loading={loading} />
        <StatCard label="Avg. Score"     value={stats?.avgScore || "—"}       sub="Based on ease factor" icon={TrendingUp} color="#f59e0b" loading={loading} />
      </div>

      {/* ── Main 3-col grid ──────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20, alignItems: "stretch", position: "relative", zIndex: 1 }}>
        <PomodoroTimer />
        <StreakWidget streak={stats?.studyStreak || 0} />
        <QuickAccessPanel />
      </div>

      {/* ── Bottom 2-col grid ────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, position: "relative", zIndex: 1 }}>
        <QuickActionsPanel />
        <ActivityPanel stats={stats} loading={loading} />
      </div>
    </div>
  );
}
