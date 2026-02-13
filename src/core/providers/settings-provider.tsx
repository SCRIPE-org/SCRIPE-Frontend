"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { appLogger } from "@core/common/logger";
import { STORAGE_KEYS } from "@core/config/storage-keys";

// Define all possible setting types
export type ColorTheme =
  | "purple"
  | "blue"
  | "green"
  | "orange"
  | "red"
  | "teal"
  | "pink"
  | "indigo"
  | "cyan";

export type LightBackgroundTheme =
  | "default"
  | "warm"
  | "cool"
  | "neutral"
  | "soft"
  | "cream"
  | "mint"
  | "lavender"
  | "rose";

export type DarkBackgroundTheme =
  | "default"
  | "darker"
  | "pitch"
  | "slate"
  | "warm-dark"
  | "forest"
  | "ocean"
  | "purple-dark"
  | "crimson";

export type ShadowIntensity = "none" | "subtle" | "moderate" | "strong";
export type LayoutTemplate =
  | "modern"
  | "minimal"
  | "classic"
  | "compact"
  | "floating"
  | "elegant"
  | "navigation"
  | "tabbed"
  | "dual"
  | "command"
  | "stacked"
  | "hud"
  | "dock"
  | "executive"
  | "magazine"
  | "spotlight"
  | "glassmorphism"
  | "galaxy"
  | "neon"
  | "retro"
  | "aurora"
  | "rail"
  | "newspaper"
  | "cinema"
  | "vault"
  // Batch 1 — Navigation Innovations
  | "bottombar"
  | "megamenu"
  | "breadcrumb"
  | "ribbon"
  | "treeview"
  | "overlay"
  // Batch 2 — Multi-Zone / Pro
  | "hub"
  | "wizard"
  | "shelf"
  | "collapseheader"
  | "splitpane"
  | "inbox"
  // Batch 3 — More Pro Patterns
  | "dualheader"
  | "topside"
  | "focus"
  | "multipanel"
  | "kanban"
  | "bento"
  // Batch 4 — Industry-Specific
  | "chat"
  | "map"
  | "feed"
  | "calendar"
  | "crm"
  | "terminal";


export type CardStyle = "default" | "glass" | "solid" | "bordered" | "elevated";
export type AnimationLevel = "none" | "minimal" | "moderate" | "high";
export type AnimationSpeed = "slow" | "normal" | "fast";
export type Theme = "light" | "dark" | "system";
export type FontSize = "xs" | "small" | "medium" | "default" | "large" | "xl";
export type BorderRadius = "none" | "small" | "default" | "large" | "full";
export type SidebarPosition = "left" | "right";

// Additional setting types
export type HeaderStyle = "default" | "compact" | "elevated" | "transparent";
export type SidebarStyle = "default" | "compact" | "floating" | "minimal";
export type ButtonStyle =
  | "default"
  | "small-round"
  | "medium-round"
  | "large-round"
  | "extra-round"
  | "super-round"
  | "rounded"
  | "sharp"
  | "modern";

export type NavigationStyle = "default" | "pills" | "underline" | "sidebar";
export type SpacingSize = "compact" | "default" | "comfortable" | "spacious";
export type IconStyle = "outline" | "filled" | "duotone" | "minimal";
export type InputStyle = "default" | "rounded" | "underlined" | "filled";
export type TableStyle =
  | "default"
  | "striped"
  | "bordered"
  | "minimal"
  | "glass"
  | "neon"
  | "gradient"
  | "neumorphism"
  | "cyberpunk"
  | "luxury"
  | "matrix"
  | "diamond";

export type BadgeStyle = "default" | "modern" | "glass" | "neon" | "gradient" | "outlined" | "filled" | "minimal" | "pill" | "square";
export type AvatarStyle = "default" | "rounded" | "square" | "hexagon";
export type LogoType = "sparkles" | "shield" | "image" | "custom";
export type LogoAnimation = "none" | "spin" | "pulse" | "fancy";
export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

export type FormStyle = "default" | "compact" | "spacious" | "inline" | "modern" | "glass" | "minimal" | "card" | "neon" | "elegant" | "organic" | "retro";
export type LoadingStyle = "spinner" | "dots" | "bars" | "pulse" | "wave" | "orbit" | "ripple" | "gradient" | "matrix" | "helix" | "quantum" | "morphing";
export type TooltipStyle = "default" | "rounded" | "sharp" | "bubble" | "glass" | "neon" | "minimal" | "elegant";
export type ModalStyle = "default" | "centered" | "fullscreen" | "drawer" | "glass" | "floating" | "card" | "overlay";

export type TreeStyle = "lines" | "cards" | "minimal" | "bubble" | "modern" | "glass" | "elegant" | "professional" | "gradient" | "neon" | "organic" | "corporate";
export type ToastDesign = "minimal" | "modern" | "gradient" | "outlined" | "filled";
export type DatePickerStyle = "default" | "modern" | "glass" | "outlined" | "filled" | "minimal" | "elegant";
export type CalendarStyle = "default" | "modern" | "glass" | "elegant" | "minimal" | "dark";

export type SelectStyle =
  | "default"
  | "modern"
  | "glass"
  | "outlined"
  | "filled"
  | "minimal"
  | "elegant"
  | "professional"
  | "neon"
  | "gradient"
  | "neumorphism"
  | "cyberpunk"
  | "luxury"
  | "aurora"
  | "matrix"
  | "diamond"
  | "holographic"
  | "cosmic"
  | "liquid"
  | "crystal"
  | "plasma"
  | "quantum"
  | "nebula"
  | "prism"
  | "stellar"
  | "vortex"
  | "phoenix";

export type SwitchStyle = "default" | "modern" | "ios" | "android" | "toggle" | "slider" | "neon" | "neumorphism" | "liquid" | "cyberpunk" | "glassmorphism" | "aurora" | "matrix" | "cosmic" | "retro";

export type CheckboxStyle =
  | "default"
  | "modern"
  | "glass"
  | "neon"
  | "gradient"
  | "neumorphism"
  | "cyberpunk"
  | "luxury"
  | "aurora"
  | "cosmic"
  | "minimal"
  | "elegant"
  | "organic"
  | "retro"
  | "matrix"
  | "diamond"
  | "liquid"
  | "crystal"
  | "plasma"
  | "quantum"
  | "holographic"
  | "stellar"
  | "vortex"
  | "phoenix";

export type RadioStyle =
  | "default"
  | "modern"
  | "glass"
  | "neon"
  | "gradient"
  | "neumorphism"
  | "cyberpunk"
  | "luxury"
  | "aurora"
  | "cosmic"
  | "minimal"
  | "elegant"
  | "organic"
  | "retro"
  | "matrix"
  | "diamond"
  | "liquid"
  | "crystal"
  | "plasma"
  | "quantum"
  | "holographic"
  | "stellar"
  | "vortex"
  | "phoenix";

export type ToastStyle =
  | "classic"
  | "neon"
  | "glassmorphism"
  | "neumorphism"
  | "aurora"
  | "cosmic"
  | "minimal"
  | "modern"
  | "gradient"
  | "outlined";

export type HoverEffectType =
  | "none"
  | "elevate"
  | "scale"
  | "glow"
  | "shimmer"
  | "rotate"
  | "slide";

export type HoverEffectIntensity = "none" | "small" | "medium" | "strong";

/**
 * Settings interface - all available settings
 */
export interface Settings {
  // Color and theme settings
  colorTheme: ColorTheme;
  lightBackgroundTheme: LightBackgroundTheme;
  darkBackgroundTheme: DarkBackgroundTheme;
  shadowIntensity: ShadowIntensity;
  layoutTemplate: LayoutTemplate;
  cardStyle: CardStyle;
  animationLevel: AnimationLevel;
  fontSize: FontSize;
  showDetailPanel: boolean;
  borderRadius: BorderRadius;
  sidebarPosition: SidebarPosition;

  // Component style settings
  headerStyle: HeaderStyle;
  sidebarStyle: SidebarStyle;
  buttonStyle: ButtonStyle;
  navigationStyle: NavigationStyle;
  spacingSize: SpacingSize;
  iconStyle: IconStyle;
  inputStyle: InputStyle;
  tableStyle: TableStyle;
  badgeStyle: BadgeStyle;
  avatarStyle: AvatarStyle;

  // Logo settings
  logoType: LogoType;
  logoAnimation: LogoAnimation;
  logoSize: LogoSize;
  logoText: string;

  // App control settings
  showBreadcrumbs: boolean;
  showUserAvatar: boolean;
  showNotifications: boolean;
  compactMode: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  stickyHeader: boolean;
  collapsibleSidebar: boolean;
  showFooter: boolean;
  autoSave: boolean;
  showLogo: boolean;

  // Additional component styles
  formStyle: FormStyle;
  loadingStyle: LoadingStyle;
  tooltipStyle: TooltipStyle;
  modalStyle: ModalStyle;
  treeStyle: TreeStyle;
  datePickerStyle: DatePickerStyle;
  calendarStyle: CalendarStyle;
  selectStyle: SelectStyle;
  switchStyle: SwitchStyle;
  checkboxStyle: CheckboxStyle;
  radioStyle: RadioStyle;

  // Toast settings
  toastStyle: ToastStyle;
  showToastIcons: boolean;
  toastDuration: number;

  // Hover effect settings
  hoverEffectType: HoverEffectType;
  hoverEffectIntensity: HoverEffectIntensity;
}

/**
 * Settings context interface
 */
interface SettingsContextType extends Settings {
  // Setters for all settings
  setColorTheme: (theme: ColorTheme) => void;
  setLightBackgroundTheme: (theme: LightBackgroundTheme) => void;
  setDarkBackgroundTheme: (theme: DarkBackgroundTheme) => void;
  setShadowIntensity: (intensity: ShadowIntensity) => void;
  setLayoutTemplate: (template: LayoutTemplate) => void;
  setCardStyle: (style: CardStyle) => void;
  setAnimationLevel: (level: AnimationLevel) => void;
  setFontSize: (size: FontSize) => void;
  setShowDetailPanel: (show: boolean) => void;
  setBorderRadius: (radius: BorderRadius) => void;
  setSidebarPosition: (position: SidebarPosition) => void;
  setHeaderStyle: (style: HeaderStyle) => void;
  setSidebarStyle: (style: SidebarStyle) => void;
  setButtonStyle: (style: ButtonStyle) => void;
  setNavigationStyle: (style: NavigationStyle) => void;
  setSpacingSize: (size: SpacingSize) => void;
  setIconStyle: (style: IconStyle) => void;
  setInputStyle: (style: InputStyle) => void;
  setTableStyle: (style: TableStyle) => void;
  setBadgeStyle: (style: BadgeStyle) => void;
  setAvatarStyle: (style: AvatarStyle) => void;
  setLogoType: (type: LogoType) => void;
  setLogoAnimation: (animation: LogoAnimation) => void;
  setLogoSize: (size: LogoSize) => void;
  setLogoText: (text: string) => void;
  setShowBreadcrumbs: (show: boolean) => void;
  setShowUserAvatar: (show: boolean) => void;
  setShowNotifications: (show: boolean) => void;
  setCompactMode: (compact: boolean) => void;
  setHighContrast: (contrast: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  setStickyHeader: (sticky: boolean) => void;
  setCollapsibleSidebar: (collapsible: boolean) => void;
  setShowFooter: (show: boolean) => void;
  setAutoSave: (autoSave: boolean) => void;
  setShowLogo: (show: boolean) => void;
  setFormStyle: (style: FormStyle) => void;
  setLoadingStyle: (style: LoadingStyle) => void;
  setTooltipStyle: (style: TooltipStyle) => void;
  setModalStyle: (style: ModalStyle) => void;
  setTreeStyle: (style: TreeStyle) => void;
  setDatePickerStyle: (style: DatePickerStyle) => void;
  setCalendarStyle: (style: CalendarStyle) => void;
  setSelectStyle: (style: SelectStyle) => void;
  setSwitchStyle: (style: SwitchStyle) => void;
  setCheckboxStyle: (style: CheckboxStyle) => void;
  setRadioStyle: (style: RadioStyle) => void;
  setToastStyle: (style: ToastStyle) => void;
  setShowToastIcons: (show: boolean) => void;
  setToastDuration: (duration: number) => void;
  setHoverEffectType: (type: HoverEffectType) => void;
  setHoverEffectIntensity: (intensity: HoverEffectIntensity) => void;

  // Utility functions
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (settings: string) => boolean;
}

/**
 * Default settings configuration
 */
const defaultSettings: Settings = {
  colorTheme: "blue",
  lightBackgroundTheme: "default",
  darkBackgroundTheme: "slate",
  shadowIntensity: "moderate",
  layoutTemplate: "navigation",
  cardStyle: "default",
  animationLevel: "moderate",
  fontSize: "medium",
  showDetailPanel: true,
  borderRadius: "default",
  sidebarPosition: "left",
  headerStyle: "default",
  sidebarStyle: "default",
  buttonStyle: "default",
  navigationStyle: "default",
  spacingSize: "default",
  iconStyle: "outline",
  inputStyle: "default",
  tableStyle: "default",
  badgeStyle: "default",
  avatarStyle: "default",
  logoType: "image",
  logoAnimation: "none",
  logoSize: "xl",
  logoText: "SA",
  showBreadcrumbs: true,
  showUserAvatar: true,
  showNotifications: false,
  compactMode: false,
  highContrast: false,
  reducedMotion: false,
  stickyHeader: true,
  collapsibleSidebar: true,
  showFooter: true,
  autoSave: true,
  showLogo: true,
  formStyle: "default",
  loadingStyle: "spinner",
  tooltipStyle: "default",
  modalStyle: "default",
  treeStyle: "modern",
  datePickerStyle: "modern",
  calendarStyle: "modern",
  selectStyle: "default",
  switchStyle: "modern",
  checkboxStyle: "default",
  radioStyle: "default",
  toastStyle: "classic",
  showToastIcons: true,
  toastDuration: 1000,
  hoverEffectType: "elevate",
  hoverEffectIntensity: "none",
};

/**
 * Create fallback settings for SSR/hydration issues
 */
function createFallbackSettings(): Partial<SettingsContextType> {
  return {
    // Color theme
    colorTheme: 'purple' as ColorTheme,
    setColorTheme: () => { },

    // Background themes
    lightBackgroundTheme: 'default' as LightBackgroundTheme,
    setLightBackgroundTheme: () => { },
    darkBackgroundTheme: 'default' as DarkBackgroundTheme,
    setDarkBackgroundTheme: () => { },

    // Shadow intensity
    shadowIntensity: 'moderate' as ShadowIntensity,
    setShadowIntensity: () => { },

    // Layout template
    layoutTemplate: 'modern' as LayoutTemplate,
    setLayoutTemplate: () => { },

    // Font size
    fontSize: 'medium' as FontSize,
    setFontSize: () => { },
    showDetailPanel: true,
    setShowDetailPanel: () => { },

    // Border radius
    borderRadius: 'default' as BorderRadius,
    setBorderRadius: () => { },

    // Sidebar position
    sidebarPosition: 'right' as SidebarPosition,
    setSidebarPosition: () => { },

    // Component styles
    cardStyle: 'default' as CardStyle,
    setCardStyle: () => { },
    badgeStyle: 'default' as BadgeStyle,
    setBadgeStyle: () => { },
    buttonStyle: 'default' as ButtonStyle,
    setButtonStyle: () => { },
    inputStyle: 'default' as InputStyle,
    setInputStyle: () => { },
    selectStyle: 'default' as SelectStyle,
    setSelectStyle: () => { },
    switchStyle: 'default' as SwitchStyle,
    setSwitchStyle: () => { },
    datePickerStyle: 'default' as DatePickerStyle,
    setDatePickerStyle: () => { },
    calendarStyle: 'default' as CalendarStyle,
    setCalendarStyle: () => { },
    toastStyle: 'default' as ToastStyle,
    setToastStyle: () => { },

    // Animation settings
    animationLevel: 'moderate' as AnimationLevel,
    setAnimationLevel: () => { },
    sidebarStyle: "default" as SidebarStyle,

    // Navigation settings
    navigationStyle: 'default' as NavigationStyle,
    setNavigationStyle: () => { },
    iconStyle: 'outline' as IconStyle,
    setIconStyle: () => { },
    spacingSize: 'default' as SpacingSize,
    setSpacingSize: () => { },
    loadingStyle: "spinner" as LoadingStyle,

    // Additional settings
    compactMode: false,
    setCompactMode: () => { },
    highContrast: false,
    setHighContrast: () => { },
    reducedMotion: false,
    setReducedMotion: () => { },
    stickyHeader: true,
    setStickyHeader: () => { },
    showFooter: true,
    setShowFooter: () => { },
    formStyle: 'default' as FormStyle,
    setFormStyle: () => { },
    checkboxStyle: 'default' as CheckboxStyle,
    setCheckboxStyle: () => { },
    radioStyle: 'default' as RadioStyle,
    setRadioStyle: () => { },

    // Logo settings
    logoType: 'default' as LogoType,
    setLogoType: () => { },
    modalStyle: "default" as ModalStyle,
    tableStyle: "default" as TableStyle,
    treeStyle: "modern" as TreeStyle,

    // Hover effect settings
    hoverEffectType: 'elevate' as HoverEffectType,
    setHoverEffectType: () => { },
    hoverEffectIntensity: 'medium' as HoverEffectIntensity,
    setHoverEffectIntensity: () => { },
  };
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

/**
 * Settings Provider Component
 * 
 * Provides centralized settings management with localStorage persistence
 * and optimized performance through reduced re-renders.
 */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEYS.DASHBOARD_SETTINGS);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      appLogger.error("Failed to load settings:", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save settings to localStorage when autoSave is enabled
  useEffect(() => {
    if (isHydrated && settings.autoSave) {
      try {
        localStorage.setItem(STORAGE_KEYS.DASHBOARD_SETTINGS, JSON.stringify(settings));
      } catch (error) {
        appLogger.error("Failed to save settings:", error);
      }
    }
  }, [settings, isHydrated, settings.autoSave]);

  // Apply settings to document root
  useEffect(() => {
    if (isHydrated && typeof document !== "undefined") {
      const root = document.documentElement;

      // Apply all data attributes
      root.setAttribute("data-theme", settings.colorTheme);
      root.setAttribute("data-light-bg-theme", settings.lightBackgroundTheme);
      root.setAttribute("data-dark-bg-theme", settings.darkBackgroundTheme);
      root.setAttribute("data-shadow", settings.shadowIntensity);
      root.setAttribute("data-layout", settings.layoutTemplate);
      root.setAttribute("data-card-style", settings.cardStyle);
      root.setAttribute("data-animation", settings.animationLevel);
      root.setAttribute("data-font-size", settings.fontSize);
      root.setAttribute("data-radius", settings.borderRadius);
      root.setAttribute("data-sidebar-position", settings.sidebarPosition);
      root.setAttribute("data-header-style", settings.headerStyle);
      root.setAttribute("data-sidebar-style", settings.sidebarStyle);
      root.setAttribute("data-button-style", settings.buttonStyle);
      root.setAttribute("data-navigation-style", settings.navigationStyle);
      root.setAttribute("data-spacing", settings.spacingSize);
      root.setAttribute("data-icon-style", settings.iconStyle);
      root.setAttribute("data-input-style", settings.inputStyle);
      root.setAttribute("data-table-style", settings.tableStyle);
      root.setAttribute("data-badge-style", settings.badgeStyle);
      root.setAttribute("data-avatar-style", settings.avatarStyle);
      root.setAttribute("data-logo-type", settings.logoType);
      root.setAttribute("data-logo-animation", settings.logoAnimation);
      root.setAttribute("data-logo-size", settings.logoSize);
      root.setAttribute("data-compact-mode", settings.compactMode.toString());
      root.setAttribute("data-high-contrast", settings.highContrast.toString());
      root.setAttribute("data-reduced-motion", settings.reducedMotion.toString());
      root.setAttribute("data-sticky-header", settings.stickyHeader.toString());
      root.setAttribute("data-form-style", settings.formStyle);
      root.setAttribute("data-loading-style", settings.loadingStyle);
      root.setAttribute("data-tooltip-style", settings.tooltipStyle);
      root.setAttribute("data-modal-style", settings.modalStyle);
      root.setAttribute("data-tree-style", settings.treeStyle);
      root.setAttribute("data-checkbox-design", settings.checkboxStyle);
      root.setAttribute("data-radio-design", settings.radioStyle);
      root.setAttribute("data-hover-effect-type", settings.hoverEffectType);
      root.setAttribute("data-hover-effect-intensity", settings.hoverEffectIntensity);

      // Apply CSS custom properties for responsive design
      root.style.setProperty(
        "--font-size-base",
        settings.fontSize === "xs"
          ? "13px"
          : settings.fontSize === "small"
            ? "14px"
            : settings.fontSize === "medium"
              ? "16px"
              : settings.fontSize === "large"
                ? "20px"
                : settings.fontSize === "xl"
                  ? "22px"
                  : "18px"
      );

      root.style.setProperty(
        "--spacing-unit",
        settings.spacingSize === "compact"
          ? "0.5rem"
          : settings.spacingSize === "comfortable"
            ? "1.5rem"
            : settings.spacingSize === "spacious"
              ? "2rem"
              : "1rem"
      );

      root.style.setProperty(
        "--border-radius",
        settings.borderRadius === "none"
          ? "0"
          : settings.borderRadius === "small"
            ? "0.25rem"
            : settings.borderRadius === "large"
              ? "0.75rem"
              : settings.borderRadius === "full"
                ? "9999px"
                : "0.5rem"
      );

      root.style.setProperty(
        "--shadow-intensity",
        settings.shadowIntensity === "none"
          ? "none"
          : settings.shadowIntensity === "subtle"
            ? "0 1px 2px 0 rgb(0 0 0 / 0.05)"
            : settings.shadowIntensity === "strong"
              ? "0 25px 50px -12px rgb(0 0 0 / 0.25)"
              : "0 4px 6px -1px rgb(0 0 0 / 0.1)"
      );
    }
  }, [settings, isHydrated]);

  // Generic update function to reduce code duplication
  const updateSetting = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const exportSettings = () => {
    return JSON.stringify(settings, null, 2);
  };

  const importSettings = (settingsString: string): boolean => {
    try {
      const parsed = JSON.parse(settingsString);
      setSettings({ ...defaultSettings, ...parsed });
      return true;
    } catch {
      return false;
    }
  };

  const contextValue: SettingsContextType = {
    ...settings,
    setColorTheme: (theme) => updateSetting("colorTheme", theme),
    setLightBackgroundTheme: (theme) => updateSetting("lightBackgroundTheme", theme),
    setDarkBackgroundTheme: (theme) => updateSetting("darkBackgroundTheme", theme),
    setShadowIntensity: (intensity) => updateSetting("shadowIntensity", intensity),
    setLayoutTemplate: (template) => updateSetting("layoutTemplate", template),
    setCardStyle: (style) => updateSetting("cardStyle", style),
    setAnimationLevel: (level) => updateSetting("animationLevel", level),
    setFontSize: (size) => updateSetting("fontSize", size),
    setShowDetailPanel: (show) => updateSetting("showDetailPanel", show),
    setBorderRadius: (radius) => updateSetting("borderRadius", radius),
    setSidebarPosition: (position) => updateSetting("sidebarPosition", position),
    setHeaderStyle: (style) => updateSetting("headerStyle", style),
    setSidebarStyle: (style) => updateSetting("sidebarStyle", style),
    setButtonStyle: (style) => updateSetting("buttonStyle", style),
    setNavigationStyle: (style) => updateSetting("navigationStyle", style),
    setSpacingSize: (size) => updateSetting("spacingSize", size),
    setIconStyle: (style) => updateSetting("iconStyle", style),
    setInputStyle: (style) => updateSetting("inputStyle", style),
    setTableStyle: (style) => updateSetting("tableStyle", style),
    setBadgeStyle: (style) => updateSetting("badgeStyle", style),
    setAvatarStyle: (style) => updateSetting("avatarStyle", style),
    setLogoType: (type) => updateSetting("logoType", type),
    setLogoAnimation: (animation) => updateSetting("logoAnimation", animation),
    setLogoSize: (size) => updateSetting("logoSize", size),
    setLogoText: (text) => updateSetting("logoText", text),
    setShowBreadcrumbs: (show) => updateSetting("showBreadcrumbs", show),
    setShowUserAvatar: (show) => updateSetting("showUserAvatar", show),
    setShowNotifications: (show) => updateSetting("showNotifications", show),
    setCompactMode: (compact) => updateSetting("compactMode", compact),
    setHighContrast: (contrast) => updateSetting("highContrast", contrast),
    setReducedMotion: (reduced) => updateSetting("reducedMotion", reduced),
    setStickyHeader: (sticky) => updateSetting("stickyHeader", sticky),
    setCollapsibleSidebar: (collapsible) => updateSetting("collapsibleSidebar", collapsible),
    setShowFooter: (show) => updateSetting("showFooter", show),
    setAutoSave: (autoSave) => updateSetting("autoSave", autoSave),
    setShowLogo: (show) => updateSetting("showLogo", show),
    setFormStyle: (style) => updateSetting("formStyle", style),
    setLoadingStyle: (style) => updateSetting("loadingStyle", style),
    setTooltipStyle: (style) => updateSetting("tooltipStyle", style),
    setModalStyle: (style) => updateSetting("modalStyle", style),
    setTreeStyle: (style) => updateSetting("treeStyle", style),
    setDatePickerStyle: (style) => updateSetting("datePickerStyle", style),
    setCalendarStyle: (style) => updateSetting("calendarStyle", style),
    setSelectStyle: (style) => updateSetting("selectStyle", style),
    setSwitchStyle: (style) => updateSetting("switchStyle", style),
    setCheckboxStyle: (style) => updateSetting("checkboxStyle", style),
    setRadioStyle: (style) => updateSetting("radioStyle", style),
    setToastStyle: (style) => updateSetting("toastStyle", style),
    setShowToastIcons: (show) => updateSetting("showToastIcons", show),
    setToastDuration: (duration) => updateSetting("toastDuration", duration),
    setHoverEffectType: (type) => updateSetting("hoverEffectType", type),
    setHoverEffectIntensity: (intensity) => updateSetting("hoverEffectIntensity", intensity),
    resetSettings,
    exportSettings,
    importSettings,
  };

  // Don't render until hydrated to prevent hydration mismatches
  if (!isHydrated) {
    return <div className="min-h-screen bg-background animate-pulse" />;
  }

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Hook to access settings context
 * 
 * @returns Settings context with all settings and setters
 * @throws Error if used outside of SettingsProvider
 */
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    // During SSR/prerendering or hydration issues, provide fallback values
    if (typeof window === 'undefined') {
      return createFallbackSettings() as SettingsContextType;
    }
    // Client-side fallback for hydration issues
    return createFallbackSettings() as SettingsContextType;
  }
  return context;
}