/**
 * useStudioViewModel — Complete state management for the Ultimate Customizer Studio
 *
 * Clean Architecture: ViewModel → Repository (domain interface) → Service → API
 *
 * - All changes are DRAFT only (no live mutation)
 * - Auto-saves draft to DraftBrandingJson every 5s
 * - Publish: copies draft → live, increments version
 * - Discard: clears draft, reverts to live
 *
 * Security: origin-validated postMessage, XSS-safe JSON, CTA URL validation
 * i18n: All user-facing strings via t() translation
 * Scalability: Token-based design system, extensible slot/block architecture
 */
"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { type TenantBrandingData } from "@core/providers/tenant-branding-provider";
import { systemContainer } from "@modules/system/di";
import type {
  LoginLayout,
  LoginSlotId,
  ContentBlock,
  SlotConfig,
} from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import {
  type StudioDraftProps as StudioDraft,
  DEFAULT_DRAFT,
  DEVICE_DIMENSIONS,
  type DeviceSize,
  type StudioPanel,
  type AuthPageId,
  type AuthPageOverride,
  type AuthPageOverrides,
  DEFAULT_PAGE_OVERRIDES,
} from "../../domain/entities/StudioDraft";

// ── All 22 Layouts ─────────────────────────────────────
export const ALL_LAYOUTS: {
  id: LoginLayout;
  labelKey: string;
  descKey: string;
  thumbnail: string; // ASCII art for mini preview
}[] = [
  { id: "split-right",     labelKey: "studio.layout.splitRight",     descKey: "studio.layout.splitRightDesc",     thumbnail: "◧" },
  { id: "split-left",      labelKey: "studio.layout.splitLeft",      descKey: "studio.layout.splitLeftDesc",      thumbnail: "◨" },
  { id: "centered",        labelKey: "studio.layout.centered",       descKey: "studio.layout.centeredDesc",       thumbnail: "◉" },
  { id: "branded-full",    labelKey: "studio.layout.brandedFull",    descKey: "studio.layout.brandedFullDesc",    thumbnail: "▣" },
  { id: "minimal",         labelKey: "studio.layout.minimal",        descKey: "studio.layout.minimalDesc",        thumbnail: "▭" },
  { id: "overlay",         labelKey: "studio.layout.overlay",        descKey: "studio.layout.overlayDesc",        thumbnail: "◫" },
  { id: "magazine",        labelKey: "studio.layout.magazine",       descKey: "studio.layout.magazineDesc",       thumbnail: "▤" },
  { id: "stacked",         labelKey: "studio.layout.stacked",        descKey: "studio.layout.stackedDesc",        thumbnail: "▥" },
  { id: "sidebar-compact", labelKey: "studio.layout.sidebarCompact", descKey: "studio.layout.sidebarCompactDesc", thumbnail: "▮" },
  { id: "asymmetric",      labelKey: "studio.layout.asymmetric",     descKey: "studio.layout.asymmetricDesc",     thumbnail: "◰" },
  { id: "floating",        labelKey: "studio.layout.floating",       descKey: "studio.layout.floatingDesc",       thumbnail: "◻" },
  { id: "immersive",       labelKey: "studio.layout.immersive",      descKey: "studio.layout.immersiveDesc",      thumbnail: "◼" },
  { id: "split-diagonal",  labelKey: "studio.layout.splitDiagonal",  descKey: "studio.layout.splitDiagonalDesc",  thumbnail: "◸" },
  { id: "carousel",        labelKey: "studio.layout.carousel",       descKey: "studio.layout.carouselDesc",       thumbnail: "⟳" },
  { id: "glass-morphism",  labelKey: "studio.layout.glassMorphism",  descKey: "studio.layout.glassMorphismDesc",  thumbnail: "◇" },
  { id: "gradient-wave",   labelKey: "studio.layout.gradientWave",   descKey: "studio.layout.gradientWaveDesc",   thumbnail: "∿" },
  { id: "spotlight",       labelKey: "studio.layout.spotlight",      descKey: "studio.layout.spotlightDesc",      thumbnail: "◎" },
  { id: "dual-panel",      labelKey: "studio.layout.dualPanel",      descKey: "studio.layout.dualPanelDesc",      thumbnail: "▦" },
  { id: "corner-card",     labelKey: "studio.layout.cornerCard",     descKey: "studio.layout.cornerCardDesc",     thumbnail: "◳" },
  { id: "vertical-split",  labelKey: "studio.layout.verticalSplit",  descKey: "studio.layout.verticalSplitDesc",  thumbnail: "⬒" },
  { id: "fullscreen-form", labelKey: "studio.layout.fullscreenForm", descKey: "studio.layout.fullscreenFormDesc", thumbnail: "▢" },
  { id: "mosaic",          labelKey: "studio.layout.mosaic",         descKey: "studio.layout.mosaicDesc",         thumbnail: "▩" },
];

// Re-export domain types so existing component imports still work
export type { StudioDraft, DeviceSize, StudioPanel, AuthPageId, AuthPageOverride, AuthPageOverrides };
export { DEFAULT_DRAFT, DEVICE_DIMENSIONS, DEFAULT_PAGE_OVERRIDES };

// ── Font Options (English) ─────────────────────────────
export const FONT_OPTIONS_EN = [
  "Inter", "Roboto", "Poppins", "Outfit", "Plus Jakarta Sans",
  "DM Sans", "Source Sans 3", "Nunito", "Lato", "Montserrat",
  "Open Sans", "Raleway", "Work Sans", "Manrope", "Geist",
  "Figtree", "Lexend", "Sora", "Bricolage Grotesque",
  "system-ui",
];

// ── Font Options (Arabic) ──────────────────────────────
export const FONT_OPTIONS_AR = [
  "Cairo", "Tajawal", "IBM Plex Sans Arabic", "Noto Kufi Arabic",
  "Amiri", "El Messiri", "Almarai", "Changa",
  "Noto Sans Arabic", "Readex Pro", "Rubik",
  "system-ui",
];

// ── Color Presets ──────────────────────────────────────
export const COLOR_PRESETS: { labelKey: string; colors: Partial<StudioDraft> }[] = [
  {
    labelKey: "studio.preset.proDark",
    colors: {
      // Light palette
      primaryColor: "#3b82f6", secondaryColor: "#64748b", bgColor: "#ffffff", surfaceColor: "#f8fafc",
      textColor: "#0f172a", mutedColor: "#64748b", borderColor: "#e2e8f0",
      // Dark palette
      darkPrimaryColor: "#3b82f6", darkSecondaryColor: "#94a3b8", darkBgColor: "#0f172a", darkSurfaceColor: "#1e293b",
      darkTextColor: "#f8fafc", darkMutedColor: "#94a3b8", darkBorderColor: "#334155",
    },
  },
  {
    labelKey: "studio.preset.oceanBlue",
    colors: {
      primaryColor: "#0ea5e9", secondaryColor: "#38bdf8", bgColor: "#f0f9ff", surfaceColor: "#e0f2fe",
      textColor: "#0c4a6e", mutedColor: "#64748b", borderColor: "#bae6fd",
      darkPrimaryColor: "#0ea5e9", darkSecondaryColor: "#38bdf8", darkBgColor: "#0c1222", darkSurfaceColor: "#172038",
      darkTextColor: "#e2e8f0", darkMutedColor: "#64748b", darkBorderColor: "#1e3a5a",
    },
  },
  {
    labelKey: "studio.preset.forestGreen",
    colors: {
      primaryColor: "#10b981", secondaryColor: "#34d399", bgColor: "#f0fdf4", surfaceColor: "#dcfce7",
      textColor: "#14532d", mutedColor: "#6b7280", borderColor: "#bbf7d0",
      darkPrimaryColor: "#10b981", darkSecondaryColor: "#6ee7b7", darkBgColor: "#0a1f15", darkSurfaceColor: "#132f21",
      darkTextColor: "#ecfdf5", darkMutedColor: "#6ee7b7", darkBorderColor: "#1a4732",
    },
  },
  {
    labelKey: "studio.preset.sunsetWarm",
    colors: {
      primaryColor: "#f59e0b", secondaryColor: "#fbbf24", bgColor: "#fffbeb", surfaceColor: "#fef3c7",
      textColor: "#78350f", mutedColor: "#92400e", borderColor: "#fde68a",
      darkPrimaryColor: "#f59e0b", darkSecondaryColor: "#fbbf24", darkBgColor: "#1c1008", darkSurfaceColor: "#2a1b0f",
      darkTextColor: "#fef3c7", darkMutedColor: "#d97706", darkBorderColor: "#451a03",
    },
  },
  {
    labelKey: "studio.preset.monochrome",
    colors: {
      primaryColor: "#71717a", secondaryColor: "#a1a1aa", bgColor: "#fafafa", surfaceColor: "#f4f4f5",
      textColor: "#18181b", mutedColor: "#71717a", borderColor: "#e4e4e7",
      darkPrimaryColor: "#a1a1aa", darkSecondaryColor: "#71717a", darkBgColor: "#09090b", darkSurfaceColor: "#18181b",
      darkTextColor: "#fafafa", darkMutedColor: "#71717a", darkBorderColor: "#27272a",
    },
  },
  {
    labelKey: "studio.preset.purpleNight",
    colors: {
      primaryColor: "#8b5cf6", secondaryColor: "#a78bfa", bgColor: "#faf5ff", surfaceColor: "#f3e8ff",
      textColor: "#3b0764", mutedColor: "#7c3aed", borderColor: "#e9d5ff",
      darkPrimaryColor: "#8b5cf6", darkSecondaryColor: "#a78bfa", darkBgColor: "#0f0720", darkSurfaceColor: "#1a0e38",
      darkTextColor: "#f5f3ff", darkMutedColor: "#a78bfa", darkBorderColor: "#2e1f5e",
    },
  },
];

// ── Hook ───────────────────────────────────────────────
export interface StudioViewModelOptions {
  /** Encrypted tenant ID for drilldown mode (super admin customizing a specific tenant) */
  targetTenantId?: string;
  /** Tenant name for drilldown banner */
  targetTenantName?: string;
}

export function useStudioViewModel(options?: StudioViewModelOptions) {
  const { t } = useI18n();
  const { success: toastSuccess, error: toastError } = useEnhancedToast();
  const queryClient = useQueryClient();
  const repository = systemContainer.customizationRepository;

  const targetTenantId = options?.targetTenantId;

  // ── Fetch raw branding data via Repository ──
  const brandingQuery = useQuery<TenantBrandingData | null>({
    queryKey: ["studio-branding", targetTenantId ?? "self"],
    queryFn: async () => {
      try {
        if (targetTenantId) {
          // Drilldown mode: fetch via repository
          const entity = await repository.getTenantBrandingById(targetTenantId);
          return entity.toProps() as unknown as TenantBrandingData;
        }
        // My tenant mode via repository
        const entity = await repository.getMyBranding();
        return entity.toProps() as unknown as TenantBrandingData;
      } catch {
        return null;
      }
    },
    staleTime: 30_000,
  });

  const branding = brandingQuery.data;

  // Mode is backend-driven: "my" | "system" | "tenant"
  const mode: 'my' | 'system' | 'tenant' = targetTenantId
    ? 'tenant'
    : (branding as any)?.mode === 'system'
      ? 'system'
      : 'my';

  // ── State ──
  const [draft, setDraft] = useState<StudioDraft>(DEFAULT_DRAFT);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [deviceSize, setDeviceSize] = useState<DeviceSize>("desktop");
  const [activePanel, setActivePanel] = useState<StudioPanel>("layout");
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [activeAuthPage, setActiveAuthPage] = useState<AuthPageId>("login");
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ── Build draft from branding data (reused by init + discard) ──
  const buildDraftFromBranding = useCallback((brandingData: TenantBrandingData, useDraft = true): StudioDraft => {
    const live = brandingData.loginBrandingJson ? JSON.parse(brandingData.loginBrandingJson) : {};
    const draftJson = useDraft && (brandingData as any).draftBrandingJson
      ? JSON.parse((brandingData as any).draftBrandingJson) : null;

    const source = draftJson || live;
    const tokens = source.tokens || {};
    const slotRaw = brandingData.slotConfigJson || (brandingData as any).slotConfigJson;

    return {
      layout: source.layout || "split-right",
      headline: source.headline || "",
      subtitle: source.subtitle || "",
      companyName: source.companyName || brandingData.companyName || "",
      logoUrl: source.logoUrl || brandingData.logoUrl || "",
      faviconUrl: source.faviconUrl || (brandingData as any).faviconUrl || "",
      copyrightText: source.copyrightText || "",
      // Colors
      primaryColor: tokens["color.primary"] || brandingData.primaryColor || DEFAULT_DRAFT.primaryColor,
      secondaryColor: tokens["color.secondary"] || brandingData.secondaryColor || DEFAULT_DRAFT.secondaryColor,
      bgColor: tokens["color.background"] || DEFAULT_DRAFT.bgColor,
      surfaceColor: tokens["color.surface"] || DEFAULT_DRAFT.surfaceColor,
      textColor: tokens["color.text"] || DEFAULT_DRAFT.textColor,
      mutedColor: tokens["color.textMuted"] || DEFAULT_DRAFT.mutedColor,
      borderColor: tokens["color.border"] || DEFAULT_DRAFT.borderColor,
      errorColor: tokens["color.error"] || DEFAULT_DRAFT.errorColor,
      successColor: tokens["color.success"] || DEFAULT_DRAFT.successColor,
      themeMode: source.themeMode || "unified",
      darkPrimaryColor: tokens["dark.color.primary"] || DEFAULT_DRAFT.darkPrimaryColor,
      darkSecondaryColor: tokens["dark.color.secondary"] || DEFAULT_DRAFT.darkSecondaryColor,
      darkBgColor: tokens["dark.color.background"] || DEFAULT_DRAFT.darkBgColor,
      darkSurfaceColor: tokens["dark.color.surface"] || DEFAULT_DRAFT.darkSurfaceColor,
      darkTextColor: tokens["dark.color.text"] || DEFAULT_DRAFT.darkTextColor,
      darkMutedColor: tokens["dark.color.textMuted"] || DEFAULT_DRAFT.darkMutedColor,
      darkBorderColor: tokens["dark.color.border"] || DEFAULT_DRAFT.darkBorderColor,
      darkErrorColor: tokens["dark.color.error"] || DEFAULT_DRAFT.darkErrorColor,
      darkSuccessColor: tokens["dark.color.success"] || DEFAULT_DRAFT.darkSuccessColor,
      // Typography
      fontFamily: tokens["font.body"] || DEFAULT_DRAFT.fontFamily,
      fontFamilyAr: tokens["font.bodyAr"] || DEFAULT_DRAFT.fontFamilyAr,
      headingFont: tokens["font.heading"] || "",
      headingSize: parseInt(tokens["font.size.headline"] || "") || DEFAULT_DRAFT.headingSize,
      bodySize: parseInt(tokens["font.size.subtitle"] || "") || DEFAULT_DRAFT.bodySize,
      headingWeight: parseInt(tokens["font.weight.heading"] || "") || DEFAULT_DRAFT.headingWeight,
      bodyWeight: parseInt(tokens["font.weight.body"] || "") || DEFAULT_DRAFT.bodyWeight,
      lineHeight: parseFloat(tokens["font.lineHeight"] || "") || DEFAULT_DRAFT.lineHeight,
      letterSpacing: parseFloat(tokens["font.letterSpacing"] || "") || DEFAULT_DRAFT.letterSpacing,
      // Background
      bgType: source.bgType || "solid",
      bgGradientDirection: source.bgGradientDirection || DEFAULT_DRAFT.bgGradientDirection,
      bgGradientFrom: source.bgGradientFrom || DEFAULT_DRAFT.bgGradientFrom,
      bgGradientTo: source.bgGradientTo || DEFAULT_DRAFT.bgGradientTo,
      bgImageUrl: tokens["bg.image"] || "",
      bgImageFit: source.bgImageFit || DEFAULT_DRAFT.bgImageFit,
      bgImagePosition: source.bgImagePosition || DEFAULT_DRAFT.bgImagePosition,
      bgOverlayEnabled: source.bgOverlayEnabled ?? false,
      bgOverlayColor: source.bgOverlayColor || DEFAULT_DRAFT.bgOverlayColor,
      bgOverlayOpacity: parseFloat(tokens["overlay.opacity"] || "") || DEFAULT_DRAFT.bgOverlayOpacity,
      bgBlur: parseInt(source.bgBlur || "") || DEFAULT_DRAFT.bgBlur,
      // Dark background
      darkBgType: source.darkBgType || DEFAULT_DRAFT.darkBgType,
      darkBgGradientDirection: source.darkBgGradientDirection || DEFAULT_DRAFT.darkBgGradientDirection,
      darkBgGradientFrom: source.darkBgGradientFrom || DEFAULT_DRAFT.darkBgGradientFrom,
      darkBgGradientTo: source.darkBgGradientTo || DEFAULT_DRAFT.darkBgGradientTo,
      darkBgImageUrl: tokens["dark.bg.image"] || source.darkBgImageUrl || "",
      darkBgImageFit: source.darkBgImageFit || DEFAULT_DRAFT.darkBgImageFit,
      darkBgImagePosition: source.darkBgImagePosition || DEFAULT_DRAFT.darkBgImagePosition,
      darkBgOverlayEnabled: source.darkBgOverlayEnabled ?? false,
      darkBgOverlayColor: source.darkBgOverlayColor || DEFAULT_DRAFT.darkBgOverlayColor,
      darkBgOverlayOpacity: parseFloat(tokens["dark.overlay.opacity"] || "") || DEFAULT_DRAFT.darkBgOverlayOpacity,
      darkBgBlur: parseInt(source.darkBgBlur || "") || DEFAULT_DRAFT.darkBgBlur,
      // Split panel bg — LIGHT
      splitBgMode: source.splitBgMode || DEFAULT_DRAFT.splitBgMode,
      panelBgType: source.panelBgType || DEFAULT_DRAFT.panelBgType,
      panelBgColor: tokens["panel.color.background"] || source.panelBgColor || DEFAULT_DRAFT.panelBgColor,
      panelBgGradientDirection: source.panelBgGradientDirection || DEFAULT_DRAFT.panelBgGradientDirection,
      panelBgGradientFrom: source.panelBgGradientFrom || DEFAULT_DRAFT.panelBgGradientFrom,
      panelBgGradientTo: source.panelBgGradientTo || DEFAULT_DRAFT.panelBgGradientTo,
      panelBgImageUrl: tokens["panel.bg.image"] || source.panelBgImageUrl || "",
      panelBgImageFit: source.panelBgImageFit || DEFAULT_DRAFT.panelBgImageFit,
      panelBgImagePosition: source.panelBgImagePosition || DEFAULT_DRAFT.panelBgImagePosition,
      panelBgOverlayEnabled: source.panelBgOverlayEnabled ?? false,
      panelBgOverlayColor: source.panelBgOverlayColor || DEFAULT_DRAFT.panelBgOverlayColor,
      panelBgOverlayOpacity: parseFloat(source.panelBgOverlayOpacity || "") || DEFAULT_DRAFT.panelBgOverlayOpacity,
      panelBgBlur: parseInt(source.panelBgBlur || "") || DEFAULT_DRAFT.panelBgBlur,
      // Split panel bg — DARK
      darkPanelBgType: source.darkPanelBgType || DEFAULT_DRAFT.darkPanelBgType,
      darkPanelBgColor: tokens["dark.panel.color.background"] || source.darkPanelBgColor || DEFAULT_DRAFT.darkPanelBgColor,
      darkPanelBgGradientDirection: source.darkPanelBgGradientDirection || DEFAULT_DRAFT.darkPanelBgGradientDirection,
      darkPanelBgGradientFrom: source.darkPanelBgGradientFrom || DEFAULT_DRAFT.darkPanelBgGradientFrom,
      darkPanelBgGradientTo: source.darkPanelBgGradientTo || DEFAULT_DRAFT.darkPanelBgGradientTo,
      darkPanelBgImageUrl: tokens["dark.panel.bg.image"] || source.darkPanelBgImageUrl || "",
      darkPanelBgImageFit: source.darkPanelBgImageFit || DEFAULT_DRAFT.darkPanelBgImageFit,
      darkPanelBgImagePosition: source.darkPanelBgImagePosition || DEFAULT_DRAFT.darkPanelBgImagePosition,
      darkPanelBgOverlayEnabled: source.darkPanelBgOverlayEnabled ?? false,
      darkPanelBgOverlayColor: source.darkPanelBgOverlayColor || DEFAULT_DRAFT.darkPanelBgOverlayColor,
      darkPanelBgOverlayOpacity: parseFloat(source.darkPanelBgOverlayOpacity || "") || DEFAULT_DRAFT.darkPanelBgOverlayOpacity,
      darkPanelBgBlur: parseInt(source.darkPanelBgBlur || "") || DEFAULT_DRAFT.darkPanelBgBlur,
      // Spacing
      borderRadius: parseInt(tokens["radius.card"] || "") || DEFAULT_DRAFT.borderRadius,
      formWidth: parseInt(source.formWidth || "") || DEFAULT_DRAFT.formWidth,
      cardPadding: parseInt(source.cardPadding || "") || DEFAULT_DRAFT.cardPadding,
      elementGap: parseInt(source.elementGap || "") || DEFAULT_DRAFT.elementGap,
      inputHeight: parseInt(source.inputHeight || "") || DEFAULT_DRAFT.inputHeight,
      btnRadius: parseInt(tokens["radius.button"] || "") || DEFAULT_DRAFT.btnRadius,
      btnSize: source.btnSize || DEFAULT_DRAFT.btnSize,
      // Slots
      slotConfig: slotRaw ? JSON.parse(slotRaw) : { _schemaVersion: 1, slots: {} },
      // Advanced
      customCss: source.customCss || "",
      safeMode: (brandingData as any).isSafeMode ?? false,
      // Multi-Page Branding
      pageOverrides: source.pages || {},
      // Accessibility
      // Focus & Keyboard
      a11yFocusRingEnabled: source.a11yFocusRingEnabled ?? tokens["a11y.focusRing.enabled"] !== "false",
      a11yFocusRingColor: source.a11yFocusRingColor || tokens["a11y.focusRing.color"] || DEFAULT_DRAFT.a11yFocusRingColor,
      a11yFocusRingWidth: parseInt(tokens["a11y.focusRing.width"] || "") || source.a11yFocusRingWidth || DEFAULT_DRAFT.a11yFocusRingWidth,
      a11yFocusRingStyle: source.a11yFocusRingStyle || DEFAULT_DRAFT.a11yFocusRingStyle,
      a11ySkipLinkEnabled: source.a11ySkipLinkEnabled ?? tokens["a11y.skipLink.enabled"] !== "false",
      a11yHighlightFocus: source.a11yHighlightFocus ?? tokens["a11y.highlightFocus"] === "true",
      // Screen Reader
      a11yAriaLandmarks: source.a11yAriaLandmarks ?? tokens["a11y.ariaLandmarks"] !== "false",
      a11yFormLabelsVisible: source.a11yFormLabelsVisible ?? tokens["a11y.formLabels.visible"] !== "false",
      a11yErrorAnnounce: source.a11yErrorAnnounce ?? tokens["a11y.errorAnnounce"] !== "false",
      a11yPageTitle: source.a11yPageTitle || tokens["a11y.pageTitle"] || "",
      // Contrast & Colors
      a11yHighContrastMode: source.a11yHighContrastMode ?? tokens["a11y.highContrast"] === "true",
      a11yContrastPreset: source.a11yContrastPreset || (tokens["a11y.contrastPreset"] as any) || DEFAULT_DRAFT.a11yContrastPreset,
      a11ySaturation: parseInt(tokens["a11y.saturation"] || "") || (source.a11ySaturation ?? DEFAULT_DRAFT.a11ySaturation),
      a11yHighlightLinks: source.a11yHighlightLinks ?? tokens["a11y.highlightLinks"] === "true",
      // Typography & Readability
      a11yMinFontSize: parseInt(tokens["a11y.minFontSize"] || "") || source.a11yMinFontSize || DEFAULT_DRAFT.a11yMinFontSize,
      a11yContentScaling: parseInt(tokens["a11y.contentScaling"] || "") || (source.a11yContentScaling ?? DEFAULT_DRAFT.a11yContentScaling),
      a11yLineHeight: parseFloat(tokens["a11y.lineHeight"] || "") || (source.a11yLineHeight ?? DEFAULT_DRAFT.a11yLineHeight),
      a11yLetterSpacing: parseFloat(tokens["a11y.letterSpacing"] || "") || (source.a11yLetterSpacing ?? DEFAULT_DRAFT.a11yLetterSpacing),
      a11yWordSpacing: parseFloat(tokens["a11y.wordSpacing"] || "") || (source.a11yWordSpacing ?? DEFAULT_DRAFT.a11yWordSpacing),
      a11yDyslexicFont: source.a11yDyslexicFont ?? tokens["a11y.dyslexicFont"] === "true",
      a11yTextAlign: source.a11yTextAlign || (tokens["a11y.textAlign"] as any) || DEFAULT_DRAFT.a11yTextAlign,
      // Cursor & Reading Aids
      a11yCursorSize: source.a11yCursorSize || (tokens["a11y.cursorSize"] as any) || DEFAULT_DRAFT.a11yCursorSize,
      a11yReadingGuide: source.a11yReadingGuide ?? tokens["a11y.readingGuide"] === "true",
      a11yReadingMask: source.a11yReadingMask ?? tokens["a11y.readingMask"] === "true",
      // Motion & Animation
      a11yReducedMotion: source.a11yReducedMotion || DEFAULT_DRAFT.a11yReducedMotion,
      a11yAnimationDuration: parseInt(tokens["a11y.animationDuration"] || "") || source.a11yAnimationDuration || DEFAULT_DRAFT.a11yAnimationDuration,
      a11yAutoplayDisabled: source.a11yAutoplayDisabled ?? tokens["a11y.autoplayDisabled"] === "true",
      a11yPauseAnimations: source.a11yPauseAnimations ?? tokens["a11y.pauseAnimations"] === "true",
      // Content & Media
      a11yHideImages: source.a11yHideImages ?? tokens["a11y.hideImages"] === "true",
      a11yTooltips: source.a11yTooltips ?? tokens["a11y.tooltips"] === "true",
      // Touch & Target Size
      a11yLargeTargets: source.a11yLargeTargets ?? tokens["a11y.largeTargets"] === "true",
      a11yForcedColorsSupport: source.a11yForcedColorsSupport ?? tokens["a11y.forcedColors"] !== "false",
    };
  }, []);

  // ── Initialize draft from live settings ──
  useEffect(() => {
    if (!branding) return;

    try {
      const newDraft = buildDraftFromBranding(branding, true);
      setDraft(newDraft);
      // NOTE: Do NOT setIsDirty here. The draft is already persisted server-side.
      // Auto-save should only fire when the USER actually makes changes.
    } catch { /* invalid JSON — use defaults */ }
  }, [branding, buildDraftFromBranding]);

  // ── Update any draft field ──
  const updateDraft = useCallback(<K extends keyof StudioDraft>(field: K, value: StudioDraft[K]) => {
    setDraft(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  // ── Batch update (for color presets) ──
  const batchUpdateDraft = useCallback((updates: Partial<StudioDraft>) => {
    setDraft(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);

  // ── Per-page override helpers ──
  const getPageOverride = useCallback((pageId: AuthPageId): AuthPageOverride => {
    const override = draft.pageOverrides[pageId];
    if (override) return override;
    // For login, derive from global draft fields (backward compat)
    if (pageId === "login") {
      return { layout: draft.layout, headline: draft.headline, subtitle: draft.subtitle };
    }
    return DEFAULT_PAGE_OVERRIDES[pageId];
  }, [draft]);

  const setPageOverride = useCallback((pageId: AuthPageId, field: keyof AuthPageOverride, value: string) => {
    setDraft(prev => {
      const currentOverride = prev.pageOverrides[pageId] || (
        pageId === "login"
          ? { layout: prev.layout, headline: prev.headline, subtitle: prev.subtitle }
          : DEFAULT_PAGE_OVERRIDES[pageId]
      );
      const newOverride = { ...currentOverride, [field]: value };
      const newOverrides = { ...prev.pageOverrides, [pageId]: newOverride };

      // For login page, also sync global layout/headline/subtitle for backward compatibility
      if (pageId === "login") {
        return {
          ...prev,
          layout: newOverride.layout as StudioDraft["layout"],
          headline: newOverride.headline,
          subtitle: newOverride.subtitle,
          pageOverrides: newOverrides,
        };
      }
      return { ...prev, pageOverrides: newOverrides };
    });
    setIsDirty(true);
  }, []);

  // ── Slot management ──
  const addBlock = useCallback((slotId: LoginSlotId, block: ContentBlock) => {
    setDraft(prev => {
      const newSlots = { ...prev.slotConfig.slots };
      const existing = newSlots[slotId] || [];
      newSlots[slotId] = [...existing, block];
      return { ...prev, slotConfig: { ...prev.slotConfig, slots: newSlots } };
    });
    setIsDirty(true);
  }, []);

  const removeBlock = useCallback((slotId: LoginSlotId, index: number) => {
    setDraft(prev => {
      const newSlots = { ...prev.slotConfig.slots };
      const existing = [...(newSlots[slotId] || [])];
      existing.splice(index, 1);
      newSlots[slotId] = existing;
      return { ...prev, slotConfig: { ...prev.slotConfig, slots: newSlots } };
    });
    setIsDirty(true);
  }, []);

  const moveBlock = useCallback((slotId: LoginSlotId, fromIndex: number, direction: "up" | "down") => {
    setDraft(prev => {
      const newSlots = { ...prev.slotConfig.slots };
      const existing = [...(newSlots[slotId] || [])];
      const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= existing.length) return prev;
      [existing[fromIndex], existing[toIndex]] = [existing[toIndex], existing[fromIndex]];
      newSlots[slotId] = existing;
      return { ...prev, slotConfig: { ...prev.slotConfig, slots: newSlots } };
    });
    setIsDirty(true);
  }, []);

  const updateBlock = useCallback((slotId: LoginSlotId, index: number, block: ContentBlock) => {
    setDraft(prev => {
      const newSlots = { ...prev.slotConfig.slots };
      const existing = [...(newSlots[slotId] || [])];
      existing[index] = block;
      newSlots[slotId] = existing;
      return { ...prev, slotConfig: { ...prev.slotConfig, slots: newSlots } };
    });
    setIsDirty(true);
  }, []);

  // ── Build LoginBrandingJson from draft ──
  const buildDraftJson = useCallback((): string => {
    return JSON.stringify({
      _schemaVersion: 1,
      layout: draft.layout,
      headline: draft.headline,
      subtitle: draft.subtitle,
      companyName: draft.companyName,
      logoUrl: draft.logoUrl,
      faviconUrl: draft.faviconUrl,
      copyrightText: draft.copyrightText,
      bgType: draft.bgType,
      bgGradientDirection: draft.bgGradientDirection,
      bgGradientFrom: draft.bgGradientFrom,
      bgGradientTo: draft.bgGradientTo,
      bgOverlayEnabled: draft.bgOverlayEnabled,
      bgOverlayColor: draft.bgOverlayColor,
      bgBlur: draft.bgBlur,
      // Dark bg passthrough
      darkBgType: draft.darkBgType,
      darkBgGradientDirection: draft.darkBgGradientDirection,
      darkBgGradientFrom: draft.darkBgGradientFrom,
      darkBgGradientTo: draft.darkBgGradientTo,
      darkBgOverlayEnabled: draft.darkBgOverlayEnabled,
      darkBgOverlayColor: draft.darkBgOverlayColor,
      darkBgBlur: draft.darkBgBlur,
      // Split panel passthrough
      splitBgMode: draft.splitBgMode,
      panelBgType: draft.panelBgType,
      panelBgGradientDirection: draft.panelBgGradientDirection,
      panelBgGradientFrom: draft.panelBgGradientFrom,
      panelBgGradientTo: draft.panelBgGradientTo,
      panelBgOverlayEnabled: draft.panelBgOverlayEnabled,
      panelBgOverlayColor: draft.panelBgOverlayColor,
      panelBgBlur: draft.panelBgBlur,
      formWidth: draft.formWidth,
      cardPadding: draft.cardPadding,
      elementGap: draft.elementGap,
      inputHeight: draft.inputHeight,
      btnSize: draft.btnSize,
      customCss: draft.customCss,
      safeMode: draft.safeMode,
      themeMode: draft.themeMode,
      // Multi-page branding — per-page layout/headline/subtitle
      pages: Object.keys(draft.pageOverrides).length > 0 ? draft.pageOverrides : undefined,
      tokens: {
        "color.primary": draft.primaryColor,
        "color.secondary": draft.secondaryColor,
        "color.background": draft.bgColor,
        "color.surface": draft.surfaceColor,
        "color.text": draft.textColor,
        "color.textMuted": draft.mutedColor,
        "color.border": draft.borderColor,
        "color.error": draft.errorColor,
        "color.success": draft.successColor,
        // Dark tokens — always emitted (both palettes always available)
        "dark.color.primary": draft.darkPrimaryColor,
        "dark.color.secondary": draft.darkSecondaryColor,
        "dark.color.background": draft.darkBgColor,
        "dark.color.surface": draft.darkSurfaceColor,
        "dark.color.text": draft.darkTextColor,
        "dark.color.textMuted": draft.darkMutedColor,
        "dark.color.border": draft.darkBorderColor,
        "dark.color.error": draft.darkErrorColor,
        "dark.color.success": draft.darkSuccessColor,
        // Dark background tokens — fully independent (no inherit from light)
        "dark.bg.image": draft.darkBgImageUrl,
        "dark.bg.image.fit": ({ cover: "cover", contain: "contain", fill: "100% 100%", none: "auto", "scale-down": "contain" } as Record<string, string>)[draft.darkBgImageFit] || "cover",
        "dark.bg.image.position": draft.darkBgImagePosition,
        "dark.bg.gradient": draft.darkBgType === "gradient"
          ? `linear-gradient(${draft.darkBgGradientDirection}, ${draft.darkBgGradientFrom}, ${draft.darkBgGradientTo})`
          : "",
        "dark.overlay.opacity": draft.darkBgOverlayEnabled ? `${draft.darkBgOverlayOpacity}` : "0",
        "dark.overlay.color": draft.darkBgOverlayColor || "rgba(0,0,0,0.5)",
        "dark.overlay.blur": draft.darkBgOverlayEnabled ? `${draft.darkBgBlur}px` : "0px",
        // Panel tokens — LIGHT (for split layouts with independent panel bg)
        ...(draft.splitBgMode === "independent" ? {
          "panel.color.background": draft.panelBgColor,
          "panel.bg.image": draft.panelBgImageUrl,
          "panel.bg.image.fit": ({ cover: "cover", contain: "contain", fill: "100% 100%", none: "auto", "scale-down": "contain" } as Record<string, string>)[draft.panelBgImageFit] || "cover",
          "panel.bg.image.position": draft.panelBgImagePosition,
          "panel.bg.gradient": draft.panelBgType === "gradient"
            ? `linear-gradient(${draft.panelBgGradientDirection}, ${draft.panelBgGradientFrom}, ${draft.panelBgGradientTo})`
            : "",
          "panel.overlay.opacity": draft.panelBgOverlayEnabled ? `${draft.panelBgOverlayOpacity}` : "0",
          "panel.overlay.color": draft.panelBgOverlayColor || "rgba(0,0,0,0.5)",
          "panel.overlay.blur": draft.panelBgOverlayEnabled ? `${draft.panelBgBlur}px` : "0px",
          // Panel tokens — DARK (fully independent, no inherit from light panel)
          "dark.panel.color.background": draft.darkPanelBgColor,
          "dark.panel.bg.image": draft.darkPanelBgImageUrl,
          "dark.panel.bg.image.fit": ({ cover: "cover", contain: "contain", fill: "100% 100%", none: "auto", "scale-down": "contain" } as Record<string, string>)[draft.darkPanelBgImageFit] || "cover",
          "dark.panel.bg.image.position": draft.darkPanelBgImagePosition,
          "dark.panel.bg.gradient": draft.darkPanelBgType === "gradient"
            ? `linear-gradient(${draft.darkPanelBgGradientDirection}, ${draft.darkPanelBgGradientFrom}, ${draft.darkPanelBgGradientTo})`
            : "",
          "dark.panel.overlay.opacity": draft.darkPanelBgOverlayEnabled ? `${draft.darkPanelBgOverlayOpacity}` : "0",
          "dark.panel.overlay.color": draft.darkPanelBgOverlayColor || "rgba(0,0,0,0.5)",
          "dark.panel.overlay.blur": draft.darkPanelBgOverlayEnabled ? `${draft.darkPanelBgBlur}px` : "0px",
        } : {}),
        "font.body": draft.fontFamily,
        "font.bodyAr": draft.fontFamilyAr,
        "font.heading": draft.headingFont || draft.fontFamily,
        "font.size.headline": `${draft.headingSize}px`,
        "font.size.subtitle": `${draft.bodySize}px`,
        "font.weight.heading": `${draft.headingWeight}`,
        "font.weight.body": `${draft.bodyWeight}`,
        "font.lineHeight": `${draft.lineHeight}`,
        "font.letterSpacing": `${draft.letterSpacing}px`,
        "radius.card": `${draft.borderRadius}px`,
        "radius.button": `${draft.btnRadius}px`,
        "shadow.card": `0 ${Math.min(draft.borderRadius, 25)}px ${draft.borderRadius * 2}px rgba(0,0,0,0.1)`,
        "overlay.opacity": draft.bgOverlayEnabled ? `${draft.bgOverlayOpacity}` : "0",
        "overlay.color": draft.bgOverlayColor || "rgba(0,0,0,0.5)",
        "overlay.blur": draft.bgOverlayEnabled ? `${draft.bgBlur}px` : "0px",
        "spacing.formWidth": `${draft.formWidth}px`,
        "spacing.cardPadding": `${draft.cardPadding}px`,
        "spacing.elementGap": `${draft.elementGap}px`,
        "spacing.inputHeight": `${draft.inputHeight}px`,
        "split.bg.mode": draft.splitBgMode,
        "bg.image": draft.bgImageUrl,
        "bg.image.fit": ({ cover: "cover", contain: "contain", fill: "100% 100%", none: "auto", "scale-down": "contain" } as Record<string, string>)[draft.bgImageFit] || "cover",
        "bg.image.position": draft.bgImagePosition,
        "bg.gradient": draft.bgType === "gradient"
          ? `linear-gradient(${draft.bgGradientDirection}, ${draft.bgGradientFrom}, ${draft.bgGradientTo})`
          : "",
        // ── Accessibility tokens ──
        // Focus & Keyboard
        "a11y.focusRing.enabled": `${draft.a11yFocusRingEnabled}`,
        "a11y.focusRing.color": draft.a11yFocusRingColor || draft.primaryColor,
        "a11y.focusRing.width": `${draft.a11yFocusRingWidth}px`,
        "a11y.focusRing.style": draft.a11yFocusRingStyle,
        "a11y.skipLink.enabled": `${draft.a11ySkipLinkEnabled}`,
        "a11y.highlightFocus": `${draft.a11yHighlightFocus}`,
        // Screen Reader
        "a11y.ariaLandmarks": `${draft.a11yAriaLandmarks}`,
        "a11y.formLabels.visible": `${draft.a11yFormLabelsVisible}`,
        "a11y.errorAnnounce": `${draft.a11yErrorAnnounce}`,
        "a11y.pageTitle": draft.a11yPageTitle,
        // Contrast & Colors
        "a11y.highContrast": `${draft.a11yHighContrastMode}`,
        "a11y.contrastPreset": draft.a11yContrastPreset,
        "a11y.saturation": `${draft.a11ySaturation}`,
        "a11y.highlightLinks": `${draft.a11yHighlightLinks}`,
        // Typography & Readability
        "a11y.minFontSize": `${draft.a11yMinFontSize}`,
        "a11y.contentScaling": `${draft.a11yContentScaling}`,
        "a11y.lineHeight": `${draft.a11yLineHeight}`,
        "a11y.letterSpacing": `${draft.a11yLetterSpacing}`,
        "a11y.wordSpacing": `${draft.a11yWordSpacing}`,
        "a11y.dyslexicFont": `${draft.a11yDyslexicFont}`,
        "a11y.textAlign": draft.a11yTextAlign,
        // Cursor & Reading Aids
        "a11y.cursorSize": draft.a11yCursorSize,
        "a11y.readingGuide": `${draft.a11yReadingGuide}`,
        "a11y.readingMask": `${draft.a11yReadingMask}`,
        // Motion & Animation
        "a11y.reducedMotion": draft.a11yReducedMotion,
        "a11y.animationDuration": `${draft.a11yAnimationDuration}`,
        "a11y.autoplayDisabled": `${draft.a11yAutoplayDisabled}`,
        "a11y.pauseAnimations": `${draft.a11yPauseAnimations}`,
        // Content & Media
        "a11y.hideImages": `${draft.a11yHideImages}`,
        "a11y.tooltips": `${draft.a11yTooltips}`,
        // Touch & Target Size
        "a11y.largeTargets": `${draft.a11yLargeTargets}`,
        "a11y.forcedColors": `${draft.a11yForcedColorsSupport}`,
      },
    });
  }, [draft]);

  // ── Build SlotConfigJson ──
  const buildSlotConfigJson = useCallback((): string => {
    return JSON.stringify(draft.slotConfig);
  }, [draft.slotConfig]);

  // ── Auto-save draft every 5s ──
  useEffect(() => {
    if (!isDirty || !branding) return; // Guard: skip if no tenant context

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        const draftJson = buildDraftJson();
        if (targetTenantId) {
          // Drilldown: save draft to specific tenant via repository
          await repository.updateTenantSettingsById(targetTenantId, { draftBrandingJson: draftJson });
        } else {
          // My tenant via repository
          await repository.updateMySettings({ draftBrandingJson: draftJson });
        }
        setLastSavedAt(new Date());
      } catch {
        // Silent fail — draft save is non-critical
      }
    }, 5000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [isDirty, draft, branding, buildDraftJson, repository]);

  // ── Publish ──
  const publishMutation = useMutation({
    mutationFn: async () => {
      const draftJson = buildDraftJson();
      if (targetTenantId) {
        // Drilldown: save draft then publish to specific tenant via repository
        await repository.updateTenantSettingsById(targetTenantId, {
          draftBrandingJson: draftJson,
          loginBrandingJson: draftJson, // Publish = copy draft to live
        });
      } else {
        // My tenant via repository
        await repository.updateMySettings({ draftBrandingJson: draftJson });
        const currentVersion = (branding as any)?.settingsVersion ?? 0;
        await repository.publishBranding(currentVersion);
      }
    },
    onSuccess: () => {
      toastSuccess({ title: t("studio.publishSuccess") || "Published successfully" });
      setIsDirty(false);
      setLastSavedAt(new Date());
      queryClient.invalidateQueries({ queryKey: ["tenantSettings"] });
      queryClient.invalidateQueries({ queryKey: ["studio-branding"] });
      queryClient.invalidateQueries({ queryKey: ["customization"] });
    },
    onError: (error: Error) => {
      const isConflict = error.message?.includes("409") || error.message?.includes("conflict");
      toastError({
        title: isConflict ? t("studio.versionConflict") : (t("studio.publishFailed") || "Publish failed"),
        description: error.message,
      });
    },
  });

  // ── Explicit Save Draft ──
  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      const draftJson = buildDraftJson();
      if (targetTenantId) {
        await repository.updateTenantSettingsById(targetTenantId, { draftBrandingJson: draftJson });
      } else {
        await repository.updateMySettings({ draftBrandingJson: draftJson });
      }
    },
    onSuccess: () => {
      toastSuccess({ title: t("studio.draftSaved") || "Draft saved" });
      setLastSavedAt(new Date());
    },
    onError: (error: Error) => {
      toastError({ title: t("studio.draftSaveFailed") || "Failed to save draft", description: error.message });
    },
  });

  // ── Discard (with confirmation) ──
  const discardMutation = useMutation({
    mutationFn: () => repository.discardDraft(),
    onSuccess: () => {
      toastSuccess({ title: t("studio.discardSuccess") || "Draft discarded" });
      setIsDirty(false);
      setShowDiscardConfirm(false);
      // Restore to currently published design (all fields, not just a few)
      if (branding) {
        try {
          const restored = buildDraftFromBranding(branding, false); // false = use live only, skip draft
          setDraft(restored);
        } catch { setDraft(DEFAULT_DRAFT); }
      } else {
        setDraft(DEFAULT_DRAFT);
      }
      queryClient.invalidateQueries({ queryKey: ["tenantSettings"] });
      queryClient.invalidateQueries({ queryKey: ["studio-branding"] });
      queryClient.invalidateQueries({ queryKey: ["customization"] });
    },
    onError: (error: Error) => {
      setShowDiscardConfirm(false);
      toastError({ title: t("studio.discardFailed") || "Discard failed", description: error.message });
    },
  });

  // Confirmation handlers for discard
  const requestDiscard = useCallback(() => setShowDiscardConfirm(true), []);
  const cancelDiscard = useCallback(() => setShowDiscardConfirm(false), []);
  const confirmDiscard = useCallback(() => discardMutation.mutate(), [discardMutation]);

  // ── Theme Preview (Preview any theme without applying it) ──
  const savedDraftRef = useRef<StudioDraft | null>(null);
  const [isPreviewingTheme, setIsPreviewingTheme] = useState(false);

  const previewTheme = useCallback((themeDataJson: string) => {
    // Save current draft so we can restore it
    if (!savedDraftRef.current) {
      savedDraftRef.current = draft;
    }
    try {
      const parsed = JSON.parse(themeDataJson);

      // Support BOTH formats:
      //   1. Seeder format:  { colors: { primary, background, ... }, typography: { fontFamily }, spacing: { borderRadius } }
      //   2. Tokens format:  { tokens: { "color.primary", "font.body", "radius.card" } }
      const tokens = parsed.tokens || {};
      const colors = parsed.colors || {};
      const typography = parsed.typography || {};
      const spacing = parsed.spacing || {};

      // Helper to parse int from token string like "12px" -> 12
      const tInt = (key: string, fb?: number) => parseInt(tokens[key] || "") || fb || 0;
      const tFloat = (key: string, fb?: number) => parseFloat(tokens[key] || "") || fb || 0;

      const tempDraft: StudioDraft = {
        ...DEFAULT_DRAFT,
        layout: parsed.layout || DEFAULT_DRAFT.layout,
        headline: parsed.headline || "",
        subtitle: parsed.subtitle || "",
        companyName: parsed.companyName || draft.companyName,
        logoUrl: parsed.logoUrl || draft.logoUrl,
        faviconUrl: parsed.faviconUrl || draft.faviconUrl,
        copyrightText: parsed.copyrightText || draft.copyrightText,

        // ── Theme Mode ──
        themeMode: parsed.themeMode || DEFAULT_DRAFT.themeMode,

        // ── Light Palette — tokens first, then seeder colors, then defaults ──
        primaryColor: tokens["color.primary"] || colors.primary || DEFAULT_DRAFT.primaryColor,
        secondaryColor: tokens["color.secondary"] || colors.secondary || DEFAULT_DRAFT.secondaryColor,
        bgColor: tokens["color.background"] || colors.background || DEFAULT_DRAFT.bgColor,
        surfaceColor: tokens["color.surface"] || colors.surface || DEFAULT_DRAFT.surfaceColor,
        textColor: tokens["color.text"] || colors.text || DEFAULT_DRAFT.textColor,
        mutedColor: tokens["color.textMuted"] || colors.muted || DEFAULT_DRAFT.mutedColor,
        borderColor: tokens["color.border"] || colors.border || DEFAULT_DRAFT.borderColor,
        errorColor: tokens["color.error"] || colors.error || DEFAULT_DRAFT.errorColor,
        successColor: tokens["color.success"] || colors.success || DEFAULT_DRAFT.successColor,

        // ── Dark Palette ──
        darkPrimaryColor: tokens["dark.color.primary"] || DEFAULT_DRAFT.darkPrimaryColor,
        darkSecondaryColor: tokens["dark.color.secondary"] || DEFAULT_DRAFT.darkSecondaryColor,
        darkBgColor: tokens["dark.color.background"] || DEFAULT_DRAFT.darkBgColor,
        darkSurfaceColor: tokens["dark.color.surface"] || DEFAULT_DRAFT.darkSurfaceColor,
        darkTextColor: tokens["dark.color.text"] || DEFAULT_DRAFT.darkTextColor,
        darkMutedColor: tokens["dark.color.textMuted"] || DEFAULT_DRAFT.darkMutedColor,
        darkBorderColor: tokens["dark.color.border"] || DEFAULT_DRAFT.darkBorderColor,
        darkErrorColor: tokens["dark.color.error"] || DEFAULT_DRAFT.darkErrorColor,
        darkSuccessColor: tokens["dark.color.success"] || DEFAULT_DRAFT.darkSuccessColor,

        // ── Typography — tokens first, then seeder typography object ──
        fontFamily: tokens["font.body"] || typography.fontFamily || DEFAULT_DRAFT.fontFamily,
        fontFamilyAr: tokens["font.bodyAr"] || DEFAULT_DRAFT.fontFamilyAr,
        headingFont: tokens["font.heading"] || typography.headingFont || "",
        headingSize: tInt("font.size.headline", typography.headingSize || DEFAULT_DRAFT.headingSize),
        bodySize: tInt("font.size.subtitle", typography.bodySize || DEFAULT_DRAFT.bodySize),
        headingWeight: tInt("font.weight.heading", DEFAULT_DRAFT.headingWeight),
        bodyWeight: tInt("font.weight.body", DEFAULT_DRAFT.bodyWeight),
        lineHeight: tFloat("font.lineHeight", DEFAULT_DRAFT.lineHeight),
        letterSpacing: tFloat("font.letterSpacing", DEFAULT_DRAFT.letterSpacing),

        // ── Spacing — tokens first, then seeder spacing object ──
        borderRadius: tInt("radius.card", spacing.borderRadius || DEFAULT_DRAFT.borderRadius),
        btnRadius: tInt("radius.button", spacing.btnRadius || DEFAULT_DRAFT.btnRadius),
        formWidth: tInt("spacing.formWidth", spacing.formWidth || DEFAULT_DRAFT.formWidth),
        cardPadding: tInt("spacing.cardPadding", spacing.cardPadding || DEFAULT_DRAFT.cardPadding),
        elementGap: tInt("spacing.elementGap", DEFAULT_DRAFT.elementGap),
        inputHeight: tInt("spacing.inputHeight", DEFAULT_DRAFT.inputHeight),
        btnSize: parsed.btnSize || DEFAULT_DRAFT.btnSize,

        // ── Background ──
        bgType: parsed.bgType || DEFAULT_DRAFT.bgType,
        bgGradientDirection: parsed.bgGradientDirection || DEFAULT_DRAFT.bgGradientDirection,
        bgGradientFrom: parsed.bgGradientFrom || DEFAULT_DRAFT.bgGradientFrom,
        bgGradientTo: parsed.bgGradientTo || DEFAULT_DRAFT.bgGradientTo,
        bgImageUrl: tokens["bg.image"] || "",
        bgOverlayEnabled: parsed.bgOverlayEnabled ?? DEFAULT_DRAFT.bgOverlayEnabled,
        bgOverlayColor: parsed.bgOverlayColor || DEFAULT_DRAFT.bgOverlayColor,
        bgOverlayOpacity: tFloat("overlay.opacity", DEFAULT_DRAFT.bgOverlayOpacity),
        bgBlur: typeof parsed.bgBlur === "number" ? parsed.bgBlur : DEFAULT_DRAFT.bgBlur,

        // ── Dark Background ──
        darkBgType: parsed.darkBgType || DEFAULT_DRAFT.darkBgType,
        darkBgGradientDirection: parsed.darkBgGradientDirection || DEFAULT_DRAFT.darkBgGradientDirection,
        darkBgGradientFrom: parsed.darkBgGradientFrom || DEFAULT_DRAFT.darkBgGradientFrom,
        darkBgGradientTo: parsed.darkBgGradientTo || DEFAULT_DRAFT.darkBgGradientTo,
        darkBgImageUrl: tokens["dark.bg.image"] || "",
        darkBgOverlayEnabled: parsed.darkBgOverlayEnabled ?? DEFAULT_DRAFT.darkBgOverlayEnabled,
        darkBgOverlayColor: parsed.darkBgOverlayColor || DEFAULT_DRAFT.darkBgOverlayColor,
        darkBgOverlayOpacity: tFloat("dark.overlay.opacity", DEFAULT_DRAFT.darkBgOverlayOpacity),
        darkBgBlur: typeof parsed.darkBgBlur === "number" ? parsed.darkBgBlur : DEFAULT_DRAFT.darkBgBlur,

        // ── Custom CSS ──
        customCss: parsed.customCss || "",

        // ── Keep current slots, safe mode & page overrides ──
        slotConfig: draft.slotConfig,
        safeMode: draft.safeMode,
        pageOverrides: draft.pageOverrides,
      };
      setDraft(tempDraft);
      setIsPreviewingTheme(true);
    } catch { /* invalid JSON */ }
  }, [draft]);

  const exitThemePreview = useCallback(() => {
    if (savedDraftRef.current) {
      setDraft(savedDraftRef.current);
      savedDraftRef.current = null;
    }
    setIsPreviewingTheme(false);
  }, []);

  // ── Reset Branding ──
  const resetMutation = useMutation({
    mutationFn: async (resetType: "Published" | "GlobalDefault" | "FactoryDefault") => {
      await repository.resetBranding(resetType);
    },
    onSuccess: () => {
      toastSuccess({ title: t("studio.resetSuccess") || "Branding reset successfully" });
      setIsDirty(false);
      setIsPreviewingTheme(false);
      savedDraftRef.current = null;
      queryClient.invalidateQueries({ queryKey: ["studio-branding"] });
      queryClient.invalidateQueries({ queryKey: ["customization"] });
    },
    onError: (error: Error) => {
      toastError({ title: t("studio.resetFailed") || "Reset failed", description: error.message });
    },
  });

  // ── Refresh draft from server ──
  const refreshDraft = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["studio-branding"] });
    setIsPreviewingTheme(false);
    savedDraftRef.current = null;
  }, [queryClient]);

  return {
    t,
    // Draft state
    draft,
    isDirty,
    lastSavedAt,
    updateDraft,
    batchUpdateDraft,
    buildDraftJson,
    buildSlotConfigJson,
    // Slots
    addBlock,
    removeBlock,
    moveBlock,
    updateBlock,
    // Device
    deviceSize,
    setDeviceSize,
    // Panels
    activePanel,
    setActivePanel,
    // Multi-page branding
    activeAuthPage,
    setActiveAuthPage,
    getPageOverride,
    setPageOverride,
    // Actions
    publish: () => publishMutation.mutate(),
    isPublishing: publishMutation.isPending,
    saveDraft: () => saveDraftMutation.mutate(),
    isSavingDraft: saveDraftMutation.isPending,
    discard: requestDiscard,
    confirmDiscard,
    cancelDiscard,
    showDiscardConfirm,
    isDiscarding: discardMutation.isPending,
    // Theme Preview
    previewTheme,
    exitThemePreview,
    isPreviewingTheme,
    // Reset Branding
    resetBranding: (type: "Published" | "GlobalDefault" | "FactoryDefault") => resetMutation.mutate(type),
    isResetting: resetMutation.isPending,
    // Refresh
    refreshDraft,
    // Loading & context
    isLoading: brandingQuery.isLoading,
    isTenantContext: true, // Backend always returns data (system defaults for system admin)
    // Drilldown metadata
    mode,
    targetTenantId,
    targetTenantName: options?.targetTenantName,
  };
}
