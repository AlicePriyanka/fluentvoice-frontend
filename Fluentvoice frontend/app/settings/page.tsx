"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Bell, Shield, Palette, ChevronRight, Check, ArrowLeft } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";

const TOGGLE_DEFAULTS: Record<string, boolean> = {
  "Session reminders": true,
  "Weekly progress report": true,
  "Therapist messages": true,
  "Share data with therapist": true,
  "Allow anonymous analytics": false,
};

export default function SettingsPage() {
  const authChecked = useAuthGuard();
  const [saved, setSaved] = useState(false);
  const [toggles, setToggles] = useState<Record<string, boolean>>(TOGGLE_DEFAULTS);

  // Real user fields — loaded from localStorage then API
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<"patient" | "therapist">("patient");


  useEffect(() => {
    // Seed from localStorage immediately (fast)
    try {
      const stored = localStorage.getItem("fv_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.name) setUserName(parsed.name);
        if (parsed?.email) setUserEmail(parsed.email);
        if (parsed?.role) setUserRole(parsed.role);
      }
    } catch { /* ignore */ }

    // Confirm with the API (authoritative)
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) {
          setUserName(data.user.name ?? "");
          setUserEmail(data.user.email ?? "");
          setUserRole(data.user.role ?? "patient");
        }
      })
      .catch(() => { /* offline — localStorage values stand */ });
  }, []);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // Don't render anything until auth is confirmed
  if (!authChecked) return null;

  const backHref = userRole === "therapist" ? "/therapist" : "/patient";
  const backLabel = userRole === "therapist" ? "Back to therapist dashboard" : "Back to dashboard";

  return (
    <div className="min-h-screen p-8" style={{ background: "var(--color-bg)" }}>
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Back nav */}
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9CA3AF] hover:text-[var(--color-navy)] transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> {backLabel}
        </Link>

        {/* Header */}
        <div>
          <h1
            className="text-2xl font-black tracking-tight"
            style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}
          >
            Settings
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">Manage your account preferences</p>
        </div>

        {/* Profile */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="p-5 rounded-2xl border"
          style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.08)" }}>
              <User className="w-4 h-4 text-[#6366F1]" />
            </div>
            <span className="text-sm font-bold" style={{ color: "var(--color-navy)" }}>Profile</span>
          </div>
          <div className="space-y-3">
            <div className="flex flex-col gap-1 py-2 border-b" style={{ borderColor: "var(--color-border)" }}>
              <label className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="text-sm font-medium outline-none bg-transparent"
                style={{ color: "var(--color-navy)" }}
              />
            </div>
            <div className="flex flex-col gap-1 py-2 border-b" style={{ borderColor: "var(--color-border)" }}>
              <label className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="text-sm font-medium outline-none bg-transparent"
                style={{ color: "var(--color-navy)" }}
              />
            </div>
            <div className="flex flex-col gap-1 py-2" style={{ borderColor: "var(--color-border)" }}>
              <label className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">Role</label>
              <span className="text-sm font-medium capitalize" style={{ color: "var(--color-navy)" }}>
                {userRole}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 }}
          className="p-5 rounded-2xl border"
          style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.08)" }}>
              <Bell className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <span className="text-sm font-bold" style={{ color: "var(--color-navy)" }}>Notifications</span>
          </div>
          <div className="space-y-3">
            {["Session reminders", "Weekly progress report", "Therapist messages"].map((label) => (
              <div key={label} className="flex items-center justify-between py-2 border-b last:border-0"
                style={{ borderColor: "var(--color-border)" }}>
                <span className="text-sm text-[#374151]">{label}</span>
                <button
                  onClick={() => setToggles((prev) => ({ ...prev, [label]: !prev[label] }))}
                  className="relative rounded-full transition-all duration-200 shrink-0"
                  style={{ background: toggles[label] ? "var(--color-navy)" : "#D1D5DB", height: "22px", width: "40px" }}
                >
                  <span
                    className="absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform duration-200"
                    style={{ transform: toggles[label] ? "translateX(18px)" : "translateX(0)" }}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="p-5 rounded-2xl border"
          style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(16,185,129,0.08)" }}>
              <Shield className="w-4 h-4 text-[#10B981]" />
            </div>
            <span className="text-sm font-bold" style={{ color: "var(--color-navy)" }}>Privacy</span>
          </div>
          <div className="space-y-3">
            {["Share data with therapist", "Allow anonymous analytics"].map((label) => (
              <div key={label} className="flex items-center justify-between py-2 border-b last:border-0"
                style={{ borderColor: "var(--color-border)" }}>
                <span className="text-sm text-[#374151]">{label}</span>
                <button
                  onClick={() => setToggles((prev) => ({ ...prev, [label]: !prev[label] }))}
                  className="relative rounded-full transition-all duration-200 shrink-0"
                  style={{ background: toggles[label] ? "var(--color-navy)" : "#D1D5DB", height: "22px", width: "40px" }}
                >
                  <span
                    className="absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform duration-200"
                    style={{ transform: toggles[label] ? "translateX(18px)" : "translateX(0)" }}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.21 }}
          className="p-5 rounded-2xl border"
          style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(139,92,246,0.08)" }}>
              <Palette className="w-4 h-4 text-[#8B5CF6]" />
            </div>
            <span className="text-sm font-bold" style={{ color: "var(--color-navy)" }}>Appearance</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-[#374151]">Theme</span>
            <div className="flex items-center gap-1 text-sm font-medium text-[#9CA3AF]">
              Light <ChevronRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-1">Dark mode coming soon.</p>
        </motion.div>

        {/* Save */}
        <div className="flex justify-end pb-4">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: saved ? "#10B981" : "var(--color-navy)" }}
          >
            {saved ? <><Check className="w-4 h-4" /> Saved!</> : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
