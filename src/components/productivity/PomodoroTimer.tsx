"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Clock, Flame, Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types & constants ─────────────────────────────────────────────────
export type TimerMode = "focus" | "short" | "long";

export const TIMER_CONFIGS: Record<TimerMode, { label: string; seconds: number; color: string; bg: string }> = {
  focus: { label: "Focus",       seconds: 25 * 60, color: "#6366f1", bg: "rgba(99,102,241,0.15)" },
  short: { label: "Short Break", seconds: 5  * 60, color: "#10b981", bg: "rgba(16,185,129,0.15)" },
  long:  { label: "Long Break",  seconds: 15 * 60, color: "#06b6d4", bg: "rgba(6,182,212,0.15)"  },
};

// Pomodoro cycle: 4 focus → long break, otherwise short break
const CYCLE: TimerMode[] = ["focus", "short", "focus", "short", "focus", "short", "focus", "long"];

interface PomodoroTimerProps {
  /** Size of the SVG ring. Default: 140 */
  size?: number;
  /** Show session counter. Default: true */
  showSessions?: boolean;
  /** Callback fired when a focus session completes */
  onFocusComplete?: (totalSessions: number) => void;
}

// ── Web Audio beep (no external file needed) ──────────────────────────
function playBeep(frequency = 880, duration = 0.4, volume = 0.3) {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);

    // Play a 3-beep pattern
    [0, 0.45, 0.9].forEach((offset) => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(frequency, ctx.currentTime + offset);
      gain2.gain.setValueAtTime(volume, ctx.currentTime + offset);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + duration);
      osc2.start(ctx.currentTime + offset);
      osc2.stop(ctx.currentTime + offset + duration);
    });
  } catch {
    // AudioContext may be unavailable (SSR / blocked)
  }
}

// ── Component ─────────────────────────────────────────────────────────
export default function PomodoroTimer({
  size = 140,
  showSessions = true,
  onFocusComplete,
}: PomodoroTimerProps) {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(TIMER_CONFIGS.focus.seconds);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [cycleIndex, setCycleIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [justFinished, setJustFinished] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const config = TIMER_CONFIGS[mode];
  const total = config.seconds;
  const radius = (size / 2) - 8;
  const circumference = 2 * Math.PI * radius;
  const progress = (total - timeLeft) / total;
  const dashOffset = circumference * (1 - progress);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  // ── Session completion handler ──────────────────────────────────────
  const handleSessionComplete = useCallback(() => {
    setRunning(false);
    setJustFinished(true);

    if (soundEnabled) playBeep();

    // Update session count & prepare next mode
    if (mode === "focus") {
      const newSessions = sessions + 1;
      setSessions(newSessions);
      onFocusComplete?.(newSessions);

      // ── Log to MongoDB (fire & forget — non-blocking) ──────────────
      const durationMinutes = Math.round(TIMER_CONFIGS.focus.seconds / 60);
      fetch("/api/analytics/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ focusBlockDuration: durationMinutes }),
      }).catch(() => {}); // silently ignore if not logged in
    }

    // Advance through the Pomodoro cycle
    const nextIndex = (cycleIndex + 1) % CYCLE.length;
    setCycleIndex(nextIndex);
    const nextMode = CYCLE[nextIndex];
    setMode(nextMode);
    setTimeLeft(TIMER_CONFIGS[nextMode].seconds);

    // Flash the "finished" state briefly, then clear it
    setTimeout(() => setJustFinished(false), 2500);
  }, [mode, sessions, cycleIndex, soundEnabled, onFocusComplete]);

  // ── Ticker ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            handleSessionComplete();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, handleSessionComplete]);

  // ── Controls ─────────────────────────────────────────────────────────
  const switchMode = (m: TimerMode) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setMode(m);
    setTimeLeft(TIMER_CONFIGS[m].seconds);
    setRunning(false);
    setJustFinished(false);
    // Sync cycle index to keep the cycle consistent
    const idx = CYCLE.indexOf(m);
    if (idx !== -1) setCycleIndex(idx);
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimeLeft(config.seconds);
    setRunning(false);
    setJustFinished(false);
  };

  const skipToNext = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const nextIndex = (cycleIndex + 1) % CYCLE.length;
    setCycleIndex(nextIndex);
    const nextMode = CYCLE[nextIndex];
    setMode(nextMode);
    setTimeLeft(TIMER_CONFIGS[nextMode].seconds);
    setRunning(false);
    setJustFinished(false);
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        "card-stratega p-6 flex flex-col items-center gap-5 transition-all duration-500",
        justFinished && "ring-2 ring-offset-2 ring-offset-[var(--bg-card)]"
      )}
      style={justFinished ? { "--tw-ring-color": config.color } as React.CSSProperties : {}}
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-indigo-400" />
          <span className="text-sm font-semibold text-slate-200">Pomodoro Timer</span>
        </div>
        <div className="flex items-center gap-2">
          {showSessions && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Flame size={12} className="text-orange-400" />
              <span>{sessions} session{sessions !== 1 ? "s" : ""} today</span>
            </div>
          )}
          <button
            onClick={() => setSoundEnabled((s) => !s)}
            title={soundEnabled ? "Mute alerts" : "Unmute alerts"}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 w-full p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
        {(Object.keys(TIMER_CONFIGS) as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={cn(
              "flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all",
              mode === m ? "text-white" : "text-slate-500 hover:text-slate-300"
            )}
            style={mode === m ? { background: TIMER_CONFIGS[m].color, boxShadow: `0 4px 12px ${TIMER_CONFIGS[m].color}50` } : {}}
          >
            {TIMER_CONFIGS[m].label}
          </button>
        ))}
      </div>

      {/* Circular ring */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Glow when running */}
        {running && (
          <div
            className="absolute inset-0 rounded-full opacity-30 blur-2xl transition-all duration-1000"
            style={{ background: config.color, animation: "pulse-glow 2s ease-in-out infinite" }}
          />
        )}

        <svg width={size} height={size} className="-rotate-90" style={{ position: "relative", zIndex: 1 }}>
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="7"
          />
          {/* Progress arc */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={config.color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: running ? "stroke-dashoffset 1s linear" : "stroke-dashoffset 0.3s ease",
              filter: `drop-shadow(0 0 ${running ? "8px" : "4px"} ${config.color})`,
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute flex flex-col items-center" style={{ zIndex: 2 }}>
          <span
            className="font-extrabold text-white tabular-nums"
            style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: size < 120 ? "1.5rem" : "2rem" }}
          >
            {mins}:{secs}
          </span>
          <span className="text-xs text-slate-400 mt-0.5">{config.label}</span>

          {/* Cycle position dots */}
          <div className="flex items-center gap-0.5 mt-2">
            {CYCLE.map((c, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === cycleIndex ? 8 : 4,
                  height: 4,
                  background: i <= cycleIndex ? config.color : "rgba(255,255,255,0.12)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Completion flash banner */}
      {justFinished && (
        <div
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold"
          style={{ background: config.bg, border: `1px solid ${config.color}50`, color: config.color, animation: "fadeInUp 0.3s ease both" }}
        >
          <span>✓</span>
          <span>{mode === "focus" ? "Focus session complete! 🎉" : "Break over — back to work!"}</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          title="Reset"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-110"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <RotateCcw size={15} />
        </button>

        <button
          onClick={() => setRunning((r) => !r)}
          title={running ? "Pause" : "Start"}
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${config.color}, ${config.color}cc)`,
            boxShadow: `0 8px 24px ${config.color}50`,
          }}
        >
          {running ? <Pause size={22} /> : <Play size={22} />}
        </button>

        <button
          onClick={skipToNext}
          title="Skip to next session"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-110"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <SkipForward size={15} />
        </button>
      </div>

      {/* Next session label */}
      <p className="text-[11px] text-slate-600">
        Next: <span className="text-slate-500 font-medium">{TIMER_CONFIGS[CYCLE[(cycleIndex + 1) % CYCLE.length]].label}</span>
      </p>
    </div>
  );
}
