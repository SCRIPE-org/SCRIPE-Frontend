/**
 * useLoginBrandingTokens — CSS Token Injection for Login Page
 *
 * Parses LoginBrandingJson, injects CSS custom properties via
 * <style> tags (NOT inline styles — so .dark {} can properly override :root {}).
 *
 * If isSafeMode is true, ALL customization is bypassed (§16, §29).
 * Login pages are server-authoritative — no client cache trust (§20).
 *
 * CRITICAL FIX: Previously set light CSS vars as inline styles on <html>
 * which has higher specificity than ANY CSS rule. This meant .dark {}
 * could NEVER override the light values. Now ALL vars are in a <style>
 * tag so :root {} and .dark {} have correct cascading behavior.
 */
"use client";

import { useEffect, useMemo } from "react";
import {
  parseLoginBrandingJson,
  parseSlotConfig,
  TOKEN_TO_CSS_VAR,
  type LoginBrandingConfig,
  type SlotConfig,
  type LoginLayout,
} from "@modules/auth/core/domain/entities/LoginBrandingTypes";

// ─── Accessibility config parsed from tokens ───
export interface AccessibilityConfig {
  // Focus & Keyboard
  focusRingEnabled: boolean;
  focusRingColor: string;
  focusRingWidth: number;
  focusRingStyle: string;
  skipLinkEnabled: boolean;
  highlightFocus: boolean;
  // Screen Reader
  ariaLandmarks: boolean;
  formLabelsVisible: boolean;
  errorAnnounce: boolean;
  pageTitle: string;
  // Contrast & Colors
  highContrastMode: boolean;
  contrastPreset: string;
  saturation: number;
  highlightLinks: boolean;
  // Typography & Readability
  minFontSize: number;
  contentScaling: number;
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  dyslexicFont: boolean;
  textAlign: string;
  // Cursor & Reading Aids
  cursorSize: string;
  readingGuide: boolean;
  readingMask: boolean;
  // Motion & Animation
  reducedMotion: string;
  animationDuration: number;
  autoplayDisabled: boolean;
  pauseAnimations: boolean;
  // Content & Media
  hideImages: boolean;
  tooltips: boolean;
  // Touch & Target Size
  largeTargets: boolean;
  forcedColorsSupport: boolean;
}

interface LoginBrandingTokensResult {
  layout: LoginLayout;
  config: LoginBrandingConfig;
  slotConfig: SlotConfig;
  a11y: AccessibilityConfig;
}

interface LoginBrandingTokensInput {
  loginBrandingJson: string | null | undefined;
  slotConfigJson: string | null | undefined;
  isSafeMode: boolean;
}

// ─── Parse a11y config from tokens (safe defaults) ───
function parseA11yConfig(tokens: Record<string, string | undefined>): AccessibilityConfig {
  return {
    // Focus & Keyboard
    focusRingEnabled: tokens["a11y.focusRing.enabled"] !== "false",
    focusRingColor: tokens["a11y.focusRing.color"] || "",
    focusRingWidth: parseInt(tokens["a11y.focusRing.width"] || "3"),
    focusRingStyle: tokens["a11y.focusRing.style"] || "solid",
    skipLinkEnabled: tokens["a11y.skipLink.enabled"] !== "false",
    highlightFocus: tokens["a11y.highlightFocus"] === "true",
    // Screen Reader
    ariaLandmarks: tokens["a11y.ariaLandmarks"] !== "false",
    formLabelsVisible: tokens["a11y.formLabels.visible"] !== "false",
    errorAnnounce: tokens["a11y.errorAnnounce"] !== "false",
    pageTitle: tokens["a11y.pageTitle"] || "",
    // Contrast & Colors
    highContrastMode: tokens["a11y.highContrast"] === "true",
    contrastPreset: tokens["a11y.contrastPreset"] || "normal",
    saturation: parseInt(tokens["a11y.saturation"] || "100"),
    highlightLinks: tokens["a11y.highlightLinks"] === "true",
    // Typography & Readability
    minFontSize: parseInt(tokens["a11y.minFontSize"] || "14"),
    contentScaling: parseInt(tokens["a11y.contentScaling"] || "100"),
    lineHeight: parseFloat(tokens["a11y.lineHeight"] || "0"),
    letterSpacing: parseFloat(tokens["a11y.letterSpacing"] || "0"),
    wordSpacing: parseFloat(tokens["a11y.wordSpacing"] || "0"),
    dyslexicFont: tokens["a11y.dyslexicFont"] === "true",
    textAlign: tokens["a11y.textAlign"] || "inherit",
    // Cursor & Reading Aids
    cursorSize: tokens["a11y.cursorSize"] || "default",
    readingGuide: tokens["a11y.readingGuide"] === "true",
    readingMask: tokens["a11y.readingMask"] === "true",
    // Motion & Animation
    reducedMotion: tokens["a11y.reducedMotion"] || "system",
    animationDuration: parseInt(tokens["a11y.animationDuration"] || "200"),
    autoplayDisabled: tokens["a11y.autoplayDisabled"] === "true",
    pauseAnimations: tokens["a11y.pauseAnimations"] === "true",
    // Content & Media
    hideImages: tokens["a11y.hideImages"] === "true",
    tooltips: tokens["a11y.tooltips"] === "true",
    // Touch & Target Size
    largeTargets: tokens["a11y.largeTargets"] === "true",
    forcedColorsSupport: tokens["a11y.forcedColors"] !== "false",
  };
}

export function useLoginBrandingTokens({
  loginBrandingJson,
  slotConfigJson,
  isSafeMode,
}: LoginBrandingTokensInput): LoginBrandingTokensResult {
  // Parse configs (memoized to avoid re-parsing on every render)
  const config = useMemo(
    () => (isSafeMode ? parseLoginBrandingJson(null) : parseLoginBrandingJson(loginBrandingJson)),
    [loginBrandingJson, isSafeMode]
  );

  const slotConfig = useMemo(
    () => (isSafeMode ? parseSlotConfig(null) : parseSlotConfig(slotConfigJson)),
    [slotConfigJson, isSafeMode]
  );

  // ══════════════════════════════════════════════════════════════
  // SINGLE useEffect: Build ALL CSS (:root + .dark) in ONE <style> tag
  // This ensures .dark {} can properly override :root {} via CSS cascade
  // ══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (typeof document === "undefined" || isSafeMode) return;

    const tokens = config.tokens;

    // ─── :root {} rules (light / unified values) ───
    const rootRules: string[] = [];

    // Map known tokens to CSS vars
    for (const [tokenKey, value] of Object.entries(tokens)) {
      const cssVar = TOKEN_TO_CSS_VAR[tokenKey];
      if (cssVar && value) {
        rootRules.push(`  ${cssVar}: ${value};`);
      }
    }

    // Split bg mode (unified vs independent — used by LoginBranding for transparency)
    if (tokens["split.bg.mode"]) {
      rootRules.push(`  --login-split-bg-mode: ${tokens["split.bg.mode"]};`);
    }

    // Background image — ALWAYS emit (use 'none' when cleared so preview updates immediately)
    rootRules.push(
      `  --login-bg-image: ${tokens["bg.image"] ? `url(${tokens["bg.image"]})` : "none"};`
    );
    if (tokens["bg.image.fit"]) {
      rootRules.push(`  --login-bg-image-fit: ${tokens["bg.image.fit"]};`);
    }
    if (tokens["bg.image.position"]) {
      rootRules.push(`  --login-bg-image-position: ${tokens["bg.image.position"]};`);
    }

    // Gradient overrides solid bg color
    if (tokens["bg.gradient"]) {
      rootRules.push(`  --login-bg-gradient: ${tokens["bg.gradient"]};`);
      rootRules.push(`  --login-bg: ${tokens["bg.gradient"]};`);
    }

    // Panel bg image — ALWAYS emit
    rootRules.push(
      `  --login-panel-bg-image: ${tokens["panel.bg.image"] ? `url(${tokens["panel.bg.image"]})` : "none"};`
    );
    if (tokens["panel.bg.image.fit"]) {
      rootRules.push(`  --login-panel-bg-image-fit: ${tokens["panel.bg.image.fit"]};`);
    }
    if (tokens["panel.bg.image.position"]) {
      rootRules.push(`  --login-panel-bg-image-position: ${tokens["panel.bg.image.position"]};`);
    }

    // Panel gradient overrides panel solid bg
    if (tokens["panel.bg.gradient"]) {
      rootRules.push(`  --login-panel-bg-gradient: ${tokens["panel.bg.gradient"]};`);
      rootRules.push(`  --login-panel-bg: ${tokens["panel.bg.gradient"]};`);
    }

    // Light overlay CSS vars — ALWAYS emit when token has a value
    // (cannot use truthiness: "0" is falsy but is a valid opacity!)
    if (tokens["overlay.opacity"] != null && tokens["overlay.opacity"] !== "") {
      rootRules.push(`  --login-overlay-opacity: ${tokens["overlay.opacity"]};`);
    }
    if (tokens["overlay.color"] != null && tokens["overlay.color"] !== "") {
      rootRules.push(`  --login-overlay-color: ${tokens["overlay.color"]};`);
    }
    if (tokens["overlay.blur"] != null && tokens["overlay.blur"] !== "") {
      rootRules.push(`  --login-overlay-blur: ${tokens["overlay.blur"]};`);
    }

    // Light panel overlay CSS vars
    if (tokens["panel.overlay.opacity"] != null && tokens["panel.overlay.opacity"] !== "") {
      rootRules.push(`  --login-panel-overlay-opacity: ${tokens["panel.overlay.opacity"]};`);
    }
    if (tokens["panel.overlay.color"] != null && tokens["panel.overlay.color"] !== "") {
      rootRules.push(`  --login-panel-overlay-color: ${tokens["panel.overlay.color"]};`);
    }
    if (tokens["panel.overlay.blur"] != null && tokens["panel.overlay.blur"] !== "") {
      rootRules.push(`  --login-panel-overlay-blur: ${tokens["panel.overlay.blur"]};`);
    }

    // ─── .dark {} rules (dark overrides) ───
    const darkRules: string[] = [];

    // Dark color map (colors only — overlay vars handled separately below)
    const darkColorMap: Record<string, string> = {
      "dark.color.primary": "--login-primary",
      "dark.color.secondary": "--login-secondary",
      "dark.color.background": "--login-bg",
      "dark.color.surface": "--login-surface",
      "dark.color.text": "--login-text",
      "dark.color.textMuted": "--login-text-muted",
      "dark.color.border": "--login-border",
      "dark.color.error": "--login-error",
      "dark.color.success": "--login-success",
    };

    for (const [tokenKey, cssVar] of Object.entries(darkColorMap)) {
      const value = tokens[tokenKey];
      if (value) darkRules.push(`  ${cssVar}: ${value};`);
    }

    // Dark overlay CSS vars — use != null check (not truthiness, "0" is valid)
    if (tokens["dark.overlay.opacity"] != null && tokens["dark.overlay.opacity"] !== "") {
      darkRules.push(`  --login-overlay-opacity: ${tokens["dark.overlay.opacity"]};`);
    }
    if (tokens["dark.overlay.color"] != null && tokens["dark.overlay.color"] !== "") {
      darkRules.push(`  --login-overlay-color: ${tokens["dark.overlay.color"]};`);
    }
    if (tokens["dark.overlay.blur"] != null && tokens["dark.overlay.blur"] !== "") {
      darkRules.push(`  --login-overlay-blur: ${tokens["dark.overlay.blur"]};`);
    }

    // Dark bg gradient
    if (tokens["dark.bg.gradient"]) {
      darkRules.push(`  --login-bg: ${tokens["dark.bg.gradient"]};`);
      darkRules.push(`  --login-bg-gradient: ${tokens["dark.bg.gradient"]};`);
    }

    // Dark bg image — ALWAYS emit
    darkRules.push(
      `  --login-bg-image: ${tokens["dark.bg.image"] ? `url(${tokens["dark.bg.image"]})` : "none"};`
    );

    // Dark panel overrides
    const darkPanelColorMap: Record<string, string> = {
      "dark.panel.color.background": "--login-panel-bg",
    };

    for (const [tokenKey, cssVar] of Object.entries(darkPanelColorMap)) {
      const value = tokens[tokenKey];
      if (value) darkRules.push(`  ${cssVar}: ${value};`);
    }

    // Dark panel overlay CSS vars — use != null check (not truthiness, "0" is valid)
    if (
      tokens["dark.panel.overlay.opacity"] != null &&
      tokens["dark.panel.overlay.opacity"] !== ""
    ) {
      darkRules.push(`  --login-panel-overlay-opacity: ${tokens["dark.panel.overlay.opacity"]};`);
    }
    if (tokens["dark.panel.overlay.color"] != null && tokens["dark.panel.overlay.color"] !== "") {
      darkRules.push(`  --login-panel-overlay-color: ${tokens["dark.panel.overlay.color"]};`);
    }
    if (tokens["dark.panel.overlay.blur"] != null && tokens["dark.panel.overlay.blur"] !== "") {
      darkRules.push(`  --login-panel-overlay-blur: ${tokens["dark.panel.overlay.blur"]};`);
    }
    if (tokens["dark.panel.bg.gradient"]) {
      darkRules.push(`  --login-panel-bg: ${tokens["dark.panel.bg.gradient"]};`);
    }
    darkRules.push(
      `  --login-panel-bg-image: ${tokens["dark.panel.bg.image"] ? `url(${tokens["dark.panel.bg.image"]})` : "none"};`
    );

    // ─── Build final CSS ───
    const cssBlocks: string[] = [];
    if (rootRules.length > 0) {
      cssBlocks.push(`:root {\n${rootRules.join("\n")}\n}`);
    }
    if (darkRules.length > 0) {
      cssBlocks.push(`.dark {\n${darkRules.join("\n")}\n}`);
    }

    // ─── Bridge: Map --login-* tokens → shadcn CSS vars scoped to .login-page ───
    // CRITICAL: shadcn CSS vars use HSL channel format (e.g. "222 47% 11%")
    // and are consumed via hsl(var(--primary)). Tokens store hex values (#f59e0b),
    // so we MUST convert hex → HSL channels before injecting.
    const hexToHslValues = (hex: string): string | null => {
      if (!hex || !hex.startsWith("#")) return null;
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      const max = Math.max(r, g, b),
        min = Math.min(r, g, b);
      const l = (max + min) / 2;
      if (max === min) return `0 0% ${Math.round(l * 100)}%`;
      const d = max - min;
      const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      let h = 0;
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
      else if (max === g) h = ((b - r) / d + 2) * 60;
      else h = ((r - g) / d + 4) * 60;
      return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    const bridgeRules: string[] = [];
    const darkBridgeRules: string[] = [];

    // Helper: push HSL-converted value
    const pushHsl = (arr: string[], varName: string, hex: string | undefined) => {
      if (!hex) return;
      const hsl = hexToHslValues(hex);
      if (hsl) arr.push(`  ${varName}: ${hsl};`);
    };

    // Light mode bridge
    pushHsl(bridgeRules, "--primary", tokens["color.primary"]);
    pushHsl(bridgeRules, "--secondary", tokens["color.secondary"]);
    pushHsl(bridgeRules, "--background", tokens["color.background"]);
    pushHsl(bridgeRules, "--card", tokens["color.surface"]);
    pushHsl(bridgeRules, "--foreground", tokens["color.text"]);
    pushHsl(bridgeRules, "--card-foreground", tokens["color.text"]);
    pushHsl(bridgeRules, "--muted-foreground", tokens["color.textMuted"]);
    pushHsl(bridgeRules, "--border", tokens["color.border"]);
    pushHsl(bridgeRules, "--input", tokens["color.border"]);
    pushHsl(bridgeRules, "--destructive", tokens["color.error"]);
    pushHsl(bridgeRules, "--accent", tokens["color.accent"]);
    pushHsl(bridgeRules, "--ring", tokens["color.primary"]);
    // Primary foreground (white for contrast on colored buttons)
    if (tokens["color.primary"]) bridgeRules.push(`  --primary-foreground: 0 0% 100%;`);

    // Dark mode bridge
    pushHsl(darkBridgeRules, "--primary", tokens["dark.color.primary"]);
    pushHsl(darkBridgeRules, "--secondary", tokens["dark.color.secondary"]);
    pushHsl(darkBridgeRules, "--background", tokens["dark.color.background"]);
    pushHsl(darkBridgeRules, "--card", tokens["dark.color.surface"]);
    pushHsl(darkBridgeRules, "--foreground", tokens["dark.color.text"]);
    pushHsl(darkBridgeRules, "--card-foreground", tokens["dark.color.text"]);
    pushHsl(darkBridgeRules, "--muted-foreground", tokens["dark.color.textMuted"]);
    pushHsl(darkBridgeRules, "--border", tokens["dark.color.border"]);
    pushHsl(darkBridgeRules, "--input", tokens["dark.color.border"]);
    pushHsl(darkBridgeRules, "--destructive", tokens["dark.color.error"]);
    pushHsl(darkBridgeRules, "--ring", tokens["dark.color.primary"]);
    if (tokens["dark.color.primary"]) darkBridgeRules.push(`  --primary-foreground: 0 0% 100%;`);

    if (bridgeRules.length > 0) {
      cssBlocks.push(`.login-page {\n${bridgeRules.join("\n")}\n}`);
    }
    if (darkBridgeRules.length > 0) {
      cssBlocks.push(`.dark .login-page {\n${darkBridgeRules.join("\n")}\n}`);
    }
    // ─── Base Stylesheet: .login-* class definitions ───
    // These use CSS vars so custom CSS can override naturally (no !important needed)
    cssBlocks.push(`/* ═══ Login Base Stylesheet ═══ */
.login-page {
  font-family: var(--login-font-body, inherit) !important;
  line-height: var(--login-line-height, 1.5) !important;
  letter-spacing: var(--login-letter-spacing, 0px) !important;
}
[dir="rtl"] .login-page {
  font-family: var(--login-font-body-ar, var(--login-font-body, inherit)) !important;
}
.login-page * {
  line-height: inherit;
  letter-spacing: inherit;
}
.login-form-wrapper {
  max-width: var(--login-form-width, 380px) !important;
  width: 100%;
}
.login-page .login-form {
  display: flex;
  flex-direction: column;
  gap: var(--login-element-gap, 16px) !important;
}
.login-page .login-input {
  height: var(--login-input-height, 44px) !important;
  border-radius: var(--login-radius-button, 8px) !important;
  border-color: var(--login-border, hsl(var(--border)));
}
.login-page .login-button {
  height: var(--login-input-height, 44px) !important;
  background-color: var(--login-primary, hsl(var(--primary)));
  border-radius: var(--login-radius-button, 8px) !important;
  color: white;
  width: 100%;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}
.login-page .login-button:hover {
  opacity: 0.9;
  filter: brightness(1.05);
}
.login-page .login-card {
  border-radius: var(--login-radius-card, 16px) !important;
  padding: var(--login-card-padding, 32px) !important;
  box-shadow: var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.25)) !important;
  background-color: var(--login-surface, hsl(var(--background)));
}
.login-page .login-heading {
  font-family: var(--login-font-heading, inherit);
  font-size: var(--login-size-headline, 1.875rem) !important;
  font-weight: var(--login-weight-heading, 600) !important;
  color: var(--login-text, hsl(var(--foreground)));
}
[dir="rtl"] .login-page .login-heading {
  font-family: var(--login-font-body-ar, var(--login-font-heading, inherit)) !important;
}
.login-page .login-subtitle {
  font-size: var(--login-size-subtitle, 0.875rem) !important;
  color: var(--login-text-muted, hsl(var(--muted-foreground)));
}
.login-logo {
  overflow: hidden;
  border-radius: var(--login-radius-card, 0.75rem);
}
.login-footer {
  text-align: center;
  margin-top: 2rem;
  color: var(--login-text-muted, hsl(var(--muted-foreground)));
  font-size: 11px;
  opacity: 0.6;
}
.login-page .login-sso button {
  border-radius: var(--login-radius-button, 8px) !important;
}
.login-overlay {
  position: absolute;
  inset: 0;
  background-color: var(--login-overlay-color, #000000);
  opacity: var(--login-overlay-opacity, 0.5);
  backdrop-filter: blur(var(--login-overlay-blur, 0px));
}
.login-divider {
  border-color: var(--login-border, hsl(var(--border)));
}
.login-label {
  color: var(--login-text, hsl(var(--foreground)));
}`);

    // ═══════════════════════════════════════════════════════════════
    // ACCESSIBILITY CSS — Reads a11y.* tokens and injects real CSS
    // ═══════════════════════════════════════════════════════════════
    const a11yCss: string[] = [];

    // ── 1. Focus Ring ──
    const focusEnabled = tokens["a11y.focusRing.enabled"] !== "false";
    const focusColor =
      tokens["a11y.focusRing.color"] || tokens["color.primary"] || "hsl(var(--primary))";
    const focusWidth = tokens["a11y.focusRing.width"] || "3px";
    const focusStyle = tokens["a11y.focusRing.style"] || "solid";
    if (focusEnabled) {
      a11yCss.push(`/* ═══ Accessibility: Focus Ring ═══ */
.login-page :focus-visible {
  outline: ${focusWidth} ${focusStyle} ${focusColor} !important;
  outline-offset: 2px !important;
  box-shadow: 0 0 0 1px rgba(255,255,255,0.4) !important;
}
.login-page input:focus-visible,
.login-page button:focus-visible,
.login-page a:focus-visible,
.login-page select:focus-visible,
.login-page [tabindex]:focus-visible {
  outline: ${focusWidth} ${focusStyle} ${focusColor} !important;
  outline-offset: 2px !important;
}`);
    } else {
      // When disabled, suppress outlines (user chose to handle focus differently)
      a11yCss.push(`/* Focus Ring Disabled */
.login-page :focus-visible {
  outline: none !important;
}`);
    }

    // ── 2. Skip Link ──
    const skipEnabled = tokens["a11y.skipLink.enabled"] !== "false";
    if (skipEnabled) {
      a11yCss.push(`/* ═══ Accessibility: Skip Link ═══ */
.login-skip-link {
  position: absolute;
  top: -100px;
  left: 16px;
  z-index: 9999;
  padding: 12px 24px;
  background: ${focusColor};
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  border-radius: 0 0 8px 8px;
  text-decoration: none;
  transition: top 0.15s ease-in-out;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.login-skip-link:focus {
  top: 0 !important;
  outline: 2px solid #fff;
  outline-offset: 2px;
}
[dir="rtl"] .login-skip-link {
  left: auto;
  right: 16px;
}`);
    }

    // ── 3. High Contrast Mode ──
    const highContrast = tokens["a11y.highContrast"] === "true";
    if (highContrast) {
      a11yCss.push(`/* ═══ Accessibility: High Contrast Mode ═══ */
.login-page {
  --login-text: #000000 !important;
  --login-text-muted: #1a1a1a !important;
  --login-border: #000000 !important;
}
.login-page input,
.login-page button,
.login-page a {
  border-width: 2px !important;
}
.login-page .login-heading,
.login-page .login-subtitle,
.login-page .login-label,
.login-page label {
  font-weight: 700 !important;
}
.dark .login-page {
  --login-text: #ffffff !important;
  --login-text-muted: #e5e5e5 !important;
  --login-border: #ffffff !important;
}`);
    }

    // ── 4. Minimum Font Size ──
    const minFontSize = parseInt(tokens["a11y.minFontSize"] || "14");
    if (minFontSize > 12) {
      a11yCss.push(`/* ═══ Accessibility: Min Font Size (${minFontSize}px) ═══ */
.login-page {
  font-size: max(${minFontSize}px, 1rem) !important;
}
.login-page input,
.login-page button,
.login-page label,
.login-page p,
.login-page span,
.login-page a {
  font-size: max(inherit, ${minFontSize}px) !important;
}
.login-page .login-subtitle,
.login-page .login-footer {
  font-size: max(${minFontSize - 2}px, 0.75rem) !important;
}`);
    }

    // ── 5. Reduced Motion ──
    const reducedMotion = tokens["a11y.reducedMotion"] || "system";
    const animDuration = tokens["a11y.animationDuration"] || "200";
    if (reducedMotion === "always") {
      a11yCss.push(`/* ═══ Accessibility: Reduced Motion (forced) ═══ */
.login-page,
.login-page * {
  animation-duration: 0.001ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.001ms !important;
  scroll-behavior: auto !important;
}`);
    } else if (reducedMotion === "system") {
      a11yCss.push(`/* ═══ Accessibility: Reduced Motion (system preference) ═══ */
@media (prefers-reduced-motion: reduce) {
  .login-page,
  .login-page * {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}`);
    }
    // For "never" — no override, full animations with custom duration
    if (reducedMotion === "never") {
      a11yCss.push(`/* ═══ Accessibility: Custom Animation Duration ═══ */
.login-page .login-button,
.login-page a,
.login-page input {
  transition-duration: ${animDuration}ms !important;
}`);
    }

    // ── 6. Forced Colors Support ──
    const forcedColors = tokens["a11y.forcedColors"] !== "false";
    if (forcedColors) {
      a11yCss.push(`/* ═══ Accessibility: Forced Colors (Windows High Contrast) ═══ */
@media (forced-colors: active) {
  .login-page input {
    border: 2px solid ButtonText !important;
  }
  .login-page button[type="submit"] {
    background: ButtonFace !important;
    color: ButtonText !important;
    border: 2px solid ButtonText !important;
    forced-color-adjust: none;
  }
  .login-page a {
    color: LinkText !important;
    text-decoration: underline !important;
  }
  .login-page .login-heading,
  .login-page label {
    color: CanvasText !important;
  }
  .login-skip-link:focus {
    background: Highlight !important;
    color: HighlightText !important;
  }
}`);
    }

    // ── 7. Contrast Preset ──
    const contrastPreset = tokens["a11y.contrastPreset"] || "normal";
    if (contrastPreset === "dark") {
      a11yCss.push(`/* ═══ Accessibility: Dark Contrast Preset ═══ */
.login-page {
  --login-bg: #1a1a1a !important;
  --login-surface: #2a2a2a !important;
  --login-text: #ffffff !important;
  --login-text-muted: #cccccc !important;
  --login-border: #555555 !important;
}
.login-page .login-card { background-color: #2a2a2a !important; }`);
    } else if (contrastPreset === "light") {
      a11yCss.push(`/* ═══ Accessibility: Light Contrast Preset ═══ */
.login-page {
  --login-bg: #ffffff !important;
  --login-surface: #f8f8f8 !important;
  --login-text: #000000 !important;
  --login-text-muted: #333333 !important;
  --login-border: #cccccc !important;
}
.login-page .login-card { background-color: #f8f8f8 !important; }`);
    } else if (contrastPreset === "inverted") {
      a11yCss.push(`/* ═══ Accessibility: Inverted Colors Preset ═══ */
.login-page { filter: invert(1) hue-rotate(180deg) !important; }
.login-page img,
.login-page .login-logo { filter: invert(1) hue-rotate(180deg) !important; }`);
    } else if (contrastPreset === "monochrome") {
      a11yCss.push(`/* ═══ Accessibility: Monochrome Preset ═══ */
.login-page { filter: grayscale(1) !important; }`);
    }

    // ── 8. Saturation Control ──
    const saturation = parseInt(tokens["a11y.saturation"] || "100");
    if (saturation !== 100) {
      a11yCss.push(`/* ═══ Accessibility: Saturation ${saturation}% ═══ */
.login-page { filter: saturate(${saturation / 100}) !important; }`);
    }

    // ── 9. Highlight Links ──
    const highlightLinks = tokens["a11y.highlightLinks"] === "true";
    if (highlightLinks) {
      a11yCss.push(`/* ═══ Accessibility: Highlight Links ═══ */
.login-page a {
  text-decoration: underline !important;
  text-decoration-thickness: 2px !important;
  text-underline-offset: 3px !important;
  outline: 2px solid currentColor !important;
  outline-offset: 2px !important;
  border-radius: 2px !important;
}`);
    }

    // ── 10. Highlight Focus/Hover ──
    const highlightFocusHover = tokens["a11y.highlightFocus"] === "true";
    if (highlightFocusHover) {
      a11yCss.push(`/* ═══ Accessibility: Highlight Focus/Hover ═══ */
.login-page *:hover {
  outline: 2px dashed ${focusColor} !important;
  outline-offset: 2px !important;
}
.login-page *:focus-within {
  background-color: color-mix(in srgb, ${focusColor} 8%, transparent) !important;
}`);
    }

    // ── 11. Content Scaling ──
    const contentScaling = parseInt(tokens["a11y.contentScaling"] || "100");
    if (contentScaling !== 100) {
      const scale = contentScaling / 100;
      a11yCss.push(`/* ═══ Accessibility: Content Scaling ${contentScaling}% ═══ */
.login-page .login-form-wrapper {
  transform: scale(${scale}) !important;
  transform-origin: top center !important;
}`);
    }

    // ── 12. Line Height Override ──
    const a11yLineHeight = parseFloat(tokens["a11y.lineHeight"] || "0");
    if (a11yLineHeight > 0) {
      a11yCss.push(`/* ═══ Accessibility: Line Height ${a11yLineHeight} ═══ */
.login-page,
.login-page * {
  line-height: ${a11yLineHeight} !important;
}`);
    }

    // ── 13. Letter Spacing Override ──
    const a11yLetterSpacing = parseFloat(tokens["a11y.letterSpacing"] || "0");
    if (a11yLetterSpacing > 0) {
      a11yCss.push(`/* ═══ Accessibility: Letter Spacing ${a11yLetterSpacing}px ═══ */
.login-page,
.login-page * {
  letter-spacing: ${a11yLetterSpacing}px !important;
}`);
    }

    // ── 14. Word Spacing Override ──
    const a11yWordSpacing = parseFloat(tokens["a11y.wordSpacing"] || "0");
    if (a11yWordSpacing > 0) {
      a11yCss.push(`/* ═══ Accessibility: Word Spacing ${a11yWordSpacing}px ═══ */
.login-page,
.login-page * {
  word-spacing: ${a11yWordSpacing}px !important;
}`);
    }

    // ── 15. Dyslexia-Friendly Font ──
    const dyslexicFont = tokens["a11y.dyslexicFont"] === "true";
    if (dyslexicFont) {
      a11yCss.push(`/* ═══ Accessibility: Dyslexia-Friendly Font ═══ */
@font-face {
  font-family: 'OpenDyslexic';
  src: url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/woff/OpenDyslexic-Regular.woff') format('woff');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'OpenDyslexic';
  src: url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/woff/OpenDyslexic-Bold.woff') format('woff');
  font-weight: bold;
  font-style: normal;
  font-display: swap;
}
.login-page,
.login-page * {
  font-family: 'OpenDyslexic', sans-serif !important;
}`);
    }

    // ── 16. Text Alignment Override ──
    const textAlign = tokens["a11y.textAlign"] || "inherit";
    if (textAlign !== "inherit") {
      a11yCss.push(`/* ═══ Accessibility: Text Align ${textAlign} ═══ */
.login-page p,
.login-page label,
.login-page span,
.login-page .login-heading,
.login-page .login-subtitle,
.login-page .login-footer {
  text-align: ${textAlign} !important;
}`);
    }

    // ── 17. Big Cursor ──
    const cursorSize = tokens["a11y.cursorSize"] || "default";
    if (cursorSize !== "default") {
      const cursorScale = cursorSize === "xlarge" ? 3 : 2;
      a11yCss.push(`/* ═══ Accessibility: Big Cursor (${cursorSize}) ═══ */
.login-page {
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${cursorScale * 16}' height='${cursorScale * 16}' viewBox='0 0 32 32'%3E%3Cpath d='M4 4l20 8-8 4-4 8z' fill='%23000' stroke='%23fff' stroke-width='2'/%3E%3C/svg%3E") 0 0, auto !important;
}
.login-page a,
.login-page button,
.login-page [role="button"],
.login-page input[type="submit"] {
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${cursorScale * 16}' height='${cursorScale * 16}' viewBox='0 0 32 32'%3E%3Cpath d='M10 2v20l5-5h10z' fill='%23000' stroke='%23fff' stroke-width='2'/%3E%3C/svg%3E") ${cursorScale * 5} 0, pointer !important;
}`);
    }

    // ── 18. Reading Guide ──
    const readingGuide = tokens["a11y.readingGuide"] === "true";
    if (readingGuide) {
      a11yCss.push(`/* ═══ Accessibility: Reading Guide ═══ */
.login-a11y-reading-guide {
  position: fixed;
  left: 0;
  right: 0;
  height: 12px;
  background: linear-gradient(to bottom,
    transparent 0%,
    ${focusColor}40 40%,
    ${focusColor}80 50%,
    ${focusColor}40 60%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 99999;
  transition: top 0.05s linear;
}`);
    }

    // ── 19. Reading Mask ──
    const readingMask = tokens["a11y.readingMask"] === "true";
    if (readingMask) {
      a11yCss.push(`/* ═══ Accessibility: Reading Mask ═══ */
.login-a11y-reading-mask-top,
.login-a11y-reading-mask-bottom {
  position: fixed;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  pointer-events: none;
  z-index: 99998;
  transition: all 0.05s linear;
}
.login-a11y-reading-mask-top { top: 0; }
.login-a11y-reading-mask-bottom { bottom: 0; }`);
    }

    // ── 20. Pause All Animations ──
    const pauseAnims = tokens["a11y.pauseAnimations"] === "true";
    if (pauseAnims) {
      a11yCss.push(`/* ═══ Accessibility: Pause All Animations ═══ */
.login-page,
.login-page * {
  animation-play-state: paused !important;
  animation-duration: 0s !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;
}`);
    }

    // ── 21. Hide Decorative Images ──
    const hideImages = tokens["a11y.hideImages"] === "true";
    if (hideImages) {
      a11yCss.push(`/* ═══ Accessibility: Hide Decorative Images ═══ */
.login-page {
  background-image: none !important;
}
.login-page [class*="bg-"] {
  background-image: none !important;
}
.login-page .login-logo img {
  filter: grayscale(1) opacity(0.3) !important;
}
.login-page .login-overlay {
  backdrop-filter: none !important;
}`);
    }

    // ── 22. Enhanced Tooltips ──
    const tooltips = tokens["a11y.tooltips"] === "true";
    if (tooltips) {
      a11yCss.push(`/* ═══ Accessibility: Enhanced Tooltips ═══ */
.login-page [title]:hover::after {
  content: attr(title);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 12px;
  background: var(--login-text, #000);
  color: var(--login-bg, #fff);
  font-size: 13px;
  border-radius: 6px;
  white-space: nowrap;
  z-index: 99999;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
.login-page [title] { position: relative; }`);
    }

    // ── 23. Large Click Targets ──
    const largeTargets = tokens["a11y.largeTargets"] === "true";
    if (largeTargets) {
      a11yCss.push(`/* ═══ Accessibility: Large Click Targets (≥44×44px) ═══ */
.login-page input,
.login-page button,
.login-page select,
.login-page a,
.login-page [role="button"] {
  min-height: 44px !important;
  min-width: 44px !important;
  padding-top: 8px !important;
  padding-bottom: 8px !important;
}`);
    }

    if (a11yCss.length > 0) {
      cssBlocks.push(a11yCss.join("\n\n"));
    }

    if (cssBlocks.length === 0) return;

    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-studio-tokens", "true");
    styleEl.textContent = cssBlocks.join("\n\n");
    document.head.appendChild(styleEl);

    // ─── Load Google Fonts runtime ───
    const fontsToLoad = new Set<string>();
    const fontTokens = ["font.heading", "font.body", "font.bodyAr"] as const;
    for (const tokenKey of fontTokens) {
      const fontName = tokens[tokenKey];
      if (fontName && fontName !== "system-ui" && fontName !== "inherit") {
        fontsToLoad.add(fontName);
      }
    }

    const fontLinkIds: string[] = [];
    fontsToLoad.forEach((fontName) => {
      const linkId = `studio-font-${fontName.replace(/\s+/g, "-").toLowerCase()}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@300;400;500;600;700;800;900&display=swap`;
        document.head.appendChild(link);
      }
      fontLinkIds.push(linkId);
    });

    // Cleanup on unmount or config change
    return () => {
      styleEl.remove();
      fontLinkIds.forEach((id) => document.getElementById(id)?.remove());
    };
  }, [config.tokens, isSafeMode]);

  // ─── Inject custom CSS (LAST — highest cascade priority) ───
  useEffect(() => {
    if (typeof document === "undefined" || isSafeMode) return;

    let customCss = "";
    try {
      const raw = loginBrandingJson ? JSON.parse(loginBrandingJson) : {};
      customCss = raw.customCss || "";
    } catch {
      /* ignore parse errors */
    }

    if (!customCss) return;

    // Remove old custom CSS first
    document.querySelector("[data-studio-custom-css]")?.remove();

    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-studio-custom-css", "true");
    // Inject AFTER everything else for highest priority
    styleEl.textContent = customCss;
    document.head.appendChild(styleEl);

    return () => {
      styleEl.remove();
    };
  }, [loginBrandingJson, isSafeMode]);

  // ─── Parse accessibility config for DOM rendering ───
  const a11y = useMemo(
    () => (isSafeMode ? parseA11yConfig({}) : parseA11yConfig(config.tokens)),
    [config.tokens, isSafeMode]
  );

  return {
    layout: config.layout,
    config,
    slotConfig,
    a11y,
  };
}
