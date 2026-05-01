/**
 * useAccessibilityChecker — Real-time WCAG AA validation hook
 *
 * Pure computation from StudioDraft state. No side effects, no API calls.
 * Evaluates accessibility checks across 4 categories:
 * - Contrast ratio (WCAG 2.1 AA: 4.5:1 normal, 3:1 large text/UI)
 * - Touch target size (≥ 44px)
 * - Overlay readability (opacity ≥ 0.4 when text over image)
 * - Reduced motion (now reflects draft.a11yReducedMotion setting)
 *
 * Each failing check includes an `autoFix` partial draft that can be applied
 * to bring the check into compliance.
 *
 * @module customization/presentation/hooks
 */
"use client";

import { useMemo } from "react";
import type { StudioDraftProps as StudioDraft } from "../../domain/entities/StudioDraft";

// ── Types ─────────────────────────────────────────────
export type CheckSeverity = "pass" | "warn" | "fail" | "info";
export type CheckCategory = "contrast" | "target" | "overlay" | "motion";

export interface AccessibilityCheck {
  id: string;
  category: CheckCategory;
  severity: CheckSeverity;
  labelKey: string;
  descriptionKey: string;
  details?: string;
  ratio?: number;
  required?: number;
  colorA?: string;
  colorB?: string;
  /** Partial draft update that fixes this check. Only present on fail/warn. */
  autoFix?: Partial<StudioDraft>;
}

export interface AccessibilitySummary {
  pass: number;
  warn: number;
  fail: number;
  info: number;
  total: number;
}

export interface AccessibilityResult {
  checks: AccessibilityCheck[];
  summary: AccessibilitySummary;
  byCategory: Record<CheckCategory, AccessibilityCheck[]>;
}

// ── Color Utilities ───────────────────────────────────

/** Parse hex color (#RGB, #RRGGBB, #RRGGBBAA) to RGB */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!hex || typeof hex !== "string") return null;
  const cleaned = hex.replace("#", "");
  let r: number, g: number, b: number;

  if (cleaned.length === 3) {
    r = parseInt(cleaned[0] + cleaned[0], 16);
    g = parseInt(cleaned[1] + cleaned[1], 16);
    b = parseInt(cleaned[2] + cleaned[2], 16);
  } else if (cleaned.length >= 6) {
    r = parseInt(cleaned.substring(0, 2), 16);
    g = parseInt(cleaned.substring(2, 4), 16);
    b = parseInt(cleaned.substring(4, 6), 16);
  } else {
    return null;
  }

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

/**
 * Calculate relative luminance per WCAG 2.1
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.04045 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate WCAG contrast ratio between two hex colors
 * Returns ratio like 4.5 (meaning 4.5:1)
 */
function contrastRatio(hexA: string, hexB: string): number | null {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  if (!a || !b) return null;

  const lumA = relativeLuminance(a.r, a.g, a.b);
  const lumB = relativeLuminance(b.r, b.g, b.b);

  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);

  return (lighter + 0.05) / (darker + 0.05);
}

/** Format ratio for display */
function formatRatio(ratio: number): string {
  return `${ratio.toFixed(1)}:1`;
}

/**
 * Darken or lighten a foreground color to meet a target contrast against a background.
 * Tries progressively until the ratio is met (up to 30 iterations).
 */
function fixForegroundColor(fgHex: string, bgHex: string, targetRatio: number): string {
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  if (!fg || !bg) return fgHex;

  const bgLum = relativeLuminance(bg.r, bg.g, bg.b);
  // Determine direction: if bg is dark, lighten fg; if bg is light, darken fg
  const shouldLighten = bgLum < 0.5;
  let { r, g, b } = fg;

  for (let i = 0; i < 30; i++) {
    const ratio = contrastRatio(
      `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`,
      bgHex
    );
    if (ratio && ratio >= targetRatio) break;

    if (shouldLighten) {
      r = Math.min(255, r + 8);
      g = Math.min(255, g + 8);
      b = Math.min(255, b + 8);
    } else {
      r = Math.max(0, r - 8);
      g = Math.max(0, g - 8);
      b = Math.max(0, b - 8);
    }
  }

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// ── Check Builders ────────────────────────────────────

function contrastCheck(
  id: string,
  labelKey: string,
  colorA: string,
  colorB: string,
  requiredRatio: number,
  /** Draft key for the foreground color (used by autoFix) */
  fgDraftKey?: keyof StudioDraft
): AccessibilityCheck {
  const ratio = contrastRatio(colorA, colorB);

  if (ratio === null) {
    return {
      id,
      category: "contrast",
      severity: "warn",
      labelKey,
      descriptionKey: "studio.a11y.desc.invalidColor",
      details: "Invalid color value",
      colorA,
      colorB,
    };
  }

  let severity: CheckSeverity;
  if (ratio >= 7) {
    severity = "pass"; // AAA level
  } else if (ratio >= requiredRatio) {
    severity = "pass"; // AA level
  } else if (ratio >= requiredRatio * 0.8) {
    severity = "warn"; // Close but not meeting
  } else {
    severity = "fail"; // Clearly failing
  }

  // Build auto-fix for non-passing checks
  let autoFix: Partial<StudioDraft> | undefined;
  if (severity !== "pass" && fgDraftKey) {
    const fixedColor = fixForegroundColor(colorA, colorB, requiredRatio);
    autoFix = { [fgDraftKey]: fixedColor } as Partial<StudioDraft>;
  }

  return {
    id,
    category: "contrast",
    severity,
    labelKey,
    descriptionKey:
      severity === "pass" ? "studio.a11y.desc.contrastPass" : "studio.a11y.desc.contrastFail",
    details: `${formatRatio(ratio)} (min ${formatRatio(requiredRatio)})`,
    ratio: Math.round(ratio * 10) / 10,
    required: requiredRatio,
    colorA,
    colorB,
    autoFix,
  };
}

// ── Main Hook ─────────────────────────────────────────

export function useAccessibilityChecker(draft: StudioDraft): AccessibilityResult {
  return useMemo(() => {
    const checks: AccessibilityCheck[] = [];

    // ── 1. Contrast Checks (Light Mode) ───────────────

    checks.push(
      contrastCheck(
        "textOnBg",
        "studio.a11y.check.textOnBg",
        draft.textColor,
        draft.bgColor,
        4.5,
        "textColor"
      )
    );
    checks.push(
      contrastCheck(
        "textOnSurface",
        "studio.a11y.check.textOnSurface",
        draft.textColor,
        draft.surfaceColor,
        4.5,
        "textColor"
      )
    );
    checks.push(
      contrastCheck(
        "primaryOnBg",
        "studio.a11y.check.primaryOnBg",
        draft.primaryColor,
        draft.bgColor,
        3.0,
        "primaryColor"
      )
    );
    checks.push(
      contrastCheck(
        "primaryOnSurface",
        "studio.a11y.check.primaryOnSurface",
        draft.primaryColor,
        draft.surfaceColor,
        3.0,
        "primaryColor"
      )
    );
    checks.push(
      contrastCheck(
        "errorOnSurface",
        "studio.a11y.check.errorOnSurface",
        draft.errorColor,
        draft.surfaceColor,
        4.5,
        "errorColor"
      )
    );

    // ── 2. Contrast Checks (Dark Mode) ────────────────

    if (draft.themeMode === "split") {
      checks.push(
        contrastCheck(
          "darkTextOnBg",
          "studio.a11y.check.darkTextOnBg",
          draft.darkTextColor,
          draft.darkBgColor,
          4.5,
          "darkTextColor"
        )
      );
      checks.push(
        contrastCheck(
          "darkTextOnSurface",
          "studio.a11y.check.darkTextOnSurface",
          draft.darkTextColor,
          draft.darkSurfaceColor,
          4.5,
          "darkTextColor"
        )
      );
      checks.push(
        contrastCheck(
          "darkPrimaryOnSurface",
          "studio.a11y.check.darkPrimaryOnSurface",
          draft.darkPrimaryColor,
          draft.darkSurfaceColor,
          3.0,
          "darkPrimaryColor"
        )
      );
    }

    // ── 3. Touch Target Size ──────────────────────────

    const inputPasses = draft.inputHeight >= 44;
    checks.push({
      id: "buttonSize",
      category: "target",
      severity: inputPasses ? "pass" : "fail",
      labelKey: "studio.a11y.check.buttonSize",
      descriptionKey: inputPasses ? "studio.a11y.desc.targetPass" : "studio.a11y.desc.targetFail",
      details: `${draft.inputHeight}px (min 44px)`,
      autoFix: inputPasses ? undefined : { inputHeight: 44 },
    });

    // ── 4. Overlay Readability ────────────────────────

    if (draft.bgType === "image" && draft.bgImageUrl) {
      const overlayOk = draft.bgOverlayEnabled && draft.bgOverlayOpacity >= 0.4;
      checks.push({
        id: "overlayReadability",
        category: "overlay",
        severity: overlayOk ? "pass" : "warn",
        labelKey: "studio.a11y.check.overlayReadability",
        descriptionKey: overlayOk ? "studio.a11y.desc.overlayPass" : "studio.a11y.desc.overlayWarn",
        details: draft.bgOverlayEnabled
          ? `Opacity: ${draft.bgOverlayOpacity.toFixed(1)} (min 0.4)`
          : "No overlay enabled",
        autoFix: overlayOk ? undefined : { bgOverlayEnabled: true, bgOverlayOpacity: 0.5 },
      });
    }

    if (draft.themeMode === "split" && draft.darkBgType === "image" && draft.darkBgImageUrl) {
      const darkOverlayOk = draft.darkBgOverlayEnabled && draft.darkBgOverlayOpacity >= 0.4;
      checks.push({
        id: "darkOverlayReadability",
        category: "overlay",
        severity: darkOverlayOk ? "pass" : "warn",
        labelKey: "studio.a11y.check.darkOverlayReadability",
        descriptionKey: darkOverlayOk
          ? "studio.a11y.desc.overlayPass"
          : "studio.a11y.desc.overlayWarn",
        details: draft.darkBgOverlayEnabled
          ? `Opacity: ${draft.darkBgOverlayOpacity.toFixed(1)} (min 0.4)`
          : "No overlay enabled",
        autoFix: darkOverlayOk
          ? undefined
          : { darkBgOverlayEnabled: true, darkBgOverlayOpacity: 0.5 },
      });
    }

    // ── 5. Reduced Motion ─────────────────────────────

    const motionSeverity: CheckSeverity =
      draft.a11yReducedMotion === "always"
        ? "pass"
        : draft.a11yReducedMotion === "auto"
          ? "pass"
          : "warn";

    checks.push({
      id: "reducedMotion",
      category: "motion",
      severity: motionSeverity,
      labelKey: "studio.a11y.check.reducedMotion",
      descriptionKey: "studio.a11y.desc.reducedMotion",
      details:
        draft.a11yReducedMotion === "always"
          ? "Animations disabled"
          : draft.a11yReducedMotion === "auto"
            ? "Respects user preference"
            : "Animations always active",
      autoFix: motionSeverity !== "pass" ? { a11yReducedMotion: "auto" as const } : undefined,
    });

    // ── Build Summary ─────────────────────────────────

    const summary: AccessibilitySummary = {
      pass: checks.filter((c) => c.severity === "pass").length,
      warn: checks.filter((c) => c.severity === "warn").length,
      fail: checks.filter((c) => c.severity === "fail").length,
      info: checks.filter((c) => c.severity === "info").length,
      total: checks.length,
    };

    // ── Group by Category ─────────────────────────────

    const byCategory: Record<CheckCategory, AccessibilityCheck[]> = {
      contrast: checks.filter((c) => c.category === "contrast"),
      target: checks.filter((c) => c.category === "target"),
      overlay: checks.filter((c) => c.category === "overlay"),
      motion: checks.filter((c) => c.category === "motion"),
    };

    return { checks, summary, byCategory };
  }, [
    draft.textColor,
    draft.bgColor,
    draft.surfaceColor,
    draft.primaryColor,
    draft.errorColor,
    draft.themeMode,
    draft.darkTextColor,
    draft.darkBgColor,
    draft.darkSurfaceColor,
    draft.darkPrimaryColor,
    draft.inputHeight,
    draft.bgType,
    draft.bgImageUrl,
    draft.bgOverlayEnabled,
    draft.bgOverlayOpacity,
    draft.darkBgType,
    draft.darkBgImageUrl,
    draft.darkBgOverlayEnabled,
    draft.darkBgOverlayOpacity,
    draft.a11yReducedMotion,
  ]);
}
