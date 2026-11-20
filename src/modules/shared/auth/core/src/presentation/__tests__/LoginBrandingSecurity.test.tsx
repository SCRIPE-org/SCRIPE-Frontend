import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import { isValidCtaUrl as isValidModuleCtaUrl } from "../../../domain/entities/LoginBrandingTypes";
import { isValidCtaUrl as isValidCoreCtaUrl } from "@core/domain/entities/LoginBrandingTypes";
import { buildTokenCss } from "../viewmodels/branding/buildTokenCss";
import { buildBridgeCss } from "../viewmodels/branding/buildBridgeCss";
import { buildBaseStylesheet } from "../viewmodels/branding/buildBaseStylesheet";
import { buildA11yCss } from "../viewmodels/branding/buildA11yCss";
import { useLoginBrandingTokens } from "../viewmodels/useLoginBrandingTokens";

describe("Login branding URL, CSS injection, and contrast security regressions", () => {
  beforeEach(() => {
    document.querySelectorAll("[data-studio-tokens], [data-studio-custom-css]").forEach((el) => {
      el.remove();
    });
  });

  afterEach(() => {
    document.querySelectorAll("[data-studio-tokens], [data-studio-custom-css]").forEach((el) => {
      el.remove();
    });
  });

  it("blocks protocol-relative, backslash, control-char, and script URLs in both isValidCtaUrl implementations", () => {
    const maliciousUrls = [
      "//evil.com",
      "//evil.com/phish",
      "/\\evil.com",
      "https://evil.com\\path",
      "javascript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "blob:https://evil.com/123",
      "vbscript:msgbox(1)",
      "https://scripe.org/start\n",
      "http://insecure.example.com/login",
      "",
    ];

    for (const url of maliciousUrls) {
      expect(isValidModuleCtaUrl(url)).toBe(false);
      expect(isValidCoreCtaUrl(url)).toBe(false);
    }

    const safeUrls = ["https://scripe.org/start", "/signup", "/", "/auth/login?next=%2Fdashboard"];
    for (const url of safeUrls) {
      expect(isValidModuleCtaUrl(url)).toBe(true);
      expect(isValidCoreCtaUrl(url)).toBe(true);
    }
  });

  it("sanitizes CSS tokens and image URLs in buildTokenCss and buildA11yCss", () => {
    const tokenCss = buildTokenCss({
      "color.primary": "#C6FF00; } body { display: none; } /*",
      "bg.image": "javascript:alert(1)",
      "panel.bg.image": "data:image/svg+xml;base64,PHN2Zz4=",
      "dark.bg.image": "https://cdn.scripe.org/bg.webp",
      "color.surface": "#14181F",
    });

    expect(tokenCss).not.toContain("display: none");
    expect(tokenCss).not.toContain("javascript:");
    expect(tokenCss).not.toContain("data:image/svg+xml");
    expect(tokenCss).toContain("--login-surface: #14181F;");
    expect(tokenCss).toContain("--login-bg-image: none;");
    expect(tokenCss).toContain("--login-panel-bg-image: none;");
    expect(tokenCss).toContain("url(https://cdn.scripe.org/bg.webp)");

    const a11yCss = buildA11yCss({
      "a11y.focusRing.color": "red; }</style><script>alert(1)</script>",
      "a11y.focusRing.width": "9px; } body{",
      "a11y.focusRing.style": "solid; } *{",
      "a11y.minFontSize": "999",
      "a11y.textAlign": "center; } body{",
      "a11y.animationDuration": "20000",
      "a11y.reducedMotion": "never",
    });

    expect(a11yCss).not.toContain("</style>");
    expect(a11yCss).not.toContain("<script>");
    expect(a11yCss).not.toContain("body{");
    expect(a11yCss).toContain("48px");
    expect(a11yCss).toContain("5000ms");
    expect(a11yCss).toContain("3px solid hsl(var(--primary))");
  });

  it("pairs login-button text with high-contrast --primary-foreground instead of hardcoded white", () => {
    const baseCss = buildBaseStylesheet();
    expect(baseCss).toContain(".login-page .login-button");
    expect(baseCss).not.toContain("color: white;");
    expect(baseCss).toContain("var(--login-button-text, hsl(var(--primary-foreground)))");

    const bridgeCss = buildBridgeCss({
      "color.primary": "#4C6200",
      "dark.color.primary": "#C6FF00",
    });
    expect(bridgeCss).toContain("--primary-foreground: 0 0% 100%;");
    expect(bridgeCss).toContain("--primary-foreground: 216 19% 5%;");
  });

  it("sanitizes author-supplied customCss before injecting <style data-studio-custom-css>", () => {
    renderHook(() =>
      useLoginBrandingTokens({
        loginBrandingJson: JSON.stringify({
          customCss:
            '@import url("https://evil.com/x.css"); </style><script>alert(1)</script> .login-card { border-radius: 12px; background: expression(alert(1)); }',
        }),
        slotConfigJson: null,
        isSafeMode: false,
      })
    );

    const customStyle = document.querySelector("[data-studio-custom-css]");
    expect(customStyle).not.toBeNull();
    const cssText = customStyle?.textContent ?? "";
    expect(cssText).not.toContain("</style>");
    expect(cssText).not.toContain("<script>");
    expect(cssText).not.toContain("@import");
    expect(cssText).not.toContain("expression(");
    expect(cssText).toContain(".login-card");
  });
});
