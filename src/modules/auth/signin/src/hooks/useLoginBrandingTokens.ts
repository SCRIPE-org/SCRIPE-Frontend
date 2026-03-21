/**
 * useLoginBrandingTokens — CSS Token Injection for Login Page
 *
 * Parses LoginBrandingJson, injects CSS custom properties via
 * useEffect, and returns layout + blocks for the LoginView.
 *
 * If isSafeMode is true, ALL customization is bypassed (§16, §29).
 * Login pages are server-authoritative — no client cache trust (§20).
 *
 * Enhanced: injects custom CSS <style> tag, handles bg.gradient override
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

  // Inject CSS custom properties from design tokens
  useEffect(() => {
    if (typeof document === "undefined" || isSafeMode) return;

    const root = document.documentElement;
    const tokensSet: string[] = [];

    for (const [tokenKey, value] of Object.entries(config.tokens)) {
      const cssVar = TOKEN_TO_CSS_VAR[tokenKey];
      if (cssVar && value) {
        root.style.setProperty(cssVar, value);
        tokensSet.push(cssVar);
      }
    }

    // Handle background image as special token
    if (config.tokens["bg.image"]) {
      root.style.setProperty("--login-bg-image", `url(${config.tokens["bg.image"]})`);
      tokensSet.push("--login-bg-image");
    }

    // Handle gradient — overrides solid bg color
    if (config.tokens["bg.gradient"]) {
      root.style.setProperty("--login-bg-gradient", config.tokens["bg.gradient"]);
      // Also set --login-bg to the gradient so layouts automatically pick it up
      root.style.setProperty("--login-bg", config.tokens["bg.gradient"]);
      tokensSet.push("--login-bg-gradient");
    }

    // ─── Load Google Fonts runtime ───
    const fontsToLoad = new Set<string>();
    const fontTokens = ["font.heading", "font.body", "font.bodyAr"] as const;
    for (const tokenKey of fontTokens) {
      const fontName = config.tokens[tokenKey];
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

    // Cleanup: remove all CSS vars on unmount
    return () => {
      tokensSet.forEach((v) => root.style.removeProperty(v));
      fontLinkIds.forEach((id) => document.getElementById(id)?.remove());
    };
  }, [config.tokens, isSafeMode]);

  // Inject custom CSS as <style> tag
  useEffect(() => {
    if (typeof document === "undefined" || isSafeMode) return;

    // Parse raw JSON to get customCss
    let customCss = "";
    try {
      const raw = loginBrandingJson ? JSON.parse(loginBrandingJson) : {};
      customCss = raw.customCss || "";
    } catch { /* ignore parse errors */ }

    if (!customCss) return;

    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-studio-custom-css", "true");
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
