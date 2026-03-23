/**
 * StudioDraft Entity
 *
 * Domain entity representing the draft state of the login customizer.
 * Pure business logic — no API/JSON concerns.
 *
 * @module customization/domain
 */
import type { LoginLayout, SlotConfig } from "@modules/auth/signin/src/types/login-branding-types";

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
};

// ── Device Sizes ──────────────────────────────────────
export type DeviceSize = "desktop" | "tablet" | "mobile";

export const DEVICE_DIMENSIONS: Record<DeviceSize, { width: number; height: number }> = {
  desktop: { width: 1280, height: 800 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 },
};

// ── Panel Identifiers ─────────────────────────────────
export type StudioPanel = "layout" | "branding" | "appearance" | "typography" | "spacing" | "blocks" | "advanced";
