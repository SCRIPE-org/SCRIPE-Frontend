/**
 * useLoginBrandingTokens — CSS Token Injection for Login Page
 *
 * Parses LoginBrandingJson, injects CSS custom properties via
 * <style> tags (NOT inline styles — so .dark {} can properly override :root {}).
 *
 * CRITICAL: Previously set light CSS vars as inline styles on <html>
 * which has higher specificity than ANY CSS rule. Now ALL vars are in a
 * <style> tag so :root {} and .dark {} cascade correctly.
 *
 * Delegates CSS generation to focused modules:
 *  - buildTokenCss    → :root{} + .dark{} CSS var blocks
 *  - buildBridgeCss   → shadcn CSS var bridge (hex→HSL)
 *  - buildBaseStylesheet → .login-* class definitions
 *  - buildA11yCss     → 23 accessibility CSS generators
 *  - parseA11yConfig  → a11y token → AccessibilityConfig
 */
"use client";

import { useEffect, useMemo } from "react";
import {
  parseLoginBrandingJson,
  parseSlotConfig,
  type LoginBrandingConfig,
  type SlotConfig,
  type LoginLayout,
} from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import { buildTokenCss } from "./branding/buildTokenCss";
import { buildBridgeCss } from "./branding/buildBridgeCss";
import { buildBaseStylesheet } from "./branding/buildBaseStylesheet";
import { buildA11yCss } from "./branding/buildA11yCss";
import { parseA11yConfig } from "./branding/parseA11yConfig";

// ─── Accessibility config type ─────────────────────────────────────────────
/**
 * Interface defining property specifications, keys types, and structural contract rules for accessibility config.
 */
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

/**
 * Interface defining property specifications, keys types, and structural contract rules for login branding tokens result.
 */
export interface LoginBrandingTokensResult {
  layout: LoginLayout;
  config: LoginBrandingConfig;
  slotConfig: SlotConfig;
  a11y: AccessibilityConfig;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for login branding tokens input.
 */
export interface LoginBrandingTokensInput {
  loginBrandingJson: string | null | undefined;
  slotConfigJson: string | null | undefined;
  isSafeMode: boolean;
}

/**
 * React hook/ViewModel orchestrating state and data flows for login branding tokens.
 * Handles active states updates, form fields validations, and browser navigation controllers.
 */
export function useLoginBrandingTokens({
  loginBrandingJson,
  slotConfigJson,
  isSafeMode,
}: LoginBrandingTokensInput): LoginBrandingTokensResult {
  // ── Parse configs (memoized) ───────────────────────────────────────────
  const config = useMemo(
    () => (isSafeMode ? parseLoginBrandingJson(null) : parseLoginBrandingJson(loginBrandingJson)),
    [loginBrandingJson, isSafeMode]
  );
  const slotConfig = useMemo(
    () => (isSafeMode ? parseSlotConfig(null) : parseSlotConfig(slotConfigJson)),
    [slotConfigJson, isSafeMode]
  );

  // ── Inject ALL CSS in ONE <style> tag (preserves :root / .dark cascade) ─
  const tokens = config.tokens;
  useEffect(() => {
    if (typeof document === "undefined" || isSafeMode) return;

    const cssBlocks = [
      buildTokenCss(tokens),
      buildBridgeCss(tokens),
      buildBaseStylesheet(),
      buildA11yCss(tokens),
    ].filter(Boolean);

    if (cssBlocks.length === 0) return;

    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-studio-tokens", "true");
    styleEl.textContent = cssBlocks.join("\n\n");
    document.head.appendChild(styleEl);

    // ── Load Google Fonts runtime ───────────────────────────────────────
    const fontsToLoad = new Set<string>();
    for (const tokenKey of ["font.heading", "font.body", "font.bodyAr"] as const) {
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

    return () => {
      styleEl.remove();
      fontLinkIds.forEach((id) => document.getElementById(id)?.remove());
    };
  }, [tokens, isSafeMode]);

  // ── Inject custom CSS (LAST — highest cascade priority) ───────────────
  useEffect(() => {
    if (typeof document === "undefined" || isSafeMode) return;
    let customCss = "";
    try {
      const raw = loginBrandingJson ? JSON.parse(loginBrandingJson) : {};
      customCss = raw.customCss || "";
    } catch {
      /* ignore */
    }
    if (!customCss) return;

    document.querySelector("[data-studio-custom-css]")?.remove();
    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-studio-custom-css", "true");
    styleEl.textContent = customCss;
    document.head.appendChild(styleEl);
    return () => {
      styleEl.remove();
    };
  }, [loginBrandingJson, isSafeMode]);

  // ── Parse a11y config for DOM rendering ───────────────────────────────
  const configTokens = config.tokens;
  const a11y = useMemo(
    () => (isSafeMode ? parseA11yConfig({}) : parseA11yConfig(configTokens)),
    [configTokens, isSafeMode]
  );

  return { layout: config.layout, config, slotConfig, a11y };
}
