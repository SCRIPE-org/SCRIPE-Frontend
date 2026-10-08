"use client";

/**
 * NexusTransitionOverlay
 *
 * Full-screen veil that crossfades when the active workspace changes: the old
 * workspace fades under a flat sheet of the shell's own ground, and the new
 * one fades back out from under it. Opacity is the ONLY animated property.
 *
 * WAVE I1 — WHAT THIS REPLACED, AND WHY. This used to paint a radial-gradient
 * sweep of the workspace accent from the reading-direction start edge, which
 * expanded across the viewport and faded. The product owner reported it
 * directly: "when press on the logo or change the workspace there's pulse
 * color go out and disappear — I don't want it". Radiating colour is exactly
 * the "glow wallpaper" the brand law forbids; light is supposed to collect on
 * the ACTIVE thing, not spray out of a transition. So:
 *
 *   - no gradient, no origin, no direction — a FLAT sheet, nothing expands;
 *   - no accent colour — the veil is --nx-ground, so no hue flashes and
 *     disappears. The workspace's colour change is now communicated properly,
 *     by the accent itself interpolating: globals.css registers
 *     --workspace-hue / --workspace-chroma with @property so every accented
 *     surface sweeps to the new hue instead of snapping;
 *   - no backdrop-filter — a full-viewport blur was the single most expensive
 *     thing in the sequence and it is a visual effect, not motion.
 *
 * The veil peaks at a partial opacity rather than covering outright: enough to
 * hide the swap, not so much that the user stares at a blank screen.
 *
 * Reduced motion keeps the crossfade — opacity is a crossfade, which the nexus
 * motion rules explicitly preserve — and simply shortens it.
 *
 * Usage: Mount once inside NexusLayout, adjacent to the workspace content.
 * The overlay is completely transparent (pointer-events: none) when inactive.
 */

import React, { useEffect, useRef, useState } from "react";
import { useWorkspace } from "@core/providers/workspace-provider";
import { cn } from "@core/common/utils";

type Phase = "idle" | "entering" | "holding" | "exiting";

// ~200ms in, a beat, ~200ms out — the whole thing is under half a second and
// symmetrical, which is what makes a crossfade read as calm rather than as a
// flash. Kept in sync with duration-nx-standard (--nx-t-standard, 200ms).
const ENTER_MS = 200;
const HOLD_MS = 60;
const EXIT_MS = 200;
// Reduced motion still crossfades, just faster. 140ms == --nx-t-micro, so the
// JS sequence and the CSS `duration-nx-micro` stay in lockstep.
const REDUCED_MS = 140;

/**
 * Peak veil opacity. A partial veil, not a blackout: enough to cover the
 * content swap, little enough that the user never faces a blank screen.
 */
const VEIL_OPACITY_CLASS = "opacity-60";

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
  const reducedMotion = useNexusReducedMotion();

  // Mirrored into a ref so the workspace effect can read the preference
  // without listing it as a dependency: it can flip mid-session, and that must
  // never re-trigger a transition. Synced in an effect, not during render.
  const reducedRef = useRef(reducedMotion);
  useEffect(() => {
    reducedRef.current = reducedMotion;
  }, [reducedMotion]);

  const prevKeyRef = useRef<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  // Opacity is driven by its own flag rather than by `phase` so the veil
  // MOUNTS transparent and is lit on a later frame. Without that the element's
  // first render already carries its peak opacity, no transition ever runs on
  // the way in, and only the fade-OUT is visible — which is precisely what
  // "color go out and disappear" described about the old sweep.
  const [lit, setLit] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  // Clear any pending timer / frame on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
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

    // ── Crossfade sequence: enter → hold → exit → idle ──
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    const enterMs = reducedRef.current ? REDUCED_MS : ENTER_MS;
    const exitMs = reducedRef.current ? REDUCED_MS : EXIT_MS;

    queueMicrotask(() => {
      setPhase("entering");
      setLit(false);
    });
    // Two frames: the first commits the transparent mount, the second is the
    // one the browser can actually transition from.
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        setLit(true);
      });
    });

    timerRef.current = setTimeout(() => {
      setPhase("holding");

      timerRef.current = setTimeout(() => {
        setPhase("exiting");
        setLit(false);

        timerRef.current = setTimeout(() => {
          setPhase("idle");
        }, exitMs);
      }, HOLD_MS);
    }, enterMs);
  }, [activeWorkspace]);

  if (phase === "idle") return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        // z-toast: the veil is transient and non-interactive, and has to paint
        // above the z-modal workspace loader while it runs.
        "pointer-events-none fixed inset-0 z-toast",
        // Flat fill from the bridge. No gradient, no origin, no
        // reading-direction mirror — there is no longer anything directional
        // to mirror.
        "bg-nx-ground",
        // Opacity is the only animated property — no transform, no filter, no
        // gradient position. Nothing expands, so nothing radiates. There is
        // deliberately no motion-reduce:transition-none here: a crossfade is
        // the one movement reduced motion keeps, so the preference shortens
        // the dip (below) instead of snapping the veil on and off.
        "transition-opacity",
        lit ? VEIL_OPACITY_CLASS : "opacity-0",
        // Ease-OUT in both directions. The exit curve (ease-nx-exit) is an
        // ease-IN: it holds the veil then drops it, which is the "flash" shape
        // we are removing. A symmetrical ease-out reads as a calm dip.
        reducedMotion ? "duration-nx-micro ease-nx-enter" : "duration-nx-standard ease-nx-enter"
      )}
    />
  );
}
