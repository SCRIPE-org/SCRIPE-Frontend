/**
 * The settings map — the ONE registry of what can be changed.
 *
 * Wave J rebuilt the settings experience around a single organising question:
 * "what do I actually want to change, and what will it look like?". The answer
 * is six human groups, each a flat list of *rows* — one row per thing you can
 * change. There is no second tab level anywhere: a group that would need one
 * is a group that was cut wrong.
 *
 * This module is pure data (no React, no dynamic imports), so three very
 * different consumers can share it without a cycle:
 *   • the group nav              — group titles + order
 *   • the search index           — every row, across every group
 *   • the group panels           — each row's own title/description/subject
 *
 * `subject` is the contract with the Stage (the persistent live preview): it
 * names the real surface that row governs, so pointing at a row points the
 * Stage at a table, a button, a calendar — the actual component, never a
 * swatch standing in for one.
 */

import {
  BarChart3,
  Blocks,
  LayoutGrid,
  Palette,
  SlidersHorizontal,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

// ── Stage subjects ────────────────────────────────────────────────────────

/**
 * The live surface the Stage foregrounds. Every one of these renders the real
 * primitive from `@core/ui` / `@core/crud` — each of which reads the settings
 * context — so the Stage never needs a bespoke mock to stay truthful.
 */
export type StageSubject =
  | "theme"
  | "surface"
  | "card"
  | "typography"
  | "buttons"
  | "input"
  | "select"
  | "table"
  | "badge"
  | "avatar"
  | "form"
  | "tooltip"
  | "modal"
  | "tree"
  | "datepicker"
  | "calendar"
  | "loading"
  | "checkbox"
  | "radio"
  | "switch"
  | "toast"
  | "logo"
  | "chrome"
  | "charts";

// ── Groups ────────────────────────────────────────────────────────────────

export type GroupId = "appearance" | "layout" | "components" | "branding" | "behavior" | "charts";

export interface SettingsGroupMeta {
  id: GroupId;
  /** i18n key for the group name. */
  titleKey: string;
  /** i18n key for the one-line "what lives here" line. */
  descKey?: string;
  icon: LucideIcon;
  /** What the Stage shows before you point at any particular row. */
  defaultSubject: StageSubject;
}

export const SETTINGS_GROUPS: SettingsGroupMeta[] = [
  {
    id: "appearance",
    titleKey: "settings.tabs.appearance",
    descKey: "settings.appearanceSettings.description",
    icon: Palette,
    defaultSubject: "theme",
  },
  // No platform key describes "size, softness, depth and motion" as one idea,
  // and a narrower key would mis-describe the group — so these two carry a
  // name only rather than a borrowed line that lies.
  {
    id: "layout",
    titleKey: "settings.tabs.layout",
    icon: LayoutGrid,
    defaultSubject: "surface",
  },
  {
    id: "components",
    titleKey: "settings.tabs.components",
    icon: Blocks,
    defaultSubject: "buttons",
  },
  {
    id: "branding",
    titleKey: "settings.logo.title",
    descKey: "settings.logo.description",
    icon: Sparkles,
    defaultSubject: "logo",
  },
  {
    id: "behavior",
    titleKey: "settings.tabs.behavior",
    descKey: "settings.behavior.description",
    icon: SlidersHorizontal,
    defaultSubject: "chrome",
  },
  {
    id: "charts",
    titleKey: "settings.tabs.charts",
    icon: BarChart3,
    defaultSubject: "charts",
  },
];

export const DEFAULT_GROUP_ID: GroupId = "appearance";

// ── Rows ──────────────────────────────────────────────────────────────────

export interface SettingRowMeta {
  /** Stable id — also the DOM anchor the search jumps to. */
  id: string;
  group: GroupId;
  /** i18n key for the row title. */
  titleKey?: string;
  /** Literal title, used only where the platform ships no key for it. */
  title?: string;
  /** i18n key for the row's supporting line. Omitted when no honest key exists. */
  descKey?: string;
  /** Literal supporting line, paired with `title`. */
  description?: string;
  /** Which real surface the Stage shows while this row is in play. */
  subject: StageSubject;
  /**
   * Extra match terms for search — the persisted field names, so anyone who
   * knows the setting key can find its control by typing it.
   */
  terms?: string[];
}

export const SETTING_ROWS: SettingRowMeta[] = [
  // ── Appearance: the colour story, top to bottom ────────────────────────
  {
    id: "palette",
    group: "appearance",
    titleKey: "settings.appearanceTabs.palettes",
    descKey: "settings.appearanceSettings.palettesInfo",
    subject: "theme",
    terms: ["activePalette", "palette", "preset"],
  },
  {
    id: "primary-color",
    group: "appearance",
    titleKey: "settings.appearanceSettings.primaryColor",
    descKey: "settings.appearanceSettings.primaryColorDesc",
    subject: "theme",
    terms: ["colorTheme", "colorThemeCustomized", "accent"],
  },
  {
    id: "secondary-color",
    group: "appearance",
    titleKey: "settings.appearanceSettings.secondaryColor",
    descKey: "settings.appearanceSettings.secondaryColorDesc",
    subject: "theme",
    terms: ["secondaryColorTheme"],
  },
  {
    id: "light-background",
    group: "appearance",
    titleKey: "settings.appearanceTabs.lightBg",
    subject: "theme",
    terms: ["lightBackgroundTheme", "background"],
  },
  {
    id: "dark-background",
    group: "appearance",
    titleKey: "settings.appearanceTabs.darkBg",
    subject: "theme",
    terms: ["darkBackgroundTheme", "background"],
  },
  {
    id: "background-mode",
    group: "appearance",
    titleKey: "settings.bgMode.title",
    descKey: "settings.bgMode.description",
    subject: "theme",
    terms: ["backgroundMode"],
  },
  {
    id: "gradient-direction",
    group: "appearance",
    titleKey: "settings.appearanceSettings.gradientDirection",
    descKey: "settings.appearanceSettings.gradientDirectionDesc",
    subject: "theme",
    terms: ["gradientDirection"],
  },
  {
    id: "light-gradient",
    group: "appearance",
    titleKey: "settings.appearanceSettings.lightGradients",
    descKey: "settings.appearanceSettings.lightGradientsDesc",
    subject: "theme",
    terms: ["lightGradientTheme"],
  },
  {
    id: "dark-gradient",
    group: "appearance",
    titleKey: "settings.appearanceSettings.darkGradients",
    descKey: "settings.appearanceSettings.darkGradientsDesc",
    subject: "theme",
    terms: ["darkGradientTheme"],
  },
  {
    id: "custom-gradient",
    group: "appearance",
    titleKey: "settings.gradient.customColors",
    descKey: "settings.gradient.customColorsDesc",
    subject: "theme",
    terms: ["gradientStartColor", "gradientEndColor"],
  },

  // ── Layout & density: size, softness, depth, motion ────────────────────
  {
    id: "font-size",
    group: "layout",
    titleKey: "settings.fontSizeSection.title",
    descKey: "settings.fontSizeSection.description",
    subject: "typography",
    terms: ["fontSize"],
  },
  {
    id: "border-radius",
    group: "layout",
    titleKey: "settings.borderRadius.title",
    descKey: "settings.borderRadius.description",
    subject: "surface",
    terms: ["borderRadius", "corner"],
  },
  {
    id: "spacing",
    group: "layout",
    titleKey: "settings.spacing.title",
    descKey: "settings.spacing.description",
    subject: "form",
    terms: ["spacingSize", "density"],
  },
  {
    id: "card-style",
    group: "layout",
    titleKey: "settings.cardStyle.title",
    descKey: "settings.cardStyle.description",
    subject: "card",
    terms: ["cardStyle"],
  },
  {
    id: "shadow",
    group: "layout",
    titleKey: "settings.shadow.title",
    descKey: "settings.shadow.description",
    subject: "card",
    terms: ["shadowIntensity", "depth"],
  },
  {
    id: "animation",
    group: "layout",
    titleKey: "settings.animation.title",
    descKey: "settings.animation.description",
    subject: "surface",
    terms: ["animationLevel", "motion"],
  },
  // No platform key ships for this row; the literals below are the same ones
  // the previous hover section rendered, so no locale key moves. Only one
  // real look exists per the design bar (§5.3: hover = colour + hairline,
  // nothing lifts), so this is an on/off control now, not a style picker.
  {
    id: "hover-type",
    group: "layout",
    title: "Hover Effect",
    description: "Turn the hover border-highlight on or off",
    subject: "card",
    terms: ["hoverEffectType", "hover"],
  },

  // ── Components: one row per part of the interface ──────────────────────
  {
    id: "button-style",
    group: "components",
    titleKey: "settings.buttonStyle.title",
    descKey: "settings.buttonStyle.description",
    subject: "buttons",
    terms: ["buttonStyle"],
  },
  {
    id: "input-style",
    group: "components",
    titleKey: "settings.inputStyle.title",
    descKey: "settings.inputStyle.description",
    subject: "input",
    terms: ["inputStyle"],
  },
  // No "select-style" row: SelectStyle collapsed to a single member when the
  // 26 invented skins were deleted, and a picker with one option is not a
  // setting. The "select" StageSubject stays — the Stage still shows a real
  // select, it is just no longer driven by a row of its own.
  {
    id: "table-style",
    group: "components",
    titleKey: "settings.tableStyle.title",
    descKey: "settings.tableStyle.description",
    subject: "table",
    terms: ["tableStyle", "grid"],
  },
  {
    id: "badge-style",
    group: "components",
    titleKey: "settings.badgeStyle.title",
    descKey: "settings.badgeStyle.description",
    subject: "badge",
    terms: ["badgeStyle", "chip", "tag"],
  },
  {
    id: "avatar-style",
    group: "components",
    titleKey: "settings.avatarStyle.title",
    descKey: "settings.avatarStyle.description",
    subject: "avatar",
    terms: ["avatarStyle"],
  },
  {
    id: "form-style",
    group: "components",
    titleKey: "settings.formStyle.title",
    descKey: "settings.formStyle.description",
    subject: "form",
    terms: ["formStyle"],
  },
  {
    id: "tooltip-style",
    group: "components",
    titleKey: "settings.tooltipStyle.title",
    descKey: "settings.tooltipStyle.description",
    subject: "tooltip",
    terms: ["tooltipStyle"],
  },
  {
    id: "modal-style",
    group: "components",
    titleKey: "settings.modalStyle.title",
    descKey: "settings.modalStyle.description",
    subject: "modal",
    terms: ["modalStyle", "dialog", "drawer"],
  },
  {
    id: "tree-style",
    group: "components",
    titleKey: "settings.treeStyle.title",
    descKey: "settings.treeStyle.description",
    subject: "tree",
    terms: ["treeStyle", "hierarchy"],
  },
  {
    id: "datepicker-style",
    group: "components",
    titleKey: "settings.datePickerStyle.title",
    descKey: "settings.datePickerStyle.description",
    subject: "datepicker",
    terms: ["datePickerStyle", "date"],
  },
  {
    id: "calendar-style",
    group: "components",
    titleKey: "settings.calendarStyle.title",
    descKey: "settings.calendarStyle.description",
    subject: "calendar",
    terms: ["calendarStyle"],
  },
  {
    id: "loading-style",
    group: "components",
    titleKey: "settings.loadingStyle.title",
    descKey: "settings.loadingStyle.description",
    subject: "loading",
    terms: ["loadingStyle", "spinner"],
  },
  {
    id: "checkbox-style",
    group: "components",
    titleKey: "settings.inputs.checkbox.title",
    descKey: "settings.inputs.checkbox.description",
    subject: "checkbox",
    terms: ["checkboxStyle"],
  },
  {
    id: "radio-style",
    group: "components",
    titleKey: "settings.inputs.radio.title",
    descKey: "settings.inputs.radio.description",
    subject: "radio",
    terms: ["radioStyle"],
  },
  {
    id: "switch-style",
    group: "components",
    titleKey: "settings.switchStyle.title",
    descKey: "settings.switchStyle.description",
    subject: "switch",
    terms: ["switchStyle", "toggle"],
  },
  {
    id: "toast-style",
    group: "components",
    // The platform `toast.*` block carries the real strings; the module's
    // `settings.toast.*` block is a placeholder stub ("Title", "Description").
    titleKey: "toast.title",
    descKey: "toast.description",
    subject: "toast",
    terms: ["toastStyle", "notification"],
  },

  // ── Branding ───────────────────────────────────────────────────────────
  {
    id: "logo-type",
    group: "branding",
    titleKey: "settings.logo.typeLabel",
    subject: "logo",
    terms: ["logoType"],
  },
  {
    id: "logo-size",
    group: "branding",
    titleKey: "settings.logo.sizeLabel",
    subject: "logo",
    terms: ["logoSize"],
  },
  {
    id: "logo-animation",
    group: "branding",
    titleKey: "settings.logo.animationLabel",
    subject: "logo",
    terms: ["logoAnimation"],
  },
  {
    id: "logo-text",
    group: "branding",
    titleKey: "settings.logo.textLabel",
    descKey: "settings.logo.textHelp",
    subject: "logo",
    terms: ["logoText"],
  },

  // ── Behaviour: the ten chrome switches ─────────────────────────────────
  {
    id: "show-breadcrumbs",
    group: "behavior",
    titleKey: "settings.behavior.breadcrumbs.label",
    descKey: "settings.behavior.breadcrumbs.description",
    subject: "chrome",
    terms: ["showBreadcrumbs"],
  },
  {
    id: "show-user-avatar",
    group: "behavior",
    titleKey: "settings.behavior.userAvatar.label",
    descKey: "settings.behavior.userAvatar.description",
    subject: "chrome",
    terms: ["showUserAvatar"],
  },
  {
    id: "show-notifications",
    group: "behavior",
    titleKey: "settings.behavior.notifications.label",
    descKey: "settings.behavior.notifications.description",
    subject: "chrome",
    terms: ["showNotifications"],
  },
  {
    id: "show-logo",
    group: "behavior",
    titleKey: "settings.behavior.logo.label",
    descKey: "settings.behavior.logo.description",
    subject: "chrome",
    terms: ["showLogo"],
  },
  {
    id: "high-contrast",
    group: "behavior",
    titleKey: "settings.behavior.contrast.label",
    descKey: "settings.behavior.contrast.description",
    subject: "chrome",
    terms: ["highContrast", "accessibility"],
  },
  {
    id: "reduced-motion",
    group: "behavior",
    titleKey: "settings.behavior.motion.label",
    descKey: "settings.behavior.motion.description",
    subject: "chrome",
    terms: ["reducedMotion", "accessibility"],
  },
  {
    id: "sticky-header",
    group: "behavior",
    titleKey: "settings.behavior.sticky.label",
    descKey: "settings.behavior.sticky.description",
    subject: "chrome",
    terms: ["stickyHeader"],
  },
  {
    id: "collapsible-sidebar",
    group: "behavior",
    titleKey: "settings.behavior.sidebar.label",
    descKey: "settings.behavior.sidebar.description",
    subject: "chrome",
    terms: ["collapsibleSidebar"],
  },
  {
    id: "show-footer",
    group: "behavior",
    titleKey: "settings.behavior.footer.label",
    descKey: "settings.behavior.footer.description",
    subject: "chrome",
    terms: ["showFooter"],
  },
  {
    id: "auto-save",
    group: "behavior",
    titleKey: "settings.behavior.autoSave.label",
    descKey: "settings.behavior.autoSave.description",
    subject: "chrome",
    terms: ["autoSave"],
  },

  // ── Charts ─────────────────────────────────────────────────────────────
  {
    id: "chart-palette",
    group: "charts",
    titleKey: "settings.tabs.charts",
    subject: "charts",
    terms: ["chart", "palette", "series"],
  },
];

/** Row lookup by id — the group panels read their own metadata from here. */
export const ROW: Record<string, SettingRowMeta> = Object.fromEntries(
  SETTING_ROWS.map((row) => [row.id, row])
);

/** The DOM anchor a search result scrolls to. */
export function rowAnchorId(rowId: string): string {
  return `setting-${rowId}`;
}
