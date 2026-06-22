"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Play, TrendingUp, Mic, ChevronRight, X, Sparkles } from "lucide-react";
import { FluencyGauge } from "@/components/fluency-gauge";

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

function pauseCount(p: number | unknown[]): number {
  return Array.isArray(p) ? p.length : (p as number);
}

function sevColor(s: string) {
  return s === "mild" ? "#10B981" : s === "moderate" ? "#F59E0B" : "#EF4444";
}

function generateInsights(report: StoredSession["report"]): string[] {
  const insights: string[] = [];
  const { fluency_score, severity, speech_rate, disfluencies } = report;

  // 1. Dominant disfluency
  if (disfluencies.length > 0) {
    const counts: Record<string, number> = {};
    for (const ev of disfluencies) {
      const t = ev.event ?? "unknown";
      counts[t] = (counts[t] ?? 0) + 1;
    }
    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    const label = DISF_LABELS[dominant[0]] ?? dominant[0].replace(/_/g, " ");
    insights.push(`Dominant disfluency: ${label} (${dominant[1]} event${dominant[1] !== 1 ? "s" : ""})`);
  } else {
    insights.push("No disfluency events detected in this session.");
  }

  // 2. Speech rate
  if (speech_rate > 0 && speech_rate <= 300) {
    const rate = Math.round(speech_rate);
    if (rate < 100) insights.push(`Speech rate ${rate} wpm — slower than usual, may reflect hesitation or blocking.`);
    else if (rate <= 160) insights.push(`Speech rate ${rate} wpm — within the typical fluent range (100–160 wpm).`);
    else if (rate <= 200) insights.push(`Speech rate ${rate} wpm — slightly fast; breath support may be strained.`);
    else insights.push(`Speech rate ${rate} wpm — very fast; consider slowing down for clarity.`);
  }

  // 3. Severity + score
  if (severity === "mild")
    insights.push(`Severity: Mild — fluency score ${fluency_score.toFixed(0)}/100. Good session, keep it up.`);
  else if (severity === "moderate")
    insights.push(`Severity: Moderate — fluency score ${fluency_score.toFixed(0)}/100. Focus on the exercises in your treatment plan.`);
  else
    insights.push(`Severity: Severe — fluency score ${fluency_score.toFixed(0)}/100. Share this session with your therapist.`);

  return insights;
}


export default function SessionsPage() {
  const [realSessions, setRealSessions] = useState<StoredSession[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [selected, setSelected] = useState<StoredSession | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Try the API first (authenticated users get their cloud sessions)
      try {
        const res = await fetch("/api/sessions");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            if (Array.isArray(data.sessions) && data.sessions.length > 0) {
              // Map API shape to StoredSession shape
              const mapped: StoredSession[] = data.sessions.map(
                (s: { id: string; date: string; report: StoredSession["report"] }) => ({
                  id: parseInt(s.id.replace(/\D/g, "").slice(-10), 10) || 0,
                  date: s.date,
                  report: s.report,
                })
              );
              setRealSessions(mapped);
            }
            setHydrated(true);
            return; // API succeeded — never fall through to localStorage
          }
        }
      } catch { /* fall through to localStorage */ }

      // Fall back to localStorage (offline / unauthenticated)
      if (!cancelled) {
        try {
          const raw = localStorage.getItem("fv_sessions");
          if (raw) setRealSessions(JSON.parse(raw));
        } catch { /* ignore */ }
        setHydrated(true);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // Escape key closes drawer
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setSelected(null);
  }, []);
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const hasReal = realSessions.length > 0;

  // Show only real sessions
  const displaySessions = realSessions;
  const isSampleData = false;

  const avgScore = displaySessions.length > 0
    ? Math.round(displaySessions.reduce((s, r) => s + r.report.fluency_score, 0) / displaySessions.length)
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-black tracking-tight"
            style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}
          >
            My Sessions
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">
            {hasReal
              ? `${realSessions.length} recording${realSessions.length > 1 ? "s" : ""}`
              : "No recordings yet"}
          </p>
        </div>
        <Link
          href="/patient/record"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: "var(--color-navy)" }}
        >
          <Mic className="w-4 h-4" aria-hidden="true" />
          New recording
        </Link>
      </div>

      {/* Sample data notice */}
      {hydrated && isSampleData && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
          style={{ background: "var(--color-gold-dim)", border: "1px solid rgba(201,169,97,0.25)", color: "#92680a" }}
        >
          <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />
          Showing sample sessions — record your voice to see your own history here.
        </motion.div>
      )}

      {/* Empty state */}
      {hydrated && displaySessions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: "var(--color-navy-dim)" }}
          >
            <Mic className="w-7 h-7" style={{ color: "var(--color-navy)" }} aria-hidden="true" />
          </div>
          <p className="font-bold text-[var(--color-navy)]">No sessions yet</p>
          <p className="text-sm text-[#9CA3AF] mt-1 mb-5">Record your first sample to get started.</p>
          <Link
            href="/patient/record"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: "var(--color-navy)" }}
          >
            <Mic className="w-4 h-4" aria-hidden="true" />
            Start recording
          </Link>
        </div>
      )}

      {/* Session list */}
      {displaySessions.length > 0 && (
        <div className="space-y-2.5">
          {displaySessions.map((sess, i) => {
            const sev = sess.report.severity;
            const color = sevColor(sev);
            return (
              <motion.div
                key={sess.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ x: 2 }}
              >
                <button
                  onClick={() => setSelected(sess)}
                  aria-label={`View session from ${sess.date}, fluency score ${sess.report.fluency_score}`}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all hover:shadow-md"
                  style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${color}14` }}
                  >
                    <Play className="w-4 h-4" style={{ color }} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-semibold truncate" style={{ color: "var(--color-navy)" }}>
                      {sess.date}
                    </div>
                    <div className="text-xs text-[#9CA3AF] mt-0.5">
                      {sess.report.disfluencies.length} disfluency event{sess.report.disfluencies.length !== 1 ? "s" : ""}
                      {sess.report.speech_rate < 300 && ` · ${Math.round(sess.report.speech_rate)} wpm`}
                    </div>
                  </div>
                  <div className="text-right shrink-0 mr-1">
                    <div className="text-xl font-black tabnum" style={{ color: "var(--color-navy)" }}>
                      {sess.report.fluency_score}
                    </div>
                    <div className="text-[10px] font-bold capitalize" style={{ color }}>
                      {sev}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#9CA3AF] shrink-0" aria-hidden="true" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Average score strip */}
      {avgScore !== null && displaySessions.length > 1 && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl"
          style={{ background: "var(--color-navy-dim)" }}
        >
          <TrendingUp className="w-4 h-4 shrink-0" style={{ color: "var(--color-navy)" }} aria-hidden="true" />
          <p className="text-sm font-medium" style={{ color: "var(--color-navy)" }}>
            Average fluency score:{" "}
            <strong>{avgScore}</strong>
            {" "}across {displaySessions.length} session{displaySessions.length !== 1 ? "s" : ""}
            {isSampleData && <span className="opacity-60"> (sample data)</span>}
          </p>
        </div>
      )}

      {/* Session detail drawer */}
      <AnimatePresence>
        {selected && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(27,43,94,0.3)" }}
              onClick={() => setSelected(null)}
              aria-hidden="true"
            />
            {/* Drawer */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Session detail: ${selected.date}`}
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-full max-w-lg z-50 overflow-y-auto"
              style={{ background: "var(--color-bg)" }}
            >
              <div className="p-6 space-y-4">

                {/* Drawer header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#9CA3AF] font-medium">Session</p>
                    <p className="text-sm font-semibold" style={{ color: "var(--color-navy)" }}>
                      {selected.date}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    aria-label="Close session detail"
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white"
                    style={{ border: "1.5px solid var(--color-border)" }}
                  >
                    <X className="w-4 h-4 text-[#9CA3AF]" aria-hidden="true" />
                  </button>
                </div>

                {/* Gauge + metrics */}
                <div
                  className="p-5 rounded-2xl border"
                  style={{ background: "white", borderColor: "var(--color-border)" }}
                >
                  <div className="flex justify-center mb-4">
                    <FluencyGauge score={selected.report.fluency_score} size={130} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Speech Rate", val: selected.report.speech_rate > 300 ? "N/A" : `${Math.round(selected.report.speech_rate)}`, unit: "wpm", color: "#6366F1" },
                      { label: "Disfluencies", val: selected.report.disfluencies.length, unit: "events", color: "#F59E0B" },
                      { label: "Pauses", val: pauseCount(selected.report.pauses), unit: "total", color: "#EC4899" },
                      { label: "Severity", val: selected.report.severity, unit: "", color: sevColor(selected.report.severity) },
                    ].map((m) => (
                      <div
                        key={m.label}
                        className="p-3 rounded-xl border text-center"
                        style={{ borderColor: "var(--color-border)" }}
                        aria-label={`${m.label}: ${m.val}${m.unit ? " " + m.unit : ""}`}
                      >
                        <div className="text-lg font-black capitalize" style={{ color: m.color }}>{m.val}</div>
                        <div className="text-[10px] text-[#9CA3AF]">{m.unit}</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] mt-1 pt-1 border-t border-[#F3F4F6]">
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Insights */}
                {(() => {
                  const insights = generateInsights(selected.report);
                  return (
                    <div
                      className="p-4 rounded-2xl"
                      style={{ background: "rgba(27,43,94,0.04)", border: "1px solid rgba(27,43,94,0.08)" }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--color-gold)" }} aria-hidden="true" />
                        <span className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">Key Insights</span>
                      </div>
                      <ul className="space-y-2">
                        {insights.map((ins, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[#374151] leading-snug">
                            <span
                              className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5"
                              style={{ background: "var(--color-navy)", color: "white" }}
                            >
                              {i + 1}
                            </span>
                            {ins}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}

                {/* Transcript */}
                {selected.report.transcript && (
                  <div
                    className="p-4 rounded-2xl border"
                    style={{ background: "white", borderColor: "var(--color-border)" }}
                  >
                    <div className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-2">Transcript</div>
                    <p className="text-sm text-[#374151] leading-relaxed">{selected.report.transcript}</p>
                  </div>
                )}

                {/* Disfluency events */}
                {selected.report.disfluencies.length > 0 && (
                  <div
                    className="p-4 rounded-2xl border"
                    style={{ background: "white", borderColor: "var(--color-border)" }}
                  >
                    <div className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">
                      Disfluency Events
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selected.report.disfluencies.map((ev, i) => {
                        const evType = ev.event ?? "unknown";
                        const color = DISF_COLORS[evType] ?? "#9CA3AF";
                        const label = DISF_LABELS[evType] ?? evType.replace(/_/g, " ");
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold"
                            style={{ background: `${color}14`, color, border: `1px solid ${color}28` }}
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
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Record again CTA */}
                <Link
                  href="/patient/record"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: "var(--color-navy)" }}
                >
                  <Mic className="w-4 h-4" aria-hidden="true" />
                  Record new session
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
