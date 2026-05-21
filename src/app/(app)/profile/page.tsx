"use client";

import { useState, useEffect, useTransition } from "react";
import {
  UserCircle2, Mail, Lock, Save, Shield, Flame, BookOpenCheck,
  Upload, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff,
  Calendar, Zap, Edit3, Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  studyStreak: number;
  lastActiveDate?: string;
  createdAt: string;
}

function StatCard({ icon: Icon, value, label, color }: {
  icon: React.ElementType; value: string | number; label: string; color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 p-5 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <p className="text-2xl font-extrabold text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{value}</p>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit name state
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [nameSuccess, setNameSuccess] = useState(false);
  const [isSavingName, startSaveName] = useTransition();

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [isSavingPw, startSavePw] = useTransition();

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setUser(d.user);
          setNewName(d.user.name);
        } else {
          setError("Failed to load profile.");
        }
      })
      .catch(() => setError("Network error."))
      .finally(() => setLoading(false));
  }, []);

  // ── Save name ───────────────────────────────────────────────────────
  function handleSaveName() {
    if (!newName.trim() || newName === user?.name) {
      setEditingName(false);
      return;
    }
    startSaveName(async () => {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser((u) => u ? { ...u, name: data.user.name } : u);
        setEditingName(false);
        setNameSuccess(true);
        setTimeout(() => setNameSuccess(false), 3000);
      } else {
        setError(data.error || "Failed to update name.");
      }
    });
  }

  // ── Change password ──────────────────────────────────────────────────
  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }
    startSavePw(async () => {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPwSuccess(true);
        setTimeout(() => setPwSuccess(false), 3000);
      } else {
        setPwError(data.error || "Failed to update password.");
      }
    });
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-violet-500" />
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="flex flex-col h-[80vh] items-center justify-center gap-4">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-slate-400 text-sm">{error}</p>
      </div>
    );
  }

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ background: "var(--bg-base)" }}>
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <UserCircle2 size={16} className="text-violet-400" />
          <span className="text-xs text-violet-400 font-semibold uppercase tracking-widest">Account</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
          Your Profile
        </h1>
        <p className="text-sm text-slate-400 mt-1">Manage your account details and security settings.</p>
      </div>

      {/* ── Success Banner ─────────────────────────────────────────── */}
      {nameSuccess && (
        <div className="flex items-center gap-2 p-4 mb-6 rounded-xl text-sm" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
          <CheckCircle2 size={15} className="text-emerald-400" />
          <span className="text-emerald-300">Profile name updated successfully.</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Left column: avatar + stats ────────────────────────── */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          {/* Avatar card */}
          <div className="rounded-3xl p-6 flex flex-col items-center text-center" style={{ background: "var(--bg-card)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="relative mb-4 group">
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-white select-none"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", boxShadow: "0 12px 30px rgba(139,92,246,0.4)", fontFamily: "Space Grotesk, sans-serif" }}
              >
                {initials}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "2px solid var(--bg-card)" }}>
                <Camera size={13} className="text-white" />
              </div>
            </div>

            {/* Editable name */}
            <div className="mb-1 flex items-center gap-2">
              {editingName ? (
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  className="text-center text-lg font-bold text-white bg-transparent outline-none border-b border-indigo-400 w-40 pb-0.5"
                />
              ) : (
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  {user?.name}
                </h2>
              )}
              {!editingName ? (
                <button onClick={() => setEditingName(true)} className="text-slate-500 hover:text-slate-300 transition-colors">
                  <Edit3 size={13} />
                </button>
              ) : (
                <button
                  onClick={handleSaveName}
                  disabled={isSavingName}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  {isSavingName ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                </button>
              )}
            </div>

            <p className="text-sm text-slate-400 mb-4">{user?.email}</p>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", color: "#c4b5fd" }}>
              <Zap size={11} />
              <span>Stratega Free</span>
            </div>

            <div className="flex items-center gap-1.5 mt-4 text-xs text-slate-500">
              <Calendar size={12} />
              <span>Member since {memberSince}</span>
            </div>
          </div>

          {/* Stats mini grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Flame} value={user?.studyStreak || 0} label="Day Streak" color="#f97316" />
            <StatCard icon={BookOpenCheck} value="Active" label="Status" color="#10b981" />
            <StatCard icon={Upload} label="Uploads" value="—" color="#6366f1" />
            <StatCard icon={Shield} label="Security" value="✓" color="#06b6d4" />
          </div>
        </div>

        {/* ── Right column: settings ──────────────────────────────── */}
        <div className="xl:col-span-2 flex flex-col gap-6">

          {/* Account info */}
          <div className="rounded-3xl p-6" style={{ background: "var(--bg-card)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                <UserCircle2 size={16} className="text-white" />
              </div>
              <h3 className="font-bold text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Account Information</h3>
            </div>

            <div className="space-y-4">
              {/* Name field */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Display Name</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <UserCircle2 size={15} className="text-slate-500 flex-shrink-0" />
                    {editingName ? (
                      <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                        className="flex-1 bg-transparent text-sm text-slate-100 outline-none"
                        autoFocus
                      />
                    ) : (
                      <span className="flex-1 text-sm text-slate-100">{user?.name}</span>
                    )}
                  </div>
                  {editingName ? (
                    <button
                      onClick={handleSaveName}
                      disabled={isSavingName}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
                    >
                      {isSavingName ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingName(true)}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <Edit3 size={14} />
                      Edit
                    </button>
                  )}
                </div>
              </div>

              {/* Email field (read-only) */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Mail size={15} className="text-slate-600 flex-shrink-0" />
                  <span className="flex-1 text-sm text-slate-400">{user?.email}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md" style={{ background: "rgba(16,185,129,0.1)", color: "#34d399" }}>Verified</span>
                </div>
                <p className="text-xs text-slate-600 mt-1.5">Email cannot be changed at this time.</p>
              </div>
            </div>
          </div>

          {/* Change password */}
          <div className="rounded-3xl p-6" style={{ background: "var(--bg-card)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#06b6d4,#6366f1)" }}>
                <Shield size={16} className="text-white" />
              </div>
              <h3 className="font-bold text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Change Password</h3>
            </div>

            {pwError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
                <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                <span className="text-red-300">{pwError}</span>
              </div>
            )}
            {pwSuccess && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
                <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                <span className="text-emerald-300">Password changed successfully!</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4" id="change-password-form">
              {/* Current password */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Current Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                  />
                  <button type="button" onClick={() => setShowCurrent((s) => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">New Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Min 8 characters"
                    className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                  />
                  <button type="button" onClick={() => setShowNew((s) => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm new password */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter new password"
                    className={cn(
                      "w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-100 placeholder-slate-600 outline-none transition-all",
                      confirmPassword && newPassword !== confirmPassword ? "border-red-500/50" : ""
                    )}
                    style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${confirmPassword && newPassword !== confirmPassword ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)"}` }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = confirmPassword && newPassword !== confirmPassword ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)")}
                  />
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-400 mt-1.5">Passwords do not match</p>
                )}
              </div>

              <button
                id="btn-change-password"
                type="submit"
                disabled={isSavingPw || !currentPassword || !newPassword || !confirmPassword}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.25)" }}
              >
                {isSavingPw ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
                {isSavingPw ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>

          {/* Danger zone */}
          <div className="rounded-3xl p-6" style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)" }}>
            <h3 className="font-bold text-red-400 mb-2 flex items-center gap-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              <AlertCircle size={16} />
              Danger Zone
            </h3>
            <p className="text-xs text-slate-500 mb-4">Permanently delete your account and all associated data. This cannot be undone.</p>
            <button
              className="px-4 py-2 rounded-xl text-sm font-semibold text-red-400 transition-all hover:bg-red-500/10"
              style={{ border: "1px solid rgba(239,68,68,0.3)" }}
              onClick={() => alert("Please contact support to delete your account.")}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
