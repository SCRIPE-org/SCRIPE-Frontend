/**
 * Settings Type Definitions
 *
 * All union types and the Settings interface for the dashboard theming engine.
 * This file is pure types — no runtime code, no React dependencies.
 */

// ── Color Themes ──────────────────────────────────────────

export type ColorTheme =
  | "purple"
  | "blue"
  | "green"
  | "orange"
  | "red"
  | "teal"
  | "pink"
  | "indigo"
  | "cyan"
  | "amber"
  | "yellow"
  | "lime"
  | "emerald"
  | "sky"
  | "violet"
  | "fuchsia"
  | "rose"
  | "slate"
  | "zinc"
  | "stone"
  | "gold"
  | "coral";

export type SecondaryColorTheme = ColorTheme;

// ── Background Themes ─────────────────────────────────────

export type LightBackgroundTheme =
  | "default"
  | "warm"
  | "cool"
  | "neutral"
  | "soft"
  | "cream"
  | "mint"
  | "lavender"
  | "rose"
  | "sky"
  | "sand"
  | "pearl"
  | "ice"
  | "linen"
  | "cloud"
  | "snow";

export type DarkBackgroundTheme =
  | "default"
  | "darker"
  | "pitch"
  | "slate"
  | "warm-dark"
  | "forest"
  | "ocean"
  | "purple-dark"
  | "crimson"
  | "midnight"
  | "charcoal"
  | "obsidian"
  | "navy"
  | "graphite"
  | "onyx"
  | "volcanic";

export type ShadowIntensity = "none" | "subtle" | "moderate" | "strong";
export type BackgroundMode = "preset" | "gradient" | "custom";

// ── Gradient Themes ───────────────────────────────────────

export type GradientDirection =
  | "to-t"
  | "to-tr"
  | "to-r"
  | "to-br"
  | "to-b"
  | "to-bl"
  | "to-l"
  | "to-tl";

export type LightGradientTheme =
  | "none"
  | "sunrise"
  | "ocean-breeze"
  | "lavender-mist"
  | "meadow"
  | "peach-glow"
  | "sky-wash"
  | "cotton-candy"
  | "lemonade"
  | "seafoam"
  | "blush"
  | "arctic"
  | "golden-hour";

export type DarkGradientTheme =
  | "none"
  | "midnight-blue"
  | "aurora"
  | "deep-space"
  | "ember"
  | "twilight"
  | "neon-noir"
  | "volcanic-ash"
  | "northern-lights"
  | "abyss"
  | "cyber-punk"
  | "dark-forest"
  | "nebula";

// ── Layout ────────────────────────────────────────────────

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
  | "terminal"
  // Nexus — Dual-rail workspace layout
  | "nexus";

// ── Component Styles ──────────────────────────────────────

export type CardStyle = "default" | "glass" | "solid" | "bordered" | "elevated";
export type AnimationLevel = "none" | "minimal" | "moderate" | "high";
export type AnimationSpeed = "slow" | "normal" | "fast";
export type Theme = "light" | "dark" | "system";
export type FontSize = "xs" | "small" | "medium" | "default" | "large" | "xl";
export type BorderRadius = "none" | "small" | "default" | "large" | "full";
export type SidebarPosition = "left" | "right";

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

export type BadgeStyle =
  | "default"
  | "modern"
  | "glass"
  | "neon"
  | "gradient"
  | "outlined"
  | "filled"
  | "minimal"
  | "pill"
  | "square";

export type AvatarStyle = "default" | "rounded" | "square" | "hexagon";
export type LogoType = "sparkles" | "shield" | "image" | "custom";
export type LogoAnimation = "none" | "spin" | "pulse" | "fancy";
export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

export type FormStyle =
  | "default"
  | "compact"
  | "spacious"
  | "inline"
  | "modern"
  | "glass"
  | "minimal"
  | "card"
  | "neon"
  | "elegant"
  | "organic"
  | "retro";

export type LoadingStyle =
  | "spinner"
  | "dots"
  | "bars"
  | "pulse"
  | "wave"
  | "orbit"
  | "ripple"
  | "gradient"
  | "matrix"
  | "helix"
  | "quantum"
  | "morphing";

export type TooltipStyle =
  | "default"
  | "rounded"
  | "sharp"
  | "bubble"
  | "glass"
  | "neon"
  | "minimal"
  | "elegant";
export type ModalStyle =
  | "default"
  | "centered"
  | "fullscreen"
  | "drawer"
  | "glass"
  | "floating"
  | "card"
  | "overlay";

export type TreeStyle =
  | "lines"
  | "cards"
  | "minimal"
  | "bubble"
  | "modern"
  | "glass"
  | "elegant"
  | "professional"
  | "gradient"
  | "neon"
  | "organic"
  | "corporate";

export type ToastDesign = "minimal" | "modern" | "gradient" | "outlined" | "filled";

export type DatePickerStyle =
  | "default"
  | "modern"
  | "glass"
  | "outlined"
  | "filled"
  | "minimal"
  | "elegant";
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

export type SwitchStyle =
  | "default"
  | "modern"
  | "ios"
  | "android"
  | "toggle"
  | "slider"
  | "neon"
  | "neumorphism"
  | "liquid"
  | "cyberpunk"
  | "glassmorphism"
  | "aurora"
  | "matrix"
  | "cosmic"
  | "retro";

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

// ── Settings Interface ────────────────────────────────────

export interface Settings {
  // Color and theme
  colorTheme: ColorTheme;
  lightBackgroundTheme: LightBackgroundTheme;
  darkBackgroundTheme: DarkBackgroundTheme;
  shadowIntensity: ShadowIntensity;
  secondaryColorTheme: SecondaryColorTheme;
  gradientDirection: GradientDirection;
  lightGradientTheme: LightGradientTheme;
  darkGradientTheme: DarkGradientTheme;
  customPrimaryColor: string;
  customSecondaryColor: string;
  customLightBgColor: string;
  customDarkBgColor: string;
  activePalette: string;
  backgroundMode: BackgroundMode;
  gradientStartColor: string;
  gradientEndColor: string;
  layoutTemplate: LayoutTemplate;
  cardStyle: CardStyle;
  animationLevel: AnimationLevel;
  fontSize: FontSize;
  showDetailPanel: boolean;
  borderRadius: BorderRadius;
  sidebarPosition: SidebarPosition;

  // Component styles
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

  // Logo
  logoType: LogoType;
  logoAnimation: LogoAnimation;
  logoSize: LogoSize;
  logoText: string;

  // App controls
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

  // Toast
  toastStyle: ToastStyle;
  showToastIcons: boolean;
  toastDuration: number;

  // Hover effects
  hoverEffectType: HoverEffectType;
  hoverEffectIntensity: HoverEffectIntensity;
}
