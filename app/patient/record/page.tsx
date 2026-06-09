"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, RotateCcw, Send, Upload, Loader2, AlertCircle, TrendingUp } from "lucide-react";
import { FluencyGauge } from "@/components/fluency-gauge";

type Stage = "idle" | "recording" | "too_short" | "done" | "analyzing" | "results" | "error";

const MIN_DURATION_SEC = 5;   // minimum recording length
const MIN_BLOB_BYTES   = 3000; // ~3KB — a silent/blank recording is usually under this

interface AnalysisResult {
  fluency_score: number;
  severity: "mild" | "moderate" | "severe";
  speech_rate: number;
  transcript: string;
  disfluencies: Array<{
    event: string;
    word?: string;
    time: string;
    duration?: number;
  }>;
  pauses: number | unknown[];
  timeline?: unknown[];
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

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function pauseCount(pauses: number | unknown[]): number {
  return Array.isArray(pauses) ? pauses.length : (pauses as number);
}

export default function RecordPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [bars, setBars] = useState<number[]>(Array(40).fill(4));
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [analyzeSeconds, setAnalyzeSeconds] = useState(0);
  const [savedToCloud, setSavedToCloud] = useState<boolean | null>(null);
  const analyzeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // ── Real mic recording ──────────────────────────────────────────────────────
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mr = new MediaRecorder(stream, { mimeType: getSupportedMimeType() });
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.start(100); // collect in 100ms chunks
      setStage("recording");
      setElapsed(0);

      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
      animRef.current = setInterval(() => {
        setBars(Array.from({ length: 40 }, () => Math.random() * 44 + 4));
      }, 80);
    } catch {
      setErrorMsg("mic_denied");
      setStage("error");
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animRef.current) clearInterval(animRef.current);
    setBars(Array(40).fill(4));

    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      mr.onstop = () => {
        const mimeType = getSupportedMimeType();
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
      };
      mr.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    // Guard: recording must be long enough to be meaningful
    if (elapsed < MIN_DURATION_SEC) {
      setStage("too_short");
    } else {
      setStage("done");
    }
  }

  function reset() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animRef.current) clearInterval(animRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setBars(Array(40).fill(4));
    setStage("idle");
    setElapsed(0);
    setAudioBlob(null);
    setResult(null);
    setErrorMsg("");
  }

  // ── File upload ─────────────────────────────────────────────────────────────
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size < MIN_BLOB_BYTES) {
      setErrorMsg("This file appears to be empty or corrupted. Please upload a valid audio recording.");
      setStage("error");
      return;
    }

    setAudioBlob(file);
    setStage("done");
    setElapsed(0);
  }

  // ── Send to HuggingFace directly (bypasses Vercel's 10s function timeout) ───
  async function analyze() {
    if (!audioBlob) return;

    // Double-check blob isn't silent/empty even if duration passed
    if (audioBlob.size < MIN_BLOB_BYTES) {
      setErrorMsg("Recording appears to be silent or empty. Please speak clearly into your microphone and try again.");
      setStage("error");
      return;
    }

    setStage("analyzing");
    setAnalyzeSeconds(0);
    analyzeTimerRef.current = setInterval(() => setAnalyzeSeconds((s) => s + 1), 1000);

    try {
      const form = new FormData();
      const ext = audioBlob.type.includes("webm") ? "webm"
                : audioBlob.type.includes("ogg") ? "ogg"
                : audioBlob.type.includes("mp4") ? "mp4"
                : "wav";
      form.append("audio", audioBlob, `recording.${ext}`);
      form.append("condition_on_previous_text", "false");
      form.append("no_speech_threshold", "0.6");

      // Call HuggingFace directly — CORS is configured for this origin.
      // This bypasses Vercel's 10-second serverless function limit; the HF
      // Space can take 30-120s on cold start and the browser will wait.
      const resp = await fetch("https://ramlakshman-fluentvoice-api.hf.space/analyze", {
        method: "POST",
        body: form,
        signal: AbortSignal.timeout(180_000), // 3 min browser-side timeout
      });
      const raw = await resp.json();

      if (!resp.ok || raw.error) {
        throw new Error(raw.error ?? `Analysis API returned ${resp.status}`);
      }

      // Normalise — same logic as the server-side route
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const normDisfluencies = (arr: any[]) =>
        arr.map((ev) => ({
          event: ev.event ?? ev.type ?? "unknown",
          word:  ev.word  ?? ev.token ?? undefined,
          time:  ev.time  ?? ev.start ?? ev.timestamp ?? "0:00",
          duration: ev.duration ?? undefined,
        }));

      const score = raw.fluency_score ?? raw.score ?? 0;
      function scoreSeverity(s: number): "mild" | "moderate" | "severe" {
        if (s >= 70) return "mild";
        if (s >= 40) return "moderate";
        return "severe";
      }

      const data = {
        ...raw,
        fluency_score: score,
        severity:      scoreSeverity(score),
        speech_rate:   raw.speech_rate ?? raw.wpm ?? 0,
        transcript:    raw.transcript ?? raw.text ?? "",
        disfluencies:  normDisfluencies(raw.disfluencies ?? raw.events ?? []),
        pauses:        raw.pauses ?? 0,
        timeline:      raw.timeline ?? [],
      };

      if (!data.fluency_score && data.fluency_score !== 0) {
        throw new Error("The analysis returned an unexpected response. Please try again.");
      }

      // Save to localStorage (offline fallback)
      const sessions = JSON.parse(localStorage.getItem("fv_sessions") ?? "[]");
      sessions.unshift({
        id: Date.now(),
        date: new Date().toLocaleString(),
        report: data,
      });
      localStorage.setItem("fv_sessions", JSON.stringify(sessions.slice(0, 20)));

      // Upload audio to Cloudinary (fire-and-forget — don't block the UI)
      let audioUrl: string | null = null;
      try {
        const audioForm = new FormData();
        audioForm.append("audio", audioBlob, `recording.${ext}`);
        const uploadRes = await fetch("/api/upload-audio", {
          method: "POST",
          body: audioForm,
          credentials: "include",
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          audioUrl = uploadData.url ?? null;
        }
      } catch { /* audio upload failure doesn't block session save */ }

      // Also persist to the database
      try {
        const saveRes = await fetch("/api/sessions", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fluency_score: data.fluency_score,
            severity: data.severity,
            speech_rate: data.speech_rate,
            transcript: data.transcript,
            disfluencies: data.disfluencies ?? [],
            pauses: Array.isArray(data.pauses) ? data.pauses.length : (data.pauses ?? 0),
            timeline: data.timeline ?? [],
            ...(audioUrl ? { audioUrl } : {}),
          }),
        });
        if (saveRes.ok) {
          setSavedToCloud(true);
        } else {
          const errBody = await saveRes.json().catch(() => ({}));
          console.error("Session save failed:", saveRes.status, errBody);
          setSavedToCloud(false);
        }
      } catch (saveErr) {
        console.error("Session save error:", saveErr);
        setSavedToCloud(false);
      }

      if (analyzeTimerRef.current) clearInterval(analyzeTimerRef.current);
      setResult(data as AnalysisResult);
      setStage("results");
    } catch (err) {
      if (analyzeTimerRef.current) clearInterval(analyzeTimerRef.current);
      const raw = err instanceof Error ? err.message : "";
      // Translate technical errors into patient-friendly messages
      const friendly =
        raw.includes("fetch") || raw.includes("network") || raw.includes("Network")
          ? "We couldn't reach the analysis service. Check your internet connection and try again."
          : raw.includes("500") || raw.includes("502") || raw.includes("503")
          ? "The analysis service is temporarily unavailable. Please try again in a moment."
          : raw.includes("timeout") || raw.includes("Timeout")
          ? "Analysis timed out — the file may be too large. Try a shorter recording and try again."
          : raw.includes("format") || raw.includes("codec") || raw.includes("audio")
          ? "We couldn't read this audio file. Please try a different recording or file format."
          : raw.length > 0 && raw.length < 120 && !raw.match(/[<>{}\[\]\/\\]/)
          ? raw  // short, non-technical message — show as-is
          : "Something went wrong during analysis. Please try again.";
      setErrorMsg(friendly);
      setStage("error");
    }
  }

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animRef.current) clearInterval(animRef.current);
    if (analyzeTimerRef.current) clearInterval(analyzeTimerRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto min-h-[80vh] flex flex-col items-center justify-center py-8">
      <AnimatePresence mode="wait">

        {/* ── TOO SHORT ── */}
        {stage === "too_short" && (
          <motion.div
            key="too_short"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center w-full max-w-sm mx-auto"
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(245,158,11,0.1)" }}>
              <span className="text-3xl">⏱️</span>
            </div>
            <h2 className="text-xl font-black tracking-tight mb-2"
              style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}>
              Recording too short
            </h2>
            <p className="text-sm text-[#64748B] mb-2 leading-relaxed">
              We need at least <strong>{MIN_DURATION_SEC} seconds</strong> of speech for an accurate analysis.
              Speak naturally for 30+ seconds for best results.
            </p>
            <p className="text-xs text-[#9CA3AF] mb-8">Your recording was only {elapsed} second{elapsed !== 1 ? "s" : ""}.</p>

            <div className="flex items-center justify-center gap-3">
              <button onClick={reset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ border: "1.5px solid var(--color-border)", color: "#64748B" }}>
                <RotateCcw className="w-4 h-4" />
                Start over
              </button>
              <button onClick={() => { setAudioBlob(null); setStage("recording"); startRecording(); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: "var(--color-navy)" }}>
                <Mic className="w-4 h-4" />
                Record again
              </button>
            </div>
          </motion.div>
        )}

        {/* ── IDLE ── */}
        {stage === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="text-center w-full"
          >
            <h1 className="text-3xl font-black tracking-tight mb-2"
              style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}>
              Ready to record?
            </h1>
            <p className="text-[#64748B] text-sm mb-12 max-w-sm mx-auto">
              Speak naturally for at least 30 seconds. We&apos;ll analyze your fluency once you&apos;re done.
            </p>

            <motion.button
              onClick={startRecording}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              aria-label="Start recording"
              className="w-36 h-36 rounded-full flex items-center justify-center mx-auto mb-10"
              style={{
                background: "linear-gradient(135deg, #1B2B5E, #2D44A0)",
                boxShadow: "0 20px 60px rgba(27,43,94,0.4)",
              }}
            >
              <Mic className="w-16 h-16 text-white" aria-hidden="true" />
            </motion.button>

            <p className="text-sm text-[#9CA3AF] mb-8">— or upload a file —</p>

            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all"
              style={{ border: "1.5px solid var(--color-border)", color: "#64748B" }}>
              <Upload className="w-4 h-4" />
              Upload WAV / MP3 / M4A
              <input type="file" accept=".wav,.mp3,.m4a,.webm,.ogg" className="hidden"
                onChange={handleFileUpload} />
            </label>
          </motion.div>
        )}

        {/* ── RECORDING ── */}
        {stage === "recording" && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="text-center w-full"
          >
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-bold text-red-500 tracking-wider uppercase">Recording</span>
            </div>

            <div className="text-7xl font-black tracking-[-3px] mb-10 tabnum"
              style={{ color: "var(--color-navy)" }}>
              {formatTime(elapsed)}
            </div>

            <div
              className="flex items-center justify-center gap-[3px] mx-auto mb-12 px-6 py-6 rounded-2xl"
              style={{ background: "white", border: "1.5px solid var(--color-border)", boxShadow: "0 4px 20px rgba(27,43,94,0.08)", height: 96 }}
              aria-hidden="true"
            >
              {bars.map((h, i) => (
                <motion.div
                  key={i}
                  animate={{ scaleY: h / 48 }}
                  transition={{ duration: 0.08, ease: "easeOut" }}
                  className="w-1 rounded-full"
                  style={{
                    height: 48,
                    transformOrigin: "center",
                    background: "linear-gradient(to top, #1B2B5E, #C9A961)",
                    opacity: 0.6 + (i % 5) * 0.08,
                  }}
                />
              ))}
            </div>

            {/* Waveform — decorative */}
            {/* aria-hidden applied inline on bars below */}

            {/* Minimum duration progress */}
            {elapsed < MIN_DURATION_SEC && (
              <div className="mb-6 max-w-xs mx-auto">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#F59E0B] font-semibold">Minimum {MIN_DURATION_SEC}s required</span>
                  <span className="text-[#9CA3AF]">{elapsed}/{MIN_DURATION_SEC}s</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
                  <motion.div className="h-full rounded-full bg-amber-400"
                    animate={{ width: `${(elapsed / MIN_DURATION_SEC) * 100}%` }}
                    transition={{ duration: 0.3 }} />
                </div>
              </div>
            )}
            {elapsed >= MIN_DURATION_SEC && (
              <p className="text-xs font-semibold text-[#10B981] mb-6">
                ✓ Minimum reached — stop anytime
              </p>
            )}

            <motion.button
              onClick={stopRecording}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              aria-label="Stop recording"
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
              style={{ background: "#EF4444", boxShadow: "0 12px 40px rgba(239,68,68,0.4)" }}>
              <Square className="w-10 h-10 text-white fill-white" aria-hidden="true" />
            </motion.button>
            <p className="text-xs text-[#9CA3AF] mt-4 font-medium">Tap to stop recording</p>
          </motion.div>
        )}

        {/* ── DONE ── */}
        {stage === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center w-full"
          >
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "linear-gradient(135deg, #10B981, #34D399)", boxShadow: "0 12px 40px rgba(16,185,129,0.35)" }}>
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>

            <h2 className="text-2xl font-black tracking-tight mb-2"
              style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}>
              {(audioBlob instanceof File && audioBlob.name) ? "File loaded" : "Recording captured"}
            </h2>
            {elapsed > 0 && <p className="text-[#64748B] text-sm mb-2">Duration: {formatTime(elapsed)}</p>}
            <p className="text-[#9CA3AF] text-xs mb-10">
              Ready to send for AI analysis. This takes about 15–30 seconds.
            </p>

            <div
              className="flex items-center justify-center gap-[3px] mx-auto mb-8 px-6 py-4 rounded-2xl"
              style={{ background: "white", border: "1.5px solid var(--color-border)", height: 64 }}
              aria-hidden="true"
            >
              {Array.from({ length: 40 }, (_, i) => (
                <div key={i} className="w-1 rounded-full"
                  style={{
                    height: Math.abs(Math.sin((i / 40) * Math.PI * 6)) * 36 + 4,
                    background: "#1B2B5E",
                    opacity: 0.25 + Math.abs(Math.sin((i / 40) * Math.PI * 6)) * 0.6,
                  }}
                />
              ))}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button onClick={reset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-[#E8EDF5]"
                style={{ border: "1.5px solid var(--color-border)", color: "#64748B" }}>
                <RotateCcw className="w-4 h-4" />
                Re-record
              </button>
              <motion.button
                onClick={analyze}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: "var(--color-navy)", boxShadow: "0 6px 20px rgba(27,43,94,0.25)" }}>
                <Send className="w-4 h-4" aria-hidden="true" />
                Analyze speech
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── ANALYZING ── */}
        {stage === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center w-full"
          >
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8"
              style={{ background: "var(--color-navy-dim)" }}>
              <Loader2 className="w-12 h-12 animate-spin" style={{ color: "var(--color-navy)" }} />
            </div>
            <h2 className="text-2xl font-black tracking-tight mb-2"
              style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}>
              Analyzing your speech…
            </h2>
            {analyzeSeconds < 15 ? (
              <>
                <p className="text-[#64748B] text-sm mb-2">Running fluency analysis via AI model</p>
                <p className="text-[#9CA3AF] text-xs">This takes 15–30 seconds. Please wait.</p>
              </>
            ) : (
              <>
                <p className="text-[#64748B] text-sm mb-2">Waking up the AI model — almost there…</p>
                <p className="text-[#9CA3AF] text-xs">The model was sleeping. First request takes up to 60 seconds.</p>
              </>
            )}

            {/* Pulsing bar */}
            <div className="mt-10 max-w-xs mx-auto">
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #1B2B5E, #C9A961)" }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* ── ERROR ── */}
        {stage === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center w-full max-w-sm mx-auto"
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "#FEF2F2" }}>
              <AlertCircle className="w-10 h-10 text-red-500" aria-hidden="true" />
            </div>

            {errorMsg === "mic_denied" ? (
              <>
                <h2 className="text-xl font-black tracking-tight mb-2"
                  style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}>
                  Microphone access needed
                </h2>
                <p className="text-sm text-[#64748B] mb-4 leading-relaxed">
                  Your browser blocked microphone access. To fix this:
                </p>
                <ol className="text-sm text-[#374151] text-left space-y-2 mb-6 bg-[#F8FAFF] rounded-xl p-4 border"
                  style={{ borderColor: "var(--color-border)" }}>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[var(--color-navy)] shrink-0">1.</span>
                    <span>Click the <strong>lock icon</strong> or <strong>camera icon</strong> in your browser address bar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[var(--color-navy)] shrink-0">2.</span>
                    <span>Find <strong>Microphone</strong> and set it to <strong>Allow</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[var(--color-navy)] shrink-0">3.</span>
                    <span>Reload this page and try again</span>
                  </li>
                </ol>
              </>
            ) : (
              <>
                <h2 className="text-xl font-black tracking-tight mb-2"
                  style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}>
                  Something went wrong
                </h2>
                <p className="text-sm text-[#64748B] mb-8 leading-relaxed">{errorMsg}</p>
              </>
            )}

            <button onClick={reset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "var(--color-navy)" }}>
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Try again
            </button>
          </motion.div>
        )}

        {/* ── RESULTS ── */}
        {stage === "results" && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full space-y-4"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black tracking-tight"
                style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}>
                Here&apos;s your report
              </h2>
              {savedToCloud === true && (
                <p className="text-sm mt-1 font-medium" style={{ color: "#10B981" }}>
                  ✓ Saved to cloud — visible to your therapist
                </p>
              )}
              {savedToCloud === false && (
                <p className="text-sm mt-1 font-medium" style={{ color: "#F59E0B" }}>
                  ⚠ Saved locally only — please sign out and sign back in to sync with your therapist
                </p>
              )}
              {savedToCloud === null && (
                <p className="text-sm text-[#9CA3AF] mt-1">Session saved to your history</p>
              )}
            </div>

            {/* Gauge + metrics */}
            <div className="p-5 rounded-2xl border grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-5"
              style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
              <div className="flex items-center justify-center px-2">
                <FluencyGauge score={result.fluency_score} size={140} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Speech Rate", val: result.speech_rate > 300 ? "N/A" : `${Math.round(result.speech_rate)}`, unit: "wpm", color: "#6366F1" },
                  { label: "Disfluencies", val: result.disfluencies.length, unit: "events", color: "#F59E0B" },
                  { label: "Pauses", val: pauseCount(result.pauses), unit: "total", color: "#EC4899" },
                  { label: "Severity", val: result.severity, unit: "", color: result.severity === "mild" ? "#10B981" : result.severity === "moderate" ? "#F59E0B" : "#EF4444" },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="p-3 rounded-xl border text-center"
                    style={{ borderColor: "var(--color-border)" }}
                    aria-label={`${m.label}: ${m.val}${m.unit ? " " + m.unit : ""}`}
                  >
                    <div className="text-xl font-black capitalize" style={{ color: m.color }}>{m.val}</div>
                    <div className="text-[10px] text-[#9CA3AF] font-medium">{m.unit}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] mt-1.5 pt-1.5 border-t border-[#F3F4F6]">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Warm interpretation */}
            {(() => {
              const sev = result.severity;
              const score = result.fluency_score;
              const cfg = sev === "mild"
                ? {
                    emoji: "🌟",
                    heading: "Your speech is flowing well",
                    body: score >= 75
                      ? "Excellent fluency. Most of your speech is smooth and natural. Keep up the consistent practice to maintain this level."
                      : "Good fluency overall, with just a few hesitation moments. These small pauses are normal — you're doing really well.",
                    bg: "rgba(16,185,129,0.06)",
                    border: "rgba(16,185,129,0.2)",
                    color: "#059669",
                  }
                : sev === "moderate"
                ? {
                    emoji: "📈",
                    heading: "You're making real progress",
                    body: "Moderate disfluency is extremely common and responds well to practice. Your transcript shows specific moments to work on — share it with your therapist to build a targeted plan.",
                    bg: "rgba(245,158,11,0.06)",
                    border: "rgba(245,158,11,0.2)",
                    color: "#92400e",
                  }
                : {
                    emoji: "💪",
                    heading: "Every session moves you forward",
                    body: "This session captured areas to focus on. Scores like this improve steadily with consistent sessions — recording regularly is the most important thing you can do right now.",
                    bg: "rgba(99,102,241,0.06)",
                    border: "rgba(99,102,241,0.2)",
                    color: "#4338CA",
                  };
              return (
                <div
                  className="p-4 rounded-2xl flex items-start gap-3"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                >
                  <span className="text-2xl shrink-0 mt-0.5">{cfg.emoji}</span>
                  <div>
                    <div className="text-sm font-bold mb-0.5" style={{ color: cfg.color }}>{cfg.heading}</div>
                    <p className="text-xs leading-relaxed" style={{ color: cfg.color, opacity: 0.85 }}>{cfg.body}</p>
                  </div>
                </div>
              );
            })()}

            {/* Transcript */}
            {result.transcript && (
              <div className="p-5 rounded-2xl border"
                style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                <div className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Transcript</div>
                <p className="text-sm text-[#374151] leading-relaxed">{result.transcript}</p>
              </div>
            )}

            {/* Disfluency events */}
            {result.disfluencies.length > 0 && (
              <div className="p-5 rounded-2xl border"
                style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                <div className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">
                  Disfluency Events
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.disfluencies.map((ev, i) => {
                    const evType = ev.event ?? "unknown";
                    const color = DISF_COLORS[evType] ?? "#9CA3AF";
                    const label = DISF_LABELS[evType] ?? evType.replace(/_/g, " ");
                    return (
                      <div key={i}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                        style={{ background: `${color}14`, color, border: `1px solid ${color}28` }}>
                        <span>{label}</span>
                        {ev.word && <span className="opacity-60">&quot;{ev.word}&quot;</span>}
                        <span className="opacity-50">@{ev.time ?? "–"}</span>
                        {ev.duration && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ background: `${color}20` }}>
                            {ev.duration}s
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Trend note */}
            <div className="p-4 rounded-2xl flex items-center gap-3"
              style={{ background: "var(--color-navy-dim)", border: "1px solid rgba(27,43,94,0.1)" }}>
              <TrendingUp className="w-5 h-5 shrink-0" style={{ color: "var(--color-navy)" }} />
              <p className="text-sm" style={{ color: "var(--color-navy)" }}>
                This session is now in your history. Aim for regular recordings — even short ones help build a picture of your progress.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={reset}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{ border: "1.5px solid var(--color-border)", color: "#64748B" }}>
                <Mic className="w-4 h-4" />
                Record again
              </button>
              <a href="/patient/sessions"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: "var(--color-navy)" }}>
                View all sessions
              </a>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

// Pick the best supported audio format
function getSupportedMimeType(): string {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}
