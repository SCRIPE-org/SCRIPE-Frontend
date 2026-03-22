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
} from "../types/login-branding-types";

interface LoginBrandingTokensResult {
  layout: LoginLayout;
  config: LoginBrandingConfig;
  slotConfig: SlotConfig;
}

interface LoginBrandingTokensInput {
  loginBrandingJson: string | null | undefined;
  slotConfigJson: string | null | undefined;
  isSafeMode: boolean;
}

export function useLoginBrandingTokens({
  loginBrandingJson,
  slotConfigJson,
  isSafeMode,
}: LoginBrandingTokensInput): LoginBrandingTokensResult {

  // Parse configs (memoized to avoid re-parsing on every render)
  const config = useMemo(
    () => isSafeMode ? parseLoginBrandingJson(null) : parseLoginBrandingJson(loginBrandingJson),
    [loginBrandingJson, isSafeMode]
  );

  const slotConfig = useMemo(
    () => isSafeMode ? parseSlotConfig(null) : parseSlotConfig(slotConfigJson),
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

    // Background image as special token
    if (tokens["bg.image"]) {
      rootRules.push(`  --login-bg-image: url(${tokens["bg.image"]});`);
    }

    // Gradient overrides solid bg color
    if (tokens["bg.gradient"]) {
      rootRules.push(`  --login-bg-gradient: ${tokens["bg.gradient"]};`);
      rootRules.push(`  --login-bg: ${tokens["bg.gradient"]};`);
    }

    // Panel bg image (for split layouts with independent panel bg)
    if (tokens["panel.bg.image"]) {
      rootRules.push(`  --login-panel-bg-image: url(${tokens["panel.bg.image"]});`);
    }

    // Panel gradient overrides panel solid bg
    if (tokens["panel.bg.gradient"]) {
      rootRules.push(`  --login-panel-bg-gradient: ${tokens["panel.bg.gradient"]};`);
      rootRules.push(`  --login-panel-bg: ${tokens["panel.bg.gradient"]};`);
    }

    // ─── .dark {} rules (dark overrides) ───
    const darkRules: string[] = [];

    // Dark color map
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
      "dark.overlay.opacity": "--login-overlay-opacity",
      "dark.overlay.color": "--login-overlay-color",
      "dark.overlay.blur": "--login-overlay-blur",
    };

    for (const [tokenKey, cssVar] of Object.entries(darkColorMap)) {
      const value = tokens[tokenKey];
      if (value) darkRules.push(`  ${cssVar}: ${value};`);
    }

    // Dark bg gradient
    if (tokens["dark.bg.gradient"]) {
      darkRules.push(`  --login-bg: ${tokens["dark.bg.gradient"]};`);
      darkRules.push(`  --login-bg-gradient: ${tokens["dark.bg.gradient"]};`);
    }

    // Dark bg image
    if (tokens["dark.bg.image"]) {
      darkRules.push(`  --login-bg-image: url(${tokens["dark.bg.image"]});`);
    }

    // Dark panel overrides
    const darkPanelMap: Record<string, string> = {
      "dark.panel.color.background": "--login-panel-bg",
      "dark.panel.overlay.opacity": "--login-panel-overlay-opacity",
      "dark.panel.overlay.color": "--login-panel-overlay-color",
      "dark.panel.overlay.blur": "--login-panel-overlay-blur",
    };

    for (const [tokenKey, cssVar] of Object.entries(darkPanelMap)) {
      const value = tokens[tokenKey];
      if (value) darkRules.push(`  ${cssVar}: ${value};`);
    }
    if (tokens["dark.panel.bg.gradient"]) {
      darkRules.push(`  --login-panel-bg: ${tokens["dark.panel.bg.gradient"]};`);
    }
    if (tokens["dark.panel.bg.image"]) {
      darkRules.push(`  --login-panel-bg-image: url(${tokens["dark.panel.bg.image"]});`);
    }

    // ─── Build final CSS ───
    const cssBlocks: string[] = [];
    if (rootRules.length > 0) {
      cssBlocks.push(`:root {\n${rootRules.join("\n")}\n}`);
    }
    if (darkRules.length > 0) {
      cssBlocks.push(`.dark {\n${darkRules.join("\n")}\n}`);
    }

    // ─── Base Stylesheet: .login-* class definitions ───
    // These use CSS vars so custom CSS can override naturally (no !important needed)
    cssBlocks.push(`/* ═══ Login Base Stylesheet ═══ */
.login-page {
  font-family: var(--login-font-body, inherit);
  line-height: var(--login-line-height, 1.5);
  letter-spacing: var(--login-letter-spacing, 0px);
}
.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--login-element-gap, 16px);
}
.login-input {
  height: var(--login-input-height, 44px);
  border-radius: var(--login-radius-button, 8px);
  border-color: var(--login-border, hsl(var(--border)));
}
.login-button {
  height: var(--login-input-height, 44px);
  background-color: var(--login-primary, hsl(var(--primary)));
  border-radius: var(--login-radius-button, 8px);
  color: white;
  width: 100%;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}
.login-button:hover {
  opacity: 0.9;
  filter: brightness(1.05);
}
.login-card {
  border-radius: var(--login-radius-card, 16px);
  padding: var(--login-card-padding, 32px);
  box-shadow: var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.25));
  background-color: var(--login-surface, hsl(var(--background)));
}
.login-heading {
  font-family: var(--login-font-heading, inherit);
  font-weight: var(--login-weight-heading, 600);
  color: var(--login-text, hsl(var(--foreground)));
}
.login-subtitle {
  font-size: var(--login-size-subtitle, 0.875rem);
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
.login-sso button {
  border-radius: var(--login-radius-button, 8px);
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
    } catch { /* ignore parse errors */ }

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

  return {
    layout: config.layout,
    config,
    slotConfig,
  };
}
