/**
 * Settings Defaults
 *
 * Default values for all 61 settings. Single source of truth.
 */

import type { Settings } from "./types";

export const defaultSettings: Settings = {
  // Pre-EDGE colour defaults, restored at the product owner's request when the
  // scripe/EDGE design pass was reverted. The "scripe" colour and background
  // themes still exist as selectable options; they are just no longer the
  // platform default.
  colorTheme: "blue",
  secondaryColorTheme: "indigo",
  lightBackgroundTheme: "default",
  darkBackgroundTheme: "slate",
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
  // Nexus is the platform default. `scripe` (the EDGE shell) was briefly the
  // default and was reverted: it shipped without an app launcher, ignored the
  // whole settings provider, and hid locked workspaces instead of offering the
  // upgrade path. It stays selectable in Settings → Layouts → Workspace, and
  // becomes the default again only once it reaches parity with nexus and a
  // human has actually used it.
  layoutTemplate: "nexus",
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
