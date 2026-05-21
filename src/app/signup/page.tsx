"use client";

import Link from "next/link";
import { ExternalLink, Mail, MessageCircle, Lock, ArrowLeft } from "lucide-react";

export default function SignupPage() {
  return (
    <div style={{
      minHeight: "100vh", background: "#080b14",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 16px", position: "relative", overflow: "hidden",
    }}>
      {/* Ambient glows */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: -160, left: -80, width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle,#6366f1 0%,transparent 70%)", filter: "blur(90px)", opacity: 0.18 }} />
        <div style={{ position: "absolute", bottom: -120, right: -120, width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle,#8b5cf6 0%,transparent 70%)", filter: "blur(80px)", opacity: 0.15 }} />
        <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <div style={{ position: "relative", width: "100%", maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, textDecoration: "none" }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 0 22px rgba(99,102,241,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Lock size={20} color="#fff" />
            </div>
            <span style={{ fontFamily: "Space Grotesk,sans-serif", fontSize: 22, fontWeight: 700, background: "linear-gradient(135deg,#6366f1,#8b5cf6,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Stratega</span>
          </Link>
        </div>

        {/* Card */}
        <div style={{
          background: "linear-gradient(145deg,#121b2c,#0e1520)",
          border: "1px solid rgba(99,102,241,0.25)", borderRadius: 20, padding: "36px 32px",
          boxShadow: "0 28px 72px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)",
          textAlign: "center",
        }}>
          {/* Lock icon */}
          <div style={{
            width: 64, height: 64, borderRadius: 20, margin: "0 auto 20px",
            background: "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.1))",
            border: "1px solid rgba(99,102,241,0.3)",
            boxShadow: "0 0 30px rgba(99,102,241,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Lock size={28} color="#818cf8" />
          </div>

          <h1 style={{ fontFamily: "Space Grotesk,sans-serif", fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: "0 0 10px" }}>
            Access Restricted
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 28px", lineHeight: 1.6 }}>
            Stratega is a private platform. New accounts require approval from the owner.
            Reach out below to request access.
          </p>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "0 0 24px" }} />

          <p style={{ fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
            Contact Owner
          </p>

          {/* Contact buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            {/* Email */}
            <a
              href="mailto:boonevanjelist@gmail.com"
              style={{
                display: "flex", alignItems: "center", gap: 14, padding: "13px 18px",
                borderRadius: 12, textDecoration: "none",
                background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
                transition: "all 0.18s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(99,102,241,0.15)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(99,102,241,0.2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(99,102,241,0.08)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Mail size={17} color="#818cf8" />
              </div>
              <div style={{ textAlign: "left", flex: 1 }}>
                <p style={{ fontSize: 11, color: "#475569", margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Email</p>
                <p style={{ fontSize: 13, color: "#c7d2fe", margin: 0, fontWeight: 500 }}>boonevanjelist@gmail.com</p>
              </div>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/BoonEvanjelist"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 14, padding: "13px 18px",
                borderRadius: 12, textDecoration: "none",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                transition: "all 0.18s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ExternalLink size={17} color="#94a3b8" />
              </div>
              <div style={{ textAlign: "left", flex: 1 }}>
                <p style={{ fontSize: 11, color: "#475569", margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>GitHub</p>
                <p style={{ fontSize: 13, color: "#cbd5e1", margin: 0, fontWeight: 500 }}>github.com/BoonEvanjelist</p>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/916381331788"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 14, padding: "13px 18px",
                borderRadius: 12, textDecoration: "none",
                background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
                transition: "all 0.18s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(16,185,129,0.14)"; e.currentTarget.style.borderColor = "rgba(16,185,129,0.4)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(16,185,129,0.15)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(16,185,129,0.08)"; e.currentTarget.style.borderColor = "rgba(16,185,129,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(16,185,129,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <MessageCircle size={17} color="#34d399" />
              </div>
              <div style={{ textAlign: "left", flex: 1 }}>
                <p style={{ fontSize: 11, color: "#475569", margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>WhatsApp</p>
                <p style={{ fontSize: 13, color: "#6ee7b7", margin: 0, fontWeight: 500 }}>+91 6381331788</p>
              </div>
            </a>
          </div>

          {/* Back to login */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "24px 0 20px" }} />
          <Link href="/login" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 13, color: "#6366f1", textDecoration: "none", fontWeight: 500,
          }}>
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "#1e293b", marginTop: 20 }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#334155" }}>Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
