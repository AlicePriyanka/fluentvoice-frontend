"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Users, TrendingUp, TrendingDown, Minus, ArrowRight, Search, Loader2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

const TREND_ICON = {
  improving: TrendingUp,
  stable: Minus,
  declining: TrendingDown,
};
const TREND_COLOR = {
  improving: "#10B981",
  stable: "#F59E0B",
  declining: "#EF4444",
};
const AVATAR_COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#1B2B5E", "#10B981", "#F59E0B"];

interface DisplayPatient {
  id: string;
  name: string;
  email: string;
  joinedDate: string;
  age: number;
  condition: string;
  sessionsCount: number;
  avgFluency: number;
  trend: "improving" | "stable" | "declining";
  lastSessionDate: string | null;
  assessmentStatus: string;
  treatmentPlanStatus: string;
  nextAppointment: string;
}

export default function PatientsPage() {
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<DisplayPatient[]>([]);
  const [loading, setLoading] = useState(true);

  function fetchPatients() {
    setLoading(true);
    fetch("/api/therapist/patients", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.patients) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mapped = data.patients.map((p: any) => ({
            id: p.id,
            name: p.name,
            email: p.email,
            joinedDate: p.joinedDate ?? "—",
            age: p.age ?? 0,
            condition: p.condition ?? "Fluency disorder",
            sessionsCount: p.sessionsCount,
            avgFluency: p.avgFluency,
            trend: p.trend,
            lastSessionDate: p.lastSessionDate,
            assessmentStatus: p.assessmentStatus ?? "pending",
            treatmentPlanStatus: p.treatmentPlanStatus ?? "pending",
            nextAppointment: p.nextAppointment ?? "Not scheduled",
          }));
          // Sort: most sessions first, then alphabetically
          mapped.sort((a: DisplayPatient, b: DisplayPatient) =>
            b.sessionsCount !== a.sessionsCount
              ? b.sessionsCount - a.sessionsCount
              : a.name.localeCompare(b.name)
          );
          setPatients(mapped);
        } else {
          setPatients([]);
        }
      })
      .catch(() => {
        setPatients([]);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients();
    }, 0);
    // Auto-refresh every 20 seconds
    const interval = setInterval(fetchPatients, 20_000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.condition.toLowerCase().includes(query.toLowerCase())
  );

  const improving = patients.filter((p) => p.trend === "improving").length;
  const declining = patients.filter((p) => p.trend === "declining").length;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-black tracking-tight"
            style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}
          >
            All Patients
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">
            {loading ? "Loading…" : `${patients.length} active patient${patients.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPatients}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all border hover:opacity-80 disabled:opacity-40"
            style={{ borderColor: "var(--color-border)", color: "var(--color-navy)", background: "white" }}
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-white"
            style={{ borderColor: "var(--color-border)" }}>
            <Search className="w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search patients..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="text-sm outline-none bg-transparent w-48"
              style={{ color: "var(--color-navy)" }}
            />
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Users,         val: patients.length, label: "Total Patients", color: "var(--color-navy)", bg: "var(--color-navy-dim)" },
          { icon: TrendingUp,    val: improving,       label: "Improving",      color: "#10B981",           bg: "rgba(16,185,129,0.08)" },
          { icon: TrendingDown,  val: declining,       label: "Declining",      color: "#EF4444",           bg: "rgba(239,68,68,0.08)" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="p-4 rounded-2xl border flex items-center gap-4"
            style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-xl font-black tabnum" style={{ color: "var(--color-navy)" }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin opacity-40" /> : s.val}
              </div>
              <div className="text-xs text-[#9CA3AF] font-medium">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Patient list */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#9CA3AF]">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading patients…
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && !loading && (
            <div className="text-center py-16 text-[#9CA3AF]">
              <p className="font-bold">{query ? "No patients found" : "No patients assigned yet"}</p>
              <p className="text-sm mt-1">{query ? "Try a different search term." : "New patients will appear here once they register."}</p>
            </div>
          )}
          {filtered.map((patient, i) => {
            const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
            const initials = patient.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
            const TrendIcon = TREND_ICON[patient.trend];
            const trendColor = TREND_COLOR[patient.trend];
            const sevColor = patient.avgFluency >= 70 ? "#10B981" : patient.avgFluency >= 40 ? "#F59E0B" : "#EF4444";
            const sevScore = patient.avgFluency >= 70 ? "Good" : patient.avgFluency >= 40 ? "Fair" : "Low";

            return (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ x: 3 }}
              >
                <Link href={`/therapist/patient-details?id=${patient.id}`}>
                  <div
                    className="flex items-center gap-4 p-5 rounded-2xl border transition-all hover:shadow-md cursor-pointer"
                    style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm text-white"
                      style={{ background: color }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[var(--color-navy)] text-sm">{patient.name}</span>
                        {patient.age > 0 && (
                          <span className="text-xs text-[#9CA3AF]">· {patient.age} yrs</span>
                        )}
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${trendColor}14`, color: trendColor }}
                        >
                          {patient.condition}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[#9CA3AF] flex-wrap">
                        <span>{patient.email}</span>
                        <span>·</span>
                        <span>Registered: {patient.joinedDate}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[#9CA3AF] flex-wrap">
                        <span>{patient.sessionsCount} session{patient.sessionsCount !== 1 ? "s" : ""}</span>
                        <span>·</span>
                        <span>Latest session: {patient.lastSessionDate ? new Date(patient.lastSessionDate).toLocaleDateString("en-IN") : "None"}</span>
                        <span>·</span>
                        <span className="capitalize">Assessment: <strong className="font-semibold">{patient.assessmentStatus}</strong></span>
                        <span>·</span>
                        <span className="capitalize">Plan: <strong className="font-semibold">{patient.treatmentPlanStatus}</strong></span>
                        {patient.nextAppointment !== "Not scheduled" && (
                          <>
                            <span>·</span>
                            <span>Next: {patient.nextAppointment.split(" ")[0]}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-xl font-black tabnum" style={{ color: "var(--color-navy)" }}>
                          {patient.avgFluency > 0 ? patient.avgFluency : "—"}
                        </div>
                        <div className="text-[10px] font-bold" style={{ color: sevColor }}>{sevScore}</div>
                      </div>
                      <div
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
                        style={{ background: `${trendColor}14`, color: trendColor }}
                      >
                        <TrendIcon className="w-3.5 h-3.5" />
                        {patient.trend}
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#9CA3AF]" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
