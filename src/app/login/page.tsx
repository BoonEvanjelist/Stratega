"use client";

import Link from "next/link";
import { Suspense, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Zap, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

/* ─── Shared input styles ───────────────────────────────────────── */
const inputBase: React.CSSProperties = {
  width: "100%",
  paddingTop: "12px",
  paddingBottom: "12px",
  paddingLeft: "44px",
  paddingRight: "16px",
  fontSize: "14px",
  lineHeight: "1.5",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  color: "#f1f5f9",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

/* ─── Login form ────────────────────────────────────────────────── */
function LoginForm() {
  const router      = useRouter();
  const params      = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";

  const [showPw, setShowPw]           = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [isPending, startTransition]  = useTransition();

  /* focus ring helpers */
  const focusOn  = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "rgba(99,102,241,0.7)";
    e.currentTarget.style.boxShadow   = "0 0 0 3px rgba(99,102,241,0.12)";
    const icon = e.currentTarget.previousElementSibling as HTMLElement | null;
    if (icon) icon.style.color = "#6366f1";
  };
  const focusOff = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
    e.currentTarget.style.boxShadow   = "none";
    const icon = e.currentTarget.previousElementSibling as HTMLElement | null;
    if (icon) icon.style.color = "#475569";
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd  = new FormData(e.currentTarget);
    const res = await new Promise<Response>((resolve) =>
      startTransition(async () =>
        resolve(
          await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email:    fd.get("email"),
              password: fd.get("password"),
            }),
          })
        )
      )
    );
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div
      style={{ minHeight: "100vh", background: "#080b14", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", position: "relative", overflow: "hidden" }}
    >
      {/* ── ambient glows ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -160, left: -80, width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle, #6366f1 0%, transparent 70%)", filter: "blur(90px)", opacity: 0.22 }} />
        <div style={{ position: "absolute", bottom: -120, right: -120, width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)", filter: "blur(80px)", opacity: 0.18 }} />
        {/* grid */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      {/* ── card wrapper ── */}
      <div style={{ position: "relative", width: "100%", maxWidth: 420, animation: "fadeInUp 0.45s ease both" }}>

        {/* logo + title */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, textDecoration: "none" }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 0 22px rgba(99,102,241,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={20} color="#fff" />
            </div>
            <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 22, fontWeight: 700, background: "linear-gradient(135deg,#6366f1,#8b5cf6,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Stratega</span>
          </Link>
          <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 26, fontWeight: 800, color: "#f1f5f9", margin: 0, textAlign: "center" }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: "#64748b", marginTop: 8, textAlign: "center" }}>Sign in to continue your study session</p>
        </div>

        {/* card */}
        <div style={{ background: "linear-gradient(145deg,#121b2c,#0e1520)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 20, padding: 32, boxShadow: "0 28px 72px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)" }}>

          {/* error */}
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, marginBottom: 20, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
              <AlertCircle size={14} color="#f87171" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "#fca5a5" }}>{error}</span>
            </div>
          )}

          <form id="login-form" onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* ─ Email ─ */}
            <div>
              <label htmlFor="email" style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748b", marginBottom: 8 }}>
                Email
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Mail size={15} style={{ position: "absolute", left: 14, color: "#475569", pointerEvents: "none", flexShrink: 0 }} />
                <input
                  id="email" name="email" type="email" autoComplete="email" required
                  placeholder="you@university.edu"
                  style={{ ...inputBase }}
                  onFocus={focusOn} onBlur={focusOff}
                />
              </div>
            </div>

            {/* ─ Password ─ */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <label htmlFor="password" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748b" }}>
                  Password
                </label>
                <a href="#" style={{ fontSize: 12, color: "#6366f1", textDecoration: "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#818cf8")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#6366f1")}>
                  Forgot password?
                </a>
              </div>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Lock size={15} style={{ position: "absolute", left: 14, color: "#475569", pointerEvents: "none", flexShrink: 0 }} />
                <input
                  id="password" name="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password" required
                  placeholder="••••••••"
                  style={{ ...inputBase, paddingRight: 44 }}
                  onFocus={focusOn} onBlur={focusOff}
                />
                <button type="button" onClick={() => setShowPw((s) => !s)}
                  style={{ position: "absolute", right: 14, background: "none", border: "none", cursor: "pointer", color: "#475569", display: "flex", padding: 0 }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#94a3b8")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#475569")}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* ─ Submit ─ */}
            <button id="btn-login" type="submit" disabled={isPending}
              style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", cursor: isPending ? "not-allowed" : "pointer", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 24px rgba(99,102,241,0.35)", opacity: isPending ? 0.7 : 1, transition: "transform 0.18s, box-shadow 0.18s" }}
              onMouseEnter={(e) => { if (!isPending) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(99,102,241,0.5)"; }}}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 8px 24px rgba(99,102,241,0.35)"; }}>
              {isPending ? <><Loader2 size={15} className="animate-spin" /><span>Signing in…</span></> : "Sign In"}
            </button>
          </form>

          {/* divider */}
          <div style={{ position: "relative", margin: "24px 0" }}>
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.07)" }} />
            <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
              <span style={{ padding: "0 12px", background: "#121b2c", fontSize: 12, color: "#334155" }}>New to Stratega?</span>
            </div>
          </div>

          {/* go signup */}
          <Link href="/signup" style={{ textDecoration: "none" }}>
            <button id="btn-go-signup"
              style={{ width: "100%", padding: "12px 0", borderRadius: 12, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all 0.18s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#f1f5f9"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
              Create a free account
            </button>
          </Link>
        </div>

        {/* footer note */}
        <p style={{ textAlign: "center", fontSize: 12, color: "#334155", marginTop: 20 }}>
          By signing in you agree to our{" "}
          <a href="#" style={{ color: "#475569" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#94a3b8")} onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}>Terms</a>
          {" "}and{" "}
          <a href="#" style={{ color: "#475569" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#94a3b8")} onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#080b14", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" size={32} color="#6366f1" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
