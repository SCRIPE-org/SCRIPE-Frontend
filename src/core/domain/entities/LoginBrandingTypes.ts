/**
 * Login Branding Types — v1.0
 *
 * TypeScript interfaces for LoginBrandingJson, content blocks,
 * slot configuration, and design tokens.
 *
 * Based on: customization_system_analysis.md §10, §11, §12
 */

// ─── Login Layout (23 unique layouts) ──────────────────
export type LoginLayout =
  | "vault" // Cinematic split: ambient hero left, glass card right (Scripe default)
  | "split-right" // Branding left, form right (default)
  | "split-left" // Branding right, form left
  | "centered" // Animated gradient ring card, centered
  | "branded-full" // Full-screen bg, frosted glass card
  | "minimal" // Clean modern, dot-pattern bg, strong shadow
  | "overlay" // True glassmorphism over bg image
  | "magazine" // Editorial hero text, gradient fade, 60/40
  | "stacked" // Wave SVG divider, banner top, form below
  | "sidebar-compact" // 200px sidebar with icons + labels
  | "asymmetric" // Diagonal clip-path, overlapping content
  | "floating" // Floating card with gradient border + dot-grid
  | "immersive" // Full-bleed cinematic hero, no card
  | "split-diagonal" // Diagonal SVG clip separating brand/form
  | "carousel" // Auto-rotating testimonials branding panel
  | "glass-morphism" // Extreme glass: thick blur, luminous border
  | "gradient-wave" // Animated SVG wave between sections
  | "spotlight" // Dark bg with radial glow behind form
  | "dual-panel" // Three zones: header + features left + form right
  | "corner-card" // Small form bottom-right, large brand hero
  | "vertical-split" // Top half branding, bottom half form
  | "fullscreen-form" // Full-screen form, zero distraction
  | "mosaic"; // CSS grid mosaic bg, form card centered

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

// ─── Common Block Props (shared by all blocks) ────────
export type BlockAnimation =
  | "none"
  | "fade-in"
  | "slide-up"
  | "slide-left"
  | "slide-right"
  | "scale-in"
  | "bounce";
export type BlockPadding = "none" | "sm" | "md" | "lg";
export type BlockMargin = "none" | "sm" | "md" | "lg";

export interface BaseBlockProps {
  visible?: boolean; // default true — hide without deleting
  animation?: BlockAnimation;
  padding?: BlockPadding;
  marginBottom?: BlockMargin;
}

// ─── Block Type Union (21 types) ───────────────────────
export type BlockType =
  | "text"
  | "image"
  | "featureList"
  | "testimonial"
  | "ctaButton"
  | "divider"
  | "heading"
  | "badge"
  | "spacer"
  | "alert"
  | "statsRow"
  | "socialLinks"
  | "logoCloud"
  | "rating"
  | "iconRow"
  | "video"
  | "countdown"
  | "accordion"
  | "progressSteps"
  | "avatarStack"
  | "gradientText";

// ═══════════════════════════════════════════════════════
// EXISTING BLOCKS (Enhanced)
// ═══════════════════════════════════════════════════════

export interface TextBlock {
  type: "text";
  props: BaseBlockProps & {
    content: string; // max 500 chars
    alignment?: "left" | "center" | "right";
    fontSize?: "sm" | "base" | "lg" | "xl" | "2xl";
    fontWeight?: "normal" | "medium" | "semibold" | "bold";
    color?: string; // "auto" | "primary" | "muted" | hex
    textTransform?: "none" | "uppercase" | "capitalize";
    maxWidth?: string;
    lineClamp?: number; // 0=off, 1-5
    highlight?: boolean; // background highlight
  };
}

export interface ImageBlock {
  type: "image";
  props: BaseBlockProps & {
    src: string;
    alt: string;
    maxWidth?: string;
    borderRadius?: number; // 0-32px
    maxHeight?: number; // px
    objectFit?: "cover" | "contain" | "fill" | "none";
    linkUrl?: string; // clickable wrapper
    caption?: string;
    shadow?: "none" | "sm" | "md" | "lg" | "xl";
    hoverEffect?: "none" | "zoom" | "brightness" | "grayscale";
    aspectRatio?: "auto" | "1:1" | "16:9" | "4:3";
  };
}

export interface FeatureListBlock {
  type: "featureList";
  props: BaseBlockProps & {
    items: Array<{ icon: string; title: string; description: string }>; // max 6
    columns?: 1 | 2 | 3;
    iconSize?: "sm" | "md" | "lg";
    iconColor?: string; // "auto" | "primary" | hex
    titleColor?: string;
    compactMode?: boolean;
    numberedMode?: boolean;
  };
}

export interface TestimonialBlock {
  type: "testimonial";
  props: BaseBlockProps & {
    quote: string;
    author: string;
    role?: string;
    avatar?: string;
    displayStyle?: "card" | "bubble" | "minimal" | "large-quote";
    rating?: number; // 0-5
    companyName?: string;
    companyLogo?: string;
    borderColor?: string;
  };
}

export interface CtaButtonBlock {
  type: "ctaButton";
  props: BaseBlockProps & {
    label: string;
    url: string;
    variant?: "default" | "outline" | "ghost";
    size?: "sm" | "md" | "lg" | "xl";
    fullWidth?: boolean;
    color?: string; // "primary" | "secondary" | "success" | hex
    icon?: string; // emoji/text before label
    borderRadius?: number;
    shadow?: boolean;
    secondaryText?: string; // small text below button
  };
}

export interface DividerBlock {
  type: "divider";
  props: BaseBlockProps & {
    style?: "line" | "space" | "dots";
    color?: string; // "auto" | "primary" | hex
    thickness?: number; // 1-5px
    width?: number; // 25-100%
    lineStyle?: "solid" | "dashed" | "dotted" | "double";
    label?: string; // text in middle of line
    labelBg?: string;
  };
}

// ═══════════════════════════════════════════════════════
// NEW BLOCKS (15 types)
// ═══════════════════════════════════════════════════════

export interface HeadingBlock {
  type: "heading";
  props: BaseBlockProps & {
    text: string; // max 200 chars
    level: "h2" | "h3" | "h4";
    alignment?: "left" | "center" | "right";
    color?: string;
    underlineAccent?: "none" | "primary" | "gradient";
    textTransform?: "none" | "uppercase" | "capitalize";
  };
}

export interface BadgeBlock {
  type: "badge";
  props: BaseBlockProps & {
    label: string; // max 50 chars
    variant: "success" | "warning" | "info" | "neutral" | "premium";
    icon?: string; // emoji
    size?: "sm" | "md";
    pill?: boolean; // rounded-full vs rounded-md
  };
}

export interface SpacerBlock {
  type: "spacer";
  props: BaseBlockProps & {
    height: number; // 8-80px
    responsiveHalve?: boolean; // halve on mobile
  };
}

export interface AlertBlock {
  type: "alert";
  props: BaseBlockProps & {
    title?: string;
    message: string; // max 300 chars
    variant: "info" | "warning" | "success" | "error";
    showIcon?: boolean;
    compact?: boolean;
  };
}

export interface StatsRowBlock {
  type: "statsRow";
  props: BaseBlockProps & {
    items: Array<{ value: string; label: string; icon?: string }>; // max 4
    layout?: "row" | "grid";
    size?: "sm" | "md" | "lg";
  };
}

export interface SocialLinksBlock {
  type: "socialLinks";
  props: BaseBlockProps & {
    items: Array<{ platform: string; url: string }>; // max 8
    style?: "icons-only" | "with-labels" | "colored-bg";
    size?: "sm" | "md" | "lg";
  };
}

export interface LogoCloudBlock {
  type: "logoCloud";
  props: BaseBlockProps & {
    items: Array<{ src: string; alt: string; url?: string }>; // max 8
    grayscale?: boolean;
    size?: "sm" | "md" | "lg";
    columns?: "auto" | 3 | 4;
  };
}

export interface RatingBlock {
  type: "rating";
  props: BaseBlockProps & {
    value: number; // 1-5 (0.5 steps)
    label?: string; // max 100 chars
    style?: "stars" | "hearts" | "number-badge";
    size?: "sm" | "md" | "lg";
    color?: string;
  };
}

export interface IconRowBlock {
  type: "iconRow";
  props: BaseBlockProps & {
    items: Array<{ icon: string; label?: string; url?: string }>; // max 6
    gap?: "sm" | "md" | "lg";
    iconSize?: "sm" | "md" | "lg";
    showLabels?: boolean;
  };
}

export interface VideoBlock {
  type: "video";
  props: BaseBlockProps & {
    url: string; // YouTube/Vimeo only
    thumbnailUrl?: string; // optional override
    aspectRatio?: "16:9" | "4:3";
    playButtonStyle?: "centered" | "corner";
    overlayText?: string;
  };
}

export interface CountdownBlock {
  type: "countdown";
  props: BaseBlockProps & {
    targetDate: string; // ISO date string
    label?: string;
    expiredText?: string;
    style?: "flip" | "simple" | "minimal";
    showLabels?: boolean; // days/hrs/min/sec labels
  };
}

export interface AccordionBlock {
  type: "accordion";
  props: BaseBlockProps & {
    items: Array<{ title: string; content: string }>; // max 5
    allowMultiple?: boolean;
    style?: "bordered" | "ghost" | "card";
    iconPosition?: "left" | "right";
  };
}

export interface ProgressStepsBlock {
  type: "progressSteps";
  props: BaseBlockProps & {
    items: Array<{ label: string; description?: string }>; // max 5
    activeStep?: number;
    style?: "horizontal" | "vertical";
    connector?: "line" | "dots" | "arrow";
  };
}

export interface AvatarStackBlock {
  type: "avatarStack";
  props: BaseBlockProps & {
    avatarUrls: string[]; // max 5 URLs
    totalCount?: string; // e.g. "1,200+"
    label?: string;
    size?: "sm" | "md" | "lg";
  };
}

export interface GradientTextBlock {
  type: "gradientText";
  props: BaseBlockProps & {
    text: string; // max 200 chars
    fromColor: string;
    toColor: string;
    direction?: "left-right" | "top-bottom" | "diagonal";
    fontSize?: "lg" | "xl" | "2xl" | "3xl" | "4xl";
    fontWeight?: "semibold" | "bold" | "extrabold";
    alignment?: "left" | "center" | "right";
  };
}

// ─── ContentBlock Union ────────────────────────────────
export type ContentBlock =
  | TextBlock
  | ImageBlock
  | FeatureListBlock
  | TestimonialBlock
  | CtaButtonBlock
  | DividerBlock
  | HeadingBlock
  | BadgeBlock
  | SpacerBlock
  | AlertBlock
  | StatsRowBlock
  | SocialLinksBlock
  | LogoCloudBlock
  | RatingBlock
  | IconRowBlock
  | VideoBlock
  | CountdownBlock
  | AccordionBlock
  | ProgressStepsBlock
  | AvatarStackBlock
  | GradientTextBlock;

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

// ─── Video URL Validation (YouTube/Vimeo only) ─────────
const VIDEO_HOST_WHITELIST = [
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "vimeo.com",
  "www.vimeo.com",
  "player.vimeo.com",
];

export function isValidVideoUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== "https:") return false;
    return VIDEO_HOST_WHITELIST.some(
      (h) => parsed.hostname === h || parsed.hostname.endsWith("." + h)
    );
  } catch {
    return false;
  }
}

// ─── Safe JSON Parser ──────────────────────────────────
export function parseLoginBrandingJson(json: string | null | undefined): LoginBrandingConfig {
  const DEFAULT: LoginBrandingConfig = {
    _schemaVersion: 1,
    layout: "vault",
    tokens: {},
  };
  if (!json) return DEFAULT;
  try {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object") return DEFAULT;
    return {
      _schemaVersion: parsed._schemaVersion ?? 1,
      layout: isValidLayout(parsed.layout) ? parsed.layout : "vault",
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
  return (
    typeof layout === "string" &&
    [
      "vault",
      "split-right",
      "split-left",
      "centered",
      "branded-full",
      "minimal",
      "overlay",
      "magazine",
      "stacked",
      "sidebar-compact",
      "asymmetric",
      "floating",
      "immersive",
      "split-diagonal",
      "carousel",
      "glass-morphism",
      "gradient-wave",
      "spotlight",
      "dual-panel",
      "corner-card",
      "vertical-split",
      "fullscreen-form",
      "mosaic",
    ].includes(layout)
  );
}
