"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Dumbbell, FileText, CheckCircle2, Clock } from "lucide-react";

const STORAGE_KEY = "fv_treatment_checked";

interface TreatmentPlan {
  goals: string[];
  exercises: string[];
  remarks: string;
}

export default function TreatmentPage() {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [plan, setPlan] = useState<TreatmentPlan | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Restore checked state from localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setChecked(JSON.parse(raw));
    } catch { /* ignore */ }

    // Load treatment plan from the API
    fetch("/api/treatment")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.plan && (data.plan.goals?.length || data.plan.exercises?.length || data.plan.remarks)) {
          setPlan({
            goals: data.plan.goals ?? [],
            exercises: data.plan.exercises ?? [],
            remarks: data.plan.remarks ?? "",
          });
        }
        setLoaded(true);
      })
      .catch(() => { setLoaded(true); });
  }, []);

  function toggle(i: number) {
    setChecked((prev) => {
      const next = { ...prev, [i]: !prev[i] };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }

  const total = (plan?.goals.length ?? 0) + (plan?.exercises.length ?? 0);
  const doneCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl"
        style={{ background: "var(--color-navy)", boxShadow: "var(--shadow-lg)" }}
      >
        <p className="text-white/50 text-xs font-medium uppercase tracking-widest mb-1">Your treatment plan</p>
        <h1 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          Practice & Goals
        </h1>
        <p className="text-white/60 text-sm mt-1">
          {plan ? "Follow these exercises daily for best results." : "Your therapist will set your plan after your session."}
        </p>
        {doneCount > 0 && plan && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-white/50 font-medium">Today&apos;s progress</span>
              <span className="text-white/80 font-bold">{doneCount} / {total} done</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.12)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "var(--color-gold)" }}
                initial={{ width: 0 }}
                animate={{ width: `${(doneCount / total) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Empty state — plan not yet set by therapist */}
      {loaded && !plan && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border"
          style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ background: "var(--color-navy-dim)" }}
          >
            <Clock className="w-6 h-6" style={{ color: "var(--color-navy)" }} />
          </div>
          <p className="font-bold text-[var(--color-navy)] text-sm">No treatment plan yet</p>
          <p className="text-sm text-[#9CA3AF] mt-1 max-w-xs">
            Your therapist will add your goals and exercises after reviewing your sessions. Check back soon.
          </p>
        </motion.div>
      )}

      {/* Goals */}
      {plan && plan.goals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="p-5 rounded-2xl border"
          style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4" style={{ color: "#6366F1" }} />
            <span className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">Goals</span>
          </div>
          <div className="space-y-2.5">
            {plan.goals.map((goal, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer"
                style={{
                  background: checked[i] ? "rgba(16,185,129,0.06)" : "#FAFBFF",
                  border: `1px solid ${checked[i] ? "rgba(16,185,129,0.2)" : "var(--color-border)"}`,
                }}
                onClick={() => toggle(i)}
              >
                <button
                  className="mt-0.5 shrink-0"
                  aria-label={checked[i] ? `Unmark goal: ${goal}` : `Mark goal as done: ${goal}`}
                  onClick={(e) => { e.stopPropagation(); toggle(i); }}
                >
                  {checked[i]
                    ? <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                    : <div className="w-5 h-5 rounded-full border-2 border-[#DDE3F0]" />
                  }
                </button>
                <p className={`text-sm font-medium leading-snug ${checked[i] ? "line-through text-[#9CA3AF]" : "text-[#374151]"}`}>
                  {goal}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Exercises */}
      {plan && plan.exercises.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="p-5 rounded-2xl border"
          style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell className="w-4 h-4 text-[#10B981]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">Daily Exercises</span>
          </div>
          <div className="space-y-2">
            {plan.exercises.map((ex, i) => {
              const idx = i + (plan.goals.length);
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer"
                  style={{
                    background: checked[idx] ? "rgba(16,185,129,0.06)" : "#FAFBFF",
                    border: `1px solid ${checked[idx] ? "rgba(16,185,129,0.2)" : "var(--color-border)"}`,
                  }}
                  onClick={() => toggle(idx)}
                >
                  <button
                    className="shrink-0"
                    aria-label={checked[idx] ? `Unmark exercise: ${ex}` : `Mark exercise as done: ${ex}`}
                    onClick={(e) => { e.stopPropagation(); toggle(idx); }}
                  >
                    {checked[idx]
                      ? <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                      : <div className="w-5 h-5 rounded-full border-2 border-[#DDE3F0]" />
                    }
                  </button>
                  <p className={`text-sm font-medium ${checked[idx] ? "line-through text-[#9CA3AF]" : "text-[#374151]"}`}>
                    {ex}
                  </p>
                </div>
              );
            })}
          </div>

          {doneCount > 0 && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#9CA3AF] font-medium">Today&apos;s progress</span>
                <span className="font-bold" style={{ color: "var(--color-navy)" }}>
                  {doneCount} / {total}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #1B2B5E, #C9A961)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(doneCount / total) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Therapist remarks */}
      {plan && plan.remarks && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-2xl border"
          style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4" style={{ color: "var(--color-gold)" }} />
            <span className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">Therapist Notes</span>
          </div>
          <p className="text-sm text-[#374151] leading-relaxed">{plan.remarks}</p>
        </motion.div>
      )}
    </div>
  );
}
