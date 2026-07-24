// UI-EXCEPTION: compact studio layout
/**
 * DashboardPreviewShell — Isolated dashboard shell preview for Customizer Studio.
 *
 * KEY ARCHITECTURE: Mirrors LoginPreviewShell pattern exactly.
 * - Has ZERO auth logic (no tokens, no API calls)
 * - Previews the single nexus shell chrome (the product's one shell)
 * - Wrapped in its own SettingsProvider so settings changes apply instantly
 * - Design settings are injected via postMessage from the studio iframe parent
 * - Shows mock dashboard content (stat cards, charts, tables)
 *
 * Security:
 * - Cannot access any data (no repositories, no API calls)
 * - postMessage is origin-validated (same-origin)
 * - No access to auth tokens
 */
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  SettingsContext,
  defaultSettings,
  createCompatSetters,
  type Settings,
  type SettingsContextType,
} from "@core/providers/settings-provider";

import {
  Users,
  DollarSign,
  Activity,
  Eye,
  TrendingUp,
  ArrowUpRight,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@core/common/utils";

// ── Valid settings keys whitelist (security hardening) ──
const VALID_SETTINGS_KEYS = new Set([
  "layoutTemplate",
  "colorTheme",
  "secondaryColorTheme",
  "lightBackgroundTheme",
  "darkBackgroundTheme",
  "shadowIntensity",
  "backgroundMode",
  "gradientDirection",
  "lightGradientTheme",
  "darkGradientTheme",
  "customPrimaryColor",
  "customSecondaryColor",
  "customLightBgColor",
  "customDarkBgColor",
  "gradientStartColor",
  "gradientEndColor",
  "activePalette",
  "cardStyle",
  "animationLevel",
  "fontSize",
  "borderRadius",
  "sidebarPosition",
  "headerStyle",
  "sidebarStyle",
  "buttonStyle",
  "navigationStyle",
  "spacingSize",
  "iconStyle",
  "inputStyle",
  "tableStyle",
  "badgeStyle",
  "avatarStyle",
  "formStyle",
  "loadingStyle",
  "tooltipStyle",
  "modalStyle",
  "treeStyle",
  "datePickerStyle",
  "calendarStyle",
  "selectStyle",
  "switchStyle",
  "checkboxStyle",
  "radioStyle",
  "toastStyle",
  "hoverEffectType",
  "hoverEffectIntensity",
  "logoType",
  "logoAnimation",
  "logoSize",
  "logoText",
  "showBreadcrumbs",
  "showUserAvatar",
  "showNotifications",
  "compactMode",
  "highContrast",
  "reducedMotion",
  "stickyHeader",
  "collapsibleSidebar",
  "showFooter",
  "autoSave",
  "showLogo",
  "showDetailPanel",
  "showToastIcons",
  "toastDuration",
]);

/**
 * Presentation UI component rendering the dashboard preview shell.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function DashboardPreviewShell() {
  // Gap #1/#11/#12 fix: Preview settings are maintained ENTIRELY in-memory.
  // No localStorage writes, no events, no auto-save triggers.
  // The parent window's SettingsProvider is completely unaffected.
  const [previewOverrides, setPreviewOverrides] = useState<Partial<Settings>>({});

  // Merge defaults with whatever the studio has sent via postMessage
  const mergedSettings = useMemo<Settings>(
    () => ({ ...defaultSettings, ...previewOverrides }),
    [previewOverrides]
  );

  // Build a context value with no-op setters (preview is read-only from the layout's perspective)
  // Uses createCompatSetters to auto-generate all 61 setXxx methods — no manual listing needed.
  const noopUpdate = useCallback(
    <K extends keyof Settings>(_key: K, _value: Settings[K]) => {},
    []
  );
  const compatSetters = useMemo(() => createCompatSetters(noopUpdate), [noopUpdate]);
  const previewContextValue = useMemo<SettingsContextType>(
    () => ({
      ...mergedSettings,
      updateSetting: noopUpdate,
      ...compatSetters,
      resetSettings: () => {},
      exportSettings: () => "{}",
      importSettings: () => false,
      overrideControl: {
        allowAdminOverride: true,
        allowedPaths: null,
        isSettingLocked: () => false,
      },
    }),
    [mergedSettings, noopUpdate, compatSetters]
  );

  // Apply data-attributes to the iframe's <html> from in-memory settings
  // This is necessary for CSS selectors ([data-theme="blue"]) to work in the preview
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    requestAnimationFrame(() => {
      root.setAttribute("data-theme", mergedSettings.colorTheme);
      root.setAttribute("data-light-bg-theme", mergedSettings.lightBackgroundTheme);
      root.setAttribute("data-dark-bg-theme", mergedSettings.darkBackgroundTheme);
      root.setAttribute("data-shadow", mergedSettings.shadowIntensity);
      root.setAttribute("data-layout", mergedSettings.layoutTemplate);
      root.setAttribute("data-card-style", mergedSettings.cardStyle);
      root.setAttribute("data-animation", mergedSettings.animationLevel);
      root.setAttribute("data-font-size", mergedSettings.fontSize);
      root.setAttribute("data-radius", mergedSettings.borderRadius);
      root.setAttribute("data-button-style", mergedSettings.buttonStyle);
      root.setAttribute("data-navigation-style", mergedSettings.navigationStyle);
      root.setAttribute("data-spacing", mergedSettings.spacingSize);
      root.setAttribute("data-icon-style", mergedSettings.iconStyle);
      root.setAttribute("data-input-style", mergedSettings.inputStyle);
      root.setAttribute("data-table-style", mergedSettings.tableStyle);
      root.setAttribute("data-badge-style", mergedSettings.badgeStyle);
      root.setAttribute("data-avatar-style", mergedSettings.avatarStyle);
      root.setAttribute("data-secondary-theme", mergedSettings.secondaryColorTheme);
      root.setAttribute("data-gradient-dir", mergedSettings.gradientDirection);
      root.setAttribute("data-light-gradient", mergedSettings.lightGradientTheme);
      root.setAttribute("data-dark-gradient", mergedSettings.darkGradientTheme);
      root.setAttribute("data-form-style", mergedSettings.formStyle);
      root.setAttribute("data-loading-style", mergedSettings.loadingStyle);
      root.setAttribute("data-tooltip-style", mergedSettings.tooltipStyle);
      root.setAttribute("data-modal-style", mergedSettings.modalStyle);
      root.setAttribute("data-tree-style", mergedSettings.treeStyle);
      root.setAttribute("data-hover-effect-type", mergedSettings.hoverEffectType);
      root.setAttribute("data-hover-effect-intensity", mergedSettings.hoverEffectIntensity);
    });
  }, [mergedSettings]);

  // Listen for postMessage from studio parent — update in-memory state only
  useEffect(() => {
    // Signal to studio that preview is ready
    window.parent?.postMessage({ type: "DASHBOARD_PREVIEW_READY" }, window.location.origin);

    const handler = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;

      if (e.data?.type === "DASHBOARD_SETTINGS_UPDATE") {
        const rawSettings = e.data.settings;
        if (!rawSettings || typeof rawSettings !== "object") return;

        // Filter to valid keys only (reject unknown/injected keys)
        const newSettings = Object.fromEntries(
          Object.entries(rawSettings).filter(([k]) => VALID_SETTINGS_KEYS.has(k))
        );
        if (Object.keys(newSettings).length === 0) return;

        // Update in-memory state only — NO localStorage, NO events
        setPreviewOverrides((prev) => ({ ...prev, ...newSettings }));
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  /**
   * Static preview of the single nexus shell.
   *
   * The real NexusLayout cannot be mounted here. This page sits under (auth)
   * with no auth guard so that the Customizer can embed it in an iframe, which
   * means there is no session: the shell's identity cluster mounts the
   * notification bell and the account menu, and its navigation comes from the
   * workspace provider, which is empty in this context.
   *
   * So the preview reproduces the chrome instead — real geometry (64px rail,
   * 240px panel, 56px topbar) and real semantic tokens, with the accent
   * following the shell's primary. It previews appearance, which is what the
   * Customizer is for; the content area is the same mock content the shell
   * would host.
   */
  const surface = "hsl(var(--card))";
  const edge = "hsl(var(--border))";
  const accent = "hsl(var(--primary))";
  const content = <MockDashboardContent />;

  const nexusShellPreview = (
    <div className="flex h-full w-full overflow-hidden">
      {/* Rail */}
      <div
        className="flex shrink-0 flex-col items-center gap-2 py-3"
        style={{ width: 64, background: surface, borderInlineEnd: `1px solid ${edge}` }}
      >
        <div className="h-7 w-7 rounded-md" style={{ background: accent, opacity: 0.9 }} />
        <div className="my-1 h-px w-6" style={{ background: edge }} />
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-9 w-9 rounded-[9px]"
            style={{
              background:
                i === 0 ? `color-mix(in oklch, ${accent} 16%, transparent)` : "transparent",
              border: `1px solid ${i === 0 ? accent : "transparent"}`,
            }}
          />
        ))}
        <div className="mt-auto h-8 w-8 rounded-full" style={{ background: edge }} />
      </div>

      {/* Panel */}
      <div
        className="flex shrink-0 flex-col gap-1.5 p-3"
        style={{ width: 240, background: surface, borderInlineEnd: `1px solid ${edge}` }}
      >
        <div
          className="mb-2 flex items-center gap-2 pb-3"
          style={{ borderBlockEnd: `1px solid ${edge}` }}
        >
          <div className="h-6 w-6 rounded-[7px]" style={{ border: `1px solid ${accent}` }} />
          <div className="h-2.5 w-24 rounded" style={{ background: edge }} />
        </div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-7 rounded-md"
            style={{
              background:
                i === 1 ? `color-mix(in oklch, ${accent} 12%, transparent)` : "transparent",
            }}
          />
        ))}
      </div>

      {/* Topbar + content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div
          className="flex shrink-0 items-center gap-2 px-4"
          style={{ height: 56, borderBlockEnd: `1px solid ${edge}` }}
        >
          <div className="h-2.5 w-32 rounded" style={{ background: edge }} />
        </div>
        <div className="flex-1 overflow-auto">{content}</div>
      </div>
    </div>
  );

  // Wrap in isolated SettingsContext — content inside reads from THIS provider,
  // not the global one from AppProvider. Zero localStorage interaction.
  return (
    <SettingsContext.Provider value={previewContextValue}>
      {nexusShellPreview}
    </SettingsContext.Provider>
  );
}

// ── Mock Dashboard Content ──
function MockDashboardContent() {
  const stats = [
    {
      icon: Users,
      label: "Total Users",
      value: "2,847",
      change: "+12.5%",
      positive: true,
      color: "text-info",
      bg: "bg-info/10",
    },
    {
      icon: DollarSign,
      label: "Revenue",
      value: "$48.2K",
      change: "+8.1%",
      positive: true,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      icon: Activity,
      label: "Active Now",
      value: "342",
      change: "-2.4%",
      positive: false,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      icon: Eye,
      label: "Page Views",
      value: "12.4K",
      change: "+23.7%",
      positive: true,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  const tableRows = [
    { name: "John Doe", email: "john@example.com", role: "Admin", status: "Active", date: "Today" },
    {
      name: "Sarah Miller",
      email: "sarah@example.com",
      role: "Editor",
      status: "Active",
      date: "Yesterday",
    },
    {
      name: "Alex Kim",
      email: "alex@example.com",
      role: "Viewer",
      status: "Pending",
      date: "2 days ago",
    },
    {
      name: "Maria Garcia",
      email: "maria@example.com",
      role: "Admin",
      status: "Active",
      date: "3 days ago",
    },
    {
      name: "James Wilson",
      email: "james@example.com",
      role: "Editor",
      status: "Inactive",
      date: "1 week ago",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Welcome back, Admin.</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground">
            Export
          </button>
          <button className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">
            + New Report
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className={cn("rounded-lg p-2", stat.bg)}>
                  <Icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div
                className={cn(
                  "mt-1 flex items-center gap-1 text-xs",
                  stat.positive ? "text-success" : "text-destructive"
                )}
              >
                <TrendingUp className={cn("h-3 w-3", !stat.positive && "rotate-180")} />
                <span>{stat.change} from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Revenue Overview</h3>
              <p className="text-xs text-muted-foreground">Monthly revenue</p>
            </div>
            <div className="flex gap-1">
              {["7d", "30d", "90d"].map((p, i) => (
                <button
                  key={p}
                  className={cn(
                    "rounded-md px-2 py-1 text-xs",
                    i === 1
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex h-[140px] items-end gap-1.5 px-2">
            {[35, 50, 70, 45, 80, 60, 90, 55, 72, 42, 85, 68].map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-primary/80 transition-colors hover:bg-primary"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Sources</h3>
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="my-4 flex items-center justify-center">
            <div className="relative h-[100px] w-[100px]">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  className="stroke-muted"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  className="stroke-primary"
                  strokeWidth="3"
                  strokeDasharray="55 45"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-foreground">68%</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { l: "Direct", p: "42%", c: "bg-primary" },
              { l: "Social", p: "28%", c: "bg-primary/60" },
              { l: "Referral", p: "18%", c: "bg-primary/30" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("h-2.5 w-2.5 rounded-full", item.c)} />
                  <span className="text-xs text-muted-foreground">{item.l}</span>
                </div>
                <span className="text-xs font-medium text-foreground">{item.p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h3 className="font-semibold text-foreground">Recent Users</h3>
            <p className="text-xs text-muted-foreground">Latest registrations</p>
          </div>
          <button className="flex items-center gap-1 text-xs text-primary">
            View all <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Name", "Email", "Role", "Status", "Date"].map((h) => (
                  <th key={h} className="p-3 text-start text-xs font-medium text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border/50 transition-colors hover:bg-muted/30"
                >
                  <td className="p-3 text-sm font-medium text-foreground">{row.name}</td>
                  <td className="p-3 text-sm text-muted-foreground">{row.email}</td>
                  <td className="p-3">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {row.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        row.status === "Active"
                          ? "bg-success/10 text-success"
                          : row.status === "Pending"
                            ? "bg-warning/10 text-warning"
                            : "bg-muted text-muted-foreground"
                      )}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
