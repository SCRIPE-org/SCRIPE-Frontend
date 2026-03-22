/**
 * Login Branding Types — v1.0
 *
 * TypeScript interfaces for LoginBrandingJson, content blocks,
 * slot configuration, and design tokens.
 *
 * Based on: customization_system_analysis.md §10, §11, §12
 */

// ─── Login Layout (22 unique layouts) ──────────────────
export type LoginLayout =
  | "split-right"      // Branding left, form right (default)
  | "split-left"       // Branding right, form left
  | "centered"         // Animated gradient ring card, centered
  | "branded-full"     // Full-screen bg, frosted glass card
  | "minimal"          // Clean modern, dot-pattern bg, strong shadow
  | "overlay"          // True glassmorphism over bg image
  | "magazine"         // Editorial hero text, gradient fade, 60/40
  | "stacked"          // Wave SVG divider, banner top, form below
  | "sidebar-compact"  // 200px sidebar with icons + labels
  | "asymmetric"       // Diagonal clip-path, overlapping content
  | "floating"         // Floating card with gradient border + dot-grid
  | "immersive"        // Full-bleed cinematic hero, no card
  | "split-diagonal"   // Diagonal SVG clip separating brand/form
  | "carousel"         // Auto-rotating testimonials branding panel
  | "glass-morphism"   // Extreme glass: thick blur, luminous border
  | "gradient-wave"    // Animated SVG wave between sections
  | "spotlight"        // Dark bg with radial glow behind form
  | "dual-panel"       // Three zones: header + features left + form right
  | "corner-card"      // Small form bottom-right, large brand hero
  | "vertical-split"   // Top half branding, bottom half form
  | "fullscreen-form"  // Full-screen form, zero distraction
  | "mosaic";          // CSS grid mosaic bg, form card centered

// ─── Design Tokens ─────────────────────────────────────
export interface LoginDesignTokens {
  // Color tokens
  "color.background"?: string;
  "color.surface"?: string;
  "color.primary"?: string;
  "color.secondary"?: string;
  "color.accent"?: string;
  "color.text"?: string;
  "color.textMuted"?: string;
  "color.border"?: string;
  "color.error"?: string;
  "color.success"?: string;
  // Dark color tokens
  "dark.color.primary"?: string;
  "dark.color.secondary"?: string;
  "dark.color.background"?: string;
  "dark.color.surface"?: string;
  "dark.color.text"?: string;
  "dark.color.textMuted"?: string;
  "dark.color.border"?: string;
  "dark.color.error"?: string;
  "dark.color.success"?: string;
  // Typography tokens
  "font.heading"?: string;
  "font.body"?: string;
  "font.bodyAr"?: string;
  "font.size.headline"?: string;
  "font.size.subtitle"?: string;
  "font.weight.heading"?: string;
  "font.weight.body"?: string;
  "font.lineHeight"?: string;
  "font.letterSpacing"?: string;
  // Spacing / appearance tokens
  "radius.card"?: string;
  "radius.button"?: string;
  "shadow.card"?: string;
  "overlay.opacity"?: string;
  "overlay.color"?: string;
  "overlay.blur"?: string;
  "spacing.formWidth"?: string;
  "spacing.cardPadding"?: string;
  "spacing.elementGap"?: string;
  "spacing.inputHeight"?: string;
  // Background
  "bg.image"?: string;
  "bg.gradient"?: string;
  // Dark background
  "dark.bg.image"?: string;
  "dark.bg.gradient"?: string;
  "dark.overlay.opacity"?: string;
  "dark.overlay.color"?: string;
  "dark.overlay.blur"?: string;
  // Panel background (for split layouts)
  "panel.color.background"?: string;
  "panel.bg.image"?: string;
  "panel.bg.gradient"?: string;
  "panel.overlay.opacity"?: string;
  "panel.overlay.color"?: string;
  "panel.overlay.blur"?: string;
  // Allow arbitrary keys for forward compatibility
  [key: string]: string | undefined;
}

// CSS variable mapping (semantic → CSS custom property)
export const TOKEN_TO_CSS_VAR: Record<string, string> = {
  "color.background": "--login-bg",
  "color.surface": "--login-surface",
  "color.primary": "--login-primary",
  "color.secondary": "--login-secondary",
  "color.accent": "--login-accent",
  "color.text": "--login-text",
  "color.textMuted": "--login-text-muted",
  "color.border": "--login-border",
  "color.error": "--login-error",
  "color.success": "--login-success",
  "font.heading": "--login-font-heading",
  "font.body": "--login-font-body",
  "font.bodyAr": "--login-font-body-ar",
  "font.size.headline": "--login-size-headline",
  "font.size.subtitle": "--login-size-subtitle",
  "font.weight.heading": "--login-weight-heading",
  "font.weight.body": "--login-weight-body",
  "font.lineHeight": "--login-line-height",
  "font.letterSpacing": "--login-letter-spacing",
  "radius.card": "--login-radius-card",
  "radius.button": "--login-radius-button",
  "shadow.card": "--login-shadow-card",
  "overlay.opacity": "--login-overlay-opacity",
  "overlay.color": "--login-overlay-color",
  "overlay.blur": "--login-overlay-blur",
  "spacing.formWidth": "--login-form-width",
  "spacing.cardPadding": "--login-card-padding",
  "spacing.elementGap": "--login-element-gap",
  "spacing.inputHeight": "--login-input-height",
  // Dark theme background/overlay tokens
  "dark.overlay.opacity": "--login-dark-overlay-opacity",
  "dark.overlay.color": "--login-dark-overlay-color",
  "dark.overlay.blur": "--login-dark-overlay-blur",
  // Panel-specific tokens (for split layouts with independent panel bg)
  "panel.color.background": "--login-panel-bg",
  "panel.overlay.opacity": "--login-panel-overlay-opacity",
  "panel.overlay.color": "--login-panel-overlay-color",
  "panel.overlay.blur": "--login-panel-overlay-blur",
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
    ["split-right", "split-left", "centered", "branded-full", "minimal",
     "overlay", "magazine", "stacked", "sidebar-compact", "asymmetric",
     "floating", "immersive", "split-diagonal", "carousel", "glass-morphism",
     "gradient-wave", "spotlight", "dual-panel", "corner-card",
     "vertical-split", "fullscreen-form", "mosaic"].includes(layout);
}
