/**
 * useLoginBrandingTokens — CSS Token Injection for Login Page
 *
 * Parses LoginBrandingJson, injects CSS custom properties via
 * useEffect, and returns layout + blocks for the LoginView.
 *
 * If isSafeMode is true, ALL customization is bypassed (§16, §29).
 * Login pages are server-authoritative — no client cache trust (§20).
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
    if (config.tokens["bg.gradient"]) {
      root.style.setProperty("--login-bg-gradient", config.tokens["bg.gradient"]);
      tokensSet.push("--login-bg-gradient");
    }

    // Cleanup: remove all CSS vars on unmount
    return () => {
      tokensSet.forEach((v) => root.style.removeProperty(v));
    };
  }, [config.tokens, isSafeMode]);

  return {
    layout: config.layout,
    config,
    slotConfig,
  };
}
