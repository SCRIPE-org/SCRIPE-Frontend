/**
 * Login Branding Types — v1.0
 *
 * TypeScript interfaces for LoginBrandingJson, content blocks,
 * slot configuration, and design tokens.
 *
 * Based on: customization_system_analysis.md §10, §11, §12
 */

// ─── Login Layout ──────────────────────────────────────
export type LoginLayout =
  | "split-right"   // Branding left, form right (default)
  | "split-left"    // Branding right, form left
  | "centered"      // Full-width, form centered with branding above
  | "branded-full"  // Full-screen branding bg, form card overlay
  | "minimal";      // No branding panel, clean centered form

// ─── Design Tokens ─────────────────────────────────────
export interface LoginDesignTokens {
  // Color tokens
  "color.background"?: string;
  "color.surface"?: string;
  "color.primary"?: string;
  "color.accent"?: string;
  "color.text"?: string;
  "color.textMuted"?: string;
  // Typography tokens
  "font.heading"?: string;
  "font.body"?: string;
  "font.size.headline"?: string;
  "font.size.subtitle"?: string;
  // Spacing / appearance tokens
  "radius.card"?: string;
  "radius.button"?: string;
  "shadow.card"?: string;
  "overlay.opacity"?: string; // For branded-full layout bg overlay (min 0.4 per §27)
  // Background
  "bg.image"?: string;
  "bg.gradient"?: string;
}

// CSS variable mapping (semantic → CSS custom property)
export const TOKEN_TO_CSS_VAR: Record<string, string> = {
  "color.background": "--login-bg",
  "color.surface": "--login-surface",
  "color.primary": "--login-primary",
  "color.accent": "--login-accent",
  "color.text": "--login-text",
  "color.textMuted": "--login-text-muted",
  "font.heading": "--login-font-heading",
  "font.body": "--login-font-body",
  "font.size.headline": "--login-size-headline",
  "font.size.subtitle": "--login-size-subtitle",
  "radius.card": "--login-radius-card",
  "radius.button": "--login-radius-button",
  "shadow.card": "--login-shadow-card",
  "overlay.opacity": "--login-overlay-opacity",
};

// ─── Content Blocks (§12) ──────────────────────────────
export type BlockType = "text" | "image" | "featureList" | "testimonial" | "ctaButton" | "divider";

export interface TextBlock {
  type: "text";
  props: { content: string }; // max 500 chars, plain text, no HTML
}

export interface ImageBlock {
  type: "image";
  props: { src: string; alt: string; maxWidth?: string };
}

export interface FeatureListBlock {
  type: "featureList";
  props: { items: Array<{ icon: string; title: string; description: string }> }; // max 6 items
}

export interface TestimonialBlock {
  type: "testimonial";
  props: { quote: string; author: string; role?: string; avatar?: string };
}

export interface CtaButtonBlock {
  type: "ctaButton";
  props: { label: string; url: string; variant?: "default" | "outline" | "ghost" };
}

export interface DividerBlock {
  type: "divider";
  props: { style?: "line" | "space" | "dots" };
}

export type ContentBlock =
  | TextBlock
  | ImageBlock
  | FeatureListBlock
  | TestimonialBlock
  | CtaButtonBlock
  | DividerBlock;

// ─── v1 Login Slots (§11) ──────────────────────────────
export type LoginSlotId =
  | "login.sidebar.top"
  | "login.sidebar.content"
  | "login.sidebar.bottom"
  | "login.form.above"
  | "login.form.below"
  | "login.footer";

export interface SlotConfig {
  _schemaVersion: number;
  slots: Partial<Record<LoginSlotId, ContentBlock[]>>;
}

// ─── LoginBrandingJson Root ────────────────────────────
export interface LoginBrandingConfig {
  _schemaVersion: number;
  layout: LoginLayout;
  tokens: Partial<LoginDesignTokens>;
  // Slots are in SlotConfigJson (separate blob on TenantSettings)
}

// ─── CTA URL Validation (§19 — Threat #4) ──────────────
const BLOCKED_PROTOCOLS = ["javascript:", "data:", "blob:", "vbscript:"];

export function isValidCtaUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  // Must start with https:// or /
  if (trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    // Reject if any blocked protocol is embedded (double encoding attacks)
    return !BLOCKED_PROTOCOLS.some((p) => trimmed.includes(p));
  }
  return false;
}

// ─── Safe JSON Parser ──────────────────────────────────
export function parseLoginBrandingJson(json: string | null | undefined): LoginBrandingConfig {
  const DEFAULT: LoginBrandingConfig = {
    _schemaVersion: 1,
    layout: "split-right",
    tokens: {},
  };
  if (!json) return DEFAULT;
  try {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object") return DEFAULT;
    return {
      _schemaVersion: parsed._schemaVersion ?? 1,
      layout: isValidLayout(parsed.layout) ? parsed.layout : "split-right",
      tokens: parsed.tokens && typeof parsed.tokens === "object" ? parsed.tokens : {},
    };
  } catch {
    return DEFAULT;
  }
}

export function parseSlotConfig(json: string | null | undefined): SlotConfig {
  const DEFAULT: SlotConfig = { _schemaVersion: 1, slots: {} };
  if (!json) return DEFAULT;
  try {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object") return DEFAULT;
    return {
      _schemaVersion: parsed._schemaVersion ?? 1,
      slots: parsed.slots && typeof parsed.slots === "object" ? parsed.slots : {},
    };
  } catch {
    return DEFAULT;
  }
}

function isValidLayout(layout: unknown): layout is LoginLayout {
  return typeof layout === "string" &&
    ["split-right", "split-left", "centered", "branded-full", "minimal"].includes(layout);
}
