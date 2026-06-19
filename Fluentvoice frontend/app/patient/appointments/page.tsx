"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Plus, X, Check, Video, MapPin, Loader2 } from "lucide-react";

interface Appointment {
  id: string; date: string; time: string; durationMinutes: number;
  type: "in-clinic" | "telehealth"; status: "pending" | "confirmed" | "cancelled";
  notes: string; patientName: string;
}

const STATUS_STYLES = {
  pending:   { bg: "rgba(245,158,11,0.08)",  color: "#F59E0B", label: "Pending" },
  confirmed: { bg: "rgba(16,185,129,0.08)",  color: "#10B981", label: "Confirmed" },
  cancelled: { bg: "rgba(239,68,68,0.08)",   color: "#EF4444", label: "Cancelled" },
};

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBook, setShowBook] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [type, setType] = useState<"in-clinic" | "telehealth">("in-clinic");
  const [notes, setNotes] = useState("");
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState("");

  // Min date = tomorrow
  const minDate = new Date(); minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  function load() {
    setLoading(true);
    fetch("/api/appointments").then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.appointments) setAppointments(d.appointments); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function cancel(id: string) {
    await fetch(`/api/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    load(); // re-fetch from DB — no stale state
  }

  async function book(e: React.FormEvent) {
    e.preventDefault();
    setBookError(""); setBooking(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time, type, notes }),
      });
      const data = await res.json();
      if (!res.ok) { setBookError(data.error ?? "Booking failed"); return; }
      setShowBook(false); setDate(""); setNotes("");
      load();
    } catch { setBookError("Network error."); }
    finally { setBooking(false); }
  }

  const upcoming = appointments.filter(a => a.status !== "cancelled" && a.date >= new Date().toISOString().split("T")[0]);
  const past = appointments.filter(a => a.status === "cancelled" || a.date < new Date().toISOString().split("T")[0]);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}>Appointments</h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">{upcoming.length} upcoming</p>
        </div>
        <button onClick={() => setShowBook(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: "var(--color-navy)" }}>
          <Plus className="w-4 h-4" /> Book session
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-[#9CA3AF]"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <>
          {upcoming.length === 0 && !showBook && (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: "var(--color-navy-dim)" }}>
                <Calendar className="w-6 h-6" style={{ color: "var(--color-navy)" }} />
              </div>
              <p className="font-bold text-[var(--color-navy)]">No upcoming appointments</p>
              <p className="text-sm text-[#9CA3AF] mt-1 mb-5">Book a session with your therapist.</p>
            </div>
          )}

          {upcoming.map(a => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl border" style={{ background: "white", borderColor: "var(--color-border)" }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--color-navy-dim)" }}>
                    {a.type === "telehealth" ? <Video className="w-4 h-4" style={{ color: "var(--color-navy)" }} /> : <MapPin className="w-4 h-4" style={{ color: "var(--color-navy)" }} />}
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: "var(--color-navy)" }}>{formatDate(a.date)}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5"><Clock className="w-3 h-3 inline mr-1" />{a.time} · {a.durationMinutes} min · {a.type === "telehealth" ? "Telehealth" : "In-clinic"}</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
                  style={{ background: STATUS_STYLES[a.status].bg, color: STATUS_STYLES[a.status].color }}>
                  {STATUS_STYLES[a.status].label}
                </span>
              </div>
              {a.notes && <p className="text-xs text-[#9CA3AF] mt-3 pl-13">{a.notes}</p>}
              {a.status === "pending" && (
                <button onClick={() => cancel(a.id)}
                  className="mt-3 text-xs font-bold text-red-400 hover:text-red-600 transition-colors">
                  Cancel appointment
                </button>
              )}
            </motion.div>
          ))}

          {past.length > 0 && (
            <>
              <p className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] pt-2">Past / Cancelled</p>
              {past.map(a => (
                <div key={a.id} className="p-4 rounded-2xl border opacity-60" style={{ background: "white", borderColor: "var(--color-border)" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "var(--color-navy)" }}>{formatDate(a.date)} · {a.time}</p>
                      <p className="text-xs text-[#9CA3AF]">{a.type === "telehealth" ? "Telehealth" : "In-clinic"}</p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: STATUS_STYLES[a.status].bg, color: STATUS_STYLES[a.status].color }}>
                      {STATUS_STYLES[a.status].label}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}

      {/* Book modal */}
      <AnimatePresence>
        {showBook && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40" style={{ background: "rgba(27,43,94,0.3)" }}
              onClick={() => setShowBook(false)} />
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6" style={{ background: "white" }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black" style={{ color: "var(--color-navy)" }}>Book a session</h2>
                <button onClick={() => setShowBook(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#F3F4F6" }}>
                  <X className="w-4 h-4 text-[#6B7280]" />
                </button>
              </div>
              <form onSubmit={book} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-1.5">Date</label>
                    <input type="date" required min={minDateStr} value={date} onChange={e => setDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ border: "1.5px solid var(--color-border)", color: "var(--color-navy)" }} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-1.5">Time</label>
                    <input type="time" required value={time} onChange={e => setTime(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ border: "1.5px solid var(--color-border)", color: "var(--color-navy)" }} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-1.5">Session type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["in-clinic", "telehealth"] as const).map(t => (
                      <button key={t} type="button" onClick={() => setType(t)}
                        className="py-2.5 rounded-xl text-sm font-bold transition-all"
                        style={{
                          background: type === t ? "var(--color-navy)" : "#F3F4F6",
                          color: type === t ? "white" : "#6B7280",
                        }}>
                        {t === "telehealth" ? "Telehealth" : "In-clinic"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-1.5">Notes (optional)</label>
                  <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Any specific topics to discuss…"
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                    style={{ border: "1.5px solid var(--color-border)", color: "var(--color-navy)" }} />
                </div>
                {bookError && <p className="text-sm text-red-500 font-medium">{bookError}</p>}
                <button type="submit" disabled={booking}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: "var(--color-navy)" }}>
                  {booking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {booking ? "Booking…" : "Confirm booking"}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
