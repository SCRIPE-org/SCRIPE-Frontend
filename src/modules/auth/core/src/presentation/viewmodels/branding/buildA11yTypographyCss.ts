/**
 * buildA11yTypographyCss — Typography, contrast, and readability generators.
 * Extracted from buildA11yCss (#3–9, #11–16, #18–19, #21–22).
 */
export function buildA11yTypographyCss(
  tokens: Record<string, string | undefined>,
  focusColor: string
): string[] {
  const css: string[] = [];

  // 3. High Contrast
  if (tokens["a11y.highContrast"] === "true") {
    css.push(`/* ═══ Accessibility: High Contrast Mode ═══ */
.login-page { --login-text: #000000 !important; --login-text-muted: #1a1a1a !important; --login-border: #000000 !important; }
.login-page input, .login-page button, .login-page a { border-width: 2px !important; }
.login-page .login-heading, .login-page .login-subtitle, .login-page .login-label, .login-page label { font-weight: 700 !important; }
.dark .login-page { --login-text: #ffffff !important; --login-text-muted: #e5e5e5 !important; --login-border: #ffffff !important; }`);
  }

  // 4. Min Font Size
  const minFontSize = parseInt(tokens["a11y.minFontSize"] || "14");
  if (minFontSize > 12) {
    css.push(`/* ═══ Accessibility: Min Font Size (${minFontSize}px) ═══ */
.login-page { font-size: max(${minFontSize}px, 1rem) !important; }
.login-page input, .login-page button, .login-page label, .login-page p, .login-page span, .login-page a { font-size: max(inherit, ${minFontSize}px) !important; }
.login-page .login-subtitle, .login-page .login-footer { font-size: max(${minFontSize - 2}px, 0.75rem) !important; }`);
  }

  // 6. Forced Colors
  if (tokens["a11y.forcedColors"] !== "false") {
    css.push(`/* ═══ Accessibility: Forced Colors (Windows High Contrast) ═══ */
@media (forced-colors: active) {
  .login-page input { border: 2px solid ButtonText !important; }
  .login-page button[type="submit"] { background: ButtonFace !important; color: ButtonText !important; border: 2px solid ButtonText !important; forced-color-adjust: none; }
  .login-page a { color: LinkText !important; text-decoration: underline !important; }
  .login-page .login-heading, .login-page label { color: CanvasText !important; }
  .login-skip-link:focus { background: Highlight !important; color: HighlightText !important; }
}`);
  }

  // 7. Contrast Preset
  const contrastPreset = tokens["a11y.contrastPreset"] || "normal";
  if (contrastPreset === "dark") {
    css.push(`/* ═══ Accessibility: Dark Contrast Preset ═══ */
.login-page { --login-bg: #1a1a1a !important; --login-surface: #2a2a2a !important; --login-text: #ffffff !important; --login-text-muted: #cccccc !important; --login-border: #555555 !important; }
.login-page .login-card { background-color: #2a2a2a !important; }`);
  } else if (contrastPreset === "light") {
    css.push(`/* ═══ Accessibility: Light Contrast Preset ═══ */
.login-page { --login-bg: #ffffff !important; --login-surface: #f8f8f8 !important; --login-text: #000000 !important; --login-text-muted: #333333 !important; --login-border: #cccccc !important; }
.login-page .login-card { background-color: #f8f8f8 !important; }`);
  } else if (contrastPreset === "inverted") {
    css.push(`.login-page { filter: invert(1) hue-rotate(180deg) !important; }
.login-page img, .login-page .login-logo { filter: invert(1) hue-rotate(180deg) !important; }`);
  } else if (contrastPreset === "monochrome") {
    css.push(`.login-page { filter: grayscale(1) !important; }`);
  }

  // 8. Saturation
  const saturation = parseInt(tokens["a11y.saturation"] || "100");
  if (saturation !== 100) {
    css.push(`.login-page { filter: saturate(${saturation / 100}) !important; }`);
  }

  // 9. Highlight Links
  if (tokens["a11y.highlightLinks"] === "true") {
    css.push(`/* ═══ Accessibility: Highlight Links ═══ */
.login-page a { text-decoration: underline !important; text-decoration-thickness: 2px !important; text-underline-offset: 3px !important; outline: 2px solid currentColor !important; outline-offset: 2px !important; border-radius: 2px !important; }`);
  }

  // 11. Content Scaling
  const contentScaling = parseInt(tokens["a11y.contentScaling"] || "100");
  if (contentScaling !== 100) {
    const scale = contentScaling / 100;
    css.push(`.login-page .login-form-wrapper { transform: scale(${scale}) !important; transform-origin: top center !important; }`);
  }

  // 12. Line Height
  const lineHeight = parseFloat(tokens["a11y.lineHeight"] || "0");
  if (lineHeight > 0) {
    css.push(`.login-page, .login-page * { line-height: ${lineHeight} !important; }`);
  }

  // 13. Letter Spacing
  const letterSpacing = parseFloat(tokens["a11y.letterSpacing"] || "0");
  if (letterSpacing > 0) {
    css.push(`.login-page, .login-page * { letter-spacing: ${letterSpacing}px !important; }`);
  }

  // 14. Word Spacing
  const wordSpacing = parseFloat(tokens["a11y.wordSpacing"] || "0");
  if (wordSpacing > 0) {
    css.push(`.login-page, .login-page * { word-spacing: ${wordSpacing}px !important; }`);
  }

  // 15. Dyslexic Font
  if (tokens["a11y.dyslexicFont"] === "true") {
    css.push(`/* ═══ Accessibility: Dyslexia-Friendly Font ═══ */
@font-face { font-family: 'OpenDyslexic'; src: url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/woff/OpenDyslexic-Regular.woff') format('woff'); font-weight: normal; font-display: swap; }
@font-face { font-family: 'OpenDyslexic'; src: url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/woff/OpenDyslexic-Bold.woff') format('woff'); font-weight: bold; font-display: swap; }
.login-page, .login-page * { font-family: 'OpenDyslexic', sans-serif !important; }`);
  }

  // 16. Text Align
  const textAlign = tokens["a11y.textAlign"] || "inherit";
  if (textAlign !== "inherit") {
    css.push(`.login-page p, .login-page label, .login-page span, .login-page .login-heading, .login-page .login-subtitle, .login-page .login-footer { text-align: ${textAlign} !important; }`);
  }

  // 18. Reading Guide
  if (tokens["a11y.readingGuide"] === "true") {
    css.push(`/* ═══ Accessibility: Reading Guide ═══ */
.login-a11y-reading-guide { position: fixed; left: 0; right: 0; height: 12px;
  background: linear-gradient(to bottom, transparent 0%, ${focusColor}40 40%, ${focusColor}80 50%, ${focusColor}40 60%, transparent 100%);
  pointer-events: none; z-index: 99999; transition: top 0.05s linear; }`);
  }

  // 19. Reading Mask
  if (tokens["a11y.readingMask"] === "true") {
    css.push(`/* ═══ Accessibility: Reading Mask ═══ */
.login-a11y-reading-mask-top, .login-a11y-reading-mask-bottom { position: fixed; left: 0; right: 0; background: rgba(0,0,0,0.7); pointer-events: none; z-index: 99998; transition: all 0.05s linear; }
.login-a11y-reading-mask-top { top: 0; }
.login-a11y-reading-mask-bottom { bottom: 0; }`);
  }

  // 21. Hide Images
  if (tokens["a11y.hideImages"] === "true") {
    css.push(`.login-page { background-image: none !important; }
.login-page [class*="bg-"] { background-image: none !important; }
.login-page .login-logo img { filter: grayscale(1) opacity(0.3) !important; }
.login-page .login-overlay { backdrop-filter: none !important; }`);
  }

  // 22. Enhanced Tooltips
  if (tokens["a11y.tooltips"] === "true") {
    css.push(`.login-page [title]:hover::after { content: attr(title); position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); padding: 6px 12px; background: var(--login-text, #000); color: var(--login-bg, #fff); font-size: 13px; border-radius: 6px; white-space: nowrap; z-index: 99999; pointer-events: none; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
.login-page [title] { position: relative; }`);
  }

  return css;
}
