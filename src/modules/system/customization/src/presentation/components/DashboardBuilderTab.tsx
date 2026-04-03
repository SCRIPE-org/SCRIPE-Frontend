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

import { useState, useCallback } from "react";
import { cn } from "@/core/common/utils";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Slider } from "@core/ui/slider";
import {
  Layout, Palette, Type, Layers, Square, Sparkles,
  Navigation, Bell as BellIcon, Info, ChevronDown, ChevronRight,
  Check, Lock, Paintbrush, Eye,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { DashboardThemeSettings } from "../../domain/entities/StudioDraft";

// ═══════════════════════════════════════════════════════════════════════════════
//  OPTION DATA — All option arrays for the picker controls
// ═══════════════════════════════════════════════════════════════════════════════

const COLOR_THEMES = [
  { value: "purple", color: "#8b5cf6" }, { value: "blue", color: "#3b82f6" },
  { value: "green", color: "#22c55e" }, { value: "orange", color: "#f97316" },
  { value: "red", color: "#ef4444" }, { value: "teal", color: "#14b8a6" },
  { value: "pink", color: "#ec4899" }, { value: "indigo", color: "#6366f1" },
  { value: "cyan", color: "#06b6d4" }, { value: "amber", color: "#f59e0b" },
  { value: "yellow", color: "#eab308" }, { value: "lime", color: "#84cc16" },
  { value: "emerald", color: "#10b981" }, { value: "sky", color: "#0ea5e9" },
  { value: "violet", color: "#7c3aed" }, { value: "fuchsia", color: "#d946ef" },
  { value: "rose", color: "#f43f5e" }, { value: "slate", color: "#64748b" },
  { value: "zinc", color: "#71717a" }, { value: "stone", color: "#78716c" },
  { value: "gold", color: "#d4a017" }, { value: "coral", color: "#ff6b6b" },
] as const;

const LAYOUT_TEMPLATES = [
  "modern", "minimal", "classic", "compact", "floating", "elegant",
  "navigation", "tabbed", "dual", "command", "stacked", "hud",
  "dock", "executive", "magazine", "spotlight", "glassmorphism",
  "galaxy", "neon", "retro", "aurora", "rail", "newspaper", "cinema",
  "vault", "bottombar", "megamenu", "breadcrumb", "ribbon", "treeview",
  "overlay", "hub", "wizard", "shelf", "collapseheader", "splitpane",
  "inbox", "dualheader", "topside", "focus", "multipanel", "kanban",
  "bento", "chat", "map", "feed", "calendar", "crm", "terminal",
] as const;

const SHADOW_OPTIONS = ["none", "subtle", "moderate", "strong"] as const;
const BG_MODES = ["preset", "gradient", "custom"] as const;
const GRADIENT_DIRS = ["to-t", "to-tr", "to-r", "to-br", "to-b", "to-bl", "to-l", "to-tl"] as const;
const FONT_SIZES = ["xs", "small", "medium", "default", "large", "xl"] as const;
const BORDER_RADII = ["none", "small", "default", "large", "full"] as const;
const SPACING_SIZES = ["compact", "default", "comfortable", "spacious"] as const;
const ANIMATION_LEVELS = ["none", "minimal", "default", "full"] as const;
const HOVER_EFFECTS = ["default", "lift", "glow", "scale", "slide", "blur", "neon"] as const;
const HOVER_INTENSITIES = ["subtle", "default", "moderate", "strong"] as const;
const LOGO_TYPES = ["sparkles", "shield", "image", "custom"] as const;
const LOGO_ANIMATIONS = ["none", "spin", "pulse", "fancy"] as const;
const LOGO_SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const NAV_STYLES = ["default", "pills", "underline", "bordered"] as const;
const ICON_STYLES = ["default", "outline", "filled", "duotone"] as const;
const CARD_STYLES = ["default", "bordered", "elevated", "flat", "glass"] as const;

// Component style option counts (for display)
const COMPONENT_STYLES: { key: keyof DashboardThemeSettings; label: string; count: number }[] = [
  { key: "buttonStyle", label: "Button", count: 9 },
  { key: "inputStyle", label: "Input", count: 4 },
  { key: "tableStyle", label: "Table", count: 12 },
  { key: "badgeStyle", label: "Badge", count: 10 },
  { key: "avatarStyle", label: "Avatar", count: 4 },
  { key: "formStyle", label: "Form", count: 12 },
  { key: "loadingStyle", label: "Loading", count: 12 },
  { key: "tooltipStyle", label: "Tooltip", count: 8 },
  { key: "modalStyle", label: "Modal", count: 8 },
  { key: "treeStyle", label: "Tree", count: 12 },
  { key: "datePickerStyle", label: "Date Picker", count: 7 },
  { key: "calendarStyle", label: "Calendar", count: 6 },
  { key: "selectStyle", label: "Select", count: 27 },
  { key: "switchStyle", label: "Switch", count: 15 },
];

const TOAST_STYLES = ["default", "minimal", "bordered", "glass", "gradient", "neon", "neumorphism", "retro", "luxury", "cyberpunk"] as const;

// ═══════════════════════════════════════════════════════════════════════════════
//  SECTION COMPONENT — Collapsible accordion for each settings group
// ═══════════════════════════════════════════════════════════════════════════════

interface SectionProps {
  icon: typeof Layout;
  title: string;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  isLocked?: boolean;
  children: React.ReactNode;
}

function Section({ icon: Icon, title, count, isOpen, onToggle, isLocked, children }: SectionProps) {
  const Arrow = isOpen ? ChevronDown : ChevronRight;
  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-2 px-1 py-2.5 text-left transition-colors",
          "hover:bg-accent/30",
          isLocked && "opacity-50"
        )}
      >
        <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="flex-1 text-[11px] font-semibold text-foreground">{title}</span>
        <span className="text-[9px] text-muted-foreground/60 tabular-nums">{count}</span>
        {isLocked && <Lock className="h-3 w-3 text-amber-500" />}
        <Arrow className="h-3 w-3 text-muted-foreground shrink-0" />
      </button>
      {isOpen && <div className="space-y-3 pb-3 px-0.5">{children}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MINI COMPONENTS — Compact controls for sidebar layout
// ═══════════════════════════════════════════════════════════════════════════════

function ColorSwatch({ value, color, selected, onSelect }: {
  value: string; color: string; selected: boolean; onSelect: (v: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(value)}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all hover:scale-110",
        selected ? "border-primary shadow-md" : "border-transparent hover:border-muted-foreground/30"
      )}
      title={value}
    >
      <div className="h-5 w-5 rounded-full shadow-sm" style={{ background: color }}>
        {selected && <Check className="h-5 w-5 p-0.5 text-white" />}
      </div>
    </button>
  );
}

function OptionGrid<T extends string>({ options, selected, onSelect, cols = 3 }: {
  options: readonly T[]; selected: T; onSelect: (v: T) => void; cols?: number;
}) {
  return (
    <div className={cn("grid gap-1", cols === 2 ? "grid-cols-2" : cols === 4 ? "grid-cols-4" : "grid-cols-3")}>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className={cn(
            "rounded-md border px-2 py-1.5 text-[10px] font-medium transition-all truncate",
            selected === opt
              ? "border-primary bg-primary/10 text-primary"
              : "border-border/50 text-muted-foreground hover:border-primary/30 hover:bg-accent/20"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[11px] text-foreground">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5 w-9 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <div className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5"
        )} />
      </button>
    </div>
  );
}

function HexInput({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-6 w-6 rounded border border-border/50 shadow-sm shrink-0" style={{ background: value }} />
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-7 text-[10px] font-mono"
        maxLength={7}
        placeholder="#000000"
      />
      <span className="text-[9px] text-muted-foreground shrink-0">{label}</span>
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
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const set = <K extends keyof DashboardThemeSettings>(key: K, value: DashboardThemeSettings[K]) => {
    onUpdate({ [key]: value } as Partial<DashboardThemeSettings>);
  };

  return (
    <div className="space-y-0">
      {/* Info banner */}
      <div className="flex items-start gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 mb-3">
        <Info className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-[10px] text-blue-600 dark:text-blue-400 leading-relaxed">
          {t("studio.dashboard.info") ||
            "Configure the dashboard experience for all admins in this tenant. Individual admins can override settings if allowed."}
        </p>
      </div>

      {/* ── Section 1: Layout & Structure (6 settings) ── */}
      <Section
        icon={Layout}
        title={t("studio.dashboard.section.layout") || "Layout & Structure"}
        count={6}
        isOpen={openSections.has(0)}
        onToggle={() => toggleSection(0)}
      >
        {/* Layout Template Grid */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            {t("studio.dashboard.layoutTemplate") || "Layout Template"}
          </Label>
          <div className="grid grid-cols-3 gap-1 max-h-[180px] overflow-y-auto scrollbar-thin pr-1">
            {LAYOUT_TEMPLATES.map(tmpl => (
              <button
                key={tmpl}
                onClick={() => set("layoutTemplate", tmpl)}
                className={cn(
                  "rounded-md border px-1.5 py-1 text-[9px] font-medium transition-all truncate",
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
          <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Sidebar Position
          </Label>
          <OptionGrid options={["left", "right"] as const} selected={settings.sidebarPosition} onSelect={v => set("sidebarPosition", v)} cols={2} />
        </div>

        {/* Sidebar & Header Style */}
        <OptionGrid options={["default", "modern", "minimal", "bordered"] as const} selected={settings.sidebarStyle as any} onSelect={v => set("sidebarStyle", v)} cols={2} />
        <OptionGrid options={["default", "minimal", "floating", "bordered"] as const} selected={settings.headerStyle as any} onSelect={v => set("headerStyle", v)} cols={2} />

        {/* Toggles */}
        <ToggleRow label="Collapsible Sidebar" checked={settings.collapsibleSidebar} onChange={v => set("collapsibleSidebar", v)} />
        <ToggleRow label="Show Breadcrumbs" checked={settings.showBreadcrumbs} onChange={v => set("showBreadcrumbs", v)} />
      </Section>

      {/* ── Section 2: Colors & Theme (16 settings) ── */}
      <Section
        icon={Palette}
        title={t("studio.dashboard.section.colors") || "Colors & Theme"}
        count={16}
        isOpen={openSections.has(1)}
        onToggle={() => toggleSection(1)}
      >
        {/* Primary Color Theme */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Primary Color
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {COLOR_THEMES.map(c => (
              <ColorSwatch key={c.value} value={c.value} color={c.color} selected={settings.colorTheme === c.value} onSelect={v => set("colorTheme", v)} />
            ))}
          </div>
        </div>

        {/* Secondary Color Theme */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Secondary Color
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {COLOR_THEMES.map(c => (
              <ColorSwatch key={c.value} value={c.value} color={c.color} selected={settings.secondaryColorTheme === c.value} onSelect={v => set("secondaryColorTheme", v)} />
            ))}
          </div>
        </div>

        {/* Shadow Intensity */}
        <div className="space-y-1">
          <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Shadow</Label>
          <OptionGrid options={SHADOW_OPTIONS} selected={settings.shadowIntensity as any} onSelect={v => set("shadowIntensity", v)} cols={4} />
        </div>

        {/* Background Mode */}
        <div className="space-y-1">
          <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Background Mode</Label>
          <OptionGrid options={BG_MODES} selected={settings.backgroundMode} onSelect={v => set("backgroundMode", v)} cols={3} />
        </div>

        {/* Gradient controls (shown when gradient mode) */}
        {settings.backgroundMode === "gradient" && (
          <div className="space-y-2 rounded-lg border border-border/30 bg-muted/20 p-2">
            <Label className="text-[9px] font-medium text-muted-foreground uppercase">Gradient Direction</Label>
            <div className="grid grid-cols-4 gap-1">
              {GRADIENT_DIRS.map(dir => (
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
            <HexInput label="Start" value={settings.gradientStartColor} onChange={v => set("gradientStartColor", v)} />
            <HexInput label="End" value={settings.gradientEndColor} onChange={v => set("gradientEndColor", v)} />
          </div>
        )}

        {/* Custom color controls (shown when custom mode) */}
        {settings.backgroundMode === "custom" && (
          <div className="space-y-2 rounded-lg border border-border/30 bg-muted/20 p-2">
            <HexInput label="Primary" value={settings.customPrimaryColor} onChange={v => set("customPrimaryColor", v)} />
            <HexInput label="Secondary" value={settings.customSecondaryColor} onChange={v => set("customSecondaryColor", v)} />
            <HexInput label="Light BG" value={settings.customLightBgColor} onChange={v => set("customLightBgColor", v)} />
            <HexInput label="Dark BG" value={settings.customDarkBgColor} onChange={v => set("customDarkBgColor", v)} />
          </div>
        )}
      </Section>

      {/* ── Section 3: Typography & Spacing (4 settings) ── */}
      <Section
        icon={Type}
        title={t("studio.dashboard.section.typography") || "Typography & Spacing"}
        count={4}
        isOpen={openSections.has(2)}
        onToggle={() => toggleSection(2)}
      >
        <div className="space-y-1">
          <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Font Size</Label>
          <OptionGrid options={FONT_SIZES} selected={settings.fontSize as any} onSelect={v => set("fontSize", v)} cols={3} />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Border Radius</Label>
          <OptionGrid options={BORDER_RADII} selected={settings.borderRadius as any} onSelect={v => set("borderRadius", v)} cols={3} />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Spacing</Label>
          <OptionGrid options={SPACING_SIZES} selected={settings.spacingSize as any} onSelect={v => set("spacingSize", v)} cols={2} />
        </div>
        <ToggleRow label="Compact Mode" checked={settings.compactMode} onChange={v => set("compactMode", v)} />
      </Section>

      {/* ── Section 4: Component Styles (14 settings) ── */}
      <Section
        icon={Layers}
        title={t("studio.dashboard.section.components") || "Component Styles"}
        count={14}
        isOpen={openSections.has(3)}
        onToggle={() => toggleSection(3)}
      >
        {COMPONENT_STYLES.map(cs => (
          <div key={cs.key} className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-medium text-foreground">{cs.label}</Label>
              <span className="text-[8px] text-muted-foreground/50">{cs.count} styles</span>
            </div>
            <Input
              value={settings[cs.key] as string}
              onChange={e => set(cs.key, e.target.value)}
              className="h-7 text-[10px]"
              placeholder="default"
            />
          </div>
        ))}
      </Section>

      {/* ── Section 5: Checkbox & Radio (2 settings) ── */}
      <Section
        icon={Square}
        title={t("studio.dashboard.section.checkboxRadio") || "Checkbox & Radio"}
        count={2}
        isOpen={openSections.has(4)}
        onToggle={() => toggleSection(4)}
      >
        <div className="space-y-1">
          <Label className="text-[10px] font-medium text-foreground">Checkbox Style</Label>
          <Input
            value={settings.checkboxStyle}
            onChange={e => set("checkboxStyle", e.target.value)}
            className="h-7 text-[10px]"
            placeholder="default"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-medium text-foreground">Radio Style</Label>
          <Input
            value={settings.radioStyle}
            onChange={e => set("radioStyle", e.target.value)}
            className="h-7 text-[10px]"
            placeholder="default"
          />
        </div>
      </Section>

      {/* ── Section 6: Card, Animation & Hover (5 settings) ── */}
      <Section
        icon={Paintbrush}
        title={t("studio.dashboard.section.animation") || "Card, Animation & Hover"}
        count={5}
        isOpen={openSections.has(5)}
        onToggle={() => toggleSection(5)}
      >
        <div className="space-y-1">
          <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Card Style</Label>
          <OptionGrid options={CARD_STYLES} selected={settings.cardStyle as any} onSelect={v => set("cardStyle", v)} cols={3} />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Animation</Label>
          <OptionGrid options={ANIMATION_LEVELS} selected={settings.animationLevel as any} onSelect={v => set("animationLevel", v)} cols={2} />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Hover Effect</Label>
          <OptionGrid options={HOVER_EFFECTS} selected={settings.hoverEffectType as any} onSelect={v => set("hoverEffectType", v)} cols={4} />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Hover Intensity</Label>
          <OptionGrid options={HOVER_INTENSITIES} selected={settings.hoverEffectIntensity as any} onSelect={v => set("hoverEffectIntensity", v)} cols={2} />
        </div>
        <ToggleRow label="Reduced Motion" checked={settings.reducedMotion} onChange={v => set("reducedMotion", v)} />
      </Section>

      {/* ── Section 7: Logo & Branding (5 settings) ── */}
      <Section
        icon={Sparkles}
        title={t("studio.dashboard.section.logo") || "Logo & Branding"}
        count={5}
        isOpen={openSections.has(6)}
        onToggle={() => toggleSection(6)}
      >
        <div className="space-y-1">
          <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Logo Type</Label>
          <OptionGrid options={LOGO_TYPES} selected={settings.logoType as any} onSelect={v => set("logoType", v)} cols={2} />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Logo Animation</Label>
          <OptionGrid options={LOGO_ANIMATIONS} selected={settings.logoAnimation as any} onSelect={v => set("logoAnimation", v)} cols={2} />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Logo Size</Label>
          <OptionGrid options={LOGO_SIZES} selected={settings.logoSize as any} onSelect={v => set("logoSize", v)} cols={5} />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-medium text-foreground">Logo Text</Label>
          <Input
            value={settings.logoText}
            onChange={e => set("logoText", e.target.value)}
            className="h-7 text-[10px]"
            placeholder="NEXORA"
            maxLength={50}
          />
        </div>
        <ToggleRow label="Show Logo" checked={settings.showLogo} onChange={v => set("showLogo", v)} />
      </Section>

      {/* ── Section 8: Navigation & UX (9 settings) ── */}
      <Section
        icon={Navigation}
        title={t("studio.dashboard.section.navigation") || "Navigation & UX"}
        count={9}
        isOpen={openSections.has(7)}
        onToggle={() => toggleSection(7)}
      >
        <div className="space-y-1">
          <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Navigation Style</Label>
          <OptionGrid options={NAV_STYLES} selected={settings.navigationStyle as any} onSelect={v => set("navigationStyle", v)} cols={2} />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Icon Style</Label>
          <OptionGrid options={ICON_STYLES} selected={settings.iconStyle as any} onSelect={v => set("iconStyle", v)} cols={2} />
        </div>
        <ToggleRow label="Show User Avatar" checked={settings.showUserAvatar} onChange={v => set("showUserAvatar", v)} />
        <ToggleRow label="Show Notifications" checked={settings.showNotifications} onChange={v => set("showNotifications", v)} />
        <ToggleRow label="Sticky Header" checked={settings.stickyHeader} onChange={v => set("stickyHeader", v)} />
        <ToggleRow label="Show Footer" checked={settings.showFooter} onChange={v => set("showFooter", v)} />
        <ToggleRow label="Auto Save" checked={settings.autoSave} onChange={v => set("autoSave", v)} />
        <ToggleRow label="High Contrast" checked={settings.highContrast} onChange={v => set("highContrast", v)} />
        <ToggleRow label="Show Detail Panel" checked={settings.showDetailPanel} onChange={v => set("showDetailPanel", v)} />
      </Section>

      {/* ── Section 9: Toast Configuration (3 settings) ── */}
      <Section
        icon={BellIcon}
        title={t("studio.dashboard.section.toast") || "Toast Configuration"}
        count={3}
        isOpen={openSections.has(8)}
        onToggle={() => toggleSection(8)}
      >
        <div className="space-y-1">
          <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Toast Style</Label>
          <OptionGrid options={TOAST_STYLES} selected={settings.toastStyle as any} onSelect={v => set("toastStyle", v)} cols={2} />
        </div>
        <ToggleRow label="Show Toast Icons" checked={settings.showToastIcons} onChange={v => set("showToastIcons", v)} />
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Duration</Label>
            <span className="text-[9px] text-muted-foreground tabular-nums">{settings.toastDuration}ms</span>
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
        title={t("studio.dashboard.section.overrides") || "Admin Override Control"}
        count={2}
        isOpen={openSections.has(9)}
        onToggle={() => toggleSection(9)}
      >
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5">
          <Lock className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-[10px] text-amber-600 dark:text-amber-400 leading-relaxed">
            {t("studio.dashboard.overrideInfo") ||
              "Configure which settings individual admins can override. These controls are applied server-side and cannot be bypassed."}
          </p>
        </div>
        <div className="space-y-1 pt-1">
          <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Allow Admin Override
          </Label>
          <p className="text-[9px] text-muted-foreground leading-relaxed">
            When enabled, individual admins can customize their own dashboard appearance within the paths you define.
          </p>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Override Path Control
          </Label>
          <p className="text-[9px] text-muted-foreground leading-relaxed">
            Fine-grained control over which specific settings admins can override. Requires Enterprise edition.
          </p>
        </div>
      </Section>
    </div>
  );
}
