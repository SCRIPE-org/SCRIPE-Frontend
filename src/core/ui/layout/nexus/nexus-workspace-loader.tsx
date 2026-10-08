"use client";

/**
 * NexusWorkspaceLoader
 *
 * The full-screen wait when a user switches workspaces. It is the one place in
 * the product where somebody stares at a screen with nothing else on it, so it
 * has to read as deliberate — "we are opening Academy" — rather than as a
 * stall.
 *
 * Deliberate means: name the destination. The abbreviation badge, the
 * "Launching" label and the workspace name are the content; the loader itself
 * is the shared LoadingSpinner, sized down. That label used to be a bare
 * English string, which meant the Arabic build's most exposed screen was the
 * one screen that shipped untranslated.
 *
 * WHAT WAS REMOVED, AND WHY
 *  - An injected stylesheet carrying a nexus-loader-pulse keyframe, driving a
 *    halo that breathed forever behind the badge. A stylesheet smuggled into a
 *    component is a second, invisible design system, and an infinite idle
 *    animation is indistinguishable from a hung request.
 *  - A hand-rolled progress bar whose fill was derived from the component's own
 *    phase, not from anything the network was doing. Invented progress is worse
 *    than no progress; the sanctioned loader says "working" honestly.
 *  - A 20px backdrop-filter over the entire viewport — the most expensive thing
 *    in the sequence, and a visual effect rather than motion. The veil is now a
 *    flat sheet of the shell's own ground.
 *
 * Colours come from the --nx- token layer. The `accentColor` prop is kept in
 * the interface for API stability (the transition hook still supplies it) but
 * is not consumed for styling — the workspace hue vars on <html> drive
 * --nx-accent, so the tokens already carry the launching workspace's colour.
 *
 * The badge is the ONE element on this screen wearing --nx-glow. That is the
 * whole budget, spent on the thing the user is waiting for.
 */

import React, { useEffect, useRef, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { cn } from "@core/common/utils";
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
const EXIT_MS = 200;

export function NexusWorkspaceLoader({
  show,
  workspaceName,
  workspaceAbbr,
  onExited,
}: NexusWorkspaceLoaderProps) {
  const { t } = useI18n();
  const reducedMotion = useNexusReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // A workspace switch always has a name; the fallback covers the mount that
  // happens before the target resolves, and it is translated like everything
  // else the user can read.
  const displayName = workspaceName ?? t("common.loading");
  const abbr = workspaceAbbr ?? displayName.slice(0, 2).toUpperCase();

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
      queueMicrotask(() => {
        setPhase("entering");
      });
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
  }, [show, phase, onExited]);

  if (phase === "idle") return null;

  const isExiting = phase === "exiting";
  // Reduced motion keeps the crossfade and drops the settle.
  const scale = phase === "entering" && !reducedMotion ? 0.96 : 1;

  return (
    <div
      role="status"
      aria-busy={!isExiting}
      aria-live="polite"
      aria-label={t("shell.workspaceLoader.launchingNamed", { name: displayName })}
      className={cn(
        "fixed inset-0 z-modal flex flex-col items-center justify-center bg-nx-ground",
        "transition-opacity motion-reduce:transition-none",
        isExiting
          ? "pointer-events-none opacity-0 duration-nx-standard ease-nx-exit"
          : "opacity-100 duration-nx-standard ease-nx-enter"
      )}
    >
      <div
        className="flex flex-col items-center gap-5 transition-transform duration-nx-standard ease-nx-enter motion-reduce:transition-none"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Destination badge — the single lit element on the screen */}
        <div
          aria-hidden="true"
          className="flex h-20 w-20 items-center justify-center rounded-full border border-nx-accent bg-nx-accent-wash text-2xl font-semibold tracking-tight text-nx-accent shadow-nx-glow"
        >
          {abbr}
        </div>

        <div className="flex flex-col items-center gap-1.5 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
            {t("shell.workspaceLoader.launching")}
          </span>
          <span className="text-balance text-xl font-bold leading-tight tracking-tight text-nx-ink">
            {displayName}
          </span>
        </div>

        {/* aria-hidden: the overlay above is already the live region for this
            wait, and LoadingSpinner carries its own role="status". Two nested
            status regions announce the same wait twice. */}
        <span aria-hidden="true">
          <LoadingSpinner size="sm" showText={false} className="min-h-0 py-0" />
        </span>
      </div>
    </div>
  );
}
