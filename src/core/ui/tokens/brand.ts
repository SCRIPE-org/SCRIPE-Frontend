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
    /** Deep obsidian canvas base — page background (#0B0D10) */
    base: "#0B0D10",
    /** Elevated panel background (#15181C) */
    panel: "rgba(21,24,28,0.88)",
    /** Frosted card overlay */
    card: "linear-gradient(180deg, rgba(21,24,28,.92), rgba(11,13,16,.96))",
    /** Glass surface (nav, sticky bars) */
    glass: "rgba(11,13,16,0.88)",
  },

  // ── Gradients ─────────────────────────────────────────────────────────────
  gradient: {
    /** Primary CTA button — solid Signal Lime (DESIGN.md bans gradient CTAs) */
    cta: "linear-gradient(135deg, #C6FF00 0%, #C6FF00 100%)",
    /** Plan card highlight — restrained Lime wash, not a violet fill */
    planCard: "linear-gradient(135deg, rgba(198,255,0,0.14), rgba(198,255,0,0.06))",
    /** Active step circle */
    step: "linear-gradient(180deg, #C6FF00 0%, #C6FF00 100%)",
    /** Page ambient — Evolved obsidian/carbon radial, restrained Lime light */
    page: "radial-gradient(140% 90% at 25% 25%, #1F242B 0%, #15181C 45%, #0B0D10 100%)",
    /** Text gradient on hero headings — solid (DESIGN.md bans gradient headings) */
    heroText: "linear-gradient(180deg, #F7F8F5 0%, #F7F8F5 100%)",
  },

  // ── Borders ───────────────────────────────────────────────────────────────
  border: {
    /** Subtle separator */
    subtle: "1px solid rgba(255,255,255,0.06)",
    /** Card outline */
    card: "1px solid rgba(198,255,0,.20)",
    /** Active tab / selected state */
    active: "1px solid rgba(198,255,0,0.55)",
    /** Muted inactive */
    muted: "1px solid #30363D",
    /** Input default (WCAG 1.4.11 >= 3.0:1 on #15181C / #1F242B) */
    input: "#6E7681",
    /** Input focus */
    inputFocus: "rgba(198,255,0,0.65)",
    /** Success */
    success: "1px solid rgba(97,212,154,0.45)",
    /** Destructive */
    error: "1px solid rgba(255,107,107,0.45)",
  },

  // ── Text ──────────────────────────────────────────────────────────────────
  text: {
    /** Primary on dark */
    primary: "#F7F8F5",
    /** Secondary muted */
    secondary: "#B9BDB8",
    /** Tertiary dimmed (>= 4.59:1 across all dark surfaces) */
    tertiary: "#909691",
    /** Disabled / ghost */
    ghost: "#6E7681",
    /** Brand highlight — Signal Lime, legible only on dark surfaces */
    brand: "#C6FF00",
    /** Success (unified dark AA status) */
    success: "#61D49A",
    /** Live/signal text — Signal Lime */
    cyan: "#C6FF00",
  },

  // ── Glows / Box Shadows ───────────────────────────────────────────────────
  shadow: {
    /** Card drop shadow — neutral depth only, no colour glow on a resting card */
    card: "0 25px 50px -12px rgba(11,13,16,.55)",
    /** CTA button — neutral depth, no colour glow on an ordinary button */
    cta: "0 4px 15px -3px rgba(11,13,16,0.45)",
    /** Active step — the one restrained Lime signal moment */
    step: "0 0 8px rgba(198,255,0,0.35)",
  },

  // ── Palette primitives (raw hex) — Evolved Relay vNext ────────────────────
  palette: {
    signal: "#C6FF00",
    ink: "#0B0D10",
    void: "#0B0D10",
    carbon: "#15181C",
    graphite: "#30363D",
    mineral: "#D7D8D6",
    emerald: "#126E43",
    amber: "#F59E0B",
    rose: "#FF6B6B",
  },
} as const;

export type BrandTokens = typeof BRAND_TOKENS;

// ─── Semantic Token Sets (signup wizard + full-bleed surfaces) ───────────────

export const DARK_THEME = {
  surface: "#0B0D10",
  surfaceRaised: "#15181C",
  surfaceCard: "linear-gradient(180deg, rgba(21,24,28,.92), rgba(11,13,16,.96))",
  ink: "#F7F8F5",
  inkMuted: "#B9BDB8",
  inkFaint: "#909691",
  inkGhost: "#6E7681",
  border: "#30363D",
  borderCard: "1px solid rgba(198,255,0,0.20)",
  borderActive: "1px solid rgba(198,255,0,0.55)",
  accent: "#C6FF00",
  accentDark: "#9FCC00",
  /* Lime fill always pairs with Ink foreground, never white (DESIGN.md Lime rule). */
  accentContrast: "#0B0D10",
  cyan: "#C6FF00",
  success: "#61D49A",
  error: "#FF6B6B",
  gradientPage:
    "radial-gradient(140% 90% at 25% 25%, #1F242B 0%, #15181C 45%, #0B0D10 100%)",
  gradientCta: "linear-gradient(135deg, #C6FF00 0%, #C6FF00 100%)",
  shadowCard: "0 25px 50px -12px rgba(11,13,16,.55)",
} as const;

export const LIGHT_THEME = {
  surface: "#F7F8F5",
  surfaceRaised: "#FFFFFF",
  surfaceCard: "linear-gradient(180deg, #FFFFFF, #F7F8F5)",
  ink: "#0D0D0E",
  inkMuted: "#4B504C",
  inkFaint: "#5E635E",
  inkGhost: "#767C75",
  border: "#CFD4CD",
  borderCard: "1px solid rgba(76,98,0,0.22)",
  borderActive: "1px solid rgba(76,98,0,0.55)",
  accent: "#4C6200",
  accentDark: "#3A4B00",
  /* Pairs with gradientCta (#C6FF00 Signal Lime fill -> 16.40:1). Note: components
     using tokens.accent as a solid light-mode button background must pair white. */
  accentContrast: "#0B0D10",
  cyan: "#4C6200",
  success: "#126E43",
  error: "#B4232A",
  gradientPage:
    "radial-gradient(140% 90% at 25% 25%, #F7F8F5 0%, #EEF0EB 40%, #FFFFFF 80%, #FFFFFF 100%)",
  gradientCta: "linear-gradient(135deg, #C6FF00 0%, #C6FF00 100%)",
  shadowCard: "0 4px 24px -4px rgba(13,13,14,0.12), 0 1px 3px rgba(0,0,0,0.06)",
} as const;

export type ThemeTokens = { readonly [K in keyof typeof DARK_THEME]: string };
