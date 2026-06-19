"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mic,
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  LogOut,
  Activity,
  ChevronRight,
  X,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "patient" | "therapist";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const patientNav: NavItem[] = [
  { label: "Dashboard",      href: "/patient",              icon: LayoutDashboard },
  { label: "Record",         href: "/patient/record",       icon: Mic },
  { label: "My Sessions",    href: "/patient/sessions",     icon: Activity },
  { label: "Treatment Plan", href: "/patient/treatment",    icon: Calendar },
  { label: "Appointments",   href: "/patient/appointments", icon: Calendar },
  { label: "My Profile",     href: "/patient/profile",      icon: User },
];

const therapistNav: NavItem[] = [
  { label: "Dashboard",    href: "/therapist",          icon: LayoutDashboard },
  { label: "Patients",     href: "/therapist/patients", icon: Users },
  { label: "Appointments", href: "/therapist/appointments", icon: Calendar },
  { label: "My Profile",   href: "/therapist/profile",  icon: User },
];

interface SidebarProps {
  role: Role;
  userName: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ role, userName, mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = role === "patient" ? patientNav : therapistNav;

  const [displayName, setDisplayName] = useState(userName);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("fv_user");
      if (raw) {
        const user = JSON.parse(raw);
        if (user.name) setDisplayName(user.name);
      }
    } catch {}
  }, []);

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: "rgba(27,43,94,0.5)" }}
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "flex-col h-screen overflow-y-auto z-50",
          // Desktop: always in flow
          "hidden lg:flex lg:w-64 lg:shrink-0 lg:sticky lg:top-0",
          // Mobile: fixed overlay when open
          mobileOpen && "fixed inset-y-0 left-0 flex w-72"
        )}
        style={{ background: "var(--color-navy)" }}
      >
        {/* Gold top bar */}
        <div className="h-1 w-full" style={{ background: "var(--color-gold)" }} />

        {/* Logo + mobile close button */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "var(--color-gold)" }}>
              <Mic className="w-4 h-4" style={{ color: "var(--color-navy)" }} />
            </div>
            <div className="flex-1">
              <div className="text-white font-bold text-base leading-tight tracking-tight">FluentVoice</div>
              <div className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "var(--color-gold)" }}>
                Speech Analytics
              </div>
            </div>
            {/* Close button — mobile only */}
            <button
              onClick={onMobileClose}
              className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
              style={{ background: "rgba(255,255,255,0.1)" }}
              aria-label="Close menu"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="px-4 mb-4">
          <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Role badge */}
        <div className="px-4 mb-4">
          <div className="rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-center"
            style={{ background: "var(--color-gold-dim)", color: "var(--color-gold)", border: "1px solid rgba(201,168,76,0.2)" }}>
            {role === "patient" ? "Patient Portal" : "Therapist Portal"}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={onMobileClose}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group",
                    active
                      ? "text-[var(--color-navy)] font-semibold"
                      : "text-white/60 hover:text-white hover:bg-white/8"
                  )}
                  style={active ? { background: "linear-gradient(135deg, var(--color-gold), var(--color-gold-light))" } : {}}
                >
                  <item.icon
                    className={cn("w-4 h-4 shrink-0", !active && "text-white/50 group-hover:text-white")}
                    style={active ? { color: "var(--color-navy)" } : {}}
                  />
                  <span className="flex-1">{item.label}</span>
                  {active && <ChevronRight className="w-3 h-3" style={{ color: "rgba(27,43,94,0.6)" }} />}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 my-4">
          <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Bottom: user + settings */}
        <div className="px-3 pb-6 space-y-1">
          <Link href="/settings" onClick={onMobileClose}>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/8 transition-all cursor-pointer">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </div>
          </Link>
          <button
            onClick={async () => {
              onMobileClose?.();
              try {
                await fetch("/api/auth/logout", { method: "POST" });
              } catch { /* ignore */ }
              localStorage.removeItem("fv_user");
              router.push("/login");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>

          {/* User card */}
          <div className="mt-3 flex items-center gap-3 px-3 py-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
              style={{ background: "linear-gradient(135deg, var(--color-gold), var(--color-gold-light))", color: "var(--color-navy)" }}>
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-white text-sm font-semibold truncate">{displayName}</div>
              <div className="text-white/40 text-[11px] capitalize">{role}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
