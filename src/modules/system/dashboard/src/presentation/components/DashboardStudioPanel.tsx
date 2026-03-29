/**
 * DashboardStudioPanel — Slide-over settings panel for dashboard theming (M9)
 *
 * Controls:
 *   - Greeting: enable, text, subtitle
 *   - KPI Cards: border radius, border, shadow, accent colors
 *   - Charts: palette picker, style, grid
 *   - Sections: visibility toggles
 *   - Layout: density, columns per row
 *
 * All changes are reflected instantly via draft state in useDashboardTheme.
 */
"use client";

import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@core/ui/sheet";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Switch } from "@core/ui/switch";
import { Separator } from "@core/ui/separator";
import { ScrollArea } from "@core/ui/scroll-area";
import { Badge } from "@core/ui/badge";
import { Save, RotateCcw, Loader2, Palette, Layout, BarChart3, Eye, MessageSquare } from "lucide-react";
import {
  DASHBOARD_PALETTES,
  type DashboardThemeConfig,
  type CardRadius,
  type ShadowLevel,
  type LayoutDensity,
} from "../../domain/entities/DashboardThemeConfig";

interface Props {
  open: boolean;
  onClose: () => void;
  draft: DashboardThemeConfig;
  onUpdateNested: (section: keyof DashboardThemeConfig, field: string, value: unknown) => void;
  onSave: () => void;
  onDiscard: () => void;
  onReset: () => void;
  isSaving: boolean;
  t: (key: string) => string;
}

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
          onClick={() => onChange(opt.value)}
          className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
            value === opt.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border hover:bg-muted"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Section wrapper ──
function StudioSection({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </div>
      <div className="space-y-3 pl-6">{children}</div>
    </div>
  );
}

export function DashboardStudioPanel({
  open,
  onClose,
  draft,
  onUpdateNested,
  onSave,
  onDiscard,
  onReset,
  isSaving,
  t,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-[400px] sm:w-[420px] p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            {t("dashboard.studio.title") || "Dashboard Studio"}
          </SheetTitle>
          <SheetDescription>
            {t("dashboard.studio.description") || "Customize the appearance and layout of your dashboard."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 pb-6">

            {/* ── Greeting ── */}
            <StudioSection icon={MessageSquare} title={t("dashboard.studio.greeting") || "Greeting"}>
              <div className="flex items-center justify-between">
                <Label htmlFor="greeting-enabled" className="text-xs">
                  {t("dashboard.studio.greetingEnabled") || "Show greeting"}
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
                    <Label htmlFor="greeting-text" className="text-xs text-muted-foreground">
                      {t("dashboard.studio.greetingText") || "Heading text"}
                    </Label>
                    <Input
                      id="greeting-text"
                      placeholder={t("dashboard.studio.greetingPlaceholder") || "Welcome back, {name}"}
                      value={draft.greeting.text || ""}
                      onChange={(e) => onUpdateNested("greeting", "text", e.target.value || undefined)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="greeting-subtitle" className="text-xs text-muted-foreground">
                      {t("dashboard.studio.greetingSubtitle") || "Subtitle"}
                    </Label>
                    <Input
                      id="greeting-subtitle"
                      placeholder={t("dashboard.studio.subtitlePlaceholder") || "Here's what's happening today"}
                      value={draft.greeting.subtitle || ""}
                      onChange={(e) => onUpdateNested("greeting", "subtitle", e.target.value || undefined)}
                      className="h-8 text-sm"
                    />
                  </div>
                </>
              )}
            </StudioSection>

            <Separator />

            {/* ── KPI Cards ── */}
            <StudioSection icon={Layout} title={t("dashboard.studio.kpiCards") || "KPI Cards"}>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  {t("dashboard.studio.borderRadius") || "Border radius"}
                </Label>
                <OptionPicker<CardRadius>
                  value={draft.kpiCards.borderRadius}
                  options={[
                    { label: t("dashboard.studio.radiusNone") || "None", value: "none" },
                    { label: "SM", value: "sm" },
                    { label: "MD", value: "md" },
                    { label: "LG", value: "lg" },
                    { label: "XL", value: "xl" },
                    { label: "2XL", value: "2xl" },
                  ]}
                  onChange={(v) => onUpdateNested("kpiCards", "borderRadius", v)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  {t("dashboard.studio.shadow") || "Shadow"}
                </Label>
                <OptionPicker<ShadowLevel>
                  value={draft.kpiCards.shadowLevel}
                  options={[
                    { label: t("dashboard.studio.shadowNone") || "None", value: "none" },
                    { label: "SM", value: "sm" },
                    { label: "MD", value: "md" },
                    { label: "LG", value: "lg" },
                  ]}
                  onChange={(v) => onUpdateNested("kpiCards", "shadowLevel", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="kpi-border" className="text-xs">
                  {t("dashboard.studio.showBorder") || "Show border"}
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
            <StudioSection icon={BarChart3} title={t("dashboard.studio.charts") || "Charts"}>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  {t("dashboard.studio.colorPalette") || "Color palette"}
                </Label>
                <div className="space-y-2">
                  {DASHBOARD_PALETTES.map((palette) => (
                    <button
                      key={palette.id}
                      type="button"
                      onClick={() => onUpdateNested("charts", "colorPalette", palette.colors)}
                      className={`flex w-full items-center gap-3 rounded-lg border p-2.5 transition-colors ${
                        JSON.stringify(draft.charts.colorPalette) === JSON.stringify(palette.colors)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex gap-1">
                        {palette.colors.slice(0, 6).map((c, i) => (
                          <div
                            key={i}
                            className="h-5 w-5 rounded-full border border-border/50"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-medium">
                        {t(palette.nameKey) || palette.id}
                      </span>
                      {JSON.stringify(draft.charts.colorPalette) === JSON.stringify(palette.colors) && (
                        <Badge variant="secondary" className="ml-auto text-[10px]">
                          {t("common.active") || "Active"}
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  {t("dashboard.studio.chartStyle") || "Chart style"}
                </Label>
                <OptionPicker
                  value={draft.charts.style}
                  options={[
                    { label: t("dashboard.studio.styleGradient") || "Gradient", value: "gradient" },
                    { label: t("dashboard.studio.styleSolid") || "Solid", value: "solid" },
                    { label: t("dashboard.studio.styleOutline") || "Outline", value: "outline" },
                  ]}
                  onChange={(v) => onUpdateNested("charts", "style", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="chart-grid" className="text-xs">
                  {t("dashboard.studio.showGrid") || "Show grid lines"}
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
            <StudioSection icon={Eye} title={t("dashboard.studio.sections") || "Visible Sections"}>
              {(
                [
                  ["loginActivity", t("dashboard.studio.sectionLoginActivity") || "Login Activity Chart"],
                  ["eventDistribution", t("dashboard.studio.sectionEventDist") || "Event Distribution"],
                  ["recentChanges", t("dashboard.studio.sectionRecentChanges") || "Recent Changes"],
                  ["securityEvents", t("dashboard.studio.sectionSecurityEvents") || "Security Events"],
                  ["blockedIPs", t("dashboard.studio.sectionBlockedIPs") || "Blocked IPs"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
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
            <StudioSection icon={Layout} title={t("dashboard.studio.layout") || "Layout"}>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  {t("dashboard.studio.density") || "Density"}
                </Label>
                <OptionPicker<LayoutDensity>
                  value={draft.layout.density}
                  options={[
                    { label: t("dashboard.studio.densityCompact") || "Compact", value: "compact" },
                    { label: t("dashboard.studio.densityDefault") || "Default", value: "default" },
                    { label: t("dashboard.studio.densityComfortable") || "Comfortable", value: "comfortable" },
                  ]}
                  onChange={(v) => onUpdateNested("layout", "density", v)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  {t("dashboard.studio.columnsPerRow") || "KPI columns per row"}
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
        </ScrollArea>

        <SheetFooter className="border-t px-6 py-4 gap-2">
          <Button variant="ghost" size="sm" onClick={onReset} className="mr-auto gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            {t("dashboard.studio.resetDefaults") || "Reset"}
          </Button>
          <Button variant="outline" size="sm" onClick={onDiscard}>
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button size="sm" onClick={onSave} disabled={isSaving} className="gap-1.5">
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {t("dashboard.studio.save") || "Save Theme"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
