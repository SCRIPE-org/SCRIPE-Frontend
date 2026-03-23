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

  // Colors (light / unified — these serve as the default/light palette)
  primaryColor: string;
  secondaryColor: string;
  bgColor: string;
  surfaceColor: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  errorColor: string;
  successColor: string;

  // Theme mode: 'unified' = same colors for both, 'split' = separate light/dark
  themeMode: "unified" | "split";

  // Dark palette (used when themeMode === 'split')
  darkPrimaryColor: string;
  darkSecondaryColor: string;
  darkBgColor: string;
  darkSurfaceColor: string;
  darkTextColor: string;
  darkMutedColor: string;
  darkBorderColor: string;
  darkErrorColor: string;
  darkSuccessColor: string;

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

  // Background (light / unified)
  bgType: "solid" | "gradient" | "image";
  bgGradientDirection: string;
  bgGradientFrom: string;
  bgGradientTo: string;
  bgImageUrl: string;
  bgImageFit: "cover" | "contain" | "fill" | "none" | "scale-down";
  bgImagePosition: string;
  bgOverlayEnabled: boolean;
  bgOverlayColor: string;
  bgOverlayOpacity: number;
  bgBlur: number;

  // Background dark (used when themeMode === 'split')
  darkBgType: "solid" | "gradient" | "image";
  darkBgGradientDirection: string;
  darkBgGradientFrom: string;
  darkBgGradientTo: string;
  darkBgImageUrl: string;
  darkBgImageFit: "cover" | "contain" | "fill" | "none" | "scale-down";
  darkBgImagePosition: string;
  darkBgOverlayEnabled: boolean;
  darkBgOverlayColor: string;
  darkBgOverlayOpacity: number;
  darkBgBlur: number;

  // Split layout panel backgrounds
  // 'unified' = same bg for both panels, 'independent' = separate controls
  splitBgMode: "unified" | "independent";
  // Branding panel overrides — LIGHT (used when splitBgMode === 'independent')
  panelBgType: "solid" | "gradient" | "image";
  panelBgColor: string;
  panelBgGradientDirection: string;
  panelBgGradientFrom: string;
  panelBgGradientTo: string;
  panelBgImageUrl: string;
  panelBgImageFit: "cover" | "contain" | "fill" | "none" | "scale-down";
  panelBgImagePosition: string;
  panelBgOverlayEnabled: boolean;
  panelBgOverlayColor: string;
  panelBgOverlayOpacity: number;
  panelBgBlur: number;
  // Branding panel overrides — DARK (used when splitBgMode === 'independent')
  darkPanelBgType: "solid" | "gradient" | "image";
  darkPanelBgColor: string;
  darkPanelBgGradientDirection: string;
  darkPanelBgGradientFrom: string;
  darkPanelBgGradientTo: string;
  darkPanelBgImageUrl: string;
  darkPanelBgImageFit: "cover" | "contain" | "fill" | "none" | "scale-down";
  darkPanelBgImagePosition: string;
  darkPanelBgOverlayEnabled: boolean;
  darkPanelBgOverlayColor: string;
  darkPanelBgOverlayOpacity: number;
  darkPanelBgBlur: number;

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
  bgColor: "#ffffff",
  surfaceColor: "#f8fafc",
  textColor: "#0f172a",
  mutedColor: "#64748b",
  borderColor: "#e2e8f0",
  errorColor: "#ef4444",
  successColor: "#22c55e",
  themeMode: "unified",
  darkPrimaryColor: "#3b82f6",
  darkSecondaryColor: "#64748b",
  darkBgColor: "#0f172a",
  darkSurfaceColor: "#1e293b",
  darkTextColor: "#f8fafc",
  darkMutedColor: "#94a3b8",
  darkBorderColor: "#334155",
  darkErrorColor: "#ef4444",
  darkSuccessColor: "#22c55e",
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
  bgImageFit: "cover",
  bgImagePosition: "center",
  bgOverlayEnabled: false,
  bgOverlayColor: "#000000",
  bgOverlayOpacity: 0.5,
  bgBlur: 0,
  // Dark background defaults
  darkBgType: "solid",
  darkBgGradientDirection: "to bottom right",
  darkBgGradientFrom: "#0f172a",
  darkBgGradientTo: "#1e293b",
  darkBgImageUrl: "",
  darkBgImageFit: "cover",
  darkBgImagePosition: "center",
  darkBgOverlayEnabled: false,
  darkBgOverlayColor: "#000000",
  darkBgOverlayOpacity: 0.5,
  darkBgBlur: 0,
  // Split panel defaults — LIGHT
  splitBgMode: "unified",
  panelBgType: "solid",
  panelBgColor: "#f1f5f9",
  panelBgGradientDirection: "to bottom right",
  panelBgGradientFrom: "#e2e8f0",
  panelBgGradientTo: "#f8fafc",
  panelBgImageUrl: "",
  panelBgImageFit: "cover",
  panelBgImagePosition: "center",
  panelBgOverlayEnabled: false,
  panelBgOverlayColor: "#000000",
  panelBgOverlayOpacity: 0.5,
  panelBgBlur: 0,
  // Split panel defaults — DARK
  darkPanelBgType: "solid",
  darkPanelBgColor: "#1e293b",
  darkPanelBgGradientDirection: "to bottom right",
  darkPanelBgGradientFrom: "#1e293b",
  darkPanelBgGradientTo: "#0f172a",
  darkPanelBgImageUrl: "",
  darkPanelBgImageFit: "cover",
  darkPanelBgImagePosition: "center",
  darkPanelBgOverlayEnabled: false,
  darkPanelBgOverlayColor: "#000000",
  darkPanelBgOverlayOpacity: 0.5,
  darkPanelBgBlur: 0,
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
export type StudioPanel = "layout" | "branding" | "appearance" | "typography" | "spacing" | "blocks" | "advanced";

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
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
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
        // Dark background tokens (image inherits from light, overlay/color independent)
        "dark.bg.image": draft.darkBgImageUrl || draft.bgImageUrl,
        "dark.bg.image.fit": ({ cover: "cover", contain: "contain", fill: "100% 100%", none: "auto", "scale-down": "contain" } as Record<string, string>)[draft.darkBgImageUrl ? draft.darkBgImageFit : draft.bgImageFit] || "cover",
        "dark.bg.image.position": draft.darkBgImageUrl ? draft.darkBgImagePosition : draft.bgImagePosition,
        "dark.bg.gradient": draft.darkBgType === "gradient"
          ? `linear-gradient(${draft.darkBgGradientDirection}, ${draft.darkBgGradientFrom}, ${draft.darkBgGradientTo})`
          : "",
        "dark.overlay.opacity": `${draft.darkBgOverlayOpacity}`,
        "dark.overlay.color": draft.darkBgOverlayColor || "rgba(0,0,0,0.5)",
        "dark.overlay.blur": `${draft.darkBgBlur}px`,
        // Panel tokens — LIGHT (for split layouts with independent panel bg)
        ...(draft.splitBgMode === "independent" ? {
          "panel.color.background": draft.panelBgColor,
          "panel.bg.image": draft.panelBgImageUrl,
          "panel.bg.image.fit": ({ cover: "cover", contain: "contain", fill: "100% 100%", none: "auto", "scale-down": "contain" } as Record<string, string>)[draft.panelBgImageFit] || "cover",
          "panel.bg.image.position": draft.panelBgImagePosition,
          "panel.bg.gradient": draft.panelBgType === "gradient"
            ? `linear-gradient(${draft.panelBgGradientDirection}, ${draft.panelBgGradientFrom}, ${draft.panelBgGradientTo})`
            : "",
          "panel.overlay.opacity": `${draft.panelBgOverlayOpacity}`,
          "panel.overlay.color": draft.panelBgOverlayColor || "rgba(0,0,0,0.5)",
          "panel.overlay.blur": `${draft.panelBgBlur}px`,
          // Panel tokens — DARK (image inherits from light panel)
          "dark.panel.color.background": draft.darkPanelBgColor,
          "dark.panel.bg.image": draft.darkPanelBgImageUrl || draft.panelBgImageUrl,
          "dark.panel.bg.image.fit": ({ cover: "cover", contain: "contain", fill: "100% 100%", none: "auto", "scale-down": "contain" } as Record<string, string>)[draft.darkPanelBgImageUrl ? draft.darkPanelBgImageFit : draft.panelBgImageFit] || "cover",
          "dark.panel.bg.image.position": draft.darkPanelBgImageUrl ? draft.darkPanelBgImagePosition : draft.panelBgImagePosition,
          "dark.panel.bg.gradient": draft.darkPanelBgType === "gradient"
            ? `linear-gradient(${draft.darkPanelBgGradientDirection}, ${draft.darkPanelBgGradientFrom}, ${draft.darkPanelBgGradientTo})`
            : "",
          "dark.panel.overlay.opacity": `${draft.darkPanelBgOverlayOpacity}`,
          "dark.panel.overlay.color": draft.darkPanelBgOverlayColor || "rgba(0,0,0,0.5)",
          "dark.panel.overlay.blur": `${draft.darkPanelBgBlur}px`,
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
        "overlay.opacity": `${draft.bgOverlayOpacity}`,
        "overlay.color": draft.bgOverlayColor || "rgba(0,0,0,0.5)",
        "overlay.blur": `${draft.bgBlur}px`,
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
        setLastSavedAt(new Date());
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
      setLastSavedAt(new Date());
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

  // ── Explicit Save Draft ──
  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      const draftJson = buildDraftJson();
      await customizationService.saveTenantDisplayPrefs(
        JSON.stringify({ draftBrandingJson: draftJson })
      );
    },
    onSuccess: () => {
      toast({ title: t("studio.draftSaved") || "Draft saved", variant: "default" });
      setLastSavedAt(new Date());
    },
    onError: (error: Error) => {
      toast({ title: t("studio.draftSaveFailed") || "Failed to save draft", description: error.message, variant: "destructive" });
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
    // Actions
    publish: () => publishMutation.mutate(),
    isPublishing: publishMutation.isPending,
    saveDraft: () => saveDraftMutation.mutate(),
    isSavingDraft: saveDraftMutation.isPending,
    discard: () => discardMutation.mutate(),
    isDiscarding: discardMutation.isPending,
    // Loading & context
    isLoading: brandingQuery.isLoading,
    isTenantContext: branding !== null,
  };
}
