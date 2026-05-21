"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Upload, MessageSquareDot,
  BookOpenCheck, CalendarDays, BarChart3,
  UserCircle2, ChevronLeft, ChevronRight,
  Sparkles, Zap, LogOut, Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Nav groups ──────────────────────────────────────────────── */
const CORE_NAV = [
  { label: "Dashboard",    href: "/dashboard",  icon: LayoutDashboard },
  { label: "Upload Notes", href: "/upload",      icon: Upload,          badge: "New" },
  { label: "AI Chat",      href: "/chat",        icon: MessageSquareDot },
];
const TOOLS_NAV = [
  { label: "Flashcards",   href: "/flashcards",  icon: BookOpenCheck },
  { label: "Timetable",    href: "/timetable",   icon: CalendarDays },
  { label: "Analytics",    href: "/analytics",   icon: BarChart3 },
];

interface SidebarProps {
  onLogout?: () => void;
  onCollapse?: (collapsed: boolean) => void;
}

/* ── Single nav item ─────────────────────────────────────────── */
function NavItem({
  href, label, icon: Icon, badge, isActive, collapsed,
}: {
  href: string; label: string; icon: React.ElementType;
  badge?: string | null; isActive: boolean; collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: collapsed ? 0 : 10,
        justifyContent: collapsed ? "center" : "flex-start",
        padding: collapsed ? "10px 0" : "9px 12px",
        borderRadius: 12,
        position: "relative",
        border: isActive ? "1px solid rgba(99,102,241,0.35)" : "1px solid transparent",
        background: isActive
          ? "linear-gradient(135deg,rgba(99,102,241,0.18),rgba(139,92,246,0.1))"
          : "transparent",
        boxShadow: isActive ? "0 0 20px rgba(99,102,241,0.08)" : "none",
        color: isActive ? "#f1f5f9" : "#64748b",
        textDecoration: "none",
        transition: "all 0.18s ease",
        overflow: "hidden",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          e.currentTarget.style.color = "#cbd5e1";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#64748b";
        }
      }}
    >
      {/* Active left accent */}
      {isActive && !collapsed && (
        <div style={{
          position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
          width: 3, height: 20, borderRadius: "0 3px 3px 0",
          background: "linear-gradient(180deg,#6366f1,#8b5cf6)",
        }} />
      )}

      {/* Icon */}
      <Icon
        size={18}
        style={{
          flexShrink: 0,
          color: isActive ? "#818cf8" : "inherit",
          transition: "color 0.18s",
        }}
      />

      {/* Label */}
      {!collapsed && (
        <span style={{ fontSize: 13, fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
          {label}
        </span>
      )}

      {/* Badge */}
      {!collapsed && badge && (
        <span style={{
          fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 6,
          background: "rgba(99,102,241,0.25)", color: "#a5b4fc", letterSpacing: "0.04em",
          flexShrink: 0,
        }}>
          {badge}
        </span>
      )}

      {/* Tooltip when collapsed */}
      {collapsed && (
        <div className="sidebar-tooltip" style={{
          position: "absolute", left: "calc(100% + 12px)", top: "50%", transform: "translateY(-50%)",
          padding: "6px 10px", borderRadius: 8, fontSize: 12, fontWeight: 500,
          background: "#1a2234", border: "1px solid rgba(255,255,255,0.1)", color: "#f1f5f9",
          whiteSpace: "nowrap", pointerEvents: "none", opacity: 0, transition: "opacity 0.15s",
          zIndex: 100,
        }}>
          {label}
        </div>
      )}
    </Link>
  );
}

/* ── Section label ───────────────────────────────────────────── */
function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div style={{ height: 8 }} />;
  return (
    <p style={{
      fontSize: 10, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.12em", color: "#334155", padding: "10px 12px 4px",
    }}>
      {label}
    </p>
  );
}

/* ── Main Sidebar ────────────────────────────────────────────── */
export default function Sidebar({ onLogout, onCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userInitials, setUserInitials] = useState("S");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          const n = d.user.name || "";
          setUserName(n);
          setUserEmail(d.user.email || "");
          setUserInitials(
            n.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || "S"
          );
        }
      })
      .catch(() => {});
  }, []);

  function toggle(val: boolean) {
    setCollapsed(val);
    onCollapse?.(val);
  }

  const sidebarW = collapsed ? 72 : 256;

  return (
    <>
      <style>{`
        .sidebar-link:hover .sidebar-tooltip { opacity: 1 !important; }
        .sidebar-link { position: relative; }
      `}</style>

      <aside style={{
        position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 50,
        width: sidebarW, minWidth: sidebarW,
        display: "flex", flexDirection: "column",
        background: "linear-gradient(180deg,#0c1220 0%,#080b14 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        transition: "width 0.3s ease",
        overflow: "hidden",
      }}>

        {/* ── Logo bar ─────────────────────────────────────── */}
        <div style={{
          height: 64, flexShrink: 0, display: "flex", alignItems: "center",
          padding: collapsed ? "0 16px" : "0 16px",
          justifyContent: collapsed ? "center" : "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
            {/* Logo icon */}
            <div style={{
              width: 36, height: 36, borderRadius: 11, flexShrink: 0,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              boxShadow: "0 0 18px rgba(99,102,241,0.55), 0 0 40px rgba(99,102,241,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Zap size={17} color="#fff" />
            </div>
            {!collapsed && (
              <span style={{
                fontFamily: "Space Grotesk,sans-serif", fontSize: 19, fontWeight: 700,
                background: "linear-gradient(135deg,#818cf8,#c4b5fd,#67e8f9)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                whiteSpace: "nowrap",
              }}>
                Stratega
              </span>
            )}
          </Link>

          {/* Collapse toggle */}
          {!collapsed && (
            <button onClick={() => toggle(true)} style={{
              width: 28, height: 28, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", color: "#475569", flexShrink: 0,
            }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#f1f5f9"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#475569"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
            >
              <ChevronLeft size={14} />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <button onClick={() => toggle(false)} style={{
            position: "absolute", right: -14, top: 76,
            width: 28, height: 28, borderRadius: "50%",
            background: "#1a2234", border: "1px solid rgba(99,102,241,0.4)",
            boxShadow: "0 0 12px rgba(99,102,241,0.3)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: "#818cf8", zIndex: 10,
          }}>
            <ChevronRight size={13} />
          </button>
        )}

        {/* ── AI badge ─────────────────────────────────────── */}
        {!collapsed && (
          <div style={{ padding: "10px 12px 4px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "7px 10px", borderRadius: 10,
              background: "linear-gradient(135deg,rgba(99,102,241,0.14),rgba(139,92,246,0.1))",
              border: "1px solid rgba(99,102,241,0.25)",
            }}>
              <Brain size={13} color="#818cf8" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: "#a5b4fc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                AI-Powered Learning
              </span>
              <Sparkles size={11} color="#c4b5fd" style={{ flexShrink: 0, marginLeft: "auto" }} />
            </div>
          </div>
        )}

        {/* ── Navigation ───────────────────────────────────── */}
        <nav style={{ flex: 1, padding: "4px 8px", overflowY: "auto", overflowX: "hidden" }}>
          <SectionLabel label="Core" collapsed={collapsed} />
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {CORE_NAV.map((item) => (
              <NavItem key={item.href} {...item}
                isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                collapsed={collapsed}
              />
            ))}
          </div>

          <SectionLabel label="Tools" collapsed={collapsed} />
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {TOOLS_NAV.map((item) => (
              <NavItem key={item.href} {...item}
                isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                collapsed={collapsed}
              />
            ))}
          </div>
        </nav>

        {/* ── Bottom ───────────────────────────────────────── */}
        <div style={{
          flexShrink: 0, padding: "8px 8px 12px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          {/* Profile link */}
          <NavItem
            href="/profile" label="Profile" icon={UserCircle2}
            isActive={pathname === "/profile"} collapsed={collapsed}
          />

          {/* User info card (expanded only) */}
          {!collapsed && (
            <div style={{
              marginTop: 8, display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 12,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              minWidth: 0,
            }}>
              {/* Avatar */}
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                boxShadow: "0 0 10px rgba(99,102,241,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "#fff",
              }}>
                {userInitials}
              </div>

              {/* Name + email */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>
                  {userName || "Loading…"}
                </p>
                <p style={{ fontSize: 11, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>
                  {userEmail}
                </p>
              </div>

              {/* Logout */}
              {onLogout && (
                <button onClick={onLogout} title="Sign out" style={{
                  width: 28, height: 28, borderRadius: 8, border: "none",
                  background: "transparent", cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", color: "#475569",
                  flexShrink: 0, transition: "all 0.15s",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#475569"; e.currentTarget.style.background = "transparent"; }}
                >
                  <LogOut size={14} />
                </button>
              )}
            </div>
          )}

          {/* Logout icon when collapsed */}
          {collapsed && onLogout && (
            <button onClick={onLogout} title="Sign out" style={{
              width: "100%", padding: "10px 0", borderRadius: 10, border: "none",
              background: "transparent", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", color: "#475569",
              marginTop: 4, transition: "all 0.15s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#475569"; e.currentTarget.style.background = "transparent"; }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
