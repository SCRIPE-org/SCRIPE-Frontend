/**
 * Settings Defaults
 *
 * Default values for every setting. Single source of truth.
 * Wave C culled the dead fields (header/sidebar styles, custom colours,
 * toast icons/duration, compact mode) — the merge-engine migration drops
 * their stored copies.
 */

import type { ColorTheme, Settings } from "./types";

export const defaultSettings: Settings = {
  // Pre-EDGE colour defaults, restored at the product owner's request when the
  // scripe/EDGE design pass was reverted. The "scripe" colour and background
  // themes still exist as selectable options; they are just no longer the
  // platform default.
  colorTheme: "blue",
  // Not customized out of the box — dom-applicator leaves --workspace-hue/
  // --workspace-chroma (the tenant's own brand accent) untouched until the
  // user actively picks a swatch in Appearance settings.
  colorThemeCustomized: false,
  secondaryColorTheme: "indigo",
  lightBackgroundTheme: "default",
  darkBackgroundTheme: "slate",
  shadowIntensity: "moderate",
  gradientDirection: "to-br",
  lightGradientTheme: "none",
  darkGradientTheme: "none",
  activePalette: "",
  backgroundMode: "preset",
  gradientStartColor: "",
  gradientEndColor: "",
  // Nexus is the platform default and, since Wave G, the only shell. The
  // multi-layout system (the reverted `scripe`/EDGE shell plus ~50 others) was
  // retired: nexus is the single workspace shell governed entirely by the
  // settings provider tokens/attributes. Any stored non-nexus layoutTemplate is
  // normalised to "nexus" by the merge-engine migration, so no existing user
  // breaks.
  layoutTemplate: "nexus",
  cardStyle: "default",
  animationLevel: "moderate",
  fontSize: "medium",
  showDetailPanel: true,
  borderRadius: "default",
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
  // TRUE is the platform default: the notification bell is part of the shell's
  // identity cluster, not an opt-in. This shipped as `false` while nothing read
  // the flag; the moment the nexus rail and topbar started honouring it, the
  // stale default silently hid the bell for every user who had never opened
  // Settings. The setting itself still works — turning it off hides the bell —
  // the default is simply the visible one now.
  showNotifications: true,
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
  // "modern" was a retired skin for all three — the Wave C4 collapse kept
  // lines/cards for the tree and default/elegant for the date picker and
  // calendar, so the platform defaults are now survivor values.
  treeStyle: "lines",
  datePickerStyle: "default",
  calendarStyle: "default",
  // The only member SelectStyle still has: the 26 invented skins collapsed to
  // one token surface. Stored copies of the retired names normalise here via
  // the merge-engine migration.
  selectStyle: "default",
  // "modern" was a retired switch skin — the Wave A collapse kept
  // default/ios/android, so the platform default is now a survivor value.
  switchStyle: "default",
  checkboxStyle: "default",
  radioStyle: "default",
  toastStyle: "classic",
  hoverEffectType: "elevate",
  hoverEffectIntensity: "none",
};

/** All setting keys — derived from defaultSettings for runtime iteration */
export const SETTINGS_KEYS = Object.keys(defaultSettings) as (keyof Settings)[];

// ── Colour-theme swatches ─────────────────────────────────

export interface ColorThemeSwatch {
  id: ColorTheme;
  /** OKLCH hue angle, degrees. */
  hue: number;
  /** OKLCH chroma. */
  chroma: number;
}

/**
 * The 23 colour themes as OKLCH hue/chroma pairs — the two numbers the accent
 * is actually made of.
 *
 * WHY NOT A HEX OR A TAILWIND CLASS: the picker used to draw each option with
 * a Tailwind palette utility — a second, unrelated palette standing in for the
 * accent. The swatch therefore promised a colour the product could not
 * produce, and it drifted the moment either side moved. These pairs are read
 * out of the same `--primary` values `globals.css` assigns to each
 * `:root[data-theme="…"]`, converted to OKLCH, so the swatch and the accent
 * are the same colour by construction.
 *
 * HOW TO RENDER IT: feed the pair into the accent's own lightness law and let
 * CSS mix the colour — no colour value crosses the JS/CSS boundary:
 *
 *   <button
 *     style={{ "--sw-h": swatch.hue, "--sw-c": swatch.chroma }}
 *     aria-label={t(`settings.colors.${swatch.id}`)}
 *   >
 *     <span style={{ background: "oklch(0.68 var(--sw-c) var(--sw-h))" }} />
 *   </button>
 *
 * Both custom properties are `@property`-registered in globals.css (L41-51),
 * so they animate rather than snap when the theme changes.
 *
 * The fixed L of 0.68 is `--nx-accent`'s dark-theme lightness, not a choice
 * made here: it is what makes yellow read as amber-gold and slate/zinc/stone
 * read as near-greys. The swatch shows the accent you get, not the colour the
 * name suggests.
 *
 * ORDER IS THE PICKER'S ORDER and the element shape is a contract — the
 * appearance picker consumes this list directly. Do not rename either field.
 */
export const COLOR_THEME_SWATCHES: ColorThemeSwatch[] = [
  { id: "scripe", hue: 293, chroma: 0.245 },
  // "purple" is the one id with no `:root[data-theme]` rule of its own, so it
  // has no --primary to convert; the pair below is the colour the picker has
  // always drawn for it. See the escalation on the missing CSS block.
  { id: "purple", hue: 304, chroma: 0.233 },
  { id: "blue", hue: 263, chroma: 0.215 },
  { id: "green", hue: 149, chroma: 0.192 },
  { id: "orange", hue: 47, chroma: 0.189 },
  { id: "red", hue: 22, chroma: 0.166 },
  { id: "teal", hue: 182, chroma: 0.123 },
  { id: "pink", hue: 354, chroma: 0.213 },
  { id: "indigo", hue: 277, chroma: 0.204 },
  { id: "cyan", hue: 213, chroma: 0.126 },
  { id: "amber", hue: 71, chroma: 0.165 },
  { id: "yellow", hue: 92, chroma: 0.173 },
  { id: "lime", hue: 131, chroma: 0.204 },
  { id: "emerald", hue: 162, chroma: 0.148 },
  { id: "sky", hue: 238, chroma: 0.148 },
  { id: "violet", hue: 292, chroma: 0.221 },
  { id: "fuchsia", hue: 322, chroma: 0.257 },
  { id: "rose", hue: 17, chroma: 0.216 },
  { id: "slate", hue: 257, chroma: 0.052 },
  { id: "zinc", hue: 286, chroma: 0.014 },
  { id: "stone", hue: 58, chroma: 0.011 },
  { id: "gold", hue: 81, chroma: 0.158 },
  { id: "coral", hue: 40, chroma: 0.164 },
];
