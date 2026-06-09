"use client";

import { useEffect } from "react";

export function SwRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          reg.addEventListener("updatefound", () => {
            const worker = reg.installing;
            if (!worker) return;
            worker.addEventListener("statechange", () => {
              if (worker.state === "installed" && navigator.serviceWorker.controller) {
                // New version available — could show a toast here
                console.log("[FluentVoice] New version available. Refresh to update.");
              }
            });
          });
        })
        .catch((err) => console.error("[FluentVoice] SW registration failed:", err));
    }
  }, []);

  return null;
}
