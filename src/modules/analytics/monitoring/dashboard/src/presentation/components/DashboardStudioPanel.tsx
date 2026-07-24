// FILE-EXCEPTION: file length
// UI-EXCEPTION: compact studio layout
/**
 * DashboardStudioPanel — Slide-over settings panel for dashboard theming (M9 + M11)
 *
 * Controls:
 *   - Tab 1 "Visual"  — Greeting, KPI Cards, Charts, Sections, Layout
 *   - Tab 2 "Builder" — Drag-and-drop dashboard layout builder
 *
 * All changes are reflected instantly via draft state in useDashboardTheme.
 *
 * The panel rides the DetailSheet container (see LeadDetailDrawer for the
 * reference composition): the container owns the overlay surface, width
 * presets and the logical side="end" default; this file only fills the
 * header / tab-bar / body / footer slots. The Builder tab asks for the wide
 * ("xl") preset, the Visual tab for the narrow ("sm") one.
 */
"use client";
import { useI18n } from "@core/providers/i18n-provider";

import React, { useState } from "react";
import {
  DetailSheet,
  DetailSheetHeader,
  DetailSheetTabBar,
  DetailSheetBody,
  DetailSheetFooter,
} from "@core/ui/detail-sheet";
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Switch } from "@core/ui/switch";
import { Separator } from "@core/ui/separator";
import { Badge } from "@core/ui/badge";
import { Tabs, TabsContent, TabsTrigger } from "@core/ui/tabs";
import {
  Save,
  RotateCcw,
  Palette,
  Layout,
  BarChart3,
  Eye,
  MessageSquare,
  Blocks,
} from "lucide-react";
import {
  DASHBOARD_PALETTES,
  type DashboardThemeConfig,
  type CardRadius,
  type ShadowLevel,
  type LayoutDensity,
} from "../../domain/entities/DashboardThemeConfig";
import type { DashboardBuilderCanvas } from "../../domain/entities/DashboardWidget";
import { DashboardBuilderPanel } from "./dashboard-builder/DashboardBuilderPanel";

interface Props {
  open: boolean;
  onClose: () => void;
  draft: DashboardThemeConfig;
  onUpdateNested: (section: keyof DashboardThemeConfig, field: string, value: unknown) => void;
  onSave: () => void;
  onDiscard: () => void;
  onReset: () => void;
  isSaving: boolean;
  onBuilderCanvasChange?: (canvas: DashboardBuilderCanvas) => void;
}

// The selectable-tile skin shared by the option pickers and the palette rows:
// a hairline that brightens on hover, the accent wash when chosen. Nothing
// lifts, nothing glows.
const TILE_BASE =
  "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-nx-focus";
const TILE_SELECTED = "border-nx-accent bg-nx-accent-wash text-nx-accent";
const TILE_REST = "border-nx-line text-nx-ink hover:border-nx-line-hi hover:bg-nx-hover";

// ── Reusable option buttons ──
function OptionPicker<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { label: string; value: T }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-nx-md border px-3 py-1.5 text-xs font-medium",
            TILE_BASE,
            value === opt.value ? TILE_SELECTED : TILE_REST
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Section wrapper ──
function StudioSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-nx-ink">
        <Icon className="h-4 w-4 text-nx-accent" aria-hidden="true" />
        {title}
      </div>
      <div className="space-y-3 ps-6">{children}</div>
    </div>
  );
}

/**
 * Presentation UI component rendering the dashboard studio panel.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function DashboardStudioPanel({
  open,
  onClose,
  draft,
  onUpdateNested,
  onSave,
  onDiscard,
  onReset,
  isSaving,
  onBuilderCanvasChange,
}: Props) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<string>("visual");

  // The radius and shadow ladders share one set of step labels.
  const sizeLabels = {
    sm: t("dashboard.studio.sizeSm"),
    md: t("dashboard.studio.sizeMd"),
    lg: t("dashboard.studio.sizeLg"),
    xl: t("dashboard.studio.sizeXl"),
    "2xl": t("dashboard.studio.size2xl"),
  };

  return (
    <DetailSheet
      open={open}
      onOpenChange={(v) => !v && onClose()}
      width={activeTab === "builder" ? "xl" : "sm"}
      title={t("dashboard.studio.title")}
      description={t("dashboard.studio.description")}
    >
      {/* ── Pinned header ── */}
      <DetailSheetHeader>
        <h2 className="flex items-center gap-2 text-lg font-semibold leading-tight text-nx-ink">
          <Palette className="h-5 w-5 text-nx-accent" aria-hidden="true" />
          {t("dashboard.studio.title")}
        </h2>
        <p className="mt-1 text-sm text-nx-ink-2">{t("dashboard.studio.description")}</p>
      </DetailSheetHeader>

      {/* ── Tabs ── */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <DetailSheetTabBar>
          <TabsTrigger value="visual" className="gap-1.5 text-xs">
            <Palette className="h-3.5 w-3.5" aria-hidden="true" />
            {t("dashboard.studio.tabVisual")}
          </TabsTrigger>
          <TabsTrigger value="builder" className="gap-1.5 text-xs">
            <Blocks className="h-3.5 w-3.5" aria-hidden="true" />
            {t("dashboard.studio.tabBuilder")}
          </TabsTrigger>
        </DetailSheetTabBar>

        <DetailSheetBody>
          <TabsContent value="visual" className="mt-0">
            <div className="space-y-6 px-6 pb-6 pt-3">
              {/* ── Greeting ── */}
              <StudioSection icon={MessageSquare} title={t("dashboard.studio.greeting")}>
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="greeting-enabled" className="text-xs">
                    {t("dashboard.studio.greetingEnabled")}
                  </Label>
                  <Switch
                    id="greeting-enabled"
                    checked={draft.greeting.enabled}
                    onCheckedChange={(v) => onUpdateNested("greeting", "enabled", v)}
                  />
                </div>
                {draft.greeting.enabled && (
                  <>
                    <div className="space-y-1">
                      <Label htmlFor="greeting-text" className="text-xs text-nx-ink-3">
                        {t("dashboard.studio.greetingText")}
                      </Label>
                      <Input
                        id="greeting-text"
                        placeholder={t("dashboard.studio.greetingPlaceholder")}
                        value={draft.greeting.text || ""}
                        onChange={(e) =>
                          onUpdateNested("greeting", "text", e.target.value || undefined)
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="greeting-subtitle" className="text-xs text-nx-ink-3">
                        {t("dashboard.studio.greetingSubtitle")}
                      </Label>
                      <Input
                        id="greeting-subtitle"
                        placeholder={t("dashboard.studio.subtitlePlaceholder")}
                        value={draft.greeting.subtitle || ""}
                        onChange={(e) =>
                          onUpdateNested("greeting", "subtitle", e.target.value || undefined)
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                  </>
                )}
              </StudioSection>

              <Separator />

              {/* ── KPI Cards ── */}
              <StudioSection icon={Layout} title={t("dashboard.studio.kpiCards")}>
                <div className="space-y-1">
                  <Label className="text-xs text-nx-ink-3">
                    {t("dashboard.studio.borderRadius")}
                  </Label>
                  <OptionPicker<CardRadius>
                    value={draft.kpiCards.borderRadius}
                    options={[
                      { label: t("dashboard.studio.radiusNone"), value: "none" },
                      { label: sizeLabels.sm, value: "sm" },
                      { label: sizeLabels.md, value: "md" },
                      { label: sizeLabels.lg, value: "lg" },
                      { label: sizeLabels.xl, value: "xl" },
                      { label: sizeLabels["2xl"], value: "2xl" },
                    ]}
                    onChange={(v) => onUpdateNested("kpiCards", "borderRadius", v)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-nx-ink-3">{t("dashboard.studio.shadow")}</Label>
                  <OptionPicker<ShadowLevel>
                    value={draft.kpiCards.shadowLevel}
                    options={[
                      { label: t("dashboard.studio.shadowNone"), value: "none" },
                      { label: sizeLabels.sm, value: "sm" },
                      { label: sizeLabels.md, value: "md" },
                      { label: sizeLabels.lg, value: "lg" },
                    ]}
                    onChange={(v) => onUpdateNested("kpiCards", "shadowLevel", v)}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="kpi-border" className="text-xs">
                    {t("dashboard.studio.showBorder")}
                  </Label>
                  <Switch
                    id="kpi-border"
                    checked={draft.kpiCards.showBorder}
                    onCheckedChange={(v) => onUpdateNested("kpiCards", "showBorder", v)}
                  />
                </div>
              </StudioSection>

              <Separator />

              {/* ── Charts ── */}
              <StudioSection icon={BarChart3} title={t("dashboard.studio.charts")}>
                <div className="space-y-2">
                  <Label className="text-xs text-nx-ink-3">
                    {t("dashboard.studio.colorPalette")}
                  </Label>
                  <div className="space-y-2">
                    {DASHBOARD_PALETTES.map((palette) => {
                      const isSelected =
                        JSON.stringify(draft.charts.colorPalette) ===
                        JSON.stringify(palette.colors);

                      return (
                        <button
                          key={palette.id}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => onUpdateNested("charts", "colorPalette", palette.colors)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-nx-md border p-2.5",
                            TILE_BASE,
                            isSelected ? TILE_SELECTED : TILE_REST
                          )}
                        >
                          <span className="flex shrink-0 gap-1" aria-hidden="true">
                            {palette.colors.slice(0, 6).map((c, i) => (
                              // The swatch IS the value being chosen, so it has
                              // to paint the stored colour verbatim.
                              <span
                                key={i}
                                className="block h-5 w-5 rounded-full ring-1 ring-nx-line"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </span>
                          <span className="truncate text-xs font-medium">{t(palette.nameKey)}</span>
                          {isSelected && (
                            <Badge variant="secondary" className="ms-auto shrink-0 text-[10px]">
                              {t("common.active")}
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-nx-ink-3">
                    {t("dashboard.studio.chartStyle")}
                  </Label>
                  <OptionPicker
                    value={draft.charts.style}
                    options={[
                      {
                        label: t("dashboard.studio.styleGradient"),
                        value: "gradient",
                      },
                      { label: t("dashboard.studio.styleSolid"), value: "solid" },
                      {
                        label: t("dashboard.studio.styleOutline"),
                        value: "outline",
                      },
                    ]}
                    onChange={(v) => onUpdateNested("charts", "style", v)}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="chart-grid" className="text-xs">
                    {t("dashboard.studio.showGrid")}
                  </Label>
                  <Switch
                    id="chart-grid"
                    checked={draft.charts.showGrid}
                    onCheckedChange={(v) => onUpdateNested("charts", "showGrid", v)}
                  />
                </div>
              </StudioSection>

              <Separator />

              {/* ── Sections Visibility ── */}
              <StudioSection icon={Eye} title={t("dashboard.studio.sections")}>
                {(
                  [
                    ["loginActivity", t("dashboard.studio.sectionLoginActivity")],
                    ["eventDistribution", t("dashboard.studio.sectionEventDist")],
                    ["recentChanges", t("dashboard.studio.sectionRecentChanges")],
                    ["securityEvents", t("dashboard.studio.sectionSecurityEvents")],
                    ["blockedIPs", t("dashboard.studio.sectionBlockedIPs")],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between gap-2">
                    <Label htmlFor={`section-${key}`} className="text-xs">
                      {label}
                    </Label>
                    <Switch
                      id={`section-${key}`}
                      checked={draft.sections[key]}
                      onCheckedChange={(v) => onUpdateNested("sections", key, v)}
                    />
                  </div>
                ))}
              </StudioSection>

              <Separator />

              {/* ── Layout ── */}
              <StudioSection icon={Layout} title={t("dashboard.studio.layout")}>
                <div className="space-y-1">
                  <Label className="text-xs text-nx-ink-3">{t("dashboard.studio.density")}</Label>
                  <OptionPicker<LayoutDensity>
                    value={draft.layout.density}
                    options={[
                      {
                        label: t("dashboard.studio.densityCompact"),
                        value: "compact",
                      },
                      {
                        label: t("dashboard.studio.densityDefault"),
                        value: "default",
                      },
                      {
                        label: t("dashboard.studio.densityComfortable"),
                        value: "comfortable",
                      },
                    ]}
                    onChange={(v) => onUpdateNested("layout", "density", v)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-nx-ink-3">
                    {t("dashboard.studio.columnsPerRow")}
                  </Label>
                  <OptionPicker
                    value={String(draft.layout.columnsPerRow)}
                    options={[
                      { label: "3", value: "3" },
                      { label: "4", value: "4" },
                      { label: "5", value: "5" },
                    ]}
                    onChange={(v) => onUpdateNested("layout", "columnsPerRow", Number(v))}
                  />
                </div>
              </StudioSection>
            </div>
          </TabsContent>

          <TabsContent value="builder" className="mt-0 h-full">
            <DashboardBuilderPanel
              initialCanvas={draft.builderCanvas}
              onCanvasChange={onBuilderCanvasChange}
            />
          </TabsContent>
        </DetailSheetBody>
      </Tabs>

      {/* ── Pinned action bar ── */}
      <DetailSheetFooter className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onReset} className="me-auto gap-1.5">
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          {t("dashboard.studio.resetDefaults")}
        </Button>
        <Button variant="outline" size="sm" onClick={onDiscard}>
          {t("common.cancel")}
        </Button>
        <Button size="sm" onClick={onSave} loading={isSaving} className="gap-1.5">
          {!isSaving && <Save className="h-3.5 w-3.5" aria-hidden="true" />}
          {t("dashboard.studio.save")}
        </Button>
      </DetailSheetFooter>
    </DetailSheet>
  );
}
