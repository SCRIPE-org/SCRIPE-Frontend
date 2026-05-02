/**
 * buildTokenCss — Builds :root {} and .dark {} CSS variable blocks
 * from the login branding token map.
 *
 * Pure function — returns CSS string, no DOM side-effects.
 */
import { TOKEN_TO_CSS_VAR } from "@modules/auth/core/domain/entities/LoginBrandingTypes";

export function buildTokenCss(tokens: Record<string, string | undefined>): string {
  const rootRules: string[] = [];
  const darkRules: string[] = [];

  // Map known tokens to CSS vars
  for (const [tokenKey, value] of Object.entries(tokens)) {
    const cssVar = TOKEN_TO_CSS_VAR[tokenKey];
    if (cssVar && value) rootRules.push(`  ${cssVar}: ${value};`);
  }

  // Split bg mode
  if (tokens["split.bg.mode"]) {
    rootRules.push(`  --login-split-bg-mode: ${tokens["split.bg.mode"]};`);
  }

  // Background image — ALWAYS emit
  rootRules.push(`  --login-bg-image: ${tokens["bg.image"] ? `url(${tokens["bg.image"]})` : "none"};`);
  if (tokens["bg.image.fit"]) rootRules.push(`  --login-bg-image-fit: ${tokens["bg.image.fit"]};`);
  if (tokens["bg.image.position"]) rootRules.push(`  --login-bg-image-position: ${tokens["bg.image.position"]};`);

  // Gradient overrides solid bg
  if (tokens["bg.gradient"]) {
    rootRules.push(`  --login-bg-gradient: ${tokens["bg.gradient"]};`);
    rootRules.push(`  --login-bg: ${tokens["bg.gradient"]};`);
  }

  // Panel bg image — ALWAYS emit
  rootRules.push(`  --login-panel-bg-image: ${tokens["panel.bg.image"] ? `url(${tokens["panel.bg.image"]})` : "none"};`);
  if (tokens["panel.bg.image.fit"]) rootRules.push(`  --login-panel-bg-image-fit: ${tokens["panel.bg.image.fit"]};`);
  if (tokens["panel.bg.image.position"]) rootRules.push(`  --login-panel-bg-image-position: ${tokens["panel.bg.image.position"]};`);
  if (tokens["panel.bg.gradient"]) {
    rootRules.push(`  --login-panel-bg-gradient: ${tokens["panel.bg.gradient"]};`);
    rootRules.push(`  --login-panel-bg: ${tokens["panel.bg.gradient"]};`);
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
    const v = tokens[key];
    if (v != null && v !== "") rootRules.push(`  ${cssVar}: ${v};`);
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
    const value = tokens[tokenKey];
    if (value) darkRules.push(`  ${cssVar}: ${value};`);
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
    const v = tokens[key];
    if (v != null && v !== "") darkRules.push(`  ${cssVar}: ${v};`);
  }

  if (tokens["dark.bg.gradient"]) {
    darkRules.push(`  --login-bg: ${tokens["dark.bg.gradient"]};`);
    darkRules.push(`  --login-bg-gradient: ${tokens["dark.bg.gradient"]};`);
  }
  darkRules.push(`  --login-bg-image: ${tokens["dark.bg.image"] ? `url(${tokens["dark.bg.image"]})` : "none"};`);

  if (tokens["dark.panel.color.background"]) darkRules.push(`  --login-panel-bg: ${tokens["dark.panel.color.background"]};`);
  if (tokens["dark.panel.bg.gradient"]) darkRules.push(`  --login-panel-bg: ${tokens["dark.panel.bg.gradient"]};`);
  darkRules.push(`  --login-panel-bg-image: ${tokens["dark.panel.bg.image"] ? `url(${tokens["dark.panel.bg.image"]})` : "none"};`);

  const blocks: string[] = [];
  if (rootRules.length) blocks.push(`:root {\n${rootRules.join("\n")}\n}`);
  if (darkRules.length) blocks.push(`.dark {\n${darkRules.join("\n")}\n}`);
  return blocks.join("\n\n");
}
