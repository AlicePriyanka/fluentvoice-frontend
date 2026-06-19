"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Calendar, Check, X, Clock, User, RefreshCw } from "lucide-react";

const AVATAR_COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#1B2B5E", "#10B981", "#F59E0B"];

type ApptStatus = "pending" | "confirmed" | "cancelled";

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: string;
  status: ApptStatus;
  notes?: string;
}

export default function TherapistAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await fetch("/api/appointments");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setAppointments(data.appointments ?? []);
    } catch {
      setError("Could not load appointments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  async function updateStatus(id: string, status: ApptStatus) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Update failed");
      // Re-fetch from DB so refresh also reflects the change
      await fetchAppointments();
    } catch {
      setError("Failed to update appointment. Try again.");
    } finally {
      setUpdating(null);
    }
  }

  const pending   = appointments.filter((a) => a.status === "pending").length;
  const confirmed = appointments.filter((a) => a.status === "confirmed").length;
  const cancelled = appointments.filter((a) => a.status === "cancelled").length;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-black tracking-tight"
            style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}
          >
            Appointments
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">Upcoming sessions with your patients</p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchAppointments(); }}
          className="p-2 rounded-xl border transition-colors hover:bg-white"
          style={{ borderColor: "var(--color-border)" }}
          aria-label="Refresh"
        >
          <RefreshCw className="w-4 h-4 text-[#9CA3AF]" />
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pending",   val: pending,   color: "#F59E0B" },
          { label: "Confirmed", val: confirmed, color: "#10B981" },
          { label: "Cancelled", val: cancelled, color: "#EF4444" },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-2xl border text-center"
            style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="text-2xl font-black tabnum" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs text-[#9CA3AF] font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-xl text-sm font-medium text-red-600 bg-red-50 border border-red-100">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-sm text-[#9CA3AF]">
          Loading appointments…
        </div>
      )}

      {/* Empty */}
      {!loading && appointments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Calendar className="w-10 h-10 text-[#D1D5DB] mb-3" />
          <p className="font-bold text-[var(--color-navy)]">No appointments yet</p>
          <p className="text-sm text-[#9CA3AF] mt-1">Patients can book sessions from their portal.</p>
        </div>
      )}

      {/* Appointment list */}
      {!loading && appointments.length > 0 && (
        <div className="space-y-3">
          {appointments.map((appt, i) => {
            const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
            const initials = (appt.patientName || "?")
              .split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
            const isUpdating = updating === appt.id;

            return (
              <motion.div
                key={appt.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 rounded-2xl border transition-all"
                style={{
                  background: "white",
                  borderColor:
                    appt.status === "confirmed" ? "rgba(16,185,129,0.3)"
                    : appt.status === "cancelled" ? "rgba(239,68,68,0.2)"
                    : "var(--color-border)",
                  boxShadow: "var(--shadow-sm)",
                  opacity: isUpdating ? 0.6 : 1,
                }}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm text-white"
                    style={{ background: color }}
                  >
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm" style={{ color: "var(--color-navy)" }}>
                      {appt.patientName}
                    </div>
                    <div className="text-xs text-[#9CA3AF] mt-0.5 flex items-center gap-2">
                      <User className="w-3 h-3" /> {appt.type || "Session"}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs font-medium" style={{ color: "var(--color-navy)" }}>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#9CA3AF]" /> {appt.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#9CA3AF]" /> {appt.time}
                      </span>
                    </div>
                    {appt.notes && (
                      <div className="text-xs text-[#9CA3AF] mt-1 italic truncate">{appt.notes}</div>
                    )}
                  </div>

                  {/* Actions — pending */}
                  {appt.status === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        disabled={isUpdating}
                        onClick={() => updateStatus(appt.id, "cancelled")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 border border-red-100 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                      <button
                        disabled={isUpdating}
                        onClick={() => updateStatus(appt.id, "confirmed")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors hover:opacity-90 disabled:opacity-50"
                        style={{ background: "var(--color-navy)" }}
                      >
                        <Check className="w-3.5 h-3.5" /> Confirm
                      </button>
                    </div>
                  )}

                  {/* Status badge — confirmed / cancelled */}
                  {appt.status !== "pending" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold capitalize"
                        style={{
                          background: appt.status === "confirmed" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)",
                          color: appt.status === "confirmed" ? "#10B981" : "#EF4444",
                        }}
                      >
                        {appt.status === "confirmed" ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        {appt.status}
                      </span>
                      <button
                        disabled={isUpdating}
                        onClick={() => updateStatus(appt.id, "pending")}
                        className="text-[10px] font-medium text-[#9CA3AF] hover:text-[var(--color-navy)] transition-colors disabled:opacity-50"
                      >
                        Undo
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
