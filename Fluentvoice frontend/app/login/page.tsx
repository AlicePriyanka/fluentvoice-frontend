"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, User, Stethoscope, ArrowRight, ChevronLeft, Eye, EyeOff } from "lucide-react";

type Mode = "signin" | "register";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "";

  const [mode, setMode] = useState<Mode>("signin");
  const [role, setRole] = useState<"patient" | "therapist">("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function redirectAfterAuth(userRole: "patient" | "therapist") {
    if (from && (from.startsWith("/patient") || from.startsWith("/therapist") || from.startsWith("/settings"))) {
      router.push(from);
    } else {
      router.push(userRole === "patient" ? "/patient" : "/therapist");
    }
  }

  async function handleSubmit() {
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    if (mode === "register" && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (mode === "register" && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const body =
        mode === "register"
          ? { name: name.trim(), email: email.trim(), password, role }
          : { email: email.trim(), password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      // Store display name + role in localStorage for UI (non-sensitive)
      const user = data.user;
      localStorage.setItem("fv_user", JSON.stringify({ name: user.name, role: user.role, id: user.id }));

      redirectAfterAuth(user.role);
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "w-full px-4 py-3.5 rounded-xl text-sm font-medium text-[var(--color-navy)] outline-none transition-all";
  const inputStyle = {
    background: "white",
    border: error ? "1.5px solid #EF4444" : "1.5px solid #DDE3F0",
    boxShadow: "0 2px 8px rgba(27,43,94,0.05)",
  };

  function onFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.border = "1.5px solid var(--color-navy)";
    e.target.style.boxShadow = "0 0 0 3px rgba(27,43,94,0.1)";
  }
  function onBlur(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.border = "1.5px solid #DDE3F0";
    e.target.style.boxShadow = "0 2px 8px rgba(27,43,94,0.05)";
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--color-bg)" }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex w-[420px] shrink-0 flex-col justify-between p-10"
        style={{ background: "var(--color-navy)" }}
      >
        <div>
          <div className="flex items-center gap-2.5 mb-16">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "var(--color-gold)" }}
            >
              <Mic className="w-4 h-4" style={{ color: "var(--color-navy)" }} />
            </div>
            <div>
              <div className="text-white font-bold text-base leading-tight">FluentVoice</div>
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--color-gold)" }}>
                Speech Analytics
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-black text-white leading-tight tracking-tight mb-4">
            Clinical-grade fluency analysis.
            <br />
            <span style={{ color: "var(--color-gold)" }}>For everyone.</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Whether you&apos;re a patient tracking your own progress or a therapist managing
            multiple patients, FluentVoice gives you the data that matters.
          </p>
        </div>

        <div className="space-y-3">
          {[
            { val: "74", label: "Avg fluency score improvement after 8 weeks", unit: "pts" },
            { val: "6", label: "Disfluency types precisely identified", unit: "types" },
            { val: "<30s", label: "Full analysis turnaround time", unit: "" },
          ].map((s) => (
            <div
              key={s.val}
              className="flex items-center gap-4 px-4 py-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="text-2xl font-black text-white w-14 shrink-0">
                {s.val}
                <span className="text-sm font-bold text-white/40 ml-0.5">{s.unit}</span>
              </div>
              <div className="text-white/50 text-xs leading-relaxed">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[var(--color-navy)] transition-colors mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to home
          </Link>

          {/* Mode toggle */}
          <div
            className="grid grid-cols-2 gap-1 p-1 rounded-xl mb-8"
            style={{ background: "#E8EDF5" }}
          >
            {(["signin", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className="py-2.5 rounded-lg text-sm font-bold transition-all"
                style={
                  mode === m
                    ? { background: "white", color: "var(--color-navy)", boxShadow: "0 2px 8px rgba(27,43,94,0.1)" }
                    : { color: "#9CA3AF" }
                }
              >
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <h1
            className="text-2xl font-black tracking-tight mb-1"
            style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}
          >
            {mode === "signin" ? "Welcome back." : "Get started."}
          </h1>
          <p className="text-[#64748B] text-sm mb-7">
            {mode === "signin"
              ? "Sign in to access your sessions and treatment plan."
              : "Create your free account in seconds."}
          </p>

          <div className="space-y-4">
            {/* Role toggle — only for register */}
            <AnimatePresence initial={false}>
              {mode === "register" && (
                <motion.div
                  key="role"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#64748B] mb-2">
                    I am a
                  </label>
                  <div
                    className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl"
                    style={{ background: "#E8EDF5" }}
                  >
                    {(["patient", "therapist"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className="relative flex flex-col items-center gap-1.5 py-4 rounded-xl text-sm font-bold transition-all"
                        style={
                          role === r
                            ? { background: "white", color: "var(--color-navy)", boxShadow: "0 2px 12px rgba(27,43,94,0.12)" }
                            : { color: "#9CA3AF" }
                        }
                      >
                        {r === "patient" ? <User className="w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}
                        <span className="capitalize">{r}</span>
                        {role === r && (
                          <motion.div
                            layoutId="role-dot"
                            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                            style={{ background: "var(--color-gold)" }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Name — only for register */}
            <AnimatePresence initial={false}>
              {mode === "register" && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#64748B] mb-2">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(""); }}
                    placeholder={role === "patient" ? "e.g. Arjun Kumar" : "e.g. Dr. Meera Iyer"}
                    className={inputBase}
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#64748B] mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="you@example.com"
                className={inputBase}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#64748B] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder={mode === "register" ? "At least 8 characters" : "••••••••"}
                  className={`${inputBase} pr-12`}
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#9CA3AF] hover:text-[var(--color-navy)] transition-colors"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-red-500 mt-3 font-medium"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-bold text-white mt-6 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none"
            style={{ background: "var(--color-navy)", boxShadow: "var(--shadow-lg)" }}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {mode === "signin" ? "Sign in" : "Create account"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {mode === "signin" && (
            <p className="text-center text-xs mt-3">
              <a href="/forgot-password" className="text-[#9CA3AF] underline hover:text-[var(--color-navy)] transition-colors">
                Forgot password?
              </a>
            </p>
          )}

          <p className="text-center text-xs text-[#9CA3AF] mt-4">
            {mode === "signin" ? (
              <>No account?{" "}
                <button onClick={() => { setMode("register"); setError(""); }} className="underline hover:text-[var(--color-navy)] transition-colors">
                  Create one free
                </button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => { setMode("signin"); setError(""); }} className="underline hover:text-[var(--color-navy)] transition-colors">
                  Sign in
                </button>
              </>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
