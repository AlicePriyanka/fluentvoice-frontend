"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mic, BarChart3, Users, ArrowRight, CheckCircle2,
  Activity, Brain, Shield, Zap, TrendingUp,
} from "lucide-react";

/* ── Floating pill nav ──────────────────────────────────────────────────────── */
function Nav() {
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50">
      <nav
        className="flex items-center gap-1 px-2 py-2"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          border: "1px solid var(--color-border)",
          borderRadius: 50,
          boxShadow: "0 4px 24px rgba(27,43,94,0.1)",
        }}
      >
        <div className="flex items-center gap-2 pl-3 pr-4">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: "var(--color-navy)" }}
          >
            <Mic className="w-3 h-3 text-white" />
          </div>
          <span className="font-bold text-sm" style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}>
            FluentVoice
          </span>
        </div>

        <div
          className="w-px h-4 mx-1"
          style={{ background: "var(--color-border)" }}
        />

        <Link
          href="/login"
          className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
          style={{ color: "var(--color-text-3)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-navy)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-3)")}
        >
          Sign in
        </Link>
        <Link
          href="/login"
          className="px-4 py-1.5 rounded-full text-sm font-bold transition-all hover:opacity-90"
          style={{
            background: "var(--color-navy)",
            color: "white",
          }}
        >
          Get started
        </Link>
      </nav>
    </div>
  );
}

/* ── Hero ───────────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-36 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-16 items-center">

        {/* Left — copy, left-aligned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-7"
            style={{
              background: "var(--color-gold-dim)",
              color: "var(--color-gold)",
              border: "1px solid rgba(201,168,76,0.25)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Whisper AI · Live analysis
          </div>

          {/* Headline — solid ink, no gradient fill */}
          <h1
            className="text-5xl lg:text-6xl leading-[1.06] tracking-[-1.5px] mb-6"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-navy)",
            }}
          >
            Understand your speech.{" "}
            <span style={{ color: "var(--color-gold)" }}>Own your voice.</span>
          </h1>

          <p
            className="text-lg leading-relaxed mb-8 max-w-lg"
            style={{ color: "var(--color-text-3)" }}
          >
            Clinical-grade fluency analysis for patients and speech therapists.
            Fluency scores, disfluency timelines, and progress tracking —
            powered by AI, built from lived experience.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-px"
              style={{
                background: "var(--color-navy)",
                boxShadow: "0 6px 24px rgba(27,43,94,0.32)",
              }}
            >
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login?role=therapist"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold border-2 transition-all"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-3)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-navy)";
                e.currentTarget.style.color = "var(--color-navy)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.color = "var(--color-text-3)";
              }}
            >
              I&apos;m a therapist
            </Link>
          </div>

          <div className="flex items-center gap-5 mt-8">
            {["No credit card", "Instant analysis", "Cancel anytime"].map((t) => (
              <div key={t} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-4)" }}>
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "var(--color-green)" }} />
                {t}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — mock report card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            {/* Card header */}
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--color-navy-dim)" }}
                >
                  <Mic className="w-3.5 h-3.5" style={{ color: "var(--color-navy)" }} />
                </div>
                <span className="text-sm font-bold" style={{ color: "var(--color-navy)" }}>Analysis Report</span>
              </div>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(16,185,129,0.1)", color: "var(--color-green)" }}
              >
                ✓ Complete
              </span>
            </div>

            {/* Severity banner */}
            <div
              className="mx-4 mt-4 px-4 py-3 rounded-xl flex items-center gap-3"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}
            >
              <span className="text-lg">⚠️</span>
              <div>
                <div className="text-sm font-bold" style={{ color: "var(--color-amber)" }}>Moderate Stuttering</div>
                <div className="text-xs" style={{ color: "var(--color-text-3)" }}>Therapy is recommended</div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 p-4">
              {[
                { label: "Fluency Score", val: "74", unit: "/100", color: "var(--color-navy)" },
                { label: "Speech Rate", val: "132", unit: "wpm", color: "var(--color-indigo)" },
                { label: "Disfluencies", val: "5", unit: "events", color: "var(--color-amber)" },
                { label: "Pauses", val: "4", unit: "total", color: "var(--color-pink)" },
              ].map((m) => (
                <div
                  key={m.label}
                  className="p-3 rounded-xl text-center"
                  style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}
                >
                  <div className="text-xl font-black tabnum" style={{ color: m.color }}>{m.val}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: "var(--color-text-4)" }}>{m.unit}</div>
                  <div
                    className="text-[9px] font-bold uppercase tracking-wider mt-2 pt-2"
                    style={{ color: "var(--color-text-4)", borderTop: "1px solid var(--color-border)" }}
                  >
                    {m.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Events */}
            <div className="px-4 pb-4">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Block", color: "var(--color-red)", time: "@0:08" },
                  { label: "Prolongation", color: "var(--color-purple)", time: "@0:41" },
                  { label: "Pause", color: "var(--color-indigo)", time: "@1:03" },
                  { label: "Word Rep", color: "var(--color-amber)", time: "@0:22" },
                ].map((p) => (
                  <span
                    key={p.label}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={{
                      background: `color-mix(in srgb, ${p.color} 12%, transparent)`,
                      color: p.color,
                      border: `1px solid color-mix(in srgb, ${p.color} 25%, transparent)`,
                    }}
                  >
                    {p.label}
                    <span style={{ opacity: 0.5 }}>{p.time}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Metrics strip ──────────────────────────────────────────────────────────── */
function Metrics() {
  const items = [
    { val: "92%", label: "Analysis accuracy" },
    { val: "<30s", label: "Processing time" },
    { val: "6", label: "Disfluency types" },
    { val: "100pt", label: "Fluency scale" },
  ];
  return (
    <section className="max-w-6xl mx-auto px-6 pb-20">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="p-6 rounded-2xl text-center"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              className="text-3xl font-black tracking-tight tabnum"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-navy)" }}
            >
              {m.val}
            </div>
            <div className="text-sm mt-1 font-medium" style={{ color: "var(--color-text-4)" }}>{m.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ── Features — bento grid, not uniform 3-col ──────────────────────────────── */
function Features() {
  return (
    <section className="max-w-6xl mx-auto px-6 pb-24">
      <div className="mb-12">
        <h2
          className="text-4xl tracking-tight mb-3"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-navy)" }}
        >
          Everything you need.
        </h2>
        <p className="text-lg" style={{ color: "var(--color-text-3)" }}>
          Built for patients and therapists, not just data scientists.
        </p>
      </div>

      {/* Bento — varied sizes, no uniform grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 auto-rows-auto">

        {/* Big feature — AI Analysis, spans 4/6 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-4 p-8 rounded-3xl relative overflow-hidden"
          style={{
            background: "var(--color-navy)",
            minHeight: 240,
          }}
        >
          <Brain className="w-8 h-8 mb-5" style={{ color: "rgba(201,168,76,0.8)" }} />
          <h3
            className="text-2xl mb-3 leading-tight"
            style={{ fontFamily: "var(--font-display)", color: "white" }}
          >
            Whisper-backed AI Analysis
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)", maxWidth: 360 }}>
            Detects blocks, repetitions, prolongations, and pauses with clinical
            precision. Sub-30 second turnaround on any audio clip.
          </p>
          <div className="flex gap-2 mt-6 flex-wrap">
            {["Blocks", "Pauses", "Prolongations", "Word Rep", "Sound Rep", "Interjections"].map((t) => (
              <span
                key={t}
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
              >
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Tall feature — Privacy, spans 2/6 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="lg:col-span-2 p-7 rounded-3xl flex flex-col justify-between"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-sm)",
            minHeight: 240,
          }}
        >
          <Shield className="w-8 h-8" style={{ color: "var(--color-green)" }} />
          <div>
            <h3 className="text-lg font-bold mb-2" style={{ color: "var(--color-navy)" }}>Privacy First</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-3)" }}>
              Your recordings stay yours. No third-party data sharing, ever.
            </p>
          </div>
        </motion.div>

        {/* Small features — 2/6 each */}
        {[
          { icon: Mic, title: "Record or Upload", desc: "Live mic or WAV / MP3 / M4A file. Works on any device.", color: "var(--color-indigo)", span: 2 },
          { icon: BarChart3, title: "Clinical Reports", desc: "Fluency score, speech rate, timeline, insights — one view.", color: "var(--color-amber)", span: 2 },
          { icon: Activity, title: "Progress Tracking", desc: "Week-by-week charts. See exactly how fluency shifts.", color: "var(--color-pink)", span: 2 },
        ].map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.06 }}
            className="p-6 rounded-3xl"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-sm)",
              gridColumn: `span ${f.span}`,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: `color-mix(in srgb, ${f.color} 10%, transparent)` }}
            >
              <f.icon className="w-5 h-5" style={{ color: f.color }} />
            </div>
            <h3 className="text-sm font-bold mb-1.5" style={{ color: "var(--color-navy)" }}>{f.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-3)" }}>{f.desc}</p>
          </motion.div>
        ))}

        {/* Wide feature — Therapist Dashboard, spans 6 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-6 p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center gap-8"
          style={{
            background: "var(--color-gold-dim)",
            border: "1px solid rgba(201,168,76,0.2)",
          }}
        >
          <Users className="w-10 h-10 shrink-0" style={{ color: "var(--color-gold)" }} />
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1.5" style={{ color: "var(--color-navy)" }}>Therapist Dashboard</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-3)" }}>
              One therapist, multiple patients. Track progress, assign practice
              exercises, write treatment notes, and manage appointments — all in one place.
            </p>
          </div>
          <Link
            href="/login?role=therapist"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
            style={{ background: "var(--color-navy)", color: "white" }}
          >
            See therapist view <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ── How it works — not a section header → same template ───────────────────── */
function HowItWorks() {
  const steps = [
    { n: "01", label: "Record or upload", desc: "30 seconds of natural speech is enough for a full analysis." },
    { n: "02", label: "AI processes it", desc: "Whisper transcribes, our model maps every disfluency event." },
    { n: "03", label: "Read your report", desc: "Fluency score, timeline, speech rate, insights — instant." },
  ];
  return (
    <section
      className="py-20 mb-16"
      style={{ background: "var(--color-navy)" }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 items-center">
          <div>
            <h2
              className="text-4xl leading-tight mb-4"
              style={{ fontFamily: "var(--font-display)", color: "white" }}
            >
              From recording to report in under 30 seconds.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
              No setup. No configuration. Record, submit, read.
            </p>
          </div>
          <div className="space-y-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-5 p-5 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <span
                  className="text-2xl font-black tabnum shrink-0 leading-none"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-gold)" }}
                >
                  {s.n}
                </span>
                <div>
                  <div className="font-bold text-white mb-1">{s.label}</div>
                  <div className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{s.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── CTA ────────────────────────────────────────────────────────────────────── */
function CTA() {
  return (
    <section className="max-w-6xl mx-auto px-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-3xl p-14 text-center"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <TrendingUp className="w-10 h-10 mx-auto mb-5" style={{ color: "var(--color-gold)" }} />
        <h2
          className="text-4xl tracking-tight mb-3"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-navy)" }}
        >
          Your voice. Measured. Improved.
        </h2>
        <p className="text-base mb-8 max-w-md mx-auto" style={{ color: "var(--color-text-3)" }}>
          Built from the experience of someone who stutters, for everyone who does.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-px"
          style={{
            background: "var(--color-navy)",
            boxShadow: "0 6px 24px rgba(27,43,94,0.3)",
          }}
        >
          Get started free <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </section>
  );
}

/* ── Footer — inline single-line (Ft2), not 4-col AI footer ────────────────── */
function Footer() {
  return (
    <footer className="border-t py-6" style={{ borderColor: "var(--color-border)" }}>
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Mic className="w-3.5 h-3.5" style={{ color: "var(--color-navy)" }} />
          <span className="font-bold text-sm" style={{ color: "var(--color-navy)" }}>FluentVoice</span>
          <span className="text-xs" style={{ color: "var(--color-text-4)" }}>· NexoVent Labs · Chennai, India</span>
        </div>
        <div className="flex items-center gap-5">
          {["Privacy", "Terms", "Contact"].map((l) => (
            <Link key={l} href="#" className="text-xs transition-colors" style={{ color: "var(--color-text-4)" }}>
              {l}
            </Link>
          ))}
          <span className="text-xs" style={{ color: "var(--color-text-4)" }}>© 2026</span>
        </div>
      </div>
    </footer>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div style={{ background: "var(--color-bg)" }}>
      <Nav />
      <Hero />
      <Metrics />
      <HowItWorks />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
}
