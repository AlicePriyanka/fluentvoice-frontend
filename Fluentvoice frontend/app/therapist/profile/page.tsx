"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Phone, Stethoscope, Save, Users, Activity } from "lucide-react";

interface ProfileData {
  id: string; name: string; email: string; role: string;
  joinedDate: string; phone: string; bio: string;
  specialty: string; licenseNumber: string; clinicName: string;
  stats: { sessionsCount: number; avgFluency: number };
}

export default function TherapistProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [patientCount, setPatientCount] = useState(0);

  useEffect(() => {
    fetch("/api/profile").then(r => r.ok ? r.json() : null).then(d => {
      if (!d?.profile) return;
      const p = d.profile;
      setProfile(p);
      setName(p.name); setPhone(p.phone ?? ""); setBio(p.bio ?? "");
      setSpecialty(p.specialty ?? ""); setLicenseNumber(p.licenseNumber ?? "");
      setClinicName(p.clinicName ?? "");
    });
    fetch("/api/therapist/patients").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.patients) setPatientCount(d.patients.length);
    });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, bio, specialty, licenseNumber, clinicName }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Save failed"); return; }
      setSaved(true); setTimeout(() => setSaved(false), 2000);
      setProfile(p => p ? { ...p, name } : p);
    } catch { setError("Network error."); }
    finally { setSaving(false); }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}>My Profile</h1>
        <p className="text-sm text-[#9CA3AF] mt-0.5">Manage your therapist profile</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Users, label: "Active Patients", val: patientCount, color: "var(--color-navy)" },
          { icon: Activity, label: "Total Sessions", val: profile?.stats.sessionsCount ?? "—", color: "#6366F1" },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl border flex items-center gap-4" style={{ background: "white", borderColor: "var(--color-border)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--color-navy-dim)" }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-xl font-black" style={{ color: s.color }}>{s.val}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit form */}
      <form onSubmit={save} className="p-5 rounded-2xl border space-y-4" style={{ background: "white", borderColor: "var(--color-border)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Stethoscope className="w-4 h-4" style={{ color: "var(--color-gold)" }} />
          <span className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">Professional Info</span>
        </div>

        {[
          { label: "Full Name", value: name, setter: setName, placeholder: "Dr. Your Name", type: "text" },
          { label: "Phone", value: phone, setter: setPhone, placeholder: "+91 98765 43210", type: "tel" },
          { label: "Specialty", value: specialty, setter: setSpecialty, placeholder: "e.g. Stuttering & Fluency", type: "text" },
          { label: "License Number", value: licenseNumber, setter: setLicenseNumber, placeholder: "e.g. SLP-2024-001", type: "text" },
          { label: "Clinic / Hospital Name", value: clinicName, setter: setClinicName, placeholder: "e.g. FluentVoice Clinic", type: "text" },
        ].map(f => (
          <div key={f.label}>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-1.5">{f.label}</label>
            <input type={f.type} value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.placeholder}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ border: "1.5px solid var(--color-border)", color: "var(--color-navy)", background: "#FAFBFF" }} />
          </div>
        ))}

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-1.5">Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
            placeholder="Brief description of your experience and approach…"
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
            style={{ border: "1.5px solid var(--color-border)", color: "var(--color-navy)", background: "#FAFBFF" }} />
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
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
          style={{ background: saved ? "#10B981" : "var(--color-navy)" }}>
          <Save className="w-4 h-4" />
          {saving ? "Saving…" : saved ? "Saved!" : "Save changes"}
        </motion.button>
      </form>

      <div className="p-4 rounded-2xl border" style={{ background: "white", borderColor: "var(--color-border)" }}>
        <p className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Account</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#374151]">Role</span>
          <span className="font-bold" style={{ color: "var(--color-navy)" }}>Therapist</span>
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
