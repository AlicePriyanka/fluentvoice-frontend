"use client";

import { useState, useEffect } from "react";
import { Mic, Menu } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const authChecked = useAuthGuard("patient");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [displayName, setDisplayName] = useState("Arjun Kumar");

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const user = localStorage.getItem("fv_user");
        if (user) {
          const parsed = JSON.parse(user);
          if (parsed?.name) setDisplayName(parsed.name);
        }
      } catch { /* ignore */ }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Don't render anything until auth is confirmed — prevents flash of content
  if (!authChecked) return null;

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Mobile top bar */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 h-14"
        style={{ background: "var(--color-navy)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <button
          onClick={() => setMobileOpen(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(255,255,255,0.1)" }}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "var(--color-gold)" }}
          >
            <Mic className="w-3 h-3" style={{ color: "var(--color-navy)" }} />
          </div>
          <span className="text-white font-bold text-sm tracking-tight">FluentVoice</span>
        </div>
      </div>

      <Sidebar
        role="patient"
        userName={displayName}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0 p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

