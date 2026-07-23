"use client";

/* eslint-disable react-hooks/set-state-in-effect */

/**
 * NexusTransitionOverlay
 *
 * Full-screen overlay that animates in/out when the active workspace changes.
 * Creates a smooth "portal" effect — the workspace accent sweeps across the
 * screen from the reading-direction start edge, briefly covers the UI, then
 * fades out revealing the new workspace.
 *
 * Colour comes from the --nx- token layer (workspace hue vars are already on
 * <html>, so the sweep tracks the NEW workspace's accent automatically). The
 * shadcn fallback matters: the dormant scripe layout also mounts this overlay,
 * outside the nexus token scope.
 *
 * Reduced motion skips the sweep entirely and keeps a 150ms crossfade of a
 * flat accent wash.
 *
 * Usage: Mount once inside NexusLayout, adjacent to the workspace content.
 * The overlay is completely transparent (pointer-events: none) when inactive.
 */

import React, { useEffect, useRef, useState } from "react";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";

type Phase = "idle" | "entering" | "holding" | "exiting";

const ENTER_MS = 200;
const HOLD_MS = 80;
const EXIT_MS = 300;

/** Workspace accent with a shadcn fallback for mounts outside the nexus token scope. */
const SWEEP_ACCENT = "var(--nx-accent, hsl(var(--primary)))";

/**
 * Shared reduced-motion gate for the nexus shell.
 *
 * True when either the OS asks for reduced motion (prefers-reduced-motion) or
 * the user enabled it in settings (dom-applicator stamps
 * data-reduced-motion="true" on <html>). Consumers strip position/scale
 * movement and keep crossfades — per the nexus motion rules.
 */
export function useNexusReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () =>
      setReduced(
        mq.matches || document.documentElement.getAttribute("data-reduced-motion") === "true"
      );
    read();
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, []);
  return reduced;
}

export function NexusTransitionOverlay() {
  const { activeWorkspace } = useWorkspace();
  const { direction } = useI18n();
  const reducedMotion = useNexusReducedMotion();
  const prevKeyRef = useRef<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const currentKey = activeWorkspace?.workspaceKey ?? null;

    // Skip the very first mount (no previous workspace to transition from)
    if (prevKeyRef.current === null) {
      prevKeyRef.current = currentKey;
      return;
    }

    // Skip if workspace hasn't actually changed
    if (prevKeyRef.current === currentKey) return;
    prevKeyRef.current = currentKey;

    // ── Animation sequence: enter → hold → exit → idle ──
    if (timerRef.current) clearTimeout(timerRef.current);

    setPhase("entering");

    timerRef.current = setTimeout(() => {
      setPhase("holding");

      timerRef.current = setTimeout(() => {
        setPhase("exiting");

        timerRef.current = setTimeout(() => {
          setPhase("idle");
        }, EXIT_MS);
      }, HOLD_MS);
    }, ENTER_MS);
  }, [activeWorkspace]);

  if (phase === "idle") return null;

  // The sweep enters from the reading-direction start edge; mirrored for RTL.
  const sweepOrigin = direction === "rtl" ? "95% 50%" : "5% 50%";

  return (
    <div
      aria-hidden="true"
      className={cn(
        // z-toast: the sweep is a transient, non-interactive flash that must
        // paint above the z-modal workspace loader while it runs.
        "pointer-events-none fixed inset-0 z-toast",
        "transition-opacity",
        phase === "entering" &&
          (reducedMotion
            ? "opacity-100 duration-150 ease-out"
            : "opacity-100 duration-nx-standard ease-nx-enter"),
        phase === "holding" && "opacity-100",
        phase === "exiting" &&
          (reducedMotion
            ? "opacity-0 duration-150 ease-in"
            : "opacity-0 duration-nx-panel ease-nx-exit")
      )}
      style={{
        background: reducedMotion
          ? // Reduced motion: no directional sweep — a flat accent wash crossfade.
            "var(--nx-accent-wash, hsl(var(--primary) / 0.1))"
          : `radial-gradient(ellipse 80% 60% at ${sweepOrigin}, color-mix(in oklch, ${SWEEP_ACCENT} 80%, transparent) 0%, color-mix(in oklch, ${SWEEP_ACCENT} 27%, transparent) 50%, transparent 100%)`,
        backdropFilter: phase === "holding" && !reducedMotion ? "blur(2px)" : undefined,
      }}
    />
  );
}
