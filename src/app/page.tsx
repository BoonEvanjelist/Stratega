"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Zap, Upload, MessageSquareDot, BookOpenCheck,
  CalendarDays, BarChart3, ArrowRight, Star,
  Users, Brain, CheckCircle2, ChevronRight,
  Sparkles, Shield, Clock,
} from "lucide-react";

const FEATURES = [
  { icon: Upload, title: "Smart Note Upload", description: "Drag-and-drop PDFs, slides, and docs. AI instantly extracts key concepts and builds structured summaries.", gradient: "from-indigo-500/20 to-purple-500/10", iconBg: "from-indigo-500 to-purple-600", badge: "Instant", href: "/upload" },
  { icon: MessageSquareDot, title: "AI Study Chat", description: "Ask questions about your own notes. Get Socratic explanations, quizzes, and concept breakdowns in real-time.", gradient: "from-cyan-500/20 to-blue-500/10", iconBg: "from-cyan-500 to-blue-600", badge: "GPT-4o", href: "/chat" },
  { icon: BookOpenCheck, title: "Auto Flashcards", description: "Spaced-repetition flashcard decks generated from your notes automatically — study the smart way.", gradient: "from-emerald-500/20 to-teal-500/10", iconBg: "from-emerald-500 to-teal-600", badge: "SRS", href: "/flashcards" },
  { icon: CalendarDays, title: "Smart Timetable", description: "AI schedules study sessions around your deadlines, energy levels, and Pomodoro preferences.", gradient: "from-orange-500/20 to-amber-500/10", iconBg: "from-orange-500 to-amber-500", badge: "Adaptive", href: "/timetable" },
  { icon: BarChart3, title: "Deep Analytics", description: "Track retention rates, time-on-task, weak areas, and streak data with beautiful interactive charts.", gradient: "from-pink-500/20 to-rose-500/10", iconBg: "from-pink-500 to-rose-500", badge: "Insights", href: "/analytics" },
  { icon: Brain, title: "Concept Mapping", description: "Visualise how topics interconnect across all your courses with AI-generated knowledge graphs.", gradient: "from-violet-500/20 to-purple-500/10", iconBg: "from-violet-500 to-purple-600", badge: "Coming", href: "#" },
];

const STATS = [
  { value: "50K+", label: "Active Students", icon: Users },
  { value: "4.9★", label: "Avg. Rating", icon: Star },
  { value: "3.2×", label: "Faster Retention", icon: Brain },
  { value: "99.9%", label: "Uptime", icon: Shield },
];

const CHECKLIST = [
  "AI-powered note summarisation",
  "Spaced repetition flashcard engine",
  "Adaptive study schedule builder",
  "Real-time AI tutor chat",
  "Privacy-first — your data stays yours",
];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "var(--bg-base)" }}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]" style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full opacity-15 blur-[100px]" style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }} />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full opacity-10 blur-[80px]" style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }} />
      </div>

      {/* Navbar */}
      <header className="relative z-50 flex items-center justify-between px-6 md:px-12 lg:px-20 h-16 border-b border-white/[0.05]" style={{ background: "rgba(8,11,20,0.85)", backdropFilter: "blur(20px)" }}>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 0 14px rgba(99,102,241,0.5)" }}>
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold gradient-text" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Stratega</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {["Features", "About", "Pricing"].map((item) => (
            <a key={item} href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">{item}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm font-medium text-slate-400 hover:text-white transition-colors hidden sm:block">Sign in</Link>
          <Link href="/dashboard">
            <button className="btn-brand text-sm px-5 py-2 relative z-10">Get Started →</button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 lg:pt-32">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8" style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", animation: "fadeInUp 0.6s ease both" }}>
          <Sparkles size={12} className="text-indigo-400" />
          <span className="text-indigo-300">Now with GPT-4o Vision support</span>
          <ChevronRight size={12} className="text-indigo-400" />
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight leading-[1.06] max-w-5xl" style={{ fontFamily: "Space Grotesk, sans-serif", animation: "fadeInUp 0.7s ease 0.1s both" }}>
          <span className="text-white">Study Smarter</span><br />
          <span className="gradient-text">with AI.</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed" style={{ animation: "fadeInUp 0.7s ease 0.2s both" }}>
          Stratega is your all-in-one AI productivity engine — upload notes, chat with AI, generate flashcards, and schedule smarter sessions. Built for students who refuse to settle.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-10" style={{ animation: "fadeInUp 0.7s ease 0.3s both" }}>
          <Link href="/dashboard">
            <button className="btn-brand text-base px-8 py-3.5 flex items-center gap-2 relative z-10" id="cta-get-started">
              <span className="relative z-10">Get Started Free</span>
              <ArrowRight size={18} className="relative z-10" />
            </button>
          </Link>
          <button className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors px-6 py-3.5 rounded-xl border border-white/[0.08] hover:border-white/[0.15]" id="cta-watch-demo">
            Watch Demo <span className="text-xs">▶</span>
          </button>
        </div>

        <div className="flex items-center gap-2 mt-8 text-sm text-slate-500" style={{ animation: "fadeInUp 0.7s ease 0.4s both" }}>
          <div className="flex -space-x-2">
            {["#6366f1", "#8b5cf6", "#06b6d4", "#10b981"].map((c, i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-[#080b14]" style={{ background: c }} />
            ))}
          </div>
          <span>Trusted by 50,000+ students worldwide</span>
        </div>

        {/* Mock dashboard preview */}
        <div className="relative mt-16 w-full max-w-4xl" style={{ animation: "fadeInUp 0.8s ease 0.5s both" }}>
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(99,102,241,0.2)", boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 60px rgba(99,102,241,0.12)", background: "var(--bg-card)" }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <div className="ml-3 flex-1 h-6 max-w-xs rounded-md text-xs text-slate-500 flex items-center px-3" style={{ background: "rgba(255,255,255,0.04)" }}>
                app.stratega.ai/dashboard
              </div>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4 h-52 md:h-64">
              <div className="col-span-2 rounded-xl p-4 flex flex-col justify-between" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }} />
                  <div><div className="h-2.5 w-32 rounded-full bg-white/10 mb-1.5" /><div className="h-2 w-20 rounded-full bg-white/5" /></div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full rounded-full bg-white/10" />
                  <div className="h-2 w-4/5 rounded-full bg-white/7" />
                  <div className="h-2 w-3/5 rounded-full bg-white/5" />
                </div>
              </div>
              <div className="space-y-3">
                {["#6366f1", "#10b981", "#f59e0b"].map((c, i) => (
                  <div key={i} className="rounded-xl p-3 flex items-center gap-2" style={{ background: `${c}15`, border: `1px solid ${c}30` }}>
                    <div className="w-5 h-5 rounded-lg" style={{ background: c }} />
                    <div className="space-y-1 flex-1">
                      <div className="h-2 rounded-full bg-white/10" />
                      <div className="h-1.5 w-2/3 rounded-full bg-white/5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="relative z-10 py-10 border-y border-white/[0.05]" style={{ background: "rgba(255,255,255,0.015)" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center text-center gap-2">
              <Icon size={20} className="text-indigo-400" />
              <span className="text-3xl font-extrabold gradient-text" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{value}</span>
              <span className="text-xs text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3 block">Platform Features</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Everything a student needs</h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">Six powerful AI tools unified in one seamless experience. No switching apps, no lost context — just focused learning.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <Link key={feat.title} href={feat.href} className="card-stratega group relative overflow-hidden p-6 flex flex-col gap-4 cursor-pointer">
                <div className={`absolute inset-0 bg-gradient-to-br ${feat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative flex items-start justify-between">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br ${feat.iconBg} shadow-lg`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-md" style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }}>{feat.badge}</span>
                </div>
                <div className="relative">
                  <h3 className="text-base font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors">{feat.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feat.description}</p>
                </div>
                <div className="relative flex items-center gap-1 text-xs font-semibold text-indigo-400 mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <ArrowRight size={13} />
                </div>
              </Link>
            );
          })}
        </div>
        </div>
      </section>

      {/* Checklist + CTA */}
      <section className="relative z-10 py-24 px-6 md:px-12" style={{ background: "linear-gradient(180deg, transparent, rgba(99,102,241,0.06) 50%, transparent)" }}>
        <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-6" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              Built for students<br /><span className="gradient-text">who mean business.</span>
            </h2>
            <ul className="space-y-3">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex items-center gap-3 text-slate-300 text-sm">
                  <CheckCircle2 size={17} className="text-emerald-400 flex-shrink-0" />{item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-1 flex flex-col items-center text-center p-10 rounded-2xl" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))", border: "1px solid rgba(99,102,241,0.25)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 12px 30px rgba(99,102,241,0.4)" }}>
              <Zap size={28} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Start for free today</h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">No credit card required. Unlock all core features free forever. Upgrade to Pro for unlimited AI power.</p>
            <Link href="/dashboard" className="w-full">
              <button className="btn-brand w-full text-base py-3.5 flex items-center justify-center gap-2 relative z-10" id="cta-hero-bottom">
                <span className="relative z-10">Create Free Account</span>
                <ArrowRight size={18} className="relative z-10" />
              </button>
            </Link>
            <div className="flex items-center gap-1.5 mt-4 text-xs text-slate-500">
              <Clock size={12} /><span>Setup takes less than 60 seconds</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.05] py-10 px-6 md:px-12" style={{ background: "rgba(8,11,20,0.9)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-bold text-slate-300" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Stratega</span>
          </div>
          <p className="text-xs text-slate-600">© 2026 Stratega. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Contact"].map((link) => (
              <a key={link} href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
