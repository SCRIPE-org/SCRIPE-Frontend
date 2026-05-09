"use client";

/**
 * NexusTransitionOverlay
 *
 * Full-screen overlay that animates in/out when the active workspace changes.
 * Creates a smooth "portal" effect — the workspace accent color sweeps across
 * the screen, briefly covers the UI, then fades out revealing the new workspace.
 *
 * Usage: Mount once inside NexusLayout, adjacent to the workspace content.
 * The overlay is completely transparent (pointer-events: none) when inactive.
 */

import React, { useEffect, useRef, useState } from "react";
import { useWorkspace } from "@core/providers/workspace-provider";
import { cn } from "@core/common/utils";

type Phase = "idle" | "entering" | "holding" | "exiting";

const ENTER_MS = 200;
const HOLD_MS = 80;
const EXIT_MS = 300;

export function NexusTransitionOverlay() {
  const { activeWorkspace } = useWorkspace();
  const prevKeyRef = useRef<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [color, setColor] = useState<string | null>(null);
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

    // Capture the accent color of the new workspace for the sweep
    const accent = activeWorkspace?.accentColor ?? "oklch(0.5 0.18 240)";
    setColor(accent);

    // ── Animation sequence: enter → hold → exit → idle ──
    if (timerRef.current) clearTimeout(timerRef.current);

    setPhase("entering");

    timerRef.current = setTimeout(() => {
      setPhase("holding");

      timerRef.current = setTimeout(() => {
        setPhase("exiting");

        timerRef.current = setTimeout(() => {
          setPhase("idle");
          setColor(null);
        }, EXIT_MS);
      }, HOLD_MS);
    }, ENTER_MS);
  }, [activeWorkspace]);

  if (phase === "idle") return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 z-[9999]",
        "transition-opacity",
        phase === "entering" && "duration-[200ms] opacity-100 ease-out",
        phase === "holding" && "opacity-100",
        phase === "exiting" && "duration-[300ms] opacity-0 ease-in"
      )}
      style={{
        background: color
          ? `radial-gradient(ellipse 80% 60% at 5% 50%, ${color}cc 0%, ${color}44 50%, transparent 100%)`
          : undefined,
        backdropFilter: phase === "holding" ? "blur(2px)" : undefined,
      }}
    />
  );
}
