/**
 * DashboardPanel -- Studio sidebar panel for dashboard theme configuration
 *
 * NEW: Allows tenant admins to configure the dashboard appearance from
 * within the Customizer Studio. Controls layout template, color theme,
 * default theme mode, language, and sidebar state.
 *
 * These settings are saved as `dashboardThemeJson` and applied via
 * TenantBrandingProvider to all admins in the tenant.
 *
 * @module customization/presentation/components
 */
"use client";
// UI-EXCEPTION: compact studio layout -- native elements for tight sidebar

import { cn } from "@/core/common/utils";
import { Label } from "@core/ui/label";
import {
  Layout, Palette, Sun, Moon, Monitor, Globe,
  PanelLeftClose, PanelLeft, Info,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";

// ── Dashboard Settings Shape ──────────────────────────────
export interface DashboardThemeSettings {
  /** Dark/light/system theme */
  theme: "light" | "dark" | "system";
  /** Default language */
  language: "en" | "ar";
  /** Sidebar collapsed by default */
  sidebarCollapsed: boolean;
  /** Color theme preset name */
  colorTheme: string;
  /** Dashboard layout template name */
  layoutTemplate: string;
}

export const DEFAULT_DASHBOARD_SETTINGS: DashboardThemeSettings = {
  theme: "system",
  language: "en",
  sidebarCollapsed: false,
  colorTheme: "default",
  layoutTemplate: "default",
};

// ── Color Theme Options ───────────────────────────────────
const COLOR_THEMES = [
  { id: "default", label: "Default", color: "#6366f1" },
  { id: "zinc", label: "Zinc", color: "#71717a" },
  { id: "slate", label: "Slate", color: "#64748b" },
  { id: "stone", label: "Stone", color: "#78716c" },
  { id: "neutral", label: "Neutral", color: "#737373" },
  { id: "red", label: "Red", color: "#ef4444" },
  { id: "rose", label: "Rose", color: "#f43f5e" },
  { id: "orange", label: "Orange", color: "#f97316" },
  { id: "green", label: "Green", color: "#22c55e" },
  { id: "blue", label: "Blue", color: "#3b82f6" },
  { id: "violet", label: "Violet", color: "#8b5cf6" },
  { id: "yellow", label: "Yellow", color: "#eab308" },
] as const;

// ── Layout Template Options ───────────────────────────────
const LAYOUT_TEMPLATES = [
  { id: "default", label: "Default", desc: "Standard sidebar navigation" },
  { id: "navigation", label: "Navigation", desc: "Top navigation bar" },
  { id: "classic", label: "Classic", desc: "Classic admin layout" },
  { id: "compact", label: "Compact", desc: "Dense, data-focused" },
  { id: "elegant", label: "Elegant", desc: "Premium sidebar design" },
  { id: "floating", label: "Floating", desc: "Floating sidebar panels" },
  { id: "modern", label: "Modern", desc: "Clean minimal design" },
  { id: "minimal", label: "Minimal", desc: "Ultra-simplified layout" },
] as const;

interface DashboardPanelProps {
  settings: DashboardThemeSettings;
  onUpdate: (updates: Partial<DashboardThemeSettings>) => void;
}

export function DashboardPanel({ settings, onUpdate }: DashboardPanelProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="flex items-start gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
        <Info className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-[10px] text-blue-600 dark:text-blue-400 leading-relaxed">
          {t("studio.dashboard.info") ||
            "These settings become the default dashboard experience for all admins in this tenant. Individual admins can override."}
        </p>
      </div>

      {/* ── Layout Template ── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Layout className="h-3.5 w-3.5 text-muted-foreground" />
          <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            {t("studio.dashboard.layoutTemplate") || "Layout Template"}
          </Label>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {LAYOUT_TEMPLATES.map(tmpl => (
            <button
              key={tmpl.id}
              onClick={() => onUpdate({ layoutTemplate: tmpl.id })}
              className={cn(
                "flex flex-col items-start rounded-lg border px-3 py-2 text-left transition-all",
                settings.layoutTemplate === tmpl.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border/50 hover:border-primary/30 hover:bg-accent/20",
              )}
            >
              <span className="text-[11px] font-medium text-foreground">{tmpl.label}</span>
              <span className="text-[9px] text-muted-foreground/70 mt-0.5">{tmpl.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Color Theme ── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Palette className="h-3.5 w-3.5 text-muted-foreground" />
          <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            {t("studio.dashboard.colorTheme") || "Color Theme"}
          </Label>
        </div>
        <div className="flex flex-wrap gap-2">
          {COLOR_THEMES.map(theme => (
            <button
              key={theme.id}
              onClick={() => onUpdate({ colorTheme: theme.id })}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-all",
                settings.colorTheme === theme.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border/50 hover:border-primary/30",
              )}
              title={theme.label}
            >
              <div
                className="h-4 w-4 rounded-full border border-border/30 shadow-sm shrink-0"
                style={{ background: theme.color }}
              />
              <span className="text-[10px] font-medium text-foreground">{theme.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Default Theme Mode ── */}
      <div className="space-y-2">
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          {t("studio.dashboard.themeMode") || "Default Theme Mode"}
        </Label>
        <div className="grid grid-cols-3 gap-1.5">
          {([
            { value: "light" as const, icon: Sun, label: "Light" },
            { value: "dark" as const, icon: Moon, label: "Dark" },
            { value: "system" as const, icon: Monitor, label: "System" },
          ]).map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => onUpdate({ theme: opt.value })}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border px-3 py-2.5 transition-all",
                  settings.theme === opt.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border/50 hover:border-primary/30 hover:bg-accent/20",
                )}
              >
                <Icon className={cn(
                  "h-4 w-4",
                  settings.theme === opt.value ? "text-primary" : "text-muted-foreground",
                )} />
                <span className="text-[10px] font-medium text-foreground">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Default Language ── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
          <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            {t("studio.dashboard.language") || "Default Language"}
          </Label>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {([
            { value: "en" as const, label: "English", flag: "🇬🇧" },
            { value: "ar" as const, label: "العربية", flag: "🇸🇦" },
          ]).map(lang => (
            <button
              key={lang.value}
              onClick={() => onUpdate({ language: lang.value })}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-all",
                settings.language === lang.value
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border/50 hover:border-primary/30 hover:bg-accent/20",
              )}
            >
              <span className="text-base">{lang.flag}</span>
              <span className="text-xs font-medium text-foreground">{lang.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Sidebar Default State ── */}
      <div className="space-y-2">
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          {t("studio.dashboard.sidebar") || "Sidebar Default State"}
        </Label>
        <div className="grid grid-cols-2 gap-1.5">
          {([
            { value: false, icon: PanelLeft, label: "Expanded" },
            { value: true, icon: PanelLeftClose, label: "Collapsed" },
          ]).map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={String(opt.value)}
                onClick={() => onUpdate({ sidebarCollapsed: opt.value })}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-all",
                  settings.sidebarCollapsed === opt.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border/50 hover:border-primary/30 hover:bg-accent/20",
                )}
              >
                <Icon className={cn(
                  "h-4 w-4",
                  settings.sidebarCollapsed === opt.value ? "text-primary" : "text-muted-foreground",
                )} />
                <span className="text-xs font-medium text-foreground">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
