/**
 * parseA11yConfig — Extracts AccessibilityConfig from branding tokens.
 *
 * Pure function, no side-effects. Safe defaults for all fields.
 */
import type { AccessibilityConfig } from "../useLoginBrandingTokens";

export function parseA11yConfig(tokens: Record<string, string | undefined>): AccessibilityConfig {
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
