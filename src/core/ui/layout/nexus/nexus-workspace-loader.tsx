"use client";

/**
 * NexusWorkspaceLoader
 *
 * A full-screen overlay that appears when a user switches workspaces (e.g.
 * entering the CRM module). It:
 *   1. Sweeps in with the workspace accent color
 *   2. Shows the module icon + name + a progress bar
 *   3. Exits once the navigation settles
 *
 * Controlled externally via the `show` prop so the parent can
 * drive mount/unmount timing around router.push().
 */

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { LoadingSpinner } from "@core/ui/loading-spinner";

interface NexusWorkspaceLoaderProps {
  show: boolean;
  workspaceName?: string;
  workspaceAbbr?: string;
  accentColor?: string | null;
  /** Called after the exit animation finishes so the parent can clean up */
  onExited?: () => void;
}

type Phase = "idle" | "entering" | "visible" | "exiting";

const ENTER_MS = 180;
const MIN_VISIBLE_MS = 250; // minimum time to show the loader (UX feel)
const EXIT_MS = 200;

export function NexusWorkspaceLoader({
  show,
  workspaceName = "Loading…",
  workspaceAbbr,
  accentColor,
  onExited,
}: NexusWorkspaceLoaderProps) {
  const { resolvedTheme } = useTheme();
  const [phase, setPhase] = useState<Phase>("idle");
  const [mounted, setMounted] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Theme
  useEffect(() => setMounted(true), []);
  const isDark = resolvedTheme === "dark";

  const accent = accentColor ?? (isDark ? "oklch(0.65 0.18 262)" : "oklch(0.55 0.18 262)");
  const abbr = workspaceAbbr ?? workspaceName.slice(0, 2).toUpperCase();

  // Clear all pending timers
  const clearAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const schedule = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };

  useEffect(() => {
    if (show && phase === "idle") {
      setPhase("entering");
      schedule(() => setPhase("visible"), ENTER_MS);
    }

    if (!show && (phase === "visible" || phase === "entering")) {
      // ensure minimum visible time has passed by waiting a beat
      schedule(() => {
        setPhase("exiting");
        schedule(() => {
          setPhase("idle");
          onExited?.();
        }, EXIT_MS);
      }, 60);
    }

    return clearAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  if (phase === "idle") return null;
  if (!mounted) return null;

  // ── Progress bar width based on phase ────────────────────────────────────
  const barWidth = phase === "entering" ? "30%" : phase === "visible" ? "75%" : "100%";
  const barDuration =
    phase === "entering"
      ? `${ENTER_MS}ms`
      : phase === "visible"
        ? `${MIN_VISIBLE_MS}ms`
        : `${EXIT_MS}ms`;

  const opacity = phase === "exiting" ? 0 : 1;
  const scale = phase === "entering" ? 0.96 : 1;

  return (
    <div
      aria-live="polite"
      aria-label={`Loading ${workspaceName}`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 24,
        // Background — dark glass
        background: isDark ? "rgba(8, 10, 20, 0.92)" : "rgba(248, 250, 252, 0.94)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        // Transition
        opacity,
        transition: `opacity ${phase === "exiting" ? EXIT_MS : ENTER_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        pointerEvents: phase === "exiting" ? "none" : "all",
      }}
    >
      {/* ── Module icon badge ── */}
      <div
        style={{
          transform: `scale(${scale})`,
          transition: `transform ${ENTER_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        {/* Glow ring + icon */}
        <div style={{ position: "relative" }}>
          {/* Outer glow */}
          <div
            style={{
              position: "absolute",
              inset: -16,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${accent}30 0%, transparent 70%)`,
              animation: "nexus-loader-pulse 1.6s ease-in-out infinite",
            }}
          />
          {/* Icon circle */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${accent}22, ${accent}44)`,
              border: `2px solid ${accent}60`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
              color: accent,
              letterSpacing: "-1px",
              boxShadow: `0 0 40px ${accent}30, inset 0 1px 0 ${accent}40`,
              position: "relative",
              zIndex: 1,
            }}
          >
            {abbr}
          </div>
        </div>

        {/* Workspace name */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: isDark ? "rgba(255,255,255,0.4)" : "rgba(15,23,42,0.4)",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Launching
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: isDark ? "#F8FAFC" : "#0F172A",
              letterSpacing: "-0.5px",
            }}
          >
            {workspaceName}
          </div>
        </div>

        {/* Progress track */}
        <div
          style={{
            width: 200,
            height: 3,
            borderRadius: 99,
            background: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 99,
              background: `linear-gradient(90deg, ${accent}99, ${accent})`,
              width: barWidth,
              transition: `width ${barDuration} cubic-bezier(0.4, 0, 0.2, 1)`,
              boxShadow: `0 0 8px ${accent}80`,
            }}
          />
        </div>

        {/* Branded loading animation */}
        <div className="flex items-center justify-center">
          <LoadingSpinner size="sm" showText={false} className="min-h-0" />
        </div>
      </div>

      {/* Keyframes injected via a style tag */}
      <style>{`
        @keyframes nexus-loader-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.12); }
        }
        @keyframes nexus-loader-bounce {
          0%, 80%, 100% { transform: scale(1);   opacity: 0.4; }
          40%            { transform: scale(1.5); opacity: 1;   }
        }
      `}</style>
    </div>
  );
}
