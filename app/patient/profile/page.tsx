"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Phone, Calendar, Activity, Save, TrendingUp } from "lucide-react";

interface ProfileData {
  id: string; name: string; email: string; role: string;
  joinedDate: string; phone: string; age: number | null; condition: string;
  stats: { sessionsCount: number; avgFluency: number; lastSession: string | null };
}

export default function PatientProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [condition, setCondition] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/profile").then(r => r.ok ? r.json() : null).then(d => {
      if (!d?.profile) return;
      const p = d.profile;
      setProfile(p);
      setName(p.name);
      setPhone(p.phone ?? "");
      setAge(p.age?.toString() ?? "");
      setCondition(p.condition ?? "");
    });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, age, condition }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Save failed"); return; }
      setSaved(true); setTimeout(() => setSaved(false), 2000);
      setProfile(p => p ? { ...p, name } : p);
    } catch { setError("Network error."); }
    finally { setSaving(false); }
  }

  const sev = (s: number) => s >= 70 ? { label: "Good", color: "#10B981" } : s >= 40 ? { label: "Fair", color: "#F59E0B" } : { label: "Low", color: "#EF4444" };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}>My Profile</h1>
        <p className="text-sm text-[#9CA3AF] mt-0.5">Manage your personal information</p>
      </div>

      {/* Stats row */}
      {profile && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Activity, label: "Sessions", val: profile.stats.sessionsCount, color: "#6366F1" },
            { icon: TrendingUp, label: "Avg Score", val: profile.stats.avgFluency || "—", color: sev(profile.stats.avgFluency).color },
            { icon: Calendar, label: "Joined", val: profile.joinedDate, color: "var(--color-navy)" },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-2xl border text-center" style={{ background: "white", borderColor: "var(--color-border)" }}>
              <s.icon className="w-4 h-4 mx-auto mb-2" style={{ color: s.color }} />
              <div className="text-lg font-black" style={{ color: s.color }}>{s.val}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Edit form */}
      <form onSubmit={save} className="p-5 rounded-2xl border space-y-4" style={{ background: "white", borderColor: "var(--color-border)" }}>
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4" style={{ color: "var(--color-gold)" }} />
          <span className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">Personal Info</span>
        </div>

        {[
          { label: "Full Name", value: name, setter: setName, type: "text", placeholder: "Your name" },
          { label: "Phone", value: phone, setter: setPhone, type: "tel", placeholder: "+91 98765 43210" },
          { label: "Age", value: age, setter: setAge, type: "number", placeholder: "25" },
        ].map(f => (
          <div key={f.label}>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-1.5">{f.label}</label>
            <input type={f.type} value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.placeholder}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{ border: "1.5px solid var(--color-border)", color: "var(--color-navy)", background: "#FAFBFF" }} />
          </div>
        ))}

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-1.5">Primary Condition</label>
          <select value={condition} onChange={e => setCondition(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{ border: "1.5px solid var(--color-border)", color: "var(--color-navy)", background: "#FAFBFF" }}>
            <option value="">Select condition</option>
            <option>Stuttering</option>
            <option>Cluttering</option>
            <option>Articulation disorder</option>
            <option>Voice disorder</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-1.5">Email</label>
          <input type="email" value={profile?.email ?? ""} disabled
            className="w-full px-4 py-2.5 rounded-xl text-sm opacity-50 cursor-not-allowed"
            style={{ border: "1.5px solid var(--color-border)", color: "var(--color-navy)", background: "#F3F4F6" }} />
        </div>

        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

        <motion.button type="submit" disabled={saving}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
          style={{ background: saved ? "#10B981" : "var(--color-navy)" }}>
          <Save className="w-4 h-4" />
          {saving ? "Saving…" : saved ? "Saved!" : "Save changes"}
        </motion.button>
      </form>

      {/* Account info */}
      <div className="p-4 rounded-2xl border" style={{ background: "white", borderColor: "var(--color-border)" }}>
        <p className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Account</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#374151]">Role</span>
          <span className="font-bold capitalize" style={{ color: "var(--color-navy)" }}>Patient</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-[#374151]">Member since</span>
          <span className="font-bold" style={{ color: "var(--color-navy)" }}>{profile?.joinedDate ?? "—"}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-[#374151]">Password</span>
          <a href="/forgot-password" className="text-xs font-bold underline" style={{ color: "var(--color-navy)" }}>
            Change password
          </a>
        </div>
      </div>
    </div>
  );
}
