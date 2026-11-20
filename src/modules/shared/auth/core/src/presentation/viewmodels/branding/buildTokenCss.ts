/**
 * buildTokenCss — Builds :root {} and .dark {} CSS variable blocks
 * from the login branding token map.
 *
 * Pure function — returns CSS string, no DOM side-effects.
 */
import { TOKEN_TO_CSS_VAR } from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import { sanitizeCssUrl, sanitizeCssValue } from "./sanitizeBrandingCss";

export function buildTokenCss(tokens: Record<string, string | undefined>): string {
  const rootRules: string[] = [];
  const darkRules: string[] = [];

  // Map known tokens to CSS vars
  for (const [tokenKey, value] of Object.entries(tokens)) {
    const cssVar = TOKEN_TO_CSS_VAR[tokenKey];
    const safeValue = sanitizeCssValue(value);
    if (cssVar && safeValue) rootRules.push(`  ${cssVar}: ${safeValue};`);
  }

  // Split bg mode
  const safeSplitMode = sanitizeCssValue(tokens["split.bg.mode"]);
  if (safeSplitMode) {
    rootRules.push(`  --login-split-bg-mode: ${safeSplitMode};`);
  }

  // Background image — ALWAYS emit
  const safeBgImage = sanitizeCssUrl(tokens["bg.image"]);
  rootRules.push(`  --login-bg-image: ${safeBgImage ? `url(${safeBgImage})` : "none"};`);
  const safeBgFit = sanitizeCssValue(tokens["bg.image.fit"]);
  if (safeBgFit) rootRules.push(`  --login-bg-image-fit: ${safeBgFit};`);
  const safeBgPos = sanitizeCssValue(tokens["bg.image.position"]);
  if (safeBgPos) rootRules.push(`  --login-bg-image-position: ${safeBgPos};`);

  // Gradient overrides solid bg
  const safeBgGradient = sanitizeCssValue(tokens["bg.gradient"]);
  if (safeBgGradient) {
    rootRules.push(`  --login-bg-gradient: ${safeBgGradient};`);
    rootRules.push(`  --login-bg: ${safeBgGradient};`);
  }

  // Panel bg image — ALWAYS emit
  const safePanelBgImage = sanitizeCssUrl(tokens["panel.bg.image"]);
  rootRules.push(
    `  --login-panel-bg-image: ${safePanelBgImage ? `url(${safePanelBgImage})` : "none"};`
  );
  const safePanelBgFit = sanitizeCssValue(tokens["panel.bg.image.fit"]);
  if (safePanelBgFit) rootRules.push(`  --login-panel-bg-image-fit: ${safePanelBgFit};`);
  const safePanelBgPos = sanitizeCssValue(tokens["panel.bg.image.position"]);
  if (safePanelBgPos) rootRules.push(`  --login-panel-bg-image-position: ${safePanelBgPos};`);
  const safePanelBgGradient = sanitizeCssValue(tokens["panel.bg.gradient"]);
  if (safePanelBgGradient) {
    rootRules.push(`  --login-panel-bg-gradient: ${safePanelBgGradient};`);
    rootRules.push(`  --login-panel-bg: ${safePanelBgGradient};`);
  }

  // Overlay CSS vars (use != null: "0" is valid)
  for (const [key, cssVar] of [
    ["overlay.opacity", "--login-overlay-opacity"],
    ["overlay.color", "--login-overlay-color"],
    ["overlay.blur", "--login-overlay-blur"],
    ["panel.overlay.opacity", "--login-panel-overlay-opacity"],
    ["panel.overlay.color", "--login-panel-overlay-color"],
    ["panel.overlay.blur", "--login-panel-overlay-blur"],
  ] as const) {
    const safeV = sanitizeCssValue(tokens[key]);
    if (safeV) rootRules.push(`  ${cssVar}: ${safeV};`);
  }

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
  };
  for (const [tokenKey, cssVar] of Object.entries(darkColorMap)) {
    const safeValue = sanitizeCssValue(tokens[tokenKey]);
    if (safeValue) darkRules.push(`  ${cssVar}: ${safeValue};`);
  }

  // Dark overlay vars
  for (const [key, cssVar] of [
    ["dark.overlay.opacity", "--login-overlay-opacity"],
    ["dark.overlay.color", "--login-overlay-color"],
    ["dark.overlay.blur", "--login-overlay-blur"],
    ["dark.panel.overlay.opacity", "--login-panel-overlay-opacity"],
    ["dark.panel.overlay.color", "--login-panel-overlay-color"],
    ["dark.panel.overlay.blur", "--login-panel-overlay-blur"],
  ] as const) {
    const safeV = sanitizeCssValue(tokens[key]);
    if (safeV) darkRules.push(`  ${cssVar}: ${safeV};`);
  }

  const safeDarkBgGradient = sanitizeCssValue(tokens["dark.bg.gradient"]);
  if (safeDarkBgGradient) {
    darkRules.push(`  --login-bg: ${safeDarkBgGradient};`);
    darkRules.push(`  --login-bg-gradient: ${safeDarkBgGradient};`);
  }
  const safeDarkBgImage = sanitizeCssUrl(tokens["dark.bg.image"]);
  darkRules.push(
    `  --login-bg-image: ${safeDarkBgImage ? `url(${safeDarkBgImage})` : "none"};`
  );

  const safeDarkPanelBg = sanitizeCssValue(tokens["dark.panel.color.background"]);
  if (safeDarkPanelBg) darkRules.push(`  --login-panel-bg: ${safeDarkPanelBg};`);
  const safeDarkPanelGradient = sanitizeCssValue(tokens["dark.panel.bg.gradient"]);
  if (safeDarkPanelGradient) darkRules.push(`  --login-panel-bg: ${safeDarkPanelGradient};`);
  const safeDarkPanelImage = sanitizeCssUrl(tokens["dark.panel.bg.image"]);
  darkRules.push(
    `  --login-panel-bg-image: ${safeDarkPanelImage ? `url(${safeDarkPanelImage})` : "none"};`
  );

  const blocks: string[] = [];
  if (rootRules.length) blocks.push(`:root {\n${rootRules.join("\n")}\n}`);
  if (darkRules.length) blocks.push(`.dark {\n${darkRules.join("\n")}\n}`);
  return blocks.join("\n\n");
}
