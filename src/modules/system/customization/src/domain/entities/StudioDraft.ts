/**
 * StudioDraft Entity
 *
 * Domain entity representing the draft state of the login customizer.
 * Pure business logic — no API/JSON concerns.
 *
 * @module customization/domain
 */
import type { LoginLayout, SlotConfig } from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import type { CanvasComponent, CanvasMode, CanvasBackground } from "./CanvasComponent";
import { DEFAULT_CANVAS_COMPONENTS, DEFAULT_CANVAS_GRID_ROWS, DEFAULT_CANVAS_BACKGROUND } from "./CanvasComponent";

// ── Auth Page Identifiers ─────────────────────────────
export type AuthPageId = "login" | "forgot-password" | "reset-password" | "register" | "verify-email" | "mfa";

export const AUTH_PAGES: { id: AuthPageId; labelKey: string; icon: string }[] = [
  { id: "login",           labelKey: "studio.page.login",         icon: "LogIn" },
  { id: "forgot-password", labelKey: "studio.page.forgotPassword", icon: "KeyRound" },
  { id: "reset-password",  labelKey: "studio.page.resetPassword",  icon: "RotateCcw" },
  { id: "register",        labelKey: "studio.page.register",       icon: "UserPlus" },
  { id: "verify-email",    labelKey: "studio.page.verifyEmail",    icon: "MailCheck" },
  { id: "mfa",             labelKey: "studio.page.mfa",            icon: "ShieldCheck" },
];

// ── Per-Page Override — each page can customize layout + content ──
export interface AuthPageOverride {
  layout: LoginLayout;
  headline: string;
  subtitle: string;
}

export type AuthPageOverrides = Partial<Record<AuthPageId, AuthPageOverride>>;

// Default per-page values (login inherits from global draft)
export const DEFAULT_PAGE_OVERRIDES: Record<AuthPageId, AuthPageOverride> = {
  "login":           { layout: "split-right", headline: "", subtitle: "" },
  "forgot-password": { layout: "centered",    headline: "", subtitle: "" },
  "reset-password":  { layout: "centered",    headline: "", subtitle: "" },
  "register":        { layout: "split-left",  headline: "", subtitle: "" },
  "verify-email":    { layout: "minimal",     headline: "", subtitle: "" },
  "mfa":             { layout: "minimal",     headline: "", subtitle: "" },
};

// ── Draft Shape ───────────────────────────────────────
export interface StudioDraftProps {
  // Layout
  layout: LoginLayout;

  // Branding
  headline: string;
  subtitle: string;
  companyName: string;
  logoUrl: string;
  faviconUrl: string;
  copyrightText: string;

  // Colors (light / unified)
  primaryColor: string;
  secondaryColor: string;
  bgColor: string;
  surfaceColor: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  errorColor: string;
  successColor: string;

  // Theme mode
  themeMode: "unified" | "split";

  // Dark palette
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
  headingFont: string;

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

  // Background dark
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
  splitBgMode: "unified" | "independent";
  // Branding panel — LIGHT
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
  // Branding panel — DARK
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

  // ── Accessibility Settings ─────────────────────────
  // Focus & Keyboard
  a11yFocusRingEnabled: boolean;
  a11yFocusRingColor: string;
  a11yFocusRingWidth: number;
  a11yFocusRingStyle: "solid" | "dashed" | "double";
  a11ySkipLinkEnabled: boolean;
  a11yHighlightFocus: boolean;
  // Screen Reader
  a11yAriaLandmarks: boolean;
  a11yFormLabelsVisible: boolean;
  a11yErrorAnnounce: boolean;
  a11yPageTitle: string;
  // Contrast & Colors
  a11yHighContrastMode: boolean;
  a11yContrastPreset: "normal" | "dark" | "light" | "inverted" | "monochrome";
  a11ySaturation: number;
  a11yHighlightLinks: boolean;
  // Typography & Readability
  a11yMinFontSize: number;
  a11yContentScaling: number;
  a11yLineHeight: number;
  a11yLetterSpacing: number;
  a11yWordSpacing: number;
  a11yDyslexicFont: boolean;
  a11yTextAlign: "inherit" | "left" | "center" | "right";
  // Cursor & Reading Aids
  a11yCursorSize: "default" | "large" | "xlarge";
  a11yReadingGuide: boolean;
  a11yReadingMask: boolean;
  // Motion & Animation
  a11yReducedMotion: "auto" | "always" | "never";
  a11yAnimationDuration: number;
  a11yAutoplayDisabled: boolean;
  a11yPauseAnimations: boolean;
  // Content & Media
  a11yHideImages: boolean;
  a11yTooltips: boolean;
  // Touch & Target Size
  a11yLargeTargets: boolean;
  a11yForcedColorsSupport: boolean;

  // ── Multi-Page Branding ─────────────────────────────
  pageOverrides: AuthPageOverrides;

  // ── Page Builder (M10) ─────────────────────────────
  /** 'layout' = 22 preset layouts, 'builder' = drag-and-drop canvas */
  canvasMode: CanvasMode;
  /** Components placed on the builder canvas */
  canvasComponents: CanvasComponent[];
  /** Number of rows in the builder grid */
  canvasGridRows: number;
  /** Canvas background — defaults to inheriting from studio tokens */
  canvasBackground: CanvasBackground;
}

// ── Default Draft ─────────────────────────────────────
export const DEFAULT_DRAFT: StudioDraftProps = {
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
  // ── Accessibility defaults (WCAG AA best practices out-of-the-box) ──
  // Focus & Keyboard
  a11yFocusRingEnabled: true,
  a11yFocusRingColor: "",
  a11yFocusRingWidth: 2,
  a11yFocusRingStyle: "solid",
  a11ySkipLinkEnabled: true,
  a11yHighlightFocus: false,
  // Screen Reader
  a11yAriaLandmarks: true,
  a11yFormLabelsVisible: true,
  a11yErrorAnnounce: true,
  a11yPageTitle: "",
  // Contrast & Colors
  a11yHighContrastMode: false,
  a11yContrastPreset: "normal",
  a11ySaturation: 100,
  a11yHighlightLinks: false,
  // Typography & Readability
  a11yMinFontSize: 14,
  a11yContentScaling: 100,
  a11yLineHeight: 0,       // 0 = inherit (no override)
  a11yLetterSpacing: 0,    // 0 = inherit
  a11yWordSpacing: 0,      // 0 = inherit
  a11yDyslexicFont: false,
  a11yTextAlign: "inherit",
  // Cursor & Reading Aids
  a11yCursorSize: "default",
  a11yReadingGuide: false,
  a11yReadingMask: false,
  // Motion & Animation
  a11yReducedMotion: "auto",
  a11yAnimationDuration: 300,
  a11yAutoplayDisabled: false,
  a11yPauseAnimations: false,
  // Content & Media
  a11yHideImages: false,
  a11yTooltips: false,
  // Touch & Target Size
  a11yLargeTargets: false,
  a11yForcedColorsSupport: true,
  // Multi-Page Branding
  pageOverrides: {},
  // Page Builder (M10)
  canvasMode: 'layout',
  canvasComponents: DEFAULT_CANVAS_COMPONENTS,
  canvasGridRows: DEFAULT_CANVAS_GRID_ROWS,
  canvasBackground: DEFAULT_CANVAS_BACKGROUND,
};

// ── Device Sizes ──────────────────────────────────────
export type DeviceSize = "desktop" | "tablet" | "mobile";

export const DEVICE_DIMENSIONS: Record<DeviceSize, { width: number; height: number }> = {
  desktop: { width: 1280, height: 800 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 },
};

// ── Panel Identifiers ─────────────────────────────────
export type StudioPanel = "layout" | "branding" | "appearance" | "typography" | "spacing" | "blocks" | "advanced" | "accessibility" | "themes" | "builder";

// ── All 22 Layouts ─────────────────────────────────────
export const ALL_LAYOUTS: {
  id: LoginLayout;
  labelKey: string;
  descKey: string;
  thumbnail: string;
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
export const COLOR_PRESETS: { labelKey: string; colors: Partial<StudioDraftProps> }[] = [
  {
    labelKey: "studio.preset.proDark",
    colors: {
      primaryColor: "#3b82f6", secondaryColor: "#64748b", bgColor: "#ffffff", surfaceColor: "#f8fafc",
      textColor: "#0f172a", mutedColor: "#64748b", borderColor: "#e2e8f0",
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
