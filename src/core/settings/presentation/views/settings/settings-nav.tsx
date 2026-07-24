"use client";

/**
 * Settings information architecture — the single registry the searchable rail,
 * the one-section content pane, and the live-preview dock all read from.
 *
 * Wave H replaced the old 7-tab bar + nested 6-tab appearance card + 14-section
 * component scroll with a flat, grouped rail: every former sub-tab and every
 * component section is now an addressable destination you can jump straight to.
 * A group with a single destination collapses into its own leaf row; a group
 * with several expands to list them.
 *
 * Section components are code-split per destination (only one renders at a
 * time), so opening Settings no longer pulls every picker — and its charts —
 * into the first paint.
 */

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import {
  AppWindow,
  BarChart3,
  Blocks,
  Calendar,
  CalendarDays,
  CircleUser,
  ClipboardList,
  ImageIcon,
  Layers,
  LayoutGrid,
  ListChecks,
  ListTree,
  Loader,
  type LucideIcon,
  MessageSquare,
  Moon,
  MousePointer2,
  MoveUp,
  Palette,
  SlidersHorizontal,
  SquareCheck,
  Sun,
  Table,
  Tag,
  TextCursorInput,
  Type,
  Wand2,
} from "lucide-react";
import { LoadingSpinner } from "@core/ui/loading-spinner";

// Shared loading affordance for a code-split destination. A centred spinner
// keeps the content column from collapsing while the chunk resolves. It is
// handed to each dynamic() as an inline { loading: SectionLoader } literal —
// Turbopack requires the options argument to be an object literal it can read
// statically, so a shared options object cannot be passed by reference.
const SectionLoader = () => (
  <div className="flex justify-center py-12">
    <LoadingSpinner size="sm" />
  </div>
);

// ── Appearance ────────────────────────────────────────────────────────────
const BackgroundModeSection = dynamic(
  () => import("./appearance-tab").then((m) => ({ default: m.BackgroundModeSection })),
  { loading: SectionLoader }
);
const ColorsSubtab = dynamic(
  () => import("./appearance-tab/colors-subtab").then((m) => ({ default: m.ColorsSubtab })),
  { loading: SectionLoader }
);
const LightBackgroundsSubtab = dynamic(
  () =>
    import("./appearance-tab/light-backgrounds-subtab").then((m) => ({
      default: m.LightBackgroundsSubtab,
    })),
  { loading: SectionLoader }
);
const DarkBackgroundsSubtab = dynamic(
  () =>
    import("./appearance-tab/dark-backgrounds-subtab").then((m) => ({
      default: m.DarkBackgroundsSubtab,
    })),
  { loading: SectionLoader }
);
const GradientsSubtab = dynamic(
  () => import("./appearance-tab/gradients-subtab").then((m) => ({ default: m.GradientsSubtab })),
  { loading: SectionLoader }
);
const PalettesSubtab = dynamic(
  () => import("./appearance-tab/palettes-subtab").then((m) => ({ default: m.PalettesSubtab })),
  { loading: SectionLoader }
);
const EffectsSubtab = dynamic(
  () => import("./appearance-tab/effects-subtab").then((m) => ({ default: m.EffectsSubtab })),
  { loading: SectionLoader }
);

// ── Layout & density ──────────────────────────────────────────────────────
const StylesTab = dynamic(
  () => import("./layout-tab/styles-tab").then((m) => ({ default: m.StylesTab })),
  { loading: SectionLoader }
);

// ── Components ────────────────────────────────────────────────────────────
const ButtonStyleSection = dynamic(
  () => import("./components-tab/button-style-section").then((m) => ({ default: m.ButtonStyleSection })),
  { loading: SectionLoader }
);
const InputStyleSection = dynamic(
  () => import("./components-tab/input-style-section").then((m) => ({ default: m.InputStyleSection })),
  { loading: SectionLoader }
);
const SelectStyleSection = dynamic(
  () => import("./components-tab/select-style-section").then((m) => ({ default: m.SelectStyleSection })),
  { loading: SectionLoader }
);
const TableStyleSection = dynamic(
  () => import("./components-tab/table-style-section").then((m) => ({ default: m.TableStyleSection })),
  { loading: SectionLoader }
);
const BadgeStyleSection = dynamic(
  () => import("./components-tab/badge-style-section").then((m) => ({ default: m.BadgeStyleSection })),
  { loading: SectionLoader }
);
const AvatarStyleSection = dynamic(
  () => import("./components-tab/avatar-style-section").then((m) => ({ default: m.AvatarStyleSection })),
  { loading: SectionLoader }
);
const FormStyleSection = dynamic(
  () => import("./components-tab/form-style-section").then((m) => ({ default: m.FormStyleSection })),
  { loading: SectionLoader }
);
const TooltipStyleSection = dynamic(
  () => import("./components-tab/tooltip-style-section").then((m) => ({ default: m.TooltipStyleSection })),
  { loading: SectionLoader }
);
const ModalStyleSection = dynamic(
  () => import("./components-tab/modal-style-section").then((m) => ({ default: m.ModalStyleSection })),
  { loading: SectionLoader }
);
const TreeStyleSection = dynamic(
  () => import("./components-tab/tree-style-section").then((m) => ({ default: m.TreeStyleSection })),
  { loading: SectionLoader }
);
const DatePickerStyleSection = dynamic(
  () => import("./components-tab/datepicker-style-section").then((m) => ({ default: m.DatePickerStyleSection })),
  { loading: SectionLoader }
);
const CalendarStyleSection = dynamic(
  () => import("./components-tab/calendar-style-section").then((m) => ({ default: m.CalendarStyleSection })),
  { loading: SectionLoader }
);
const LoadingStyleSection = dynamic(
  () => import("./components-tab/loading-style-section").then((m) => ({ default: m.LoadingStyleSection })),
  { loading: SectionLoader }
);
const HoverEffectsSection = dynamic(
  () => import("./components-tab/hover-effects-section").then((m) => ({ default: m.HoverEffectsSection })),
  { loading: SectionLoader }
);

// ── Data & charts / typography / behaviour / checkbox+radio ───────────────
const ProfessionalChartsTab = dynamic(
  () => import("./charts-tab").then((m) => ({ default: m.ProfessionalChartsTab })),
  { loading: SectionLoader }
);
const CheckboxRadioTab = dynamic(
  () => import("./checkbox-radio-tab").then((m) => ({ default: m.CheckboxRadioTab })),
  { loading: SectionLoader }
);
const TypographyTab = dynamic(
  () => import("./typography-tab").then((m) => ({ default: m.TypographyTab })),
  { loading: SectionLoader }
);
const BehaviorTab = dynamic(
  () => import("./behavior-tab").then((m) => ({ default: m.BehaviorTab })),
  { loading: SectionLoader }
);

/**
 * Which live surface the preview dock foregrounds for a destination. Every
 * primitive listed here reads the global settings provider, so a real instance
 * mirrors the committed selection with no bespoke wiring. `null` opts a
 * destination out of the dock entirely (pure toggles have no visual result).
 */
export type PreviewKind =
  | "surface"
  | "buttons"
  | "input"
  | "select"
  | "table"
  | "badge"
  | "avatar"
  | "form"
  | "tooltip"
  | "loading"
  | "datepicker"
  | "calendar"
  | "charts"
  | "checkboxRadio"
  | "typography"
  | null;

export interface SettingsItem {
  /** Stable destination id (also the value persisted as the active rail row). */
  id: string;
  /** i18n key for the rail label — reuses each section's own title key. */
  labelKey?: string;
  /**
   * Literal label, used only where the owning section carries no i18n title of
   * its own (Hover Effects is hard-coded in its section). Mirroring that literal
   * keeps rail/section parity without minting a new locale key.
   */
  label?: string;
  icon: LucideIcon;
  /** The code-split section rendered in the content column. */
  Component: ComponentType;
  /** The live surface the dock shows for this destination. */
  preview: PreviewKind;
}

export interface SettingsGroup {
  id: string;
  labelKey: string;
  icon: LucideIcon;
  items: SettingsItem[];
}

export const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    id: "appearance",
    labelKey: "settings.tabs.appearance",
    icon: Palette,
    items: [
      { id: "background", labelKey: "settings.bgMode.title", icon: ImageIcon, Component: BackgroundModeSection, preview: "surface" },
      { id: "colors", labelKey: "settings.appearanceTabs.colors", icon: Palette, Component: ColorsSubtab, preview: "surface" },
      { id: "light-bg", labelKey: "settings.appearanceTabs.lightBg", icon: Sun, Component: LightBackgroundsSubtab, preview: "surface" },
      { id: "dark-bg", labelKey: "settings.appearanceTabs.darkBg", icon: Moon, Component: DarkBackgroundsSubtab, preview: "surface" },
      { id: "gradients", labelKey: "settings.appearanceTabs.gradients", icon: Wand2, Component: GradientsSubtab, preview: "surface" },
      { id: "palettes", labelKey: "settings.appearanceTabs.palettes", icon: Layers, Component: PalettesSubtab, preview: "surface" },
      { id: "effects", labelKey: "settings.appearanceTabs.effects", icon: Wand2, Component: EffectsSubtab, preview: "surface" },
    ],
  },
  {
    id: "layout",
    labelKey: "settings.tabs.layout",
    icon: LayoutGrid,
    items: [
      { id: "card-style", labelKey: "settings.cardStyle.title", icon: LayoutGrid, Component: StylesTab, preview: "surface" },
    ],
  },
  {
    id: "components",
    labelKey: "settings.tabs.components",
    icon: Blocks,
    items: [
      { id: "button", labelKey: "settings.buttonStyle.title", icon: MousePointer2, Component: ButtonStyleSection, preview: "buttons" },
      { id: "input", labelKey: "settings.inputStyle.title", icon: TextCursorInput, Component: InputStyleSection, preview: "input" },
      { id: "select", labelKey: "settings.selectStyle.title", icon: ListChecks, Component: SelectStyleSection, preview: "select" },
      { id: "table", labelKey: "settings.tableStyle.title", icon: Table, Component: TableStyleSection, preview: "table" },
      { id: "badge", labelKey: "settings.badgeStyle.title", icon: Tag, Component: BadgeStyleSection, preview: "badge" },
      { id: "avatar", labelKey: "settings.avatarStyle.title", icon: CircleUser, Component: AvatarStyleSection, preview: "avatar" },
      { id: "form", labelKey: "settings.formStyle.title", icon: ClipboardList, Component: FormStyleSection, preview: "form" },
      { id: "tooltip", labelKey: "settings.tooltipStyle.title", icon: MessageSquare, Component: TooltipStyleSection, preview: "tooltip" },
      { id: "modal", labelKey: "settings.modalStyle.title", icon: AppWindow, Component: ModalStyleSection, preview: "surface" },
      { id: "tree", labelKey: "settings.treeStyle.title", icon: ListTree, Component: TreeStyleSection, preview: "surface" },
      { id: "datepicker", labelKey: "settings.datePickerStyle.title", icon: CalendarDays, Component: DatePickerStyleSection, preview: "datepicker" },
      { id: "calendar", labelKey: "settings.calendarStyle.title", icon: Calendar, Component: CalendarStyleSection, preview: "calendar" },
      { id: "loading", labelKey: "settings.loadingStyle.title", icon: Loader, Component: LoadingStyleSection, preview: "loading" },
      { id: "hover", label: "Hover Effects", icon: MoveUp, Component: HoverEffectsSection, preview: "surface" },
    ],
  },
  {
    id: "charts",
    labelKey: "settings.tabs.charts",
    icon: BarChart3,
    items: [
      { id: "charts", labelKey: "settings.tabs.charts", icon: BarChart3, Component: ProfessionalChartsTab, preview: "charts" },
    ],
  },
  {
    id: "checkboxRadio",
    labelKey: "settings.tabs.checkboxRadio",
    icon: SquareCheck,
    items: [
      { id: "checkbox-radio", labelKey: "settings.tabs.checkboxRadio", icon: SquareCheck, Component: CheckboxRadioTab, preview: "checkboxRadio" },
    ],
  },
  {
    id: "typography",
    labelKey: "settings.tabs.typography",
    icon: Type,
    items: [
      { id: "typography", labelKey: "settings.tabs.typography", icon: Type, Component: TypographyTab, preview: "typography" },
    ],
  },
  {
    id: "behavior",
    labelKey: "settings.tabs.behavior",
    icon: SlidersHorizontal,
    items: [
      { id: "behavior", labelKey: "settings.tabs.behavior", icon: SlidersHorizontal, Component: BehaviorTab, preview: null },
    ],
  },
];

/** Flat lookup for the active destination (content + dock resolution). */
export const SETTINGS_ITEMS: SettingsItem[] = SETTINGS_GROUPS.flatMap((g) => g.items);

/** The first destination shown when Settings opens. */
export const DEFAULT_SETTINGS_ITEM_ID = "colors";
