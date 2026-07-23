"use client";

/**
 * NexusWorkspaceLoader
 *
 * A full-screen overlay that appears when a user switches workspaces (e.g.
 * entering the CRM module). It:
 *   1. Sweeps in with the workspace accent
 *   2. Shows the module icon + name + a progress bar
 *   3. Exits once the navigation settles
 *
 * Controlled externally via the `show` prop so the parent can
 * drive mount/unmount timing around router.push().
 *
 * Colours come from the --nx- token layer. The `accentColor` prop is kept in
 * the interface for API stability (the transition hook still supplies it) but
 * is no longer consumed for styling — the workspace hue vars on <html> drive
 * --nx-accent, so the tokens already carry the launching workspace's colour.
 *
 * The icon badge is the ONE glowing element on this screen; the progress bar
 * animates transform only, with its origin following reading direction.
 */

import React, { useEffect, useRef, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { useNexusReducedMotion } from "./nexus-transition";

interface NexusWorkspaceLoaderProps {
  show: boolean;
  workspaceName?: string;
  workspaceAbbr?: string;
  /** Legacy accent passthrough — kept for API stability, no longer styles anything. */
  accentColor?: string | null;
  /** Called after the exit animation finishes so the parent can clean up */
  onExited?: () => void;
}

type Phase = "idle" | "entering" | "visible" | "exiting";

const ENTER_MS = 180;
const MIN_VISIBLE_MS = 250; // minimum time to show the loader (UX feel)
const EXIT_MS = 200;

/** Accent token with a shadcn fallback so a stray mount outside nexus still renders. */
const ACCENT = "var(--nx-accent, hsl(var(--primary)))";

export function NexusWorkspaceLoader({
  show,
  workspaceName = "Loading…",
  workspaceAbbr,
  onExited,
}: NexusWorkspaceLoaderProps) {
  const { direction } = useI18n();
  const reducedMotion = useNexusReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

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

  // ── Progress bar — transform-only, origin follows reading direction ───────
  const barScale = phase === "entering" ? 0.3 : phase === "visible" ? 0.75 : 1;
  const barDuration =
    phase === "entering"
      ? `${ENTER_MS}ms`
      : phase === "visible"
        ? `${MIN_VISIBLE_MS}ms`
        : `${EXIT_MS}ms`;

  const opacity = phase === "exiting" ? 0 : 1;
  const scale = phase === "entering" && !reducedMotion ? 0.96 : 1;

  return (
    <div
      aria-live="polite"
      aria-label={`Loading ${workspaceName}`}
      className="fixed inset-0 z-modal flex flex-col items-center justify-center"
      style={{
        gap: 24,
        // Background — near-opaque ground glass
        background: "color-mix(in oklch, var(--nx-ground, hsl(var(--background))) 93%, transparent)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        // Transition — opacity crossfade stays even under reduced motion
        opacity,
        transition: `opacity ${phase === "exiting" ? EXIT_MS : ENTER_MS}ms ${
          phase === "exiting"
            ? "var(--nx-ease-exit, cubic-bezier(0.3, 0, 0.8, 0.15))"
            : "var(--nx-ease-enter, cubic-bezier(0.23, 1, 0.32, 1))"
        }`,
        pointerEvents: phase === "exiting" ? "none" : "all",
      }}
    >
      {/* ── Module icon badge ── */}
      <div
        style={{
          transform: `scale(${scale})`,
          transition: reducedMotion
            ? "none"
            : `transform ${ENTER_MS}ms var(--nx-ease-enter, cubic-bezier(0.23, 1, 0.32, 1))`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        {/* Glow ring + icon */}
        <div style={{ position: "relative" }}>
          {/* Outer pulse halo — static under reduced motion */}
          <div
            style={{
              position: "absolute",
              inset: -16,
              borderRadius: "50%",
              background: `radial-gradient(circle, color-mix(in oklch, ${ACCENT} 19%, transparent) 0%, transparent 70%)`,
              animation: reducedMotion ? "none" : "nexus-loader-pulse 1.6s ease-in-out infinite",
              opacity: reducedMotion ? 0.6 : undefined,
            }}
          />
          {/* Icon circle — the one glowing element on this screen.
              z-raised lifts it above its absolutely-positioned pulse halo. */}
          <div
            className="relative z-raised"
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: `linear-gradient(135deg, color-mix(in oklch, ${ACCENT} 13%, transparent), color-mix(in oklch, ${ACCENT} 27%, transparent))`,
              border: `2px solid color-mix(in oklch, ${ACCENT} 38%, transparent)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
              color: ACCENT,
              letterSpacing: "-1px",
              boxShadow: `var(--nx-glow, 0 0 0 0 transparent), inset 0 1px 0 color-mix(in oklch, ${ACCENT} 25%, transparent)`,
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
              color: "var(--nx-ink-3, hsl(var(--muted-foreground)))",
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
              color: "var(--nx-ink, hsl(var(--foreground)))",
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
            background: "var(--nx-line, hsl(var(--border)))",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: "100%",
              borderRadius: 99,
              background: `linear-gradient(${direction === "rtl" ? "270deg" : "90deg"}, color-mix(in oklch, ${ACCENT} 60%, transparent), ${ACCENT})`,
              transform: `scaleX(${barScale})`,
              transformOrigin: direction === "rtl" ? "100% 50%" : "0% 50%",
              // Reduced motion: the bar snaps between steps instead of gliding
              transition: reducedMotion
                ? "none"
                : `transform ${barDuration} var(--nx-ease-enter, cubic-bezier(0.23, 1, 0.32, 1))`,
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
      `}</style>
    </div>
  );
}
