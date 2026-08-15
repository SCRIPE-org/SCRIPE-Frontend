/**
 * Brand Design Tokens
 *
 * Central design-token constants for the signup wizard, auth pages, and any
 * full-bleed marketing surface.  Import these instead of hard-coding colour
 * strings so that a future rebrand only touches this file.
 *
 * SCRIPE Relay vNext — Signal Lime / Ink / Void / Carbon / Graphite / Mineral.
 * A Lime FILL always pairs with an Ink foreground, never white — see
 * `accentContrast` below. Gradient-shaped values below render as flat single
 * colours (`linear-gradient(x, C 0%, C 100%)`) rather than being deleted, so
 * every existing `style={{ background: tokens.gradient.x }}` consumer keeps
 * working with zero edits while the visible gradient/glow is retired.
 *
 * Usage:
 *   import { BRAND_TOKENS } from "@core/ui/tokens/brand";
 *   style={{ background: BRAND_TOKENS.gradient.cta }}
 */

export const BRAND_TOKENS = {
  // ── Background ────────────────────────────────────────────────────────────
  bg: {
    /** Deep space base — page background */
    base: "#050506",
    /** Slightly lighter panel background */
    panel: "rgba(21,23,25,0.86)",
    /** Frosted card overlay */
    card: "linear-gradient(180deg, rgba(21,23,25,.86), rgba(13,13,14,.92))",
    /** Glass surface (nav, sticky bars) */
    glass: "rgba(13,13,14,0.85)",
  },

  // ── Gradients ─────────────────────────────────────────────────────────────
  gradient: {
    /** Primary CTA button — solid Signal Lime (DESIGN.md bans gradient CTAs) */
    cta: "linear-gradient(135deg, #C6FF00 0%, #C6FF00 100%)",
    /** Plan card highlight — restrained Lime wash, not a violet fill */
    planCard: "linear-gradient(135deg, rgba(198,255,0,0.12), rgba(198,255,0,0.05))",
    /** Active step circle */
    step: "linear-gradient(180deg, #C6FF00 0%, #C6FF00 100%)",
    /** Page ambient — Void/Ink radial, restrained Lime light (no purple) */
    page: "radial-gradient(140% 90% at 25% 25%, #151719 0%, #0D0D0E 40%, #050506 80%, #030304 100%)",
    /** Text gradient on hero headings — solid (DESIGN.md bans gradient headings) */
    heroText: "linear-gradient(180deg, #F7F8F5 0%, #F7F8F5 100%)",
  },

  // ── Borders ───────────────────────────────────────────────────────────────
  border: {
    /** Subtle separator */
    subtle: "1px solid rgba(255,255,255,0.04)",
    /** Card outline */
    card: "1px solid rgba(198,255,0,.18)",
    /** Active tab / selected state */
    active: "1px solid rgba(198,255,0,0.5)",
    /** Muted inactive */
    muted: "1px solid rgba(255,255,255,0.07)",
    /** Input default */
    input: "rgba(255,255,255,0.08)",
    /** Input focus */
    inputFocus: "rgba(198,255,0,0.5)",
    /** Success */
    success: "1px solid rgba(34,197,94,0.4)",
    /** Destructive */
    error: "1px solid rgba(239,68,68,0.4)",
  },

  // ── Text ──────────────────────────────────────────────────────────────────
  text: {
    /** Primary on dark */
    primary: "rgba(247,248,245,0.95)",
    /** Secondary muted */
    secondary: "rgba(247,248,245,0.62)",
    /** Tertiary dimmed */
    tertiary: "rgba(247,248,245,0.4)",
    /** Disabled / ghost */
    ghost: "rgba(247,248,245,0.25)",
    /** Brand highlight — Signal Lime, legible only on dark surfaces */
    brand: "#C6FF00",
    /** Success */
    success: "#22c55e",
    /** Live/signal text — was the retired cyan identity, now Signal Lime */
    cyan: "#C6FF00",
  },

  // ── Glows / Box Shadows ───────────────────────────────────────────────────
  shadow: {
    /** Card drop shadow — neutral depth only, no colour glow on a resting card */
    card: "0 25px 50px -12px rgba(13,13,14,.5)",
    /** CTA button — neutral depth, no colour glow on an ordinary button */
    cta: "0 4px 15px -3px rgba(13,13,14,0.4)",
    /** Active step — the one restrained Lime signal moment */
    step: "0 0 8px rgba(198,255,0,0.35)",
  },

  // ── Palette primitives (raw hex) — Relay vNext ────────────────────────────
  palette: {
    signal: "#C6FF00",
    ink: "#0D0D0E",
    void: "#050506",
    carbon: "#151719",
    graphite: "#3F4347",
    mineral: "#D7D8D6",
    emerald: "#10b981",
    amber: "#eab308",
    rose: "#ef4444",
  },
} as const;

export type BrandTokens = typeof BRAND_TOKENS;

// ─── Semantic Token Sets (signup wizard + full-bleed surfaces) ───────────────

export const DARK_THEME = {
  surface: "#050506",
  surfaceRaised: "rgba(21,23,25,0.86)",
  surfaceCard: "linear-gradient(180deg, rgba(21,23,25,.86), rgba(13,13,14,.92))",
  ink: "rgba(247,248,245,0.95)",
  inkMuted: "rgba(247,248,245,0.62)",
  inkFaint: "rgba(247,248,245,0.4)",
  inkGhost: "rgba(247,248,245,0.25)",
  border: "rgba(255,255,255,0.04)",
  borderCard: "1px solid rgba(198,255,0,0.18)",
  borderActive: "1px solid rgba(198,255,0,0.5)",
  accent: "#C6FF00",
  accentDark: "#9FCC00",
  /* Lime fill always pairs with Ink foreground, never white (DESIGN.md Lime rule). */
  accentContrast: "#0D0D0E",
  cyan: "#C6FF00",
  success: "#22c55e",
  error: "#ef4444",
  gradientPage:
    "radial-gradient(140% 90% at 25% 25%, #151719 0%, #0D0D0E 40%, #050506 80%, #030304 100%)",
  gradientCta: "linear-gradient(135deg, #C6FF00 0%, #C6FF00 100%)",
  shadowCard: "0 25px 50px -12px rgba(13,13,14,.5)",
} as const;

export const LIGHT_THEME = {
  surface: "#F7F8F5",
  surfaceRaised: "#FFFFFF",
  surfaceCard: "linear-gradient(180deg, #FFFFFF, #F7F8F5)",
  ink: "#0D0D0E",
  inkMuted: "#4B504C",
  inkFaint: "#6F756F",
  inkGhost: "#AEB4AD",
  border: "rgba(76,98,0,0.08)",
  borderCard: "1px solid rgba(76,98,0,0.18)",
  borderActive: "1px solid rgba(76,98,0,0.5)",
  accent: "#4C6200",
  accentDark: "#3A4B00",
  /* Same Lime-fill/Ink-foreground pairing as dark — accentContrast never flips to white. */
  accentContrast: "#0D0D0E",
  cyan: "#4C6200",
  success: "#15803d",
  error: "#b91c1c",
  gradientPage:
    "radial-gradient(140% 90% at 25% 25%, #F7F8F5 0%, #EEF0EB 40%, #FFFFFF 80%, #FFFFFF 100%)",
  gradientCta: "linear-gradient(135deg, #C6FF00 0%, #C6FF00 100%)",
  shadowCard: "0 4px 24px -4px rgba(13,13,14,0.12), 0 1px 3px rgba(0,0,0,0.06)",
} as const;

export type ThemeTokens = { readonly [K in keyof typeof DARK_THEME]: string };
