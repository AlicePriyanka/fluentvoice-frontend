"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft, TrendingUp, TrendingDown, Minus, Play,
  Save, Target, Dumbbell, FileText, Loader2, Calendar,
} from "lucide-react";
import { FluencyGauge } from "@/components/fluency-gauge";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

const DISF_COLORS: Record<string, string> = {
  block: "#EF4444", word_rep: "#F59E0B", sound_rep: "#F97316",
  prolongation: "#8B5CF6", interjection: "#9CA3AF", pause: "#6366F1",
  repetition: "#F59E0B", filler: "#9CA3AF", revision: "#6366F1",
  false_start: "#EC4899", phrase_rep: "#F97316", unknown: "#D1D5DB",
};

interface Session {
  id: string;
  date: string;          // "May 27, 2026, 11:59 AM"
  createdAt: string;     // ISO string
  fluency_score: number;
  severity: "mild" | "moderate" | "severe";
  speech_rate: number;
  transcript: string;
  disfluencies: Array<{ event: string; word?: string; time: string; duration?: number }>;
  pauses: number;
  audioUrl?: string;     // Cloudinary URL for replay
}

interface PatientData {
  id: string;
  name: string;
  email: string;
  joinedDate: string;
  condition: string;
  nextAppointment: string | null;
  goals: string[];
  exercises: string[];
  remarks: string;
}

interface Stats {
  count: number;
  avgFluency: number;
  trend: "improving" | "stable" | "declining";
}

const TREND_ICON = { improving: TrendingUp, stable: Minus, declining: TrendingDown };
const TREND_COLOR = { improving: "#10B981", stable: "#F59E0B", declining: "#EF4444" };

function sevColor(s: string) {
  return s === "mild" ? "#10B981" : s === "moderate" ? "#F59E0B" : "#EF4444";
}

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [patient, setPatient]   = useState<PatientData | null>(null);
  const [stats, setStats]       = useState<Stats | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const [goals, setGoals]       = useState("");
  const [exercises, setExercises] = useState("");
  const [remarks, setRemarks]   = useState("");
  const [saved, setSaved]       = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  function fetchData(isInitial = false) {
    if (isInitial) setLoading(true);
    fetch(`/api/therapist/patients/${id}`, { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        setPatient(data.patient);
        setStats(data.stats);
        setSessions(data.sessions ?? []);
        // Only set treatment plan fields on initial load so edits aren't lost
        if (isInitial) {
          setGoals(data.patient.goals?.join("\n") ?? "");
          setExercises(data.patient.exercises?.join("\n") ?? "");
          setRemarks(data.patient.remarks ?? "");
        }
      })
      .finally(() => { if (isInitial) setLoading(false); });
  }

  useEffect(() => {
    fetchData(true);
    // Auto-refresh sessions every 20 seconds
    const interval = setInterval(() => fetchData(false), 20_000);
    return () => clearInterval(interval);
  }, [id]);

  async function handleSave() {
    try {
      const res = await fetch("/api/treatment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: id,
          goals: goals.split("\n").filter(Boolean),
          exercises: exercises.split("\n").filter(Boolean),
          remarks,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      setHasUnsaved(false);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaved(false);
      // Brief red flash to signal failure
      setHasUnsaved(true);
    }
  }

  // Build chart data from sessions (oldest → newest, max 10 points)
  const chartData = [...sessions]
    .reverse()
    .slice(-10)
    .map((s, i) => ({
      label: `#${i + 1}`,
      date: s.date,
      fluency: s.fluency_score,
    }));

  const selected = sessions[selectedIdx] ?? null;
  const TrendIcon = stats ? TREND_ICON[stats.trend] : Minus;
  const trendColor = stats ? TREND_COLOR[stats.trend] : "#F59E0B";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-[#9CA3AF]">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading patient data…
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-5xl mx-auto">
        <Link href="/therapist" className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[var(--color-navy)]">
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>
        <p className="mt-8 text-center text-[#9CA3AF]">Patient not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/therapist/patients" className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[var(--color-navy)] transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Back to patients
      </Link>

      {/* Patient header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-5 p-6 rounded-2xl border"
        style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white shrink-0"
          style={{ background: "var(--color-navy)" }}
        >
          {patient.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}>
            {patient.name}
          </h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-[#9CA3AF] flex-wrap">
            <span>{patient.condition}</span>
            <span>·</span>
            <span>Joined {patient.joinedDate}</span>
            {patient.nextAppointment && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Next: {patient.nextAppointment}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-3xl font-black tabnum" style={{ color: "var(--color-navy)" }}>
            {stats?.avgFluency ?? "—"}
          </div>
          <div className="text-xs text-[#9CA3AF] font-medium">Avg fluency</div>
          <div className="flex items-center gap-1 text-xs font-bold mt-1 justify-end" style={{ color: trendColor }}>
            <TrendIcon className="w-3.5 h-3.5" />
            {stats?.trend ?? "stable"}
          </div>
        </div>
      </motion.div>

      {/* Trend chart */}
      {chartData.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl border"
          style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-[var(--color-navy)] text-sm">Fluency Over Time</h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5">{chartData.length} sessions plotted</p>
            </div>
            <div className="text-xs font-bold flex items-center gap-1" style={{ color: trendColor }}>
              <TrendIcon className="w-3.5 h-3.5" />
              {stats?.trend}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gradTherapist" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1B2B5E" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#1B2B5E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "white", border: "1px solid #DDE3F0", borderRadius: 10, fontSize: 12 }}
                formatter={(v) => [`${v}`, "Fluency"]}
                labelFormatter={(label) => {
                  const point = chartData.find((d) => d.label === label);
                  return point?.date ?? label;
                }}
              />
              <Area
                type="monotone"
                dataKey="fluency"
                stroke="#1B2B5E"
                strokeWidth={2.5}
                fill="url(#gradTherapist)"
                dot={{ fill: "#1B2B5E", r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Sessions list + detail */}
      {sessions.length === 0 ? (
        <div className="text-center py-12 text-[#9CA3AF]">
          <p className="font-bold">No sessions recorded yet</p>
          <p className="text-sm mt-1">Sessions will appear here once the patient records their first audio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
          {/* Session list */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="p-4 rounded-2xl border"
            style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">
              {sessions.length} Session{sessions.length !== 1 ? "s" : ""}
            </div>
            <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
              {sessions.map((s, i) => {
                const isSelected = i === selectedIdx;
                const color = sevColor(s.severity);
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedIdx(i)}
                    className="w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all"
                    style={isSelected
                      ? { background: "var(--color-navy)", color: "white" }
                      : { color: "#374151" }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: isSelected ? "rgba(255,255,255,0.15)" : `${color}14` }}
                    >
                      <Play className="w-3.5 h-3.5" style={{ color: isSelected ? "white" : color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      {/* Full date + time */}
                      <div className="text-xs font-semibold leading-tight" style={{ color: isSelected ? "white" : "var(--color-navy)" }}>
                        {s.date}
                      </div>
                      <div className="text-[10px] mt-0.5" style={{ color: isSelected ? "rgba(255,255,255,0.6)" : "#9CA3AF" }}>
                        Score: {s.fluency_score} · {s.severity}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Session detail */}
          {selected && (
            <motion.div
              key={selectedIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Timestamp banner */}
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium"
                style={{ background: "var(--color-navy-dim)", color: "var(--color-navy)" }}
              >
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                Recorded: <strong>{selected.date}</strong>
              </div>

              {/* Gauge + metrics */}
              <div
                className="grid grid-cols-[auto_1fr] gap-4 p-5 rounded-2xl border"
                style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
              >
                <div className="flex items-center justify-center px-4">
                  <FluencyGauge score={selected.fluency_score} size={140} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Speech Rate", val: selected.speech_rate > 300 ? "N/A" : `${Math.round(selected.speech_rate)}`, unit: "wpm",    color: "#6366F1" },
                    { label: "Disfluencies", val: selected.disfluencies.length,                                               unit: "events", color: "#F59E0B" },
                    { label: "Pauses",        val: selected.pauses,                                                           unit: "total",  color: "#EC4899" },
                    { label: "Severity",      val: selected.severity,                                                         unit: "",       color: sevColor(selected.severity) },
                  ].map((m) => (
                    <div key={m.label} className="p-3 rounded-xl border text-center" style={{ borderColor: "var(--color-border)" }}>
                      <div className="text-xl font-black capitalize" style={{ color: m.color }}>{m.val}</div>
                      <div className="text-[10px] text-[#9CA3AF] font-medium">{m.unit}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] mt-1.5 pt-1.5 border-t border-[#F3F4F6]">
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audio replay */}
              {selected.audioUrl && (
                <div className="p-4 rounded-2xl border" style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                  <div className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Session Recording</div>
                  <audio controls src={selected.audioUrl} className="w-full" style={{ borderRadius: 8 }}>
                    Your browser does not support audio playback.
                  </audio>
                </div>
              )}

              {/* Transcript */}
              {selected.transcript && (
                <div className="p-5 rounded-2xl border" style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                  <div className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Transcript</div>
                  <p className="text-sm text-[#374151] leading-relaxed">{selected.transcript}</p>
                </div>
              )}

              {/* Disfluency events */}
              {selected.disfluencies.length > 0 && (
                <div className="p-5 rounded-2xl border" style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                  <div className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Disfluency Events</div>
                  <div className="flex flex-wrap gap-2">
                    {selected.disfluencies.map((ev, i) => {
                      const color = DISF_COLORS[ev.event ?? "unknown"] ?? "#9CA3AF";
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold"
                          style={{ background: `${color}14`, color, border: `1px solid ${color}28` }}
                        >
                          <span className="capitalize">{(ev.event ?? "unknown").replace("_", " ")}</span>
                          {ev.word && <span className="opacity-60">&quot;{ev.word}&quot;</span>}
                          <span className="opacity-50">@{ev.time ?? "–"}</span>
                          {ev.duration && (
                            <span className="px-1 py-0.5 rounded-full text-[10px] font-bold" style={{ background: `${color}20` }}>
                              {ev.duration}s
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* Treatment plan editor */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl border"
        style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-[var(--color-navy)] text-sm">Treatment Plan</h3>
            {hasUnsaved && !saved && (
              <p className="text-[11px] text-[#F59E0B] font-medium mt-0.5">Unsaved changes</p>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              background: saved ? "#10B981" : "var(--color-gold)",
              color: saved ? "white" : "var(--color-navy)",
              opacity: !hasUnsaved && !saved ? 0.6 : 1,
            }}
          >
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : "Save changes"}
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: Target,   label: "Goals",               val: goals,     set: (v: string) => { setGoals(v);     setHasUnsaved(true); }, placeholder: "One goal per line…",     color: "#6366F1" },
            { icon: Dumbbell, label: "Practice Exercises",  val: exercises, set: (v: string) => { setExercises(v); setHasUnsaved(true); }, placeholder: "One exercise per line…", color: "#10B981" },
            { icon: FileText, label: "Treatment Remarks",   val: remarks,   set: (v: string) => { setRemarks(v);   setHasUnsaved(true); }, placeholder: "Clinical notes…",        color: "var(--color-gold)" },
          ].map((field) => (
            <div key={field.label}>
              <div className="flex items-center gap-2 mb-2">
                <field.icon className="w-4 h-4" style={{ color: field.color }} />
                <span className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">{field.label}</span>
              </div>
              <textarea
                value={field.val}
                onChange={(e) => field.set(e.target.value)}
                rows={6}
                placeholder={field.placeholder}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-[#374151] resize-none outline-none transition-all"
                style={{ border: "1.5px solid #DDE3F0", background: "#FAFBFF", lineHeight: 1.7 }}
                onFocus={(e) => { e.target.style.border = `1.5px solid ${field.color}`; e.target.style.boxShadow = `0 0 0 3px ${field.color}18`; }}
                onBlur={(e)  => { e.target.style.border = "1.5px solid #DDE3F0"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
