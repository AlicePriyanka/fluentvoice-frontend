/**
 * useAuthGuard.ts
 * ===============
 * Client-side auth guard for protected pages.
 * Reads `fv_user` from localStorage. If missing, redirects to /login.
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuthGuard(requiredRole?: "patient" | "therapist") {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("fv_user");
      if (!raw) {
        router.replace("/login");
        return;
      }
      const user = JSON.parse(raw);
      if (!user?.id && !user?._id && !user?.email) {
        // Malformed token — treat as unauthenticated
        localStorage.removeItem("fv_user");
        router.replace("/login");
        return;
      }
      if (requiredRole && user?.role && user.role !== requiredRole) {
        // Wrong role — redirect to their own dashboard
        router.replace(user.role === "therapist" ? "/therapist" : "/patient");
        return;
      }
    } catch {
      router.replace("/login");
      return;
    }
    setChecked(true);
  }, [router, requiredRole]);

  return checked;
}
