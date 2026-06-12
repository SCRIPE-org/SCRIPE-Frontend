/**
 * Brand Design Tokens
 *
 * Central design-token constants for the signup wizard, auth pages, and any
 * full-bleed marketing surface.  Import these instead of hard-coding colour
 * strings so that a future rebrand only touches this file.
 *
 * Usage:
 *   import { BRAND_TOKENS } from "@core/ui/tokens/brand";
 *   style={{ background: BRAND_TOKENS.gradient.cta }}
 */

export const BRAND_TOKENS = {
  // ── Background ────────────────────────────────────────────────────────────
  bg: {
    /** Deep space base — page background */
    base: "#06060E",
    /** Slightly lighter panel background */
    panel: "rgba(20,12,46,0.78)",
    /** Frosted card overlay */
    card: "linear-gradient(180deg, rgba(20,12,46,.78), rgba(10,8,28,.85))",
    /** Glass surface (nav, sticky bars) */
    glass: "rgba(6,6,14,0.85)",
  },

  // ── Gradients ─────────────────────────────────────────────────────────────
  gradient: {
    /** Primary CTA button */
    cta: "linear-gradient(135deg, #A855F7 0%, #7C3AED 50%, #6366F1 100%)",
    /** Plan card highlight */
    planCard: "linear-gradient(135deg, rgba(168,85,247,0.25), rgba(124,58,237,0.18))",
    /** Active step circle / completed step */
    step: "linear-gradient(180deg, #A855F7 0%, #7C3AED 100%)",
    /** Page ambient — radial for full-bleed pages */
    page: "radial-gradient(140% 90% at 25% 25%, #1A1140 0%, #0A0820 40%, #06060E 80%, #04040A 100%)",
    /** Text gradient on hero headings */
    heroText: "linear-gradient(180deg, #F5F2FF 0%, #C7B8F0 100%)",
  },

  // ── Borders ───────────────────────────────────────────────────────────────
  border: {
    /** Subtle separator */
    subtle: "1px solid rgba(255,255,255,0.04)",
    /** Card outline */
    card: "1px solid rgba(168,85,247,.22)",
    /** Active tab / selected state */
    active: "1px solid rgba(168,85,247,0.5)",
    /** Muted inactive */
    muted: "1px solid rgba(255,255,255,0.07)",
    /** Input default */
    input: "rgba(255,255,255,0.08)",
    /** Input focus */
    inputFocus: "rgba(168,85,247,0.5)",
    /** Success */
    success: "1px solid rgba(34,197,94,0.4)",
    /** Destructive */
    error: "1px solid rgba(239,68,68,0.4)",
  },

  // ── Text ──────────────────────────────────────────────────────────────────
  text: {
    /** Primary on dark */
    primary: "rgba(245,242,255,0.95)",
    /** Secondary muted */
    secondary: "rgba(245,242,255,0.62)",
    /** Tertiary dimmed */
    tertiary: "rgba(245,242,255,0.4)",
    /** Disabled / ghost */
    ghost: "rgba(245,242,255,0.25)",
    /** Brand violet highlight */
    brand: "#C4B5FD",
    /** Success */
    success: "#22c55e",
    /** Accent cyan */
    cyan: "#22D3EE",
  },

  // ── Glows / Box Shadows ───────────────────────────────────────────────────
  shadow: {
    /** Card drop shadow */
    card: "0 25px 50px -12px rgba(0,0,0,.5), 0 0 80px -20px rgba(168,85,247,.15)",
    /** CTA button glow */
    cta: "0 4px 15px -3px rgba(124,58,237,0.4)",
    /** Active step glow */
    step: "0 0 12px rgba(168,85,247,0.4)",
  },

  // ── Palette primitives (raw HSL / hex) ────────────────────────────────────
  palette: {
    violet: "#A855F7",
    violetDark: "#7C3AED",
    indigo: "#6366F1",
    cyan: "#22D3EE",
    emerald: "#10b981",
    amber: "#eab308",
    rose: "#ef4444",
  },
} as const;

export type BrandTokens = typeof BRAND_TOKENS;
