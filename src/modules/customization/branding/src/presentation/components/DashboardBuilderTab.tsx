// FILE-EXCEPTION: file length
/**
 * DashboardBuilderTab — Full 61-setting dashboard builder for Customizer Studio
 *
 * Replaces the legacy 5-setting DashboardPanel with 10 collapsible sections
 * covering all dashboard appearance settings. Uses shared setting primitives
 * and EditionGatedControl for feature gating.
 *
 * @module customization/presentation/components
 */
"use client";
// UI-EXCEPTION: compact studio layout — native elements for tight sidebar
// where @core/ui components would break the compact design.

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/core/common/utils";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Slider } from "@core/ui/slider";
import { Switch } from "@core/ui/switch";
import { CollapsibleSection } from "@core/ui/collapsible-section";
import {
  Layout,
  Palette,
  Type,
  Layers,
  Square,
  Sparkles,
  Navigation,
  Bell as BellIcon,
  Info,
  Check,
  Lock,
  Paintbrush,
  Eye,
  Wand2,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { BRAND } from "@core/config/branding";
import type { DashboardThemeSettings } from "../../domain/entities/StudioDraft";

// ═══════════════════════════════════════════════════════════════════════════════
//  OPTION DATA — All option arrays for the picker controls
// ═══════════════════════════════════════════════════════════════════════════════

const COLOR_THEMES = [
  { value: "scripe", color: "#7c3aed" },
  { value: "purple", color: "#8b5cf6" },
  { value: "blue", color: "#3b82f6" },
  { value: "green", color: "#22c55e" },
  { value: "orange", color: "#f97316" },
  { value: "red", color: "#ef4444" },
  { value: "teal", color: "#14b8a6" },
  { value: "pink", color: "#ec4899" },
  { value: "indigo", color: "#6366f1" },
  { value: "cyan", color: "#06b6d4" },
  { value: "amber", color: "#f59e0b" },
  { value: "yellow", color: "#eab308" },
  { value: "lime", color: "#84cc16" },
  { value: "emerald", color: "#10b981" },
  { value: "sky", color: "#0ea5e9" },
  { value: "violet", color: "#7c3aed" },
  { value: "fuchsia", color: "#d946ef" },
  { value: "rose", color: "#f43f5e" },
  { value: "slate", color: "#64748b" },
  { value: "zinc", color: "#71717a" },
  { value: "stone", color: "#78716c" },
  { value: "gold", color: "#d4a017" },
  { value: "coral", color: "#ff6b6b" },
] as const;

const LAYOUT_TEMPLATES = [
  "modern",
  "minimal",
  "classic",
  "compact",
  "floating",
  "elegant",
  "navigation",
  "tabbed",
  "dual",
  "command",
  "stacked",
  "hud",
  "dock",
  "executive",
  "magazine",
  "spotlight",
  "glassmorphism",
  "galaxy",
  "neon",
  "retro",
  "aurora",
  "rail",
  "newspaper",
  "cinema",
  "vault",
  "bottombar",
  "megamenu",
  "breadcrumb",
  "ribbon",
  "treeview",
  "overlay",
  "hub",
  "wizard",
  "shelf",
  "collapseheader",
  "splitpane",
  "inbox",
  "dualheader",
  "topside",
  "focus",
  "multipanel",
  "kanban",
  "bento",
  "chat",
  "map",
  "feed",
  "calendar",
  "crm",
  "terminal",
] as const;

const SHADOW_OPTIONS = ["none", "subtle", "moderate", "strong"] as const;
const BG_MODES = ["preset", "gradient", "custom"] as const;
const GRADIENT_DIRS = ["to-t", "to-tr", "to-r", "to-br", "to-b", "to-bl", "to-l", "to-tl"] as const;
const FONT_SIZES = ["xs", "small", "medium", "default", "large", "xl"] as const;
const BORDER_RADII = ["none", "small", "default", "large", "full"] as const;
const SPACING_SIZES = ["compact", "default", "comfortable", "spacious"] as const;
const LOGO_TYPES = ["sparkles", "shield", "image", "custom"] as const;
const LOGO_ANIMATIONS = ["none", "spin", "pulse", "fancy"] as const;
const LOGO_SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

// ── Fixed: match SettingsProvider types exactly ──
const ANIMATION_LEVELS = ["none", "minimal", "moderate", "high"] as const;
const HOVER_EFFECTS = ["none", "elevate", "scale", "glow", "shimmer", "rotate", "slide"] as const;
const HOVER_INTENSITIES = ["none", "small", "medium", "strong"] as const;
const NAV_STYLES = ["default", "pills", "underline", "sidebar"] as const;
const ICON_STYLES = ["outline", "filled", "duotone", "minimal"] as const;
const CARD_STYLES = ["default", "glass", "solid", "bordered", "elevated"] as const;
const SIDEBAR_STYLES = ["default", "compact", "floating", "minimal"] as const;
const HEADER_STYLES = ["default", "compact", "elevated", "transparent"] as const;
const TOAST_STYLES = [
  "classic",
  "neon",
  "glassmorphism",
  "neumorphism",
  "aurora",
  "cosmic",
  "minimal",
  "modern",
  "gradient",
  "outlined",
] as const;

// ── Missing: Background & Gradient presets (from SettingsProvider) ──
const LIGHT_BG_THEMES = [
  "default",
  "warm",
  "cool",
  "neutral",
  "soft",
  "cream",
  "mint",
  "lavender",
  "rose",
  "sky",
  "sand",
  "pearl",
  "ice",
  "linen",
  "cloud",
  "snow",
] as const;
const DARK_BG_THEMES = [
  "default",
  "darker",
  "pitch",
  "slate",
  "warm-dark",
  "forest",
  "ocean",
  "purple-dark",
  "crimson",
  "midnight",
  "charcoal",
  "obsidian",
  "navy",
  "graphite",
  "onyx",
  "volcanic",
] as const;
const LIGHT_GRADIENT_THEMES = [
  "none",
  "sunrise",
  "ocean-breeze",
  "lavender-mist",
  "meadow",
  "peach-glow",
  "sky-wash",
  "cotton-candy",
  "lemonade",
  "seafoam",
  "blush",
  "arctic",
  "golden-hour",
] as const;
const DARK_GRADIENT_THEMES = [
  "none",
  "midnight-blue",
  "aurora",
  "deep-space",
  "ember",
  "twilight",
  "neon-noir",
  "volcanic-ash",
  "northern-lights",
  "abyss",
  "cyber-punk",
  "dark-forest",
  "nebula",
] as const;

// ── Component style option arrays (from SettingsProvider types) ──
const BUTTON_STYLES = [
  "default",
  "small-round",
  "medium-round",
  "large-round",
  "extra-round",
  "super-round",
  "rounded",
  "sharp",
  "modern",
] as const;
const INPUT_STYLES = ["default", "rounded", "underlined", "filled"] as const;
const TABLE_STYLES = [
  "default",
  "striped",
  "bordered",
  "minimal",
  "glass",
  "neon",
  "gradient",
  "neumorphism",
  "cyberpunk",
  "luxury",
  "matrix",
  "diamond",
] as const;
const BADGE_STYLES = [
  "default",
  "modern",
  "glass",
  "neon",
  "gradient",
  "outlined",
  "filled",
  "minimal",
  "pill",
  "square",
] as const;
const AVATAR_STYLES = ["default", "rounded", "square", "hexagon"] as const;
const FORM_STYLES = [
  "default",
  "compact",
  "spacious",
  "inline",
  "modern",
  "glass",
  "minimal",
  "card",
  "neon",
  "elegant",
  "organic",
  "retro",
] as const;
const LOADING_STYLES = [
  "spinner",
  "dots",
  "bars",
  "pulse",
  "wave",
  "orbit",
  "ripple",
  "gradient",
  "matrix",
  "helix",
  "quantum",
  "morphing",
] as const;
const TOOLTIP_STYLES = [
  "default",
  "rounded",
  "sharp",
  "bubble",
  "glass",
  "neon",
  "minimal",
  "elegant",
] as const;
const MODAL_STYLES = [
  "default",
  "centered",
  "fullscreen",
  "drawer",
  "glass",
  "floating",
  "card",
  "overlay",
] as const;
const TREE_STYLES = [
  "lines",
  "cards",
  "minimal",
  "bubble",
  "modern",
  "glass",
  "elegant",
  "professional",
  "gradient",
  "neon",
  "organic",
  "corporate",
] as const;
const DATE_PICKER_STYLES = [
  "default",
  "modern",
  "glass",
  "outlined",
  "filled",
  "minimal",
  "elegant",
] as const;
const CALENDAR_STYLES = ["default", "modern", "glass", "elegant", "minimal", "dark"] as const;
const SELECT_STYLES = [
  "default",
  "modern",
  "glass",
  "outlined",
  "filled",
  "minimal",
  "elegant",
  "professional",
  "neon",
  "gradient",
  "neumorphism",
  "cyberpunk",
  "luxury",
  "aurora",
  "matrix",
  "diamond",
  "holographic",
  "cosmic",
  "liquid",
  "crystal",
  "plasma",
  "quantum",
  "nebula",
  "prism",
  "stellar",
  "vortex",
  "phoenix",
] as const;
const SWITCH_STYLES = [
  "default",
  "modern",
  "ios",
  "android",
  "toggle",
  "slider",
  "neon",
  "neumorphism",
  "liquid",
  "cyberpunk",
  "glassmorphism",
  "aurora",
  "matrix",
  "cosmic",
  "retro",
] as const;
const CHECKBOX_STYLES = [
  "default",
  "modern",
  "glass",
  "neon",
  "gradient",
  "neumorphism",
  "cyberpunk",
  "luxury",
  "aurora",
  "cosmic",
  "minimal",
  "elegant",
  "organic",
  "retro",
  "matrix",
  "diamond",
  "liquid",
  "crystal",
  "plasma",
  "quantum",
  "holographic",
  "stellar",
  "vortex",
  "phoenix",
] as const;
const RADIO_STYLES = [
  "default",
  "modern",
  "glass",
  "neon",
  "gradient",
  "neumorphism",
  "cyberpunk",
  "luxury",
  "aurora",
  "cosmic",
  "minimal",
  "elegant",
  "organic",
  "retro",
  "matrix",
  "diamond",
  "liquid",
  "crystal",
  "plasma",
  "quantum",
  "holographic",
  "stellar",
  "vortex",
  "phoenix",
] as const;

// Component style definitions — each with its options array for OptionGrid rendering
const COMPONENT_STYLES: {
  key: keyof DashboardThemeSettings;
  localeKey: string;
  options: readonly string[];
}[] = [
  { key: "buttonStyle", localeKey: "button", options: BUTTON_STYLES },
  { key: "inputStyle", localeKey: "input", options: INPUT_STYLES },
  { key: "tableStyle", localeKey: "table", options: TABLE_STYLES },
  { key: "badgeStyle", localeKey: "badge", options: BADGE_STYLES },
  { key: "avatarStyle", localeKey: "avatar", options: AVATAR_STYLES },
  { key: "formStyle", localeKey: "form", options: FORM_STYLES },
  { key: "loadingStyle", localeKey: "loading", options: LOADING_STYLES },
  { key: "tooltipStyle", localeKey: "tooltip", options: TOOLTIP_STYLES },
  { key: "modalStyle", localeKey: "modal", options: MODAL_STYLES },
  { key: "treeStyle", localeKey: "tree", options: TREE_STYLES },
  { key: "datePickerStyle", localeKey: "datePicker", options: DATE_PICKER_STYLES },
  { key: "calendarStyle", localeKey: "calendar", options: CALENDAR_STYLES },
  { key: "selectStyle", localeKey: "select", options: SELECT_STYLES },
  { key: "switchStyle", localeKey: "switch", options: SWITCH_STYLES },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  DASHBOARD PRESETS — Curated one-click presets that populate all settings
// ═══════════════════════════════════════════════════════════════════════════════

interface DashboardPreset {
  id: string;
  localeKey: string;
  accent: string; // Gradient or color for the preview card
  accentEnd?: string;
  icon: string; // Emoji for quick visual cue
  settings: Partial<DashboardThemeSettings>;
}

const DASHBOARD_PRESETS: DashboardPreset[] = [
  {
    id: "professional",
    localeKey: "professional",
    accent: "#3b82f6",
    accentEnd: "#6366f1",
    icon: "💼",
    settings: {
      layoutTemplate: "modern",
      sidebarPosition: "left",
      sidebarStyle: "default",
      headerStyle: "default",
      collapsibleSidebar: true,
      showBreadcrumbs: true,
      colorTheme: "blue",
      secondaryColorTheme: "indigo",
      shadowIntensity: "subtle",
      backgroundMode: "preset",
      fontSize: "default",
      borderRadius: "default",
      spacingSize: "default",
      compactMode: false,
      cardStyle: "default",
      animationLevel: "moderate",
      hoverEffectType: "elevate",
      hoverEffectIntensity: "small",
      reducedMotion: false,
      logoType: "sparkles",
      logoAnimation: "none",
      logoSize: "md",
      navigationStyle: "default",
      iconStyle: "outline",
      showUserAvatar: true,
      showNotifications: true,
      stickyHeader: true,
      showFooter: true,
      toastStyle: "classic",
      showToastIcons: true,
      toastDuration: 5000,
    },
  },
  {
    id: "neonCyber",
    localeKey: "neonCyber",
    accent: "#06b6d4",
    accentEnd: "#d946ef",
    icon: "⚡",
    settings: {
      layoutTemplate: "neon",
      sidebarPosition: "left",
      sidebarStyle: "compact",
      headerStyle: "elevated",
      collapsibleSidebar: true,
      showBreadcrumbs: false,
      colorTheme: "cyan",
      secondaryColorTheme: "fuchsia",
      shadowIntensity: "strong",
      backgroundMode: "gradient",
      gradientDirection: "to-br",
      gradientStartColor: "#0f172a",
      gradientEndColor: "#1e1b4b",
      fontSize: "default",
      borderRadius: "large",
      spacingSize: "comfortable",
      compactMode: false,
      cardStyle: "glass",
      animationLevel: "high",
      hoverEffectType: "glow",
      hoverEffectIntensity: "strong",
      reducedMotion: false,
      logoType: "sparkles",
      logoAnimation: "pulse",
      logoSize: "lg",
      navigationStyle: "pills",
      iconStyle: "duotone",
      toastStyle: "neon",
      showToastIcons: true,
      toastDuration: 4000,
    },
  },
  {
    id: "minimal",
    localeKey: "minimal",
    accent: "#64748b",
    accentEnd: "#94a3b8",
    icon: "✨",
    settings: {
      layoutTemplate: "minimal",
      sidebarPosition: "left",
      sidebarStyle: "minimal",
      headerStyle: "compact",
      collapsibleSidebar: true,
      showBreadcrumbs: false,
      colorTheme: "slate",
      secondaryColorTheme: "zinc",
      shadowIntensity: "none",
      backgroundMode: "preset",
      fontSize: "default",
      borderRadius: "small",
      spacingSize: "comfortable",
      compactMode: false,
      cardStyle: "solid",
      animationLevel: "minimal",
      hoverEffectType: "elevate",
      hoverEffectIntensity: "small",
      reducedMotion: false,
      logoType: "sparkles",
      logoAnimation: "none",
      logoSize: "sm",
      navigationStyle: "underline",
      iconStyle: "outline",
      toastStyle: "minimal",
      showToastIcons: false,
      toastDuration: 3000,
    },
  },
  {
    id: "enterprise",
    localeKey: "enterprise",
    accent: "#1e293b",
    accentEnd: "#334155",
    icon: "🏢",
    settings: {
      layoutTemplate: "executive",
      sidebarPosition: "left",
      sidebarStyle: "compact",
      headerStyle: "elevated",
      collapsibleSidebar: false,
      showBreadcrumbs: true,
      colorTheme: "slate",
      secondaryColorTheme: "blue",
      shadowIntensity: "moderate",
      backgroundMode: "preset",
      fontSize: "medium",
      borderRadius: "small",
      spacingSize: "default",
      compactMode: false,
      cardStyle: "bordered",
      animationLevel: "minimal",
      hoverEffectType: "elevate",
      hoverEffectIntensity: "small",
      reducedMotion: false,
      logoType: "shield",
      logoAnimation: "none",
      logoSize: "md",
      navigationStyle: "underline",
      iconStyle: "outline",
      toastStyle: "outlined",
      showToastIcons: true,
      toastDuration: 5000,
    },
  },
  {
    id: "creative",
    localeKey: "creative",
    accent: "#f97316",
    accentEnd: "#ec4899",
    icon: "🎨",
    settings: {
      layoutTemplate: "bento",
      sidebarPosition: "left",
      sidebarStyle: "compact",
      headerStyle: "elevated",
      collapsibleSidebar: true,
      showBreadcrumbs: true,
      colorTheme: "orange",
      secondaryColorTheme: "pink",
      shadowIntensity: "moderate",
      backgroundMode: "preset",
      fontSize: "default",
      borderRadius: "large",
      spacingSize: "comfortable",
      compactMode: false,
      cardStyle: "elevated",
      animationLevel: "high",
      hoverEffectType: "scale",
      hoverEffectIntensity: "medium",
      reducedMotion: false,
      logoType: "sparkles",
      logoAnimation: "fancy",
      logoSize: "lg",
      navigationStyle: "pills",
      iconStyle: "filled",
      toastStyle: "gradient",
      showToastIcons: true,
      toastDuration: 4000,
    },
  },
  {
    id: "darkExecutive",
    localeKey: "darkExecutive",
    accent: "#8b5cf6",
    accentEnd: "#1e1b4b",
    icon: "🌙",
    settings: {
      layoutTemplate: "executive",
      sidebarPosition: "left",
      sidebarStyle: "default",
      headerStyle: "default",
      collapsibleSidebar: true,
      showBreadcrumbs: true,
      colorTheme: "violet",
      secondaryColorTheme: "purple",
      shadowIntensity: "moderate",
      backgroundMode: "custom",
      customPrimaryColor: "#7c3aed",
      customSecondaryColor: "#4c1d95",
      customLightBgColor: "#faf5ff",
      customDarkBgColor: "#0f0720",
      fontSize: "default",
      borderRadius: "default",
      spacingSize: "default",
      compactMode: false,
      cardStyle: "elevated",
      animationLevel: "moderate",
      hoverEffectType: "glow",
      hoverEffectIntensity: "medium",
      reducedMotion: false,
      logoType: "sparkles",
      logoAnimation: "pulse",
      logoSize: "md",
      navigationStyle: "default",
      iconStyle: "outline",
      toastStyle: "cosmic",
      showToastIcons: true,
      toastDuration: 5000,
    },
  },
  {
    id: "glass",
    localeKey: "glass",
    accent: "#06b6d4",
    accentEnd: "#22d3ee",
    icon: "💎",
    settings: {
      layoutTemplate: "glassmorphism",
      sidebarPosition: "left",
      sidebarStyle: "compact",
      headerStyle: "elevated",
      collapsibleSidebar: true,
      showBreadcrumbs: false,
      colorTheme: "cyan",
      secondaryColorTheme: "teal",
      shadowIntensity: "subtle",
      backgroundMode: "gradient",
      gradientDirection: "to-br",
      gradientStartColor: "#0f172a",
      gradientEndColor: "#164e63",
      fontSize: "default",
      borderRadius: "large",
      spacingSize: "comfortable",
      compactMode: false,
      cardStyle: "glass",
      animationLevel: "moderate",
      hoverEffectType: "shimmer",
      hoverEffectIntensity: "medium",
      reducedMotion: false,
      logoType: "sparkles",
      logoAnimation: "none",
      logoSize: "md",
      navigationStyle: "pills",
      iconStyle: "outline",
      toastStyle: "glassmorphism",
      showToastIcons: true,
      toastDuration: 4000,
    },
  },
  {
    id: "warmSunset",
    localeKey: "warmSunset",
    accent: "#f59e0b",
    accentEnd: "#f43f5e",
    icon: "🌅",
    settings: {
      layoutTemplate: "modern",
      sidebarPosition: "left",
      sidebarStyle: "default",
      headerStyle: "default",
      collapsibleSidebar: true,
      showBreadcrumbs: true,
      colorTheme: "amber",
      secondaryColorTheme: "rose",
      shadowIntensity: "subtle",
      backgroundMode: "preset",
      fontSize: "default",
      borderRadius: "default",
      spacingSize: "default",
      compactMode: false,
      cardStyle: "default",
      animationLevel: "moderate",
      hoverEffectType: "elevate",
      hoverEffectIntensity: "small",
      reducedMotion: false,
      logoType: "sparkles",
      logoAnimation: "none",
      logoSize: "md",
      navigationStyle: "default",
      iconStyle: "outline",
      toastStyle: "classic",
      showToastIcons: true,
      toastDuration: 5000,
    },
  },
];

// Section alias for backward-compat — delegates to core CollapsibleSection
const Section = CollapsibleSection;

// ═══════════════════════════════════════════════════════════════════════════════
//  MINI COMPONENTS — Compact controls for sidebar layout
// ═══════════════════════════════════════════════════════════════════════════════

function ColorSwatch({
  value,
  color,
  selected,
  onSelect,
}: {
  value: string;
  color: string;
  selected: boolean;
  onSelect: (v: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(value)}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all hover:scale-110",
        selected
          ? "border-primary shadow-md"
          : "border-transparent hover:border-muted-foreground/30"
      )}
      title={value}
    >
      <div className="h-5 w-5 rounded-full shadow-sm" style={{ background: color }}>
        {selected && <Check className="h-5 w-5 p-0.5 text-white" />}
      </div>
    </button>
  );
}

function OptionGrid<T extends string>({
  options,
  selected,
  onSelect,
  cols = 3,
  labelFn,
}: {
  options: readonly T[];
  selected: T;
  onSelect: (v: T) => void;
  cols?: number;
  labelFn?: (v: T) => string;
}) {
  return (
    <div
      className={cn(
        "grid gap-1",
        cols === 2
          ? "grid-cols-2"
          : cols === 4
            ? "grid-cols-4"
            : cols === 5
              ? "grid-cols-5"
              : "grid-cols-3"
      )}
    >
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className={cn(
            "truncate rounded-md border px-2 py-1.5 text-[10px] font-medium transition-all",
            selected === opt
              ? "border-primary bg-primary/10 text-primary"
              : "border-border/50 text-muted-foreground hover:border-primary/30 hover:bg-accent/20"
          )}
        >
          {labelFn ? labelFn(opt) : opt}
        </button>
      ))}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[11px] text-foreground">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function HexInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-6 w-6 shrink-0 rounded border border-border/50 shadow-sm"
        style={{ background: value }}
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 font-mono text-[10px]"
        maxLength={7}
        placeholder="#000000"
      />
      <span className="shrink-0 text-[9px] text-muted-foreground">{label}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  DASHBOARD BUILDER TAB — Main component
// ═══════════════════════════════════════════════════════════════════════════════

interface DashboardBuilderTabProps {
  settings: DashboardThemeSettings;
  onUpdate: (updates: Partial<DashboardThemeSettings>) => void;
}

export function DashboardBuilderTab({ settings, onUpdate }: DashboardBuilderTabProps) {
  const { t } = useI18n();

  // Track which sections are open (all closed by default except first)
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));

  const toggleSection = useCallback((index: number) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const set = <K extends keyof DashboardThemeSettings>(
    key: K,
    value: DashboardThemeSettings[K]
  ) => {
    onUpdate({ [key]: value } as Partial<DashboardThemeSettings>);
  };

  // ── Localized label functions for OptionGrid ──
  const shadowLabel = useCallback((v: string) => t(`studio.dashboard.shadow.${v}`) || v, [t]);
  const bgModeLabel = useCallback((v: string) => t(`studio.dashboard.bgMode.${v}`) || v, [t]);
  const fontSizeLabel = useCallback((v: string) => t(`studio.dashboard.fontSizes.${v}`) || v, [t]);
  const radiusLabel = useCallback((v: string) => t(`studio.dashboard.radii.${v}`) || v, [t]);
  const spacingLabel = useCallback((v: string) => t(`studio.dashboard.spacing.${v}`) || v, [t]);
  const cardLabel = useCallback((v: string) => t(`studio.dashboard.card.${v}`) || v, [t]);
  const animationLabel = useCallback((v: string) => t(`studio.dashboard.animation.${v}`) || v, [t]);
  const hoverLabel = useCallback((v: string) => t(`studio.dashboard.hover.${v}`) || v, [t]);
  const intensityLabel = useCallback((v: string) => t(`studio.dashboard.intensity.${v}`) || v, [t]);
  const logoTypeLabel = useCallback((v: string) => t(`studio.dashboard.logoTypes.${v}`) || v, [t]);
  const logoAnimLabel = useCallback(
    (v: string) => t(`studio.dashboard.logoAnimations.${v}`) || v,
    [t]
  );
  const logoSizeLabel = useCallback((v: string) => t(`studio.dashboard.logoSizes.${v}`) || v, [t]);
  const navStyleLabel = useCallback((v: string) => t(`studio.dashboard.navStyles.${v}`) || v, [t]);
  const iconStyleLabel = useCallback(
    (v: string) => t(`studio.dashboard.iconStyles.${v}`) || v,
    [t]
  );
  const toastStyleLabel = useCallback(
    (v: string) => t(`studio.dashboard.toastStyles.${v}`) || v,
    [t]
  );
  const sidebarStyleLabel = useCallback((v: string) => t(`studio.dashboard.styles.${v}`) || v, [t]);
  const headerStyleLabel = useCallback((v: string) => t(`studio.dashboard.styles.${v}`) || v, [t]);
  const sidebarPosLabel = useCallback(
    (v: string) => {
      return v === "left"
        ? t("studio.dashboard.sidebarPositionLeft") || "Left"
        : t("studio.dashboard.sidebarPositionRight") || "Right";
    },
    [t]
  );
  // Labels for new background/gradient settings
  const bgThemeLabel = useCallback((v: string) => t(`studio.dashboard.bgTheme.${v}`) || v, [t]);
  const gradientThemeLabel = useCallback(
    (v: string) => t(`studio.dashboard.gradientTheme.${v}`) || v,
    [t]
  );
  // Generic component style label
  const componentStyleLabel = useCallback(
    (v: string) => t(`studio.dashboard.styles.${v}`) || v,
    [t]
  );

  // Localized component style items (memoized so the list rebuilds on language change)
  const componentStyles = useMemo(
    () =>
      COMPONENT_STYLES.map((cs) => ({
        ...cs,
        label: t(`studio.dashboard.component.${cs.localeKey}`) || cs.localeKey,
      })),
    [t]
  );

  // Localized "N styles" text
  const nStylesLabel = useCallback(
    (count: number) => {
      const tpl = t("studio.dashboard.nStyles");
      return tpl ? tpl.replace("{{count}}", String(count)) : `${count} styles`;
    },
    [t]
  );

  // Apply a preset — merges preset settings into the current dashboard settings
  const applyPreset = useCallback(
    (preset: DashboardPreset) => {
      onUpdate(preset.settings);
    },
    [onUpdate]
  );

  return (
    <div className="space-y-0">
      {/* Info banner */}
      <div className="mb-3 flex items-start gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
        <p className="text-[10px] leading-relaxed text-blue-600 dark:text-blue-400">
          {t("studio.dashboard.info")}
        </p>
      </div>

      {/* ── Quick Presets ── */}
      <Section
        icon={Wand2}
        title={t("studio.dashboard.section.presets")}
        count={DASHBOARD_PRESETS.length}
        isOpen={openSections.has(10)}
        onToggle={() => toggleSection(10)}
      >
        <div className="grid grid-cols-2 gap-1.5">
          {DASHBOARD_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className={cn(
                "group relative flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition-all",
                "border-border/50 hover:border-primary/40 hover:shadow-sm"
              )}
            >
              {/* Accent bar */}
              <div
                className="absolute inset-x-0 top-0 h-1 rounded-t-lg transition-opacity group-hover:opacity-100"
                style={{
                  background: preset.accentEnd
                    ? `linear-gradient(to right, ${preset.accent}, ${preset.accentEnd})`
                    : preset.accent,
                  opacity: 0.7,
                }}
              />
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="text-sm">{preset.icon}</span>
                <span className="text-[10px] font-semibold text-foreground">
                  {t(`studio.dashboard.preset.${preset.localeKey}`)}
                </span>
              </div>
              <span className="text-[9px] leading-tight text-muted-foreground/70">
                {t(`studio.dashboard.presetDesc.${preset.localeKey}`)}
              </span>
            </button>
          ))}
        </div>
      </Section>

      {/* ── Section 1: Layout & Structure (6 settings) ── */}
      <Section
        icon={Layout}
        title={t("studio.dashboard.section.layout")}
        count={6}
        isOpen={openSections.has(0)}
        onToggle={() => toggleSection(0)}
      >
        {/* Layout Template Grid */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("studio.dashboard.layoutTemplate")}
          </Label>
          <div className="scrollbar-thin grid max-h-[180px] grid-cols-3 gap-1 overflow-y-auto pr-1">
            {LAYOUT_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl}
                onClick={() => set("layoutTemplate", tmpl)}
                className={cn(
                  "truncate rounded-md border px-1.5 py-1 text-[9px] font-medium transition-all",
                  settings.layoutTemplate === tmpl
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 text-muted-foreground hover:border-primary/30"
                )}
              >
                {tmpl}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Position */}
        <div className="space-y-1">
          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("studio.dashboard.sidebarPosition")}
          </Label>
          <OptionGrid
            options={["left", "right"] as const}
            selected={settings.sidebarPosition}
            onSelect={(v) => set("sidebarPosition", v)}
            cols={2}
            labelFn={sidebarPosLabel}
          />
        </div>

        {/* Sidebar & Header Style */}
        <div className="space-y-1">
          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("studio.dashboard.sidebarStyle")}
          </Label>
          <OptionGrid
            options={SIDEBAR_STYLES}
            selected={settings.sidebarStyle as any}
            onSelect={(v) => set("sidebarStyle", v)}
            cols={2}
            labelFn={sidebarStyleLabel}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("studio.dashboard.headerStyle")}
          </Label>
          <OptionGrid
            options={HEADER_STYLES}
            selected={settings.headerStyle as any}
            onSelect={(v) => set("headerStyle", v)}
            cols={2}
            labelFn={headerStyleLabel}
          />
        </div>

        {/* Toggles */}
        <ToggleRow
          label={t("studio.dashboard.collapsibleSidebar")}
          checked={settings.collapsibleSidebar}
          onChange={(v) => set("collapsibleSidebar", v)}
        />
        <ToggleRow
          label={t("studio.dashboard.showBreadcrumbs")}
          checked={settings.showBreadcrumbs}
          onChange={(v) => set("showBreadcrumbs", v)}
        />
      </Section>

      {/* ── Section 2: Colors & Theme (21 settings) ── */}
      <Section
        icon={Palette}
        title={t("studio.dashboard.section.colors")}
        count={21}
        isOpen={openSections.has(1)}
        onToggle={() => toggleSection(1)}
      >
        {/* Primary Color Theme */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("studio.dashboard.colorTheme")}
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {COLOR_THEMES.map((c) => (
              <ColorSwatch
                key={c.value}
                value={c.value}
                color={c.color}
                selected={settings.colorTheme === c.value}
                onSelect={(v) => set("colorTheme", v)}
              />
            ))}
          </div>
        </div>

        {/* Secondary Color Theme */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("studio.dashboard.secondaryColor")}
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {COLOR_THEMES.map((c) => (
              <ColorSwatch
                key={c.value}
                value={c.value}
                color={c.color}
                selected={settings.secondaryColorTheme === c.value}
                onSelect={(v) => set("secondaryColorTheme", v)}
              />
            ))}
          </div>
        </div>

        {/* Shadow Intensity */}
        <div className="space-y-1">
          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("studio.dashboard.shadowIntensity")}
          </Label>
          <OptionGrid
            options={SHADOW_OPTIONS}
            selected={settings.shadowIntensity as any}
            onSelect={(v) => set("shadowIntensity", v)}
            cols={4}
            labelFn={shadowLabel}
          />
        </div>

        {/* Background Mode */}
        <div className="space-y-1">
          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("studio.dashboard.backgroundMode")}
          </Label>
          <OptionGrid
            options={BG_MODES}
            selected={settings.backgroundMode}
            onSelect={(v) => set("backgroundMode", v)}
            cols={3}
            labelFn={bgModeLabel}
          />
        </div>

        {/* Gradient controls (shown when gradient mode) */}
        {settings.backgroundMode === "gradient" && (
          <div className="space-y-2 rounded-lg border border-border/30 bg-muted/20 p-2">
            <Label className="text-[9px] font-medium uppercase text-muted-foreground">
              {t("studio.dashboard.gradientDirection")}
            </Label>
            <div className="grid grid-cols-4 gap-1">
              {GRADIENT_DIRS.map((dir) => (
                <button
                  key={dir}
                  onClick={() => set("gradientDirection", dir)}
                  className={cn(
                    "rounded border px-1.5 py-1 text-[9px] transition-all",
                    settings.gradientDirection === dir
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/30 text-muted-foreground hover:border-primary/30"
                  )}
                >
                  {dir}
                </button>
              ))}
            </div>
            <HexInput
              label={t("studio.dashboard.gradientStart")}
              value={settings.gradientStartColor}
              onChange={(v) => set("gradientStartColor", v)}
            />
            <HexInput
              label={t("studio.dashboard.gradientEnd")}
              value={settings.gradientEndColor}
              onChange={(v) => set("gradientEndColor", v)}
            />

            {/* Light Gradient Theme */}
            <div className="space-y-1 pt-1">
              <Label className="text-[9px] font-medium uppercase text-muted-foreground">
                {t("studio.dashboard.lightGradientTheme") || "Light Gradient"}
              </Label>
              <div className="scrollbar-thin grid max-h-[120px] grid-cols-3 gap-1 overflow-y-auto pr-1">
                {LIGHT_GRADIENT_THEMES.map((gt) => (
                  <button
                    key={gt}
                    onClick={() => set("lightGradientTheme", gt)}
                    className={cn(
                      "truncate rounded-md border px-1.5 py-1 text-[9px] font-medium transition-all",
                      settings.lightGradientTheme === gt
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    {gradientThemeLabel(gt)}
                  </button>
                ))}
              </div>
            </div>

            {/* Dark Gradient Theme */}
            <div className="space-y-1">
              <Label className="text-[9px] font-medium uppercase text-muted-foreground">
                {t("studio.dashboard.darkGradientTheme") || "Dark Gradient"}
              </Label>
              <div className="scrollbar-thin grid max-h-[120px] grid-cols-3 gap-1 overflow-y-auto pr-1">
                {DARK_GRADIENT_THEMES.map((gt) => (
                  <button
                    key={gt}
                    onClick={() => set("darkGradientTheme", gt)}
                    className={cn(
                      "truncate rounded-md border px-1.5 py-1 text-[9px] font-medium transition-all",
                      settings.darkGradientTheme === gt
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    {gradientThemeLabel(gt)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Preset background themes (shown when preset mode) */}
        {settings.backgroundMode === "preset" && (
          <div className="space-y-2 rounded-lg border border-border/30 bg-muted/20 p-2">
            {/* Light Background Theme */}
            <div className="space-y-1">
              <Label className="text-[9px] font-medium uppercase text-muted-foreground">
                {t("studio.dashboard.lightBgTheme") || "Light Background"}
              </Label>
              <div className="scrollbar-thin grid max-h-[120px] grid-cols-3 gap-1 overflow-y-auto pr-1">
                {LIGHT_BG_THEMES.map((bg) => (
                  <button
                    key={bg}
                    onClick={() => set("lightBackgroundTheme", bg)}
                    className={cn(
                      "truncate rounded-md border px-1.5 py-1 text-[9px] font-medium transition-all",
                      settings.lightBackgroundTheme === bg
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    {bgThemeLabel(bg)}
                  </button>
                ))}
              </div>
            </div>

            {/* Dark Background Theme */}
            <div className="space-y-1">
              <Label className="text-[9px] font-medium uppercase text-muted-foreground">
                {t("studio.dashboard.darkBgTheme") || "Dark Background"}
              </Label>
              <div className="scrollbar-thin grid max-h-[120px] grid-cols-3 gap-1 overflow-y-auto pr-1">
                {DARK_BG_THEMES.map((bg) => (
                  <button
                    key={bg}
                    onClick={() => set("darkBackgroundTheme", bg)}
                    className={cn(
                      "truncate rounded-md border px-1.5 py-1 text-[9px] font-medium transition-all",
                      settings.darkBackgroundTheme === bg
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    {bgThemeLabel(bg)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Custom color controls (shown when custom mode) */}
        {settings.backgroundMode === "custom" && (
          <div className="space-y-2 rounded-lg border border-border/30 bg-muted/20 p-2">
            <HexInput
              label={t("studio.dashboard.customPrimary")}
              value={settings.customPrimaryColor}
              onChange={(v) => set("customPrimaryColor", v)}
            />
            <HexInput
              label={t("studio.dashboard.customSecondary")}
              value={settings.customSecondaryColor}
              onChange={(v) => set("customSecondaryColor", v)}
            />
            <HexInput
              label={t("studio.dashboard.customLightBg")}
              value={settings.customLightBgColor}
              onChange={(v) => set("customLightBgColor", v)}
            />
            <HexInput
              label={t("studio.dashboard.customDarkBg")}
              value={settings.customDarkBgColor}
              onChange={(v) => set("customDarkBgColor", v)}
            />
          </div>
        )}

        {/* Active Palette (open-ended palette ID) */}
        <div className="space-y-1">
          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("studio.dashboard.activePalette") || "Active Palette"}
          </Label>
          <Input
            value={settings.activePalette}
            onChange={(e) => set("activePalette", e.target.value)}
            className="h-7 text-[10px]"
            placeholder={t("studio.dashboard.activePalettePlaceholder") || "e.g. ocean-breeze"}
          />
        </div>
      </Section>

      {/* ── Section 3: Typography & Spacing (4 settings) ── */}
      <Section
        icon={Type}
        title={t("studio.dashboard.section.typography")}
        count={4}
        isOpen={openSections.has(2)}
        onToggle={() => toggleSection(2)}
      >
        <div className="space-y-1">
          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("studio.dashboard.fontSize")}
          </Label>
          <OptionGrid
            options={FONT_SIZES}
            selected={settings.fontSize as any}
            onSelect={(v) => set("fontSize", v)}
            cols={3}
            labelFn={fontSizeLabel}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("studio.dashboard.borderRadius")}
          </Label>
          <OptionGrid
            options={BORDER_RADII}
            selected={settings.borderRadius as any}
            onSelect={(v) => set("borderRadius", v)}
            cols={3}
            labelFn={radiusLabel}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("studio.dashboard.spacingSize")}
          </Label>
          <OptionGrid
            options={SPACING_SIZES}
            selected={settings.spacingSize as any}
            onSelect={(v) => set("spacingSize", v)}
            cols={2}
            labelFn={spacingLabel}
          />
        </div>
        <ToggleRow
          label={t("studio.dashboard.compactMode")}
          checked={settings.compactMode}
          onChange={(v) => set("compactMode", v)}
        />
      </Section>

      {/* ── Section 4: Component Styles (14 settings) ── */}
      <Section
        icon={Layers}
        title={t("studio.dashboard.section.components")}
        count={14}
        isOpen={openSections.has(3)}
        onToggle={() => toggleSection(3)}
      >
        {componentStyles.map((cs) => (
          <div key={cs.key} className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-medium text-foreground">{cs.label}</Label>
              <span className="text-[8px] text-muted-foreground/50">
                {nStylesLabel(cs.options.length)}
              </span>
            </div>
            <div className="scrollbar-thin grid max-h-[100px] grid-cols-3 gap-1 overflow-y-auto pr-1">
              {cs.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => set(cs.key, opt)}
                  className={cn(
                    "truncate rounded-md border px-1.5 py-1 text-[9px] font-medium transition-all",
                    settings[cs.key] === opt
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 text-muted-foreground hover:border-primary/30 hover:bg-accent/20"
                  )}
                >
                  {componentStyleLabel(opt)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </Section>

      {/* ── Section 5: Checkbox & Radio (2 settings) ── */}
      <Section
        icon={Square}
        title={t("studio.dashboard.section.checkboxRadio")}
        count={2}
        isOpen={openSections.has(4)}
        onToggle={() => toggleSection(4)}
      >
        <div className="space-y-1">
          <Label className="text-[10px] font-medium text-foreground">
            {t("studio.dashboard.checkboxStyle")}
          </Label>
          <div className="scrollbar-thin grid max-h-[120px] grid-cols-3 gap-1 overflow-y-auto pr-1">
            {CHECKBOX_STYLES.map((opt) => (
              <button
                key={opt}
                onClick={() => set("checkboxStyle", opt)}
                className={cn(
                  "truncate rounded-md border px-1.5 py-1 text-[9px] font-medium transition-all",
                  settings.checkboxStyle === opt
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 text-muted-foreground hover:border-primary/30 hover:bg-accent/20"
                )}
              >
                {componentStyleLabel(opt)}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-medium text-foreground">
            {t("studio.dashboard.radioStyle")}
          </Label>
          <div className="scrollbar-thin grid max-h-[120px] grid-cols-3 gap-1 overflow-y-auto pr-1">
            {RADIO_STYLES.map((opt) => (
              <button
                key={opt}
                onClick={() => set("radioStyle", opt)}
                className={cn(
                  "truncate rounded-md border px-1.5 py-1 text-[9px] font-medium transition-all",
                  settings.radioStyle === opt
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 text-muted-foreground hover:border-primary/30 hover:bg-accent/20"
                )}
              >
                {componentStyleLabel(opt)}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Section 6: Card, Animation & Hover (5 settings) ── */}
      <Section
        icon={Paintbrush}
        title={t("studio.dashboard.section.animation")}
        count={5}
        isOpen={openSections.has(5)}
        onToggle={() => toggleSection(5)}
      >
        <div className="space-y-1">
          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("studio.dashboard.cardStyle")}
          </Label>
          <OptionGrid
            options={CARD_STYLES}
            selected={settings.cardStyle as any}
            onSelect={(v) => set("cardStyle", v)}
            cols={3}
            labelFn={cardLabel}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("studio.dashboard.animationLevel")}
          </Label>
          <OptionGrid
            options={ANIMATION_LEVELS}
            selected={settings.animationLevel as any}
            onSelect={(v) => set("animationLevel", v)}
            cols={2}
            labelFn={animationLabel}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("studio.dashboard.hoverEffect")}
          </Label>
          <OptionGrid
            options={HOVER_EFFECTS}
            selected={settings.hoverEffectType as any}
            onSelect={(v) => set("hoverEffectType", v)}
            cols={4}
            labelFn={hoverLabel}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("studio.dashboard.hoverIntensity")}
          </Label>
          <OptionGrid
            options={HOVER_INTENSITIES}
            selected={settings.hoverEffectIntensity as any}
            onSelect={(v) => set("hoverEffectIntensity", v)}
            cols={2}
            labelFn={intensityLabel}
          />
        </div>
        <ToggleRow
          label={t("studio.dashboard.reducedMotion")}
          checked={settings.reducedMotion}
          onChange={(v) => set("reducedMotion", v)}
        />
      </Section>

      {/* ── Section 7: Logo & Branding (5 settings) ── */}
      <Section
        icon={Sparkles}
        title={t("studio.dashboard.section.logo")}
        count={5}
        isOpen={openSections.has(6)}
        onToggle={() => toggleSection(6)}
      >
        <div className="space-y-1">
          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("studio.dashboard.logoType")}
          </Label>
          <OptionGrid
            options={LOGO_TYPES}
            selected={settings.logoType as any}
            onSelect={(v) => set("logoType", v)}
            cols={2}
            labelFn={logoTypeLabel}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("studio.dashboard.logoAnimation")}
          </Label>
          <OptionGrid
            options={LOGO_ANIMATIONS}
            selected={settings.logoAnimation as any}
            onSelect={(v) => set("logoAnimation", v)}
            cols={2}
            labelFn={logoAnimLabel}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("studio.dashboard.logoSize")}
          </Label>
          <OptionGrid
            options={LOGO_SIZES}
            selected={settings.logoSize as any}
            onSelect={(v) => set("logoSize", v)}
            cols={5}
            labelFn={logoSizeLabel}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-medium text-foreground">
            {t("studio.dashboard.logoText")}
          </Label>
          <Input
            value={settings.logoText}
            onChange={(e) => set("logoText", e.target.value)}
            className="h-7 text-[10px]"
            placeholder={t("studio.dashboard.logoTextPlaceholder") || BRAND.name}
            maxLength={50}
          />
        </div>
        <ToggleRow
          label={t("studio.dashboard.showLogo")}
          checked={settings.showLogo}
          onChange={(v) => set("showLogo", v)}
        />
      </Section>

      {/* ── Section 8: Navigation & UX (9 settings) ── */}
      <Section
        icon={Navigation}
        title={t("studio.dashboard.section.navigation")}
        count={9}
        isOpen={openSections.has(7)}
        onToggle={() => toggleSection(7)}
      >
        <div className="space-y-1">
          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("studio.dashboard.navigationStyle")}
          </Label>
          <OptionGrid
            options={NAV_STYLES}
            selected={settings.navigationStyle as any}
            onSelect={(v) => set("navigationStyle", v)}
            cols={2}
            labelFn={navStyleLabel}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("studio.dashboard.iconStyle")}
          </Label>
          <OptionGrid
            options={ICON_STYLES}
            selected={settings.iconStyle as any}
            onSelect={(v) => set("iconStyle", v)}
            cols={2}
            labelFn={iconStyleLabel}
          />
        </div>
        <ToggleRow
          label={t("studio.dashboard.showUserAvatar")}
          checked={settings.showUserAvatar}
          onChange={(v) => set("showUserAvatar", v)}
        />
        <ToggleRow
          label={t("studio.dashboard.showNotifications")}
          checked={settings.showNotifications}
          onChange={(v) => set("showNotifications", v)}
        />
        <ToggleRow
          label={t("studio.dashboard.stickyHeader")}
          checked={settings.stickyHeader}
          onChange={(v) => set("stickyHeader", v)}
        />
        <ToggleRow
          label={t("studio.dashboard.showFooter")}
          checked={settings.showFooter}
          onChange={(v) => set("showFooter", v)}
        />
        <ToggleRow
          label={t("studio.dashboard.autoSave")}
          checked={settings.autoSave}
          onChange={(v) => set("autoSave", v)}
        />
        <ToggleRow
          label={t("studio.dashboard.highContrast")}
          checked={settings.highContrast}
          onChange={(v) => set("highContrast", v)}
        />
        <ToggleRow
          label={t("studio.dashboard.showDetailPanel")}
          checked={settings.showDetailPanel}
          onChange={(v) => set("showDetailPanel", v)}
        />
      </Section>

      {/* ── Section 9: Toast Configuration (3 settings) ── */}
      <Section
        icon={BellIcon}
        title={t("studio.dashboard.section.toast")}
        count={3}
        isOpen={openSections.has(8)}
        onToggle={() => toggleSection(8)}
      >
        <div className="space-y-1">
          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("studio.dashboard.toastStyle")}
          </Label>
          <OptionGrid
            options={TOAST_STYLES}
            selected={settings.toastStyle as any}
            onSelect={(v) => set("toastStyle", v)}
            cols={2}
            labelFn={toastStyleLabel}
          />
        </div>
        <ToggleRow
          label={t("studio.dashboard.showToastIcons")}
          checked={settings.showToastIcons}
          onChange={(v) => set("showToastIcons", v)}
        />
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {t("studio.dashboard.toastDuration")}
            </Label>
            <span className="text-[9px] tabular-nums text-muted-foreground">
              {settings.toastDuration}ms
            </span>
          </div>
          <Slider
            value={[settings.toastDuration]}
            onValueChange={([v]) => set("toastDuration", v)}
            min={1000}
            max={10000}
            step={500}
            className="w-full"
          />
        </div>
      </Section>

      {/* ── Section 10: Admin Override Control ── */}
      <Section
        icon={Eye}
        title={t("studio.dashboard.section.overrides")}
        count={2}
        isOpen={openSections.has(9)}
        onToggle={() => toggleSection(9)}
      >
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
          <p className="text-[10px] leading-relaxed text-amber-600 dark:text-amber-400">
            {t("studio.dashboard.overrideInfo")}
          </p>
        </div>
        <div className="space-y-1 pt-1">
          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("studio.dashboard.allowOverride")}
          </Label>
          <p className="text-[9px] leading-relaxed text-muted-foreground">
            {t("studio.dashboard.allowOverrideDesc")}
          </p>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("studio.dashboard.overridePaths")}
          </Label>
          <p className="text-[9px] leading-relaxed text-muted-foreground">
            {t("studio.dashboard.overridePathsDesc")}
          </p>
        </div>
      </Section>
    </div>
  );
}
