/**
 * Settings Defaults
 *
 * Default values for all 61 settings. Single source of truth.
 */

import type { Settings } from "./types";

export const defaultSettings: Settings = {
  colorTheme: "scripe",
  secondaryColorTheme: "indigo",
  lightBackgroundTheme: "scripe",
  darkBackgroundTheme: "scripe",
  shadowIntensity: "moderate",
  gradientDirection: "to-br",
  lightGradientTheme: "none",
  darkGradientTheme: "none",
  customPrimaryColor: "",
  customSecondaryColor: "",
  customLightBgColor: "",
  customDarkBgColor: "",
  activePalette: "",
  backgroundMode: "preset",
  gradientStartColor: "",
  gradientEndColor: "",
  // The EDGE shell is the platform default. Nexus stays selectable in
  // Settings → Layouts → Workspace for tenants who prefer it.
  layoutTemplate: "scripe",
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

/** All setting keys — derived from defaultSettings for runtime iteration */
export const SETTINGS_KEYS = Object.keys(defaultSettings) as (keyof Settings)[];
