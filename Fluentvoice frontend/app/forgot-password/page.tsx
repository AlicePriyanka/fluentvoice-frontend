"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { KeyRound, ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--color-bg)" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Back */}
        <Link href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9CA3AF] hover:text-[var(--color-navy)] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: "var(--color-navy)" }}>
          <KeyRound className="w-7 h-7 text-white" />
        </div>

        <h1 className="text-2xl font-black tracking-tight mb-1"
          style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}>
          Reset password
        </h1>
        <p className="text-sm text-[#9CA3AF] mb-8">
          Enter your email and choose a new password.
        </p>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center py-6"
          >
            <CheckCircle2 className="w-12 h-12 text-[#10B981] mb-3" />
            <p className="font-bold text-[var(--color-navy)]">Password updated!</p>
            <p className="text-sm text-[#9CA3AF] mt-1">Redirecting to login…</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ border: "1.5px solid var(--color-border)", color: "var(--color-navy)", background: "white" }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-1.5">
                New password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-11 transition-all"
                  style={{ border: "1.5px solid var(--color-border)", color: "var(--color-navy)", background: "white" }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[var(--color-navy)]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
              style={{ background: "var(--color-navy)" }}
            >
              {loading ? "Updating…" : "Reset password"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
