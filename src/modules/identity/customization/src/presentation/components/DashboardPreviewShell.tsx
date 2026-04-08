/**
 * DashboardPreviewShell — Isolated dashboard layout preview for Customizer Studio.
 *
 * KEY ARCHITECTURE: Mirrors LoginPreviewShell pattern exactly.
 * - Has ZERO auth logic (no tokens, no API calls)
 * - Renders the REAL layout components (ClassicLayout, ModernLayout, etc.)
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
import { SettingsContext, defaultSettings, createCompatSetters, type Settings, type SettingsContextType } from "@core/providers/settings-provider";

import {
  Users, DollarSign, Activity, Eye, TrendingUp,
  ArrowUpRight, MoreHorizontal,
} from "lucide-react";
import { cn } from "@core/common/utils";

// ── Import REAL layout components ──
import { NavigationLayout } from "@core/ui/layout/navigation/navigation-layout";
import dynamic from "next/dynamic";

const ClassicLayout = dynamic(() => import("@core/ui/layout/classic/classic-layout").then(m => ({ default: m.ClassicLayout })), { ssr: false });
const CompactLayout = dynamic(() => import("@core/ui/layout/compact/compact-layout").then(m => ({ default: m.CompactLayout })), { ssr: false });
const ElegantLayout = dynamic(() => import("@core/ui/layout/elegant/elegant-layout").then(m => ({ default: m.ElegantLayout })), { ssr: false });
const FloatingLayout = dynamic(() => import("@core/ui/layout/floating/floating-layout").then(m => ({ default: m.FloatingLayout })), { ssr: false });
const ModernLayout = dynamic(() => import("@core/ui/layout/modern/modern-layout").then(m => ({ default: m.ModernLayout })), { ssr: false });
const MinimalLayout = dynamic(() => import("@core/ui/layout/minimal/minimal-layout").then(m => ({ default: m.MinimalLayout })), { ssr: false });
const TabbedLayout = dynamic(() => import("@core/ui/layout/tabbed/tabbed-layout").then(m => ({ default: m.TabbedLayout })), { ssr: false });
const DualLayout = dynamic(() => import("@core/ui/layout/dual/dual-layout").then(m => ({ default: m.DualLayout })), { ssr: false });
const CommandLayout = dynamic(() => import("@core/ui/layout/command/command-layout").then(m => ({ default: m.CommandLayout })), { ssr: false });
const StackedLayout = dynamic(() => import("@core/ui/layout/stacked/stacked-layout").then(m => ({ default: m.StackedLayout })), { ssr: false });
const HUDLayout = dynamic(() => import("@core/ui/layout/hud/hud-layout").then(m => ({ default: m.HUDLayout })), { ssr: false });
const DockLayout = dynamic(() => import("@core/ui/layout/dock/dock-layout").then(m => ({ default: m.DockLayout })), { ssr: false });
const ExecutiveLayout = dynamic(() => import("@core/ui/layout/executive/executive-layout").then(m => ({ default: m.ExecutiveLayout })), { ssr: false });
const MagazineLayout = dynamic(() => import("@core/ui/layout/magazine/magazine-layout").then(m => ({ default: m.MagazineLayout })), { ssr: false });
const SpotlightLayout = dynamic(() => import("@core/ui/layout/spotlight/spotlight-layout").then(m => ({ default: m.SpotlightLayout })), { ssr: false });
const GlassmorphismLayout = dynamic(() => import("@core/ui/layout/glassmorphism/glassmorphism-layout").then(m => ({ default: m.GlassmorphismLayout })), { ssr: false });
const GalaxyLayout = dynamic(() => import("@core/ui/layout/galaxy/galaxy-layout").then(m => ({ default: m.GalaxyLayout })), { ssr: false });
const NeonLayout = dynamic(() => import("@core/ui/layout/neon/neon-layout").then(m => ({ default: m.NeonLayout })), { ssr: false });
const RetroLayout = dynamic(() => import("@core/ui/layout/retro/retro-layout").then(m => ({ default: m.RetroLayout })), { ssr: false });
const AuroraLayout = dynamic(() => import("@core/ui/layout/aurora/aurora-layout").then(m => ({ default: m.AuroraLayout })), { ssr: false });
const RailLayout = dynamic(() => import("@core/ui/layout/rail/rail-layout").then(m => ({ default: m.RailLayout })), { ssr: false });
const NewspaperLayout = dynamic(() => import("@core/ui/layout/newspaper/newspaper-layout").then(m => ({ default: m.NewspaperLayout })), { ssr: false });
const CinemaLayout = dynamic(() => import("@core/ui/layout/cinema/cinema-layout").then(m => ({ default: m.CinemaLayout })), { ssr: false });
const VaultLayout = dynamic(() => import("@core/ui/layout/vault/vault-layout").then(m => ({ default: m.VaultLayout })), { ssr: false });
const BottomBarLayout = dynamic(() => import("@core/ui/layout/bottombar/bottombar-layout").then(m => ({ default: m.BottomBarLayout })), { ssr: false });
const MegaMenuLayout = dynamic(() => import("@core/ui/layout/megamenu/megamenu-layout").then(m => ({ default: m.MegaMenuLayout })), { ssr: false });
const BreadcrumbLayout = dynamic(() => import("@core/ui/layout/breadcrumb/breadcrumb-layout").then(m => ({ default: m.BreadcrumbLayout })), { ssr: false });
const RibbonLayout = dynamic(() => import("@core/ui/layout/ribbon/ribbon-layout").then(m => ({ default: m.RibbonLayout })), { ssr: false });
const TreeViewLayout = dynamic(() => import("@core/ui/layout/treeview/treeview-layout").then(m => ({ default: m.TreeViewLayout })), { ssr: false });
const OverlayLayout = dynamic(() => import("@core/ui/layout/overlay/overlay-layout").then(m => ({ default: m.OverlayLayout })), { ssr: false });
const HubLayout = dynamic(() => import("@core/ui/layout/hub/hub-layout").then(m => ({ default: m.HubLayout })), { ssr: false });
const WizardLayout = dynamic(() => import("@core/ui/layout/wizard/wizard-layout").then(m => ({ default: m.WizardLayout })), { ssr: false });
const ShelfLayout = dynamic(() => import("@core/ui/layout/shelf/shelf-layout").then(m => ({ default: m.ShelfLayout })), { ssr: false });
const CollapseHeaderLayout = dynamic(() => import("@core/ui/layout/collapseheader/collapseheader-layout").then(m => ({ default: m.CollapseHeaderLayout })), { ssr: false });
const SplitPaneLayout = dynamic(() => import("@core/ui/layout/splitpane/splitpane-layout").then(m => ({ default: m.SplitPaneLayout })), { ssr: false });
const InboxLayout = dynamic(() => import("@core/ui/layout/inbox/inbox-layout").then(m => ({ default: m.InboxLayout })), { ssr: false });
const DualHeaderLayout = dynamic(() => import("@core/ui/layout/dualheader/dualheader-layout").then(m => ({ default: m.DualHeaderLayout })), { ssr: false });
const TopSideLayout = dynamic(() => import("@core/ui/layout/topside/topside-layout").then(m => ({ default: m.TopSideLayout })), { ssr: false });
const FocusLayout = dynamic(() => import("@core/ui/layout/focus/focus-layout").then(m => ({ default: m.FocusLayout })), { ssr: false });
const MultiPanelLayout = dynamic(() => import("@core/ui/layout/multipanel/multipanel-layout").then(m => ({ default: m.MultiPanelLayout })), { ssr: false });
const KanbanLayout = dynamic(() => import("@core/ui/layout/kanban/kanban-layout").then(m => ({ default: m.KanbanLayout })), { ssr: false });
const BentoLayout = dynamic(() => import("@core/ui/layout/bento/bento-layout").then(m => ({ default: m.BentoLayout })), { ssr: false });
const ChatLayout = dynamic(() => import("@core/ui/layout/chat/chat-layout").then(m => ({ default: m.ChatLayout })), { ssr: false });
const MapLayout = dynamic(() => import("@core/ui/layout/map/map-layout").then(m => ({ default: m.MapLayout })), { ssr: false });
const FeedLayout = dynamic(() => import("@core/ui/layout/feed/feed-layout").then(m => ({ default: m.FeedLayout })), { ssr: false });
const CalendarLayout = dynamic(() => import("@core/ui/layout/calendar/calendar-layout").then(m => ({ default: m.CalendarLayout })), { ssr: false });
const CRMLayout = dynamic(() => import("@core/ui/layout/crm/crm-layout").then(m => ({ default: m.CRMLayout })), { ssr: false });
const TerminalLayout = dynamic(() => import("@core/ui/layout/terminal/terminal-layout").then(m => ({ default: m.TerminalLayout })), { ssr: false });


// ── Valid settings keys whitelist (security hardening) ──
const VALID_SETTINGS_KEYS = new Set([
  "layoutTemplate", "colorTheme", "secondaryColorTheme", "lightBackgroundTheme",
  "darkBackgroundTheme", "shadowIntensity", "backgroundMode", "gradientDirection",
  "lightGradientTheme", "darkGradientTheme", "customPrimaryColor", "customSecondaryColor",
  "customLightBgColor", "customDarkBgColor", "gradientStartColor", "gradientEndColor",
  "activePalette", "cardStyle", "animationLevel", "fontSize", "borderRadius",
  "sidebarPosition", "headerStyle", "sidebarStyle", "buttonStyle", "navigationStyle",
  "spacingSize", "iconStyle", "inputStyle", "tableStyle", "badgeStyle", "avatarStyle",
  "formStyle", "loadingStyle", "tooltipStyle", "modalStyle", "treeStyle",
  "datePickerStyle", "calendarStyle", "selectStyle", "switchStyle", "checkboxStyle",
  "radioStyle", "toastStyle", "hoverEffectType", "hoverEffectIntensity",
  "logoType", "logoAnimation", "logoSize", "logoText",
  "showBreadcrumbs", "showUserAvatar", "showNotifications", "compactMode",
  "highContrast", "reducedMotion", "stickyHeader", "collapsibleSidebar",
  "showFooter", "autoSave", "showLogo", "showDetailPanel", "showToastIcons",
  "toastDuration",
]);

export function DashboardPreviewShell() {
  // Gap #1/#11/#12 fix: Preview settings are maintained ENTIRELY in-memory.
  // No localStorage writes, no events, no auto-save triggers.
  // The parent window's SettingsProvider is completely unaffected.
  const [previewOverrides, setPreviewOverrides] = useState<Partial<Settings>>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Merge defaults with whatever the studio has sent via postMessage
  const mergedSettings = useMemo<Settings>(
    () => ({ ...defaultSettings, ...previewOverrides }),
    [previewOverrides]
  );

  // Build a context value with no-op setters (preview is read-only from the layout's perspective)
  // Uses createCompatSetters to auto-generate all 61 setXxx methods — no manual listing needed.
  const noopUpdate = useCallback(<K extends keyof Settings>(_key: K, _value: Settings[K]) => {}, []);
  const compatSetters = useMemo(() => createCompatSetters(noopUpdate), [noopUpdate]);
  const previewContextValue = useMemo<SettingsContextType>(() => ({
    ...mergedSettings,
    updateSetting: noopUpdate,
    ...compatSetters,
    resetSettings: () => {},
    exportSettings: () => "{}",
    importSettings: () => false,
    overrideControl: { allowAdminOverride: true, allowedPaths: null, isSettingLocked: () => false },
  }), [mergedSettings, noopUpdate, compatSetters]);

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
      root.setAttribute("data-sidebar-position", mergedSettings.sidebarPosition);
      root.setAttribute("data-header-style", mergedSettings.headerStyle);
      root.setAttribute("data-sidebar-style", mergedSettings.sidebarStyle);
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
      root.setAttribute("data-compact-mode", mergedSettings.compactMode.toString());
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

  // Render the correct layout, wrapped in an isolated SettingsContext
  const layoutTemplate = mergedSettings.layoutTemplate;
  const content = <MockDashboardContent />;

  const withSidebar = (Layout: React.ComponentType<{ children: React.ReactNode; sidebarOpen: boolean; onSidebarOpenChange: (open: boolean) => void }>) => (
    <Layout sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>{content}</Layout>
  );

  const withoutSidebar = (Layout: React.ComponentType<{ children: React.ReactNode }>) => (
    <Layout>{content}</Layout>
  );

  const renderLayout = () => {
    switch (layoutTemplate) {
      case "classic": return withSidebar(ClassicLayout);
      case "compact": return withSidebar(CompactLayout);
      case "elegant": return withSidebar(ElegantLayout);
      case "floating": return withSidebar(FloatingLayout);
      case "modern": return withSidebar(ModernLayout);
      case "tabbed": return withSidebar(TabbedLayout);
      case "dual": return withSidebar(DualLayout);
      case "minimal": return withoutSidebar(MinimalLayout);
      case "command": return withoutSidebar(CommandLayout);
      case "stacked": return withoutSidebar(StackedLayout);
      case "hud": return withoutSidebar(HUDLayout);
      case "dock": return withoutSidebar(DockLayout);
      case "executive": return withoutSidebar(ExecutiveLayout);
      case "magazine": return withoutSidebar(MagazineLayout);
      case "spotlight": return withoutSidebar(SpotlightLayout);
      case "glassmorphism": return withoutSidebar(GlassmorphismLayout);
      case "galaxy": return withoutSidebar(GalaxyLayout);
      case "neon": return withoutSidebar(NeonLayout);
      case "retro": return withoutSidebar(RetroLayout);
      case "aurora": return withoutSidebar(AuroraLayout);
      case "rail": return withoutSidebar(RailLayout);
      case "newspaper": return withoutSidebar(NewspaperLayout);
      case "cinema": return withoutSidebar(CinemaLayout);
      case "vault": return withoutSidebar(VaultLayout);
      case "bottombar": return withoutSidebar(BottomBarLayout);
      case "megamenu": return withoutSidebar(MegaMenuLayout);
      case "breadcrumb": return withoutSidebar(BreadcrumbLayout);
      case "ribbon": return withoutSidebar(RibbonLayout);
      case "treeview": return withoutSidebar(TreeViewLayout);
      case "overlay": return withoutSidebar(OverlayLayout);
      case "hub": return withoutSidebar(HubLayout);
      case "wizard": return withoutSidebar(WizardLayout);
      case "shelf": return withoutSidebar(ShelfLayout);
      case "collapseheader": return withoutSidebar(CollapseHeaderLayout);
      case "splitpane": return withoutSidebar(SplitPaneLayout);
      case "inbox": return withoutSidebar(InboxLayout);
      case "dualheader": return withoutSidebar(DualHeaderLayout);
      case "topside": return withoutSidebar(TopSideLayout);
      case "focus": return withoutSidebar(FocusLayout);
      case "multipanel": return withoutSidebar(MultiPanelLayout);
      case "kanban": return withoutSidebar(KanbanLayout);
      case "bento": return withoutSidebar(BentoLayout);
      case "chat": return withoutSidebar(ChatLayout);
      case "map": return withoutSidebar(MapLayout);
      case "feed": return withoutSidebar(FeedLayout);
      case "calendar": return withoutSidebar(CalendarLayout);
      case "crm": return withoutSidebar(CRMLayout);
      case "terminal": return withoutSidebar(TerminalLayout);
      default:
        return (
          <NavigationLayout sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>
            {content}
          </NavigationLayout>
        );
    }
  };

  // Wrap in isolated SettingsContext — layout components inside read from THIS
  // provider, not the global one from AppProvider. Zero localStorage interaction.
  return (
    <SettingsContext.Provider value={previewContextValue}>
      {renderLayout()}
    </SettingsContext.Provider>
  );
}


// ── Mock Dashboard Content ──
function MockDashboardContent() {
  const stats = [
    { icon: Users, label: "Total Users", value: "2,847", change: "+12.5%", positive: true, color: "text-blue-500", bg: "bg-blue-500/10" },
    { icon: DollarSign, label: "Revenue", value: "$48.2K", change: "+8.1%", positive: true, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { icon: Activity, label: "Active Now", value: "342", change: "-2.4%", positive: false, color: "text-amber-500", bg: "bg-amber-500/10" },
    { icon: Eye, label: "Page Views", value: "12.4K", change: "+23.7%", positive: true, color: "text-violet-500", bg: "bg-violet-500/10" },
  ];

  const tableRows = [
    { name: "John Doe", email: "john@company.com", role: "Admin", status: "Active", date: "Today" },
    { name: "Sarah Miller", email: "sarah@company.com", role: "Editor", status: "Active", date: "Yesterday" },
    { name: "Alex Kim", email: "alex@company.com", role: "Viewer", status: "Pending", date: "2 days ago" },
    { name: "Maria Garcia", email: "maria@company.com", role: "Admin", status: "Active", date: "3 days ago" },
    { name: "James Wilson", email: "james@company.com", role: "Editor", status: "Inactive", date: "1 week ago" },
  ];

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back, Admin.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-sm rounded-md border border-border bg-background text-foreground">Export</button>
          <button className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground">+ New Report</button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className={cn("p-2 rounded-lg", stat.bg)}><Icon className={cn("h-4 w-4", stat.color)} /></div>
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className={cn("flex items-center gap-1 mt-1 text-xs", stat.positive ? "text-emerald-500" : "text-rose-500")}>
                <TrendingUp className={cn("h-3 w-3", !stat.positive && "rotate-180")} />
                <span>{stat.change} from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="font-semibold text-foreground">Revenue Overview</h3><p className="text-xs text-muted-foreground">Monthly revenue</p></div>
            <div className="flex gap-1">
              {["7d", "30d", "90d"].map((p, i) => (<button key={p} className={cn("px-2 py-1 text-xs rounded-md", i === 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>{p}</button>))}
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-[140px] px-2">
            {[35, 50, 70, 45, 80, 60, 90, 55, 72, 42, 85, 68].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors" style={{ height: `${h}%` }} />
                <span className="text-[10px] text-muted-foreground">{["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-foreground">Sources</h3><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></div>
          <div className="flex items-center justify-center my-4">
            <div className="relative h-[100px] w-[100px]">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" className="stroke-muted" strokeWidth="3" />
                <circle cx="18" cy="18" r="14" fill="none" className="stroke-primary" strokeWidth="3" strokeDasharray="55 45" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center"><span className="text-xl font-bold text-foreground">68%</span></div>
            </div>
          </div>
          <div className="space-y-2">
            {[{ l: "Direct", p: "42%", c: "bg-primary" }, { l: "Social", p: "28%", c: "bg-primary/60" }, { l: "Referral", p: "18%", c: "bg-primary/30" }].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2"><div className={cn("h-2.5 w-2.5 rounded-full", item.c)} /><span className="text-xs text-muted-foreground">{item.l}</span></div>
                <span className="text-xs font-medium text-foreground">{item.p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div><h3 className="font-semibold text-foreground">Recent Users</h3><p className="text-xs text-muted-foreground">Latest registrations</p></div>
          <button className="text-xs text-primary flex items-center gap-1">View all <ArrowUpRight className="h-3 w-3" /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              {["Name", "Email", "Role", "Status", "Date"].map(h => (<th key={h} className="text-start text-xs font-medium text-muted-foreground p-3">{h}</th>))}
            </tr></thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-sm font-medium text-foreground">{row.name}</td>
                  <td className="p-3 text-sm text-muted-foreground">{row.email}</td>
                  <td className="p-3"><span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{row.role}</span></td>
                  <td className="p-3"><span className={cn("text-xs px-2 py-0.5 rounded-full",
                    row.status === "Active" ? "bg-emerald-500/10 text-emerald-500" :
                    row.status === "Pending" ? "bg-amber-500/10 text-amber-500" :
                    "bg-muted text-muted-foreground"
                  )}>{row.status}</span></td>
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
