"use client";

import { Mic, WifiOff } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
      style={{ background: "var(--color-bg)" }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: "var(--color-navy)" }}
      >
        <WifiOff className="w-7 h-7 text-white" />
      </div>

      <h1
        className="text-2xl font-black tracking-tight mb-2"
        style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}
      >
        You&apos;re offline
      </h1>
      <p className="text-sm text-[#9CA3AF] max-w-xs mb-8">
        FluentVoice needs a connection to analyse speech and sync sessions.
        Check your network and try again.
      </p>

      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white mb-4"
        style={{ background: "var(--color-navy)" }}
      >
        Try again
      </button>

      <Link
        href="/patient/sessions"
        className="inline-flex items-center gap-2 text-sm font-medium"
        style={{ color: "var(--color-gold)" }}
      >
        <Mic className="w-4 h-4" />
        View cached sessions
      </Link>
    </div>
  );
}
