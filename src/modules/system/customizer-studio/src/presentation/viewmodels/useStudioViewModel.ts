/**
 * useStudioViewModel — Complete state management for the Ultimate Customizer Studio
 *
 * Per analysis §22-23:
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
import { useToast } from "@core/hooks/use-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { useTenantBranding, type TenantBrandingData } from "@core/providers/tenant-branding-provider";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import { getModuleApiService } from "@core/services/api-factory";
import { systemContainer } from "@modules/system/di";
import type {
  LoginLayout,
  LoginSlotId,
  ContentBlock,
  SlotConfig,
} from "@modules/auth/signin/src/types/login-branding-types";

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

// ── Extended Draft Shape ───────────────────────────────
export interface StudioDraft {
  // Layout
  layout: LoginLayout;

  // Branding
  headline: string;
  subtitle: string;
  companyName: string;
  logoUrl: string;
  faviconUrl: string;
  copyrightText: string;

  // Colors
  primaryColor: string;
  secondaryColor: string;
  bgColor: string;
  surfaceColor: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  errorColor: string;
  successColor: string;

  // Typography
  fontFamily: string;
  fontFamilyAr: string;
  headingSize: number;
  bodySize: number;
  headingWeight: number;
  bodyWeight: number;
  lineHeight: number;
  letterSpacing: number;
  headingFont: string; // Separate heading font (defaults to fontFamily)

  // Background
  bgType: "solid" | "gradient" | "image";
  bgGradientDirection: string;
  bgGradientFrom: string;
  bgGradientTo: string;
  bgImageUrl: string;
  bgOverlayEnabled: boolean;
  bgOverlayColor: string;
  bgOverlayOpacity: number;
  bgBlur: number;

  // Spacing & Shape
  borderRadius: number;
  formWidth: number;
  cardPadding: number;
  elementGap: number;
  inputHeight: number;
  btnRadius: number;
  btnSize: "sm" | "md" | "lg";

  // Slot content
  slotConfig: SlotConfig;

  // Advanced
  customCss: string;
  safeMode: boolean;
}

export const DEFAULT_DRAFT: StudioDraft = {
  layout: "split-right",
  headline: "",
  subtitle: "",
  companyName: "",
  logoUrl: "",
  faviconUrl: "",
  copyrightText: "",
  primaryColor: "#3b82f6",
  secondaryColor: "#64748b",
  bgColor: "#0f172a",
  surfaceColor: "#1e293b",
  textColor: "#f8fafc",
  mutedColor: "#94a3b8",
  borderColor: "#334155",
  errorColor: "#ef4444",
  successColor: "#22c55e",
  fontFamily: "Inter",
  fontFamilyAr: "Cairo",
  headingFont: "",
  headingSize: 32,
  bodySize: 14,
  headingWeight: 600,
  bodyWeight: 400,
  lineHeight: 1.5,
  letterSpacing: 0,
  bgType: "solid",
  bgGradientDirection: "to bottom right",
  bgGradientFrom: "#0f172a",
  bgGradientTo: "#1e293b",
  bgImageUrl: "",
  bgOverlayEnabled: false,
  bgOverlayColor: "#000000",
  bgOverlayOpacity: 0.5,
  bgBlur: 0,
  borderRadius: 12,
  formWidth: 380,
  cardPadding: 32,
  elementGap: 24,
  inputHeight: 44,
  btnRadius: 8,
  btnSize: "md",
  slotConfig: { _schemaVersion: 1, slots: {} },
  customCss: "",
  safeMode: false,
};

// ── Device Sizes ───────────────────────────────────────
export type DeviceSize = "desktop" | "tablet" | "mobile";

export const DEVICE_DIMENSIONS: Record<DeviceSize, { width: number; height: number }> = {
  desktop: { width: 1280, height: 800 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 },
};

// ── Panel Identifiers ──────────────────────────────────
export type StudioPanel = "layout" | "branding" | "colors" | "typography" | "background" | "spacing" | "blocks" | "advanced";

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
    colors: { primaryColor: "#3b82f6", bgColor: "#0f172a", surfaceColor: "#1e293b", textColor: "#f8fafc", mutedColor: "#94a3b8", borderColor: "#334155" },
  },
  {
    labelKey: "studio.preset.oceanBlue",
    colors: { primaryColor: "#0ea5e9", bgColor: "#0c1222", surfaceColor: "#172038", textColor: "#e2e8f0", mutedColor: "#64748b", borderColor: "#1e3a5a" },
  },
  {
    labelKey: "studio.preset.forestGreen",
    colors: { primaryColor: "#10b981", bgColor: "#0a1f15", surfaceColor: "#132f21", textColor: "#ecfdf5", mutedColor: "#6ee7b7", borderColor: "#1a4732" },
  },
  {
    labelKey: "studio.preset.sunsetWarm",
    colors: { primaryColor: "#f59e0b", bgColor: "#1c1008", surfaceColor: "#2a1b0f", textColor: "#fef3c7", mutedColor: "#d97706", borderColor: "#451a03" },
  },
  {
    labelKey: "studio.preset.monochrome",
    colors: { primaryColor: "#a1a1aa", bgColor: "#09090b", surfaceColor: "#18181b", textColor: "#fafafa", mutedColor: "#71717a", borderColor: "#27272a" },
  },
  {
    labelKey: "studio.preset.purpleNight",
    colors: { primaryColor: "#8b5cf6", bgColor: "#0f0720", surfaceColor: "#1a0e38", textColor: "#f5f3ff", mutedColor: "#a78bfa", borderColor: "#2e1f5e" },
  },
];

// ── Hook ───────────────────────────────────────────────
export function useStudioViewModel() {
  const { t } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const customizationService = systemContainer.customizationService;

  // ── Fetch raw branding data ──
  const brandingQuery = useQuery<TenantBrandingData | null>({
    queryKey: ["studio-branding"],
    queryFn: async () => {
      try {
        const api = getModuleApiService("IDENTITY");
        return await api.get<TenantBrandingData>(API_ENDPOINTS.TENANTS.MY_BRANDING);
      } catch {
        return null;
      }
    },
    staleTime: 30_000,
  });

  const branding = brandingQuery.data;

  // ── State ──
  const [draft, setDraft] = useState<StudioDraft>(DEFAULT_DRAFT);
  const [isDirty, setIsDirty] = useState(false);
  const [deviceSize, setDeviceSize] = useState<DeviceSize>("desktop");
  const [activePanel, setActivePanel] = useState<StudioPanel>("layout");
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ── Initialize draft from live settings ──
  useEffect(() => {
    if (!branding) return;

    try {
      const live = branding.loginBrandingJson ? JSON.parse(branding.loginBrandingJson) : {};
      const draftJson = (branding as any).draftBrandingJson
        ? JSON.parse((branding as any).draftBrandingJson) : null;

      const source = draftJson || live;
      const tokens = source.tokens || {};
      const slotRaw = branding.slotConfigJson || (branding as any).slotConfigJson;

      setDraft({
        layout: source.layout || "split-right",
        headline: source.headline || "",
        subtitle: source.subtitle || "",
        companyName: source.companyName || branding.companyName || "",
        logoUrl: source.logoUrl || branding.logoUrl || "",
        faviconUrl: source.faviconUrl || (branding as any).faviconUrl || "",
        copyrightText: source.copyrightText || "",
        // Colors
        primaryColor: tokens["color.primary"] || branding.primaryColor || DEFAULT_DRAFT.primaryColor,
        secondaryColor: tokens["color.secondary"] || branding.secondaryColor || DEFAULT_DRAFT.secondaryColor,
        bgColor: tokens["color.background"] || DEFAULT_DRAFT.bgColor,
        surfaceColor: tokens["color.surface"] || DEFAULT_DRAFT.surfaceColor,
        textColor: tokens["color.text"] || DEFAULT_DRAFT.textColor,
        mutedColor: tokens["color.textMuted"] || DEFAULT_DRAFT.mutedColor,
        borderColor: tokens["color.border"] || DEFAULT_DRAFT.borderColor,
        errorColor: tokens["color.error"] || DEFAULT_DRAFT.errorColor,
        successColor: tokens["color.success"] || DEFAULT_DRAFT.successColor,
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
        bgOverlayEnabled: source.bgOverlayEnabled ?? false,
        bgOverlayColor: source.bgOverlayColor || DEFAULT_DRAFT.bgOverlayColor,
        bgOverlayOpacity: parseFloat(tokens["overlay.opacity"] || "") || DEFAULT_DRAFT.bgOverlayOpacity,
        bgBlur: parseInt(source.bgBlur || "") || DEFAULT_DRAFT.bgBlur,
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
        safeMode: (branding as any).isSafeMode ?? false,
      });

      if (draftJson) setIsDirty(true);
    } catch { /* invalid JSON — use defaults */ }
  }, [branding]);

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
      formWidth: draft.formWidth,
      cardPadding: draft.cardPadding,
      elementGap: draft.elementGap,
      inputHeight: draft.inputHeight,
      btnSize: draft.btnSize,
      customCss: draft.customCss,
      safeMode: draft.safeMode,
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
        "overlay.opacity": `${draft.bgOverlayOpacity}`,
        "overlay.color": draft.bgOverlayColor || "rgba(0,0,0,0.5)",
        "overlay.blur": `${draft.bgBlur}px`,
        "spacing.formWidth": `${draft.formWidth}px`,
        "spacing.cardPadding": `${draft.cardPadding}px`,
        "spacing.elementGap": `${draft.elementGap}px`,
        "spacing.inputHeight": `${draft.inputHeight}px`,
        "bg.image": draft.bgImageUrl,
        "bg.gradient": draft.bgType === "gradient"
          ? `linear-gradient(${draft.bgGradientDirection}, ${draft.bgGradientFrom}, ${draft.bgGradientTo})`
          : "",
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
        await customizationService.saveTenantDisplayPrefs(
          JSON.stringify({ draftBrandingJson: draftJson })
        );
      } catch {
        // Silent fail — draft save is non-critical
      }
    }, 5000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [isDirty, draft, branding, buildDraftJson, customizationService]);

  // ── Publish ──
  const publishMutation = useMutation({
    mutationFn: async () => {
      const draftJson = buildDraftJson();
      await customizationService.saveTenantDisplayPrefs(
        JSON.stringify({ draftBrandingJson: draftJson })
      );
      const currentVersion = (branding as any)?.settingsVersion ?? 0;
      await customizationService.publishBranding({ expectedVersion: currentVersion });
    },
    onSuccess: () => {
      toast({ title: t("studio.publishSuccess"), variant: "default" });
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ["tenantSettings"] });
      queryClient.invalidateQueries({ queryKey: ["studio-branding"] });
      queryClient.invalidateQueries({ queryKey: ["customization"] });
    },
    onError: (error: Error) => {
      const isConflict = error.message?.includes("409") || error.message?.includes("conflict");
      toast({
        title: isConflict ? t("studio.versionConflict") : t("studio.publishFailed"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // ── Discard ──
  const discardMutation = useMutation({
    mutationFn: () => customizationService.discardDraft(),
    onSuccess: () => {
      toast({ title: t("studio.discardSuccess"), variant: "default" });
      setIsDirty(false);
      if (branding?.loginBrandingJson) {
        try {
          const live = JSON.parse(branding.loginBrandingJson);
          const tokens = live.tokens || {};
          setDraft({
            ...DEFAULT_DRAFT,
            layout: live.layout || "split-right",
            headline: live.headline || "",
            subtitle: live.subtitle || "",
            companyName: live.companyName || branding.companyName || "",
            logoUrl: live.logoUrl || branding.logoUrl || "",
            primaryColor: tokens["color.primary"] || branding.primaryColor || DEFAULT_DRAFT.primaryColor,
            secondaryColor: tokens["color.secondary"] || branding.secondaryColor || DEFAULT_DRAFT.secondaryColor,
          });
        } catch { setDraft(DEFAULT_DRAFT); }
      } else {
        setDraft(DEFAULT_DRAFT);
      }
      queryClient.invalidateQueries({ queryKey: ["tenantSettings"] });
      queryClient.invalidateQueries({ queryKey: ["studio-branding"] });
      queryClient.invalidateQueries({ queryKey: ["customization"] });
    },
    onError: (error: Error) => {
      toast({ title: t("studio.discardFailed"), description: error.message, variant: "destructive" });
    },
  });

  return {
    t,
    // Draft state
    draft,
    isDirty,
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
    // Actions
    publish: () => publishMutation.mutate(),
    isPublishing: publishMutation.isPending,
    discard: () => discardMutation.mutate(),
    isDiscarding: discardMutation.isPending,
    // Loading
    isLoading: brandingQuery.isLoading,
  };
}
