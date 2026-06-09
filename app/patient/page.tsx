"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mic, Upload, TrendingUp, TrendingDown, Calendar, ArrowRight, Play, Sparkles } from "lucide-react";
import { FluencyGauge } from "@/components/fluency-gauge";
import { MOCK_SESSIONS, MOCK_PATIENT_TREND, MOCK_DISF_BREAKDOWN } from "@/lib/mock-data";
import {
  AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

// ── Types ────────────────────────────────────────────────────────────────────
interface StoredSession {
  id: number;
  date: string;
  report: {
    fluency_score: number;
    severity: "mild" | "moderate" | "severe";
    speech_rate: number;
    transcript: string;
    disfluencies: Array<{ event: string; word?: string; time: string; duration?: number }>;
    pauses: number | unknown[];
  };
}

// ── Constants ─────────────────────────────────────────────────────────────────
const DISF_COLORS: Record<string, string> = {
  block: "#EF4444", word_rep: "#F59E0B", sound_rep: "#F97316",
  prolongation: "#8B5CF6", interjection: "#9CA3AF", pause: "#6366F1",
  repetition: "#F59E0B", filler: "#9CA3AF", revision: "#6366F1",
  false_start: "#EC4899", phrase_rep: "#F97316", unknown: "#D1D5DB",
};
const DISF_LABELS: Record<string, string> = {
  block: "Block", word_rep: "Word Rep", sound_rep: "Sound Rep",
  prolongation: "Prolongation", interjection: "Interjection", pause: "Pause",
  repetition: "Repetition", filler: "Filler", revision: "Revision",
  false_start: "False Start", phrase_rep: "Phrase Rep", unknown: "Other",
};

const MOCK_PATIENT_SESSIONS = MOCK_SESSIONS.filter((s) => s.patientId === "p1");
const MOCK_LATEST = MOCK_PATIENT_SESSIONS[0];

function sevColor(s: string) {
  return s === "mild" ? "#10B981" : s === "moderate" ? "#F59E0B" : "#EF4444";
}

function sevLabel(s: string) {
  return s === "mild" ? "Mild" : s === "moderate" ? "Moderate" : "Severe";
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function PatientDashboard() {
  const [realSessions, setRealSessions] = useState<StoredSession[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [displayName, setDisplayName] = useState("Arjun Kumar");
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    // Greeting + name from localStorage (instant, no flicker)
    try {
      const user = localStorage.getItem("fv_user");
      if (user) {
        const parsed = JSON.parse(user);
        if (parsed?.name) setDisplayName(parsed.name);
      }
    } catch { /* ignore */ }
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");

    // Load sessions: API first (cloud), fall back to localStorage (offline)
    async function loadSessions() {
      try {
        const res = await fetch("/api/sessions");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.sessions) && data.sessions.length > 0) {
            // Map API shape → StoredSession shape
            const mapped: StoredSession[] = data.sessions.map(
              (s: { id: string; date: string; report: StoredSession["report"] }) => ({
                id: parseInt(s.id.replace(/\D/g, "").slice(-10), 10) || 0,
                date: s.date,
                report: s.report,
              })
            );
            setRealSessions(mapped);
            setHydrated(true);
            return;
          }
        }
      } catch { /* fall through */ }

      // Offline / unauthenticated fallback — localStorage
      try {
        const raw = localStorage.getItem("fv_sessions");
        if (raw) setRealSessions(JSON.parse(raw));
      } catch { /* ignore */ }
      setHydrated(true);
    }

    loadSessions();
  }, []);

  const hasReal = realSessions.length > 0;

  // ── Latest session ──────────────────────────────────────────────────────────
  const latestScore    = hasReal ? realSessions[0].report.fluency_score : MOCK_LATEST.fluencyScore;
  const latestDate     = hasReal ? realSessions[0].date                  : MOCK_LATEST.date;
  const latestSev      = hasReal ? realSessions[0].report.severity        : MOCK_LATEST.severity;
  const latestDisf     = hasReal ? realSessions[0].report.disfluencies    : MOCK_LATEST.disfluencies;

  // ── Trend chart (oldest→newest, max 7 points) ───────────────────────────────
  const trendData = useMemo(() => {
    if (realSessions.length >= 2) {
      return [...realSessions]
        .reverse()
        .slice(-7)
        .map((s, i) => ({ week: `S${i + 1}`, fluency: s.report.fluency_score }));
    }
    return MOCK_PATIENT_TREND;
  }, [realSessions]);

  const trendDelta = useMemo(() => {
    if (realSessions.length >= 2) {
      const oldest = [...realSessions].reverse()[0].report.fluency_score;
      return realSessions[0].report.fluency_score - oldest;
    }
    return 26;
  }, [realSessions]);

  const trendLabel = hasReal && realSessions.length >= 2
    ? `Last ${Math.min(realSessions.length, 7)} sessions`
    : "Sample data";

  // ── Disfluency breakdown ────────────────────────────────────────────────────
  const disfBreakdown = useMemo(() => {
    if (!hasReal) return MOCK_DISF_BREAKDOWN;
    const counts: Record<string, number> = {};
    realSessions.forEach((s) =>
      s.report.disfluencies.forEach((ev) => {
        const t = ev.event ?? "unknown";
        counts[t] = (counts[t] ?? 0) + 1;
      })
    );
    return Object.entries(counts)
      .filter(([, n]) => n > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([type, count]) => ({
        type: DISF_LABELS[type] ?? type,
        count,
        color: DISF_COLORS[type] ?? "#9CA3AF",
      }));
  }, [realSessions, hasReal]);

  // ── Recent sessions list (real first, mock fill to 3) ──────────────────────
  const recentSessions = useMemo(() => {
    const real = realSessions.slice(0, 3).map((s) => ({
      id: String(s.id),
      date: s.date,
      fluencyScore: s.report.fluency_score,
      severity: s.report.severity,
      speechRate: s.report.speech_rate,
      disfCount: s.report.disfluencies.length,
    }));
    if (real.length >= 3) return real;
    const fill = MOCK_PATIENT_SESSIONS.slice(0, 3 - real.length).map((s) => ({
      id: s.id,
      date: s.date,
      fluencyScore: s.fluencyScore,
      severity: s.severity,
      speechRate: s.speechRate,
      disfCount: s.disfluencies.length,
    }));
    return [...real, ...fill];
  }, [realSessions]);

  // Use real count when available; mock count only as demo fallback
  const totalCount = hasReal ? realSessions.length : MOCK_PATIENT_SESSIONS.length;

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* ── Page heading ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 pt-1"
      >
        <div>
          <p className="text-xs font-medium text-[#9CA3AF] mb-0.5">{greeting}</p>
          <h1
            className="text-2xl font-black tracking-tight"
            style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}
          >
            {displayName}
          </h1>
          {hydrated && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <Sparkles className="w-3 h-3" style={{ color: hasReal ? "#059669" : "#92680a" }} />
              <span className="text-xs font-medium" style={{ color: hasReal ? "#059669" : "#92680a" }}>
                {hasReal
                  ? `${realSessions.length} session${realSessions.length > 1 ? "s" : ""} recorded`
                  : "Showing sample data"}
              </span>
            </div>
          )}
        </div>
        {/* Primary CTA — right-anchored in the header row */}
        <Link
          href="/patient/record"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90 mt-1"
          style={{ background: "var(--color-navy)", color: "white" }}
        >
          <Mic className="w-4 h-4" />
          Record
        </Link>
      </motion.div>

      {/* ── Score Hero — the dominant element ────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="rounded-3xl border overflow-hidden"
        style={{
          background: "white",
          borderColor: "var(--color-border)",
          boxShadow: "0 4px 24px rgba(27,43,94,0.1)",
        }}
      >
        {/* ── Empty state: no real sessions yet ── */}
        {hydrated && !hasReal && (
          <div className="flex flex-col items-center justify-center px-8 py-12 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
              style={{ background: "var(--color-navy-dim)" }}
            >
              <Mic className="w-9 h-9" style={{ color: "var(--color-navy)" }} aria-hidden="true" />
            </div>
            <h2
              className="text-xl font-black tracking-tight mb-2"
              style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}
            >
              Record your first session
            </h2>
            <p className="text-sm text-[#64748B] mb-6 max-w-xs leading-relaxed">
              Speak for 30 seconds and we&apos;ll show your fluency score, speech rate, and disfluency patterns here.
            </p>
            <Link
              href="/patient/record"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: "var(--color-navy)" }}
            >
              <Mic className="w-4 h-4" aria-hidden="true" />
              Start recording
            </Link>
            <p className="text-xs text-[#9CA3AF] mt-4">Takes about 30 seconds</p>
          </div>
        )}

        {/* ── Score + gauge (only when real sessions exist) ── */}
        {(!hydrated || hasReal) && (
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr]">

          {/* Left: score + gauge */}
          <div
            className="flex flex-col items-center justify-center px-8 py-7 gap-1 md:border-r"
            style={{ borderColor: "var(--color-border)" }}
          >
            <FluencyGauge score={latestScore} size={180} />
            <div className="mt-3 text-center">
              <div className="text-4xl font-black tabnum leading-none" style={{ color: "var(--color-navy)" }}>
                {latestScore}
              </div>
              <div className="text-xs text-[#9CA3AF] font-medium mt-1">Fluency score</div>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: `${sevColor(latestSev)}18`,
                    color: sevColor(latestSev),
                  }}
                >
                  {sevLabel(latestSev)}
                </span>
                <span className="text-[11px] text-[#9CA3AF]">{latestDate}</span>
              </div>
            </div>
          </div>

          {/* Right: trend chart */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-sm" style={{ color: "var(--color-navy)" }}>Fluency Over Time</h2>
                <p className="text-xs text-[#9CA3AF] mt-0.5">{trendLabel}</p>
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-bold ${
                  trendDelta >= 0 ? "text-[#10B981]" : "text-[#EF4444]"
                }`}
              >
                {trendDelta >= 0
                  ? <TrendingUp className="w-3.5 h-3.5" />
                  : <TrendingDown className="w-3.5 h-3.5" />}
                {trendDelta >= 0 ? "+" : ""}{trendDelta} pts
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="fluencyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1B2B5E" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1B2B5E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "white", border: "1px solid #DDE3F0", borderRadius: 10, fontSize: 12 }}
                  formatter={(v) => v != null ? [`${v}`, "Fluency Score"] : ["–", "Fluency Score"]}
                />
                <Area
                  type="monotone"
                  dataKey="fluency"
                  stroke="#1B2B5E"
                  strokeWidth={2.5}
                  fill="url(#fluencyGrad)"
                  dot={{ fill: "#1B2B5E", r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        )} {/* end hasReal score block */}

        {/* Footer: quick utility strip — no cards, just actions */}
        <div
          className="flex items-center gap-1 px-4 py-3 border-t flex-wrap"
          style={{ background: "#FAFBFF", borderColor: "var(--color-border)" }}
        >
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mr-2 shrink-0">Actions</span>
          {[
            { icon: Mic,      label: "Record voice",   href: "/patient/record",    color: "#1B2B5E" },
            { icon: Upload,   label: "Upload audio",   href: "/patient/record",    color: "#6366F1" },
            { icon: Calendar, label: "Treatment plan", href: "/patient/treatment", color: "#C9A961" },
            { icon: ArrowRight, label: "All sessions", href: "/patient/sessions",  color: "#10B981" },
          ].map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
              style={{ background: `${a.color}10`, color: a.color }}
            >
              <a.icon className="w-3.5 h-3.5" />
              {a.label}
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── Disfluency breakdown + Recent sessions (only after first recording) ── */}
      {hydrated && hasReal && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="p-6 rounded-2xl border"
          style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
        >
          <h3 className="font-bold text-[var(--color-navy)] text-sm mb-0.5">Disfluency Breakdown</h3>
          <p className="text-xs text-[#9CA3AF] mb-5">
            {hasReal ? `Across ${realSessions.length} session${realSessions.length > 1 ? "s" : ""}` : "Sample data"}
          </p>
          {disfBreakdown.length === 0 ? (
            <div className="flex items-center justify-center h-[160px] text-sm text-[#9CA3AF]">
              No disfluency events detected yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={disfBreakdown} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="type" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "white", border: "1px solid #DDE3F0", borderRadius: 10, fontSize: 12 }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {disfBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Recent sessions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="p-6 rounded-2xl border"
          style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-[var(--color-navy)] text-sm">Recent Sessions</h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5">{totalCount} sessions total</p>
            </div>
            <Link
              href="/patient/sessions"
              className="text-xs font-bold text-[var(--color-navy)] hover:text-[var(--color-gold)] transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {recentSessions.map((s) => {
              const sc = sevColor(s.severity);
              return (
                <Link key={s.id} href="/patient/sessions">
                  <div className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-[#F0F4FF] cursor-pointer">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${sc}14` }}
                    >
                      <Play className="w-3.5 h-3.5" style={{ color: sc }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-[var(--color-navy)] truncate">{s.date}</div>
                      <div className="text-[11px] text-[#9CA3AF]">
                        {s.disfCount} events
                        {s.speechRate > 0 && s.speechRate < 300 && ` · ${Math.round(s.speechRate)} wpm`}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-black tabnum" style={{ color: "var(--color-navy)" }}>{s.fluencyScore}</div>
                      <div className="text-[10px] font-bold capitalize" style={{ color: sc }}>{s.severity}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>
      )} {/* end hasReal data sections */}

      {/* ── Latest disfluency timeline (only with real data) ─────── */}
      {hydrated && hasReal && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="p-6 rounded-2xl border"
        style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-[var(--color-navy)] text-sm">Latest Session: Disfluency Timeline</h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">{latestDate}</p>
          </div>
        </div>
        {latestDisf.length === 0 ? (
          <p className="text-sm text-[#9CA3AF]">No disfluency events detected in this session.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {latestDisf.map((ev, i) => {
              const evType = ev.event ?? "unknown";
              const color = DISF_COLORS[evType] ?? "#9CA3AF";
              const label = DISF_LABELS[evType] ?? evType.replace("_", " ");
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: `${color}16`, color, border: `1px solid ${color}30` }}
                >
                  <span>{label}</span>
                  {ev.word && <span className="opacity-60">&quot;{ev.word}&quot;</span>}
                  <span className="opacity-50">@{ev.time ?? "–"}</span>
                  {ev.duration && (
                    <span
                      className="px-1 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ background: `${color}20` }}
                    >
                      {ev.duration}s
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
      )} {/* end hasReal timeline */}

    </div>
  );
}
