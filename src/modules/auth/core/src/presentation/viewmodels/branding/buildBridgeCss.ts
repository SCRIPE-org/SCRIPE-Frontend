/**
 * buildBridgeCss — Builds shadcn CSS variable bridge rules.
 *
 * Converts hex login tokens → HSL channel format required by shadcn/ui
 * and scopes them to .login-page so they only affect the login page.
 *
 * Pure function — returns CSS string, no DOM side-effects.
 */

function hexToHslValues(hex: string): string | null {
  if (!hex || !hex.startsWith("#")) return null;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return `0 0% ${Math.round(l * 100)}%`;
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function buildBridgeCss(tokens: Record<string, string | undefined>): string {
  const push = (arr: string[], varName: string, hex: string | undefined) => {
    if (!hex) return;
    const hsl = hexToHslValues(hex);
    if (hsl) arr.push(`  ${varName}: ${hsl};`);
  };

  const bridgeRules: string[] = [];
  push(bridgeRules, "--primary", tokens["color.primary"]);
  push(bridgeRules, "--secondary", tokens["color.secondary"]);
  push(bridgeRules, "--background", tokens["color.background"]);
  push(bridgeRules, "--card", tokens["color.surface"]);
  push(bridgeRules, "--foreground", tokens["color.text"]);
  push(bridgeRules, "--card-foreground", tokens["color.text"]);
  push(bridgeRules, "--muted-foreground", tokens["color.textMuted"]);
  push(bridgeRules, "--border", tokens["color.border"]);
  push(bridgeRules, "--input", tokens["color.border"]);
  push(bridgeRules, "--destructive", tokens["color.error"]);
  push(bridgeRules, "--accent", tokens["color.accent"]);
  push(bridgeRules, "--ring", tokens["color.primary"]);
  if (tokens["color.primary"]) bridgeRules.push(`  --primary-foreground: 0 0% 100%;`);

  const darkBridgeRules: string[] = [];
  push(darkBridgeRules, "--primary", tokens["dark.color.primary"]);
  push(darkBridgeRules, "--secondary", tokens["dark.color.secondary"]);
  push(darkBridgeRules, "--background", tokens["dark.color.background"]);
  push(darkBridgeRules, "--card", tokens["dark.color.surface"]);
  push(darkBridgeRules, "--foreground", tokens["dark.color.text"]);
  push(darkBridgeRules, "--card-foreground", tokens["dark.color.text"]);
  push(darkBridgeRules, "--muted-foreground", tokens["dark.color.textMuted"]);
  push(darkBridgeRules, "--border", tokens["dark.color.border"]);
  push(darkBridgeRules, "--input", tokens["dark.color.border"]);
  push(darkBridgeRules, "--destructive", tokens["dark.color.error"]);
  push(darkBridgeRules, "--ring", tokens["dark.color.primary"]);
  if (tokens["dark.color.primary"]) darkBridgeRules.push(`  --primary-foreground: 0 0% 100%;`);

  const blocks: string[] = [];
  if (bridgeRules.length) blocks.push(`.login-page {\n${bridgeRules.join("\n")}\n}`);
  if (darkBridgeRules.length) blocks.push(`.dark .login-page {\n${darkBridgeRules.join("\n")}\n}`);
  return blocks.join("\n\n");
}
