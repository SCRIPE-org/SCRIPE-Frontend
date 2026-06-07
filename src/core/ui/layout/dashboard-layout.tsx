"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useAdminSettingsSync } from "@core/providers/useAdminSettingsSync";
import { TenantBrandingProvider, useTenantBranding } from "@core/providers/tenant-branding-provider";
import { TenantContextBanner } from "@core/ui/layout/shared/tenant-context-banner";
import { GracePeriodBanner } from "@core/components/GracePeriodBanner";
import { PaymentWallDialog } from "@core/components/PaymentWallDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@core/ui/avatar";
import { useAppStore } from "@core/store/useAppStore";
import { useTheme } from "next-themes";
import { useWorkspace } from "@core/providers/workspace-provider";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";


// Default layout — statically imported (always needed, no lazy-load delay)
// Nexus is the default layoutTemplate (defaults.ts), so it must be statically
// imported to avoid a flash of empty content while dynamic() downloads the chunk.
import { NexusLayout } from "@core/ui/layout/nexus/nexus-layout";

// ── Layout chunk loading shimmer ────────────────────────────────────────────
// Shown while a lazy-loaded layout chunk downloads. Prevents the brief blank
// frame (null render) that Next.js dynamic() produces with ssr:false.
// Uses the same visual treatment as the FOUC shimmer in DashboardLayout.
function LayoutLoadingShimmer() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex animate-pulse flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full bg-muted" />
        <div className="h-4 w-32 rounded bg-muted" />
      </div>
    </div>
  );
}

const API_URL = process.env.NEXT_PUBLIC_File_URL || "";

function getAvatarUrl(profileImageUrl: string | null | undefined): string | undefined {
  if (!profileImageUrl) return undefined;
  const base = `${API_URL}${profileImageUrl}`;
  return `${base}?v=${Date.now()}`;
}

function LoginWelcomeLoader() {
  const user = useAppStore((state) => state.user);
  const { t } = useI18n();
  const { resolvedTheme } = useTheme();
  const { accentColor } = useWorkspace();
  const isDark = resolvedTheme === "dark";
  const accent = accentColor ?? (isDark ? "#7C6FD4" : "#6258c4");

  const avatarUrl = user ? getAvatarUrl(user.profileImageUrl) : undefined;
  const avatarGradient = `linear-gradient(135deg, ${accent}CC 0%, ${isDark ? "#3B2FA3" : "#2D2580"} 100%)`;

  const getInitials = () => {
    if (!user) return "U";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    const firstInitial = firstName.charAt(0)?.toUpperCase() || "";
    const lastInitial = lastName.charAt(0)?.toUpperCase() || "";
    return `${firstInitial}${lastInitial}` || "U";
  };

  const getDisplayName = () => {
    if (!user) return t("common.user");
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    return `${firstName} ${lastName}`.trim() || user.username || "User";
  };

  const nameForWelcome = user?.firstName || user?.username || t("common.user");

  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-center bg-background overflow-hidden select-none">
      <style>{`
        @keyframes indeterminate-progress {
          0% { left: -33%; width: 33%; }
          50% { left: 33%; width: 50%; }
          100% { left: 100%; width: 33%; }
        }
        .animate-indeterminate {
          animation: indeterminate-progress 1.6s infinite ease-in-out;
        }
      `}</style>
      
      {/* Background ambient glow */}
      <div 
        className="absolute h-96 w-96 rounded-full opacity-[0.08] blur-[100px] transition-all duration-1000"
        style={{
          background: accent,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
      
      {/* Glassmorphic Welcome Card */}
      <div className="relative z-10 flex flex-col items-center justify-center rounded-2xl border border-border/40 bg-card/40 p-8 shadow-2xl backdrop-blur-md max-w-sm w-full mx-4 animate-in fade-in duration-500">
        
        {/* Avatar Ring with pulsing glow */}
        <div className="relative flex items-center justify-center">
          <div 
            className="absolute -inset-2 rounded-full opacity-35 blur-sm animate-pulse"
            style={{
              background: `radial-gradient(circle, ${accent} 0%, transparent 80%)`
            }}
          />
          <div 
            className="absolute -inset-1.5 rounded-full opacity-55"
            style={{
              border: `2px solid ${accent}`
            }}
          />
          <Avatar className="relative h-24 w-24 border-4 border-background shadow-xl">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={getDisplayName()} />}
            <AvatarFallback
              style={{ background: avatarGradient }}
              className="text-3xl font-bold text-white animate-in fade-in duration-300"
            >
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Text Details */}
        <h2 className="mt-6 text-2xl font-extrabold text-foreground tracking-tight text-center">
          {getDisplayName()}
        </h2>
        
        <p className="mt-3 text-base font-semibold text-muted-foreground text-center">
          {t("common.welcomeBack", { name: nameForWelcome })}
        </p>

        <p className="mt-1 text-xs text-muted-foreground/75 text-center">
          {t("common.gettingReady")}
        </p>

        {/* Premium Loading Progress Bar */}
        <div className="mt-8 relative w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="absolute top-0 bottom-0 left-0 rounded-full animate-indeterminate"
            style={{
              background: accent,
            }}
          />
        </div>
      </div>
    </div>
  );
}


// ── Shared loading fallback for lazy layouts ────────────────────────────────
// NOTE: Next.js dynamic() requires the second argument to be an OBJECT LITERAL
// (Turbopack/SWC statically analyzes it). We cannot use a shared variable.
// Instead, we reference LayoutLoadingShimmer in each inline options object.

// Navigation layout — lazy-loaded (only used when explicitly selected)
const NavigationLayout = dynamic(
  () =>
    import("@core/ui/layout/navigation/navigation-layout").then((m) => ({ default: m.NavigationLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);

// ── Lazy-loaded layouts (only downloaded when actually selected) ──
const ClassicLayout = dynamic(
  () =>
    import("@core/ui/layout/classic/classic-layout").then((m) => ({ default: m.ClassicLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const CompactLayout = dynamic(
  () =>
    import("@core/ui/layout/compact/compact-layout").then((m) => ({ default: m.CompactLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const ElegantLayout = dynamic(
  () =>
    import("@core/ui/layout/elegant/elegant-layout").then((m) => ({ default: m.ElegantLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const FloatingLayout = dynamic(
  () =>
    import("@core/ui/layout/floating/floating-layout").then((m) => ({ default: m.FloatingLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const ModernLayout = dynamic(
  () => import("@core/ui/layout/modern/modern-layout").then((m) => ({ default: m.ModernLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const MinimalLayout = dynamic(
  () =>
    import("@core/ui/layout/minimal/minimal-layout").then((m) => ({ default: m.MinimalLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const TabbedLayout = dynamic(
  () => import("@core/ui/layout/tabbed/tabbed-layout").then((m) => ({ default: m.TabbedLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const DualLayout = dynamic(
  () => import("@core/ui/layout/dual/dual-layout").then((m) => ({ default: m.DualLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const CommandLayout = dynamic(
  () =>
    import("@core/ui/layout/command/command-layout").then((m) => ({ default: m.CommandLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const StackedLayout = dynamic(
  () =>
    import("@core/ui/layout/stacked/stacked-layout").then((m) => ({ default: m.StackedLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const HUDLayout = dynamic(
  () => import("@core/ui/layout/hud/hud-layout").then((m) => ({ default: m.HUDLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const DockLayout = dynamic(
  () => import("@core/ui/layout/dock/dock-layout").then((m) => ({ default: m.DockLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const ExecutiveLayout = dynamic(
  () =>
    import("@core/ui/layout/executive/executive-layout").then((m) => ({
      default: m.ExecutiveLayout,
    })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const MagazineLayout = dynamic(
  () =>
    import("@core/ui/layout/magazine/magazine-layout").then((m) => ({ default: m.MagazineLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const SpotlightLayout = dynamic(
  () =>
    import("@core/ui/layout/spotlight/spotlight-layout").then((m) => ({
      default: m.SpotlightLayout,
    })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const GlassmorphismLayout = dynamic(
  () =>
    import("@core/ui/layout/glassmorphism/glassmorphism-layout").then((m) => ({
      default: m.GlassmorphismLayout,
    })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const GalaxyLayout = dynamic(
  () => import("@core/ui/layout/galaxy/galaxy-layout").then((m) => ({ default: m.GalaxyLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const NeonLayout = dynamic(
  () => import("@core/ui/layout/neon/neon-layout").then((m) => ({ default: m.NeonLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const RetroLayout = dynamic(
  () => import("@core/ui/layout/retro/retro-layout").then((m) => ({ default: m.RetroLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const AuroraLayout = dynamic(
  () => import("@core/ui/layout/aurora/aurora-layout").then((m) => ({ default: m.AuroraLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const RailLayout = dynamic(
  () => import("@core/ui/layout/rail/rail-layout").then((m) => ({ default: m.RailLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const NewspaperLayout = dynamic(
  () =>
    import("@core/ui/layout/newspaper/newspaper-layout").then((m) => ({
      default: m.NewspaperLayout,
    })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const CinemaLayout = dynamic(
  () => import("@core/ui/layout/cinema/cinema-layout").then((m) => ({ default: m.CinemaLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const VaultLayout = dynamic(
  () => import("@core/ui/layout/vault/vault-layout").then((m) => ({ default: m.VaultLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const BottomBarLayout = dynamic(
  () =>
    import("@core/ui/layout/bottombar/bottombar-layout").then((m) => ({
      default: m.BottomBarLayout,
    })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const MegaMenuLayout = dynamic(
  () =>
    import("@core/ui/layout/megamenu/megamenu-layout").then((m) => ({ default: m.MegaMenuLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const BreadcrumbLayout = dynamic(
  () =>
    import("@core/ui/layout/breadcrumb/breadcrumb-layout").then((m) => ({
      default: m.BreadcrumbLayout,
    })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const RibbonLayout = dynamic(
  () => import("@core/ui/layout/ribbon/ribbon-layout").then((m) => ({ default: m.RibbonLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const TreeViewLayout = dynamic(
  () =>
    import("@core/ui/layout/treeview/treeview-layout").then((m) => ({ default: m.TreeViewLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const OverlayLayout = dynamic(
  () =>
    import("@core/ui/layout/overlay/overlay-layout").then((m) => ({ default: m.OverlayLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const HubLayout = dynamic(
  () => import("@core/ui/layout/hub/hub-layout").then((m) => ({ default: m.HubLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const WizardLayout = dynamic(
  () => import("@core/ui/layout/wizard/wizard-layout").then((m) => ({ default: m.WizardLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const ShelfLayout = dynamic(
  () => import("@core/ui/layout/shelf/shelf-layout").then((m) => ({ default: m.ShelfLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const CollapseHeaderLayout = dynamic(
  () =>
    import("@core/ui/layout/collapseheader/collapseheader-layout").then((m) => ({
      default: m.CollapseHeaderLayout,
    })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const SplitPaneLayout = dynamic(
  () =>
    import("@core/ui/layout/splitpane/splitpane-layout").then((m) => ({
      default: m.SplitPaneLayout,
    })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const InboxLayout = dynamic(
  () => import("@core/ui/layout/inbox/inbox-layout").then((m) => ({ default: m.InboxLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const DualHeaderLayout = dynamic(
  () =>
    import("@core/ui/layout/dualheader/dualheader-layout").then((m) => ({
      default: m.DualHeaderLayout,
    })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const TopSideLayout = dynamic(
  () =>
    import("@core/ui/layout/topside/topside-layout").then((m) => ({ default: m.TopSideLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const FocusLayout = dynamic(
  () => import("@core/ui/layout/focus/focus-layout").then((m) => ({ default: m.FocusLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const MultiPanelLayout = dynamic(
  () =>
    import("@core/ui/layout/multipanel/multipanel-layout").then((m) => ({
      default: m.MultiPanelLayout,
    })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const KanbanLayout = dynamic(
  () => import("@core/ui/layout/kanban/kanban-layout").then((m) => ({ default: m.KanbanLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const BentoLayout = dynamic(
  () => import("@core/ui/layout/bento/bento-layout").then((m) => ({ default: m.BentoLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const ChatLayout = dynamic(
  () => import("@core/ui/layout/chat/chat-layout").then((m) => ({ default: m.ChatLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const MapLayout = dynamic(
  () => import("@core/ui/layout/map/map-layout").then((m) => ({ default: m.MapLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const FeedLayout = dynamic(
  () => import("@core/ui/layout/feed/feed-layout").then((m) => ({ default: m.FeedLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const CalendarLayout = dynamic(
  () =>
    import("@core/ui/layout/calendar/calendar-layout").then((m) => ({ default: m.CalendarLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const CRMLayout = dynamic(
  () => import("@core/ui/layout/crm/crm-layout").then((m) => ({ default: m.CRMLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
const TerminalLayout = dynamic(
  () =>
    import("@core/ui/layout/terminal/terminal-layout").then((m) => ({ default: m.TerminalLayout })),
  { ssr: false, loading: () => <LayoutLoadingShimmer /> }
);
// Nexus — statically imported above as the default layout (no lazy-load needed)

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  // Detect "fresh login" vs "page refresh": sessionStorage flag is set by
  // useAppStore.setAuth() and survives the redirect to /dashboard, but
  // does NOT survive a new browser tab or manual URL entry.
  const [isFreshLogin] = useState(() => {
    if (typeof window === "undefined") return false;
    try { return sessionStorage.getItem(STORAGE_KEYS.JUST_LOGGED_IN) === "1"; } catch { return false; }
  });

  // Wrap with TenantBrandingProvider immediately, then delegate to inner component
  // so the loader mounts under the same context tree and does not remount.
  return (
    <TenantBrandingProvider>
      <DashboardLayoutContent isFreshLogin={isFreshLogin}>{children}</DashboardLayoutContent>
    </TenantBrandingProvider>
  );
}

// ── Inner component: gates on branding + settings + routes + renders the actual layout ──
// Must be a separate component so useTenantBranding() is called INSIDE
// TenantBrandingProvider's React context.
function DashboardLayoutContent({ children, isFreshLogin }: { children: React.ReactNode; isFreshLogin: boolean }) {
  const { isSettingsReady, isTransitioning } = useAdminSettingsSync();
  const settings = useSettings();
  const { isLoading: isBrandingLoading } = useTenantBranding();
  const [sidebarOpen, setSidebarOpen] = useState(settings.collapsibleSidebar ? false : true);
  const { direction } = useI18n();
  const { layoutTemplate, collapsibleSidebar } = settings;

  // Sync sidebar when collapsibleSidebar setting changes
  const [prevCollapsibleSidebar, setPrevCollapsibleSidebar] = useState(collapsibleSidebar);
  if (collapsibleSidebar !== prevCollapsibleSidebar) {
    setPrevCollapsibleSidebar(collapsibleSidebar);
    if (!collapsibleSidebar && !sidebarOpen) {
      setSidebarOpen(true);
    }
  }

  // Close sidebar when clicking outside on mobile if collapsible
  useEffect(() => {
    if (!collapsibleSidebar) return;
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector(".sidebar");
      const sidebarTrigger = document.querySelector(".sidebar-trigger");

      if (
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        sidebarTrigger &&
        !sidebarTrigger.contains(event.target as Node) &&
        window.innerWidth < 1024
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [collapsibleSidebar]);

  const isInitialLoading = useNavigationStore((s) => s.isInitialLoading);
  const routesLoadedAt = useNavigationStore((s) => s.routesLoadedAt);

  // ── Gate 2 + 3: Wait for branding AND one extra frame for settings re-merge ──
  // 
  // ARCHITECTURE NOTE — why two gates?
  // Gate 2: Branding itself is still loading (API in flight).
  // Gate 3: Branding just resolved this frame. TenantBrandingProvider dispatches
  //         "tenant-branding-loaded" which causes SettingsProvider to re-merge
  //         with dashboardThemeJson (may change layoutTemplate). Without this
  //         extra-frame gate, React renders with STALE settings for 1 frame
  //         (the old layoutTemplate) then re-renders with the correct one → flash.
  //         By holding the gate for one rAF, the re-merge commits and the
  //         layout renders with the FINAL merged settings on first paint.
  const [isSettingsMergeSettled, setIsSettingsMergeSettled] = useState(!isFreshLogin);

  useEffect(() => {
    if (!isBrandingLoading && !isSettingsMergeSettled) {
      // Branding just finished loading — wait one animation frame for
      // SettingsProvider to process the "tenant-branding-loaded" event
      // and re-merge settings (including dashboardThemeJson overrides).
      const raf = requestAnimationFrame(() => {
        setIsSettingsMergeSettled(true);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isBrandingLoading, isSettingsMergeSettled]);

  const isNavReady = !isInitialLoading && routesLoadedAt !== null;
  const isSettingsCompleted = isSettingsReady && !isTransitioning;

  // Unify all loading gates under a single layout wrapper
  const shouldBlockContent = isFreshLogin
    ? (!isSettingsCompleted || isBrandingLoading || !isSettingsMergeSettled || !isNavReady)
    : (!isSettingsReady || isTransitioning || isBrandingLoading || !isSettingsMergeSettled);

  if (shouldBlockContent) {
    // Fresh login → premium welcome card; Page refresh → lightweight shimmer
    return isFreshLogin ? <LoginWelcomeLoader /> : <LayoutLoadingShimmer />;
  }

  // ── Both gates passed — clear the "just logged in" flag ──
  // This MUST happen after BOTH Gate 1 (settings), Gate 2 (branding) and routes/menus resolve.
  // The flag is checked once on mount (via useState initializer in DashboardLayout)
  // and cleared here so subsequent page refreshes never show the welcome loader.
  if (isFreshLogin && typeof window !== "undefined") {
    try { sessionStorage.removeItem(STORAGE_KEYS.JUST_LOGGED_IN); } catch { /* ignore */ }
  }

  // ── Compute layout content (rendered below the tenant banner) ──
  const renderLayout = () => {
    // ── Nexus: dual-rail workspace layout (highest priority — checked first) ──
    if (layoutTemplate === "nexus") {
      return <NexusLayout>{children}</NexusLayout>;
    }

    // Classic Layout
    if (layoutTemplate === "classic") {
      return (
        <ClassicLayout sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>
          {children}
        </ClassicLayout>
      );
    }

    // Compact Layout
    if (layoutTemplate === "compact") {
      return (
        <CompactLayout sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>
          {children}
        </CompactLayout>
      );
    }

    // Elegant Layout
    if (layoutTemplate === "elegant") {
      return (
        <ElegantLayout sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>
          {children}
        </ElegantLayout>
      );
    }

    // Floating Layout
    if (layoutTemplate === "floating") {
      return (
        <FloatingLayout sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>
          {children}
        </FloatingLayout>
      );
    }

    // Modern Layout
    if (layoutTemplate === "modern") {
      return (
        <ModernLayout sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>
          {children}
        </ModernLayout>
      );
    }

    // Tabbed Layout
    if (layoutTemplate === "tabbed") {
      return (
        <TabbedLayout sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>
          {children}
        </TabbedLayout>
      );
    }

    // Dual Layout
    if (layoutTemplate === "dual") {
      return (
        <DualLayout sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>
          {children}
        </DualLayout>
      );
    }

    if (layoutTemplate === "command") {
      return <CommandLayout>{children}</CommandLayout>;
    }
    if (layoutTemplate === "stacked") {
      return <StackedLayout>{children}</StackedLayout>;
    }
    if (layoutTemplate === "hud") {
      return <HUDLayout>{children}</HUDLayout>;
    }
    if (layoutTemplate === "minimal") {
      return <MinimalLayout>{children}</MinimalLayout>;
    }
    if (layoutTemplate === "dock") {
      return <DockLayout>{children}</DockLayout>;
    }
    if (layoutTemplate === "executive") {
      return <ExecutiveLayout>{children}</ExecutiveLayout>;
    }
    if (layoutTemplate === "magazine") {
      return <MagazineLayout>{children}</MagazineLayout>;
    }
    if (layoutTemplate === "spotlight") {
      return <SpotlightLayout>{children}</SpotlightLayout>;
    }
    if (layoutTemplate === "glassmorphism") {
      return <GlassmorphismLayout>{children}</GlassmorphismLayout>;
    }
    if (layoutTemplate === "galaxy") {
      return <GalaxyLayout>{children}</GalaxyLayout>;
    }
    if (layoutTemplate === "neon") {
      return <NeonLayout>{children}</NeonLayout>;
    }
    if (layoutTemplate === "retro") {
      return <RetroLayout>{children}</RetroLayout>;
    }
    if (layoutTemplate === "aurora") {
      return <AuroraLayout>{children}</AuroraLayout>;
    }
    if (layoutTemplate === "rail") {
      return <RailLayout>{children}</RailLayout>;
    }
    if (layoutTemplate === "newspaper") {
      return <NewspaperLayout>{children}</NewspaperLayout>;
    }
    if (layoutTemplate === "cinema") {
      return <CinemaLayout>{children}</CinemaLayout>;
    }
    if (layoutTemplate === "vault") {
      return <VaultLayout>{children}</VaultLayout>;
    }
    if (layoutTemplate === "bottombar") {
      return <BottomBarLayout>{children}</BottomBarLayout>;
    }
    if (layoutTemplate === "megamenu") {
      return <MegaMenuLayout>{children}</MegaMenuLayout>;
    }
    if (layoutTemplate === "breadcrumb") {
      return <BreadcrumbLayout>{children}</BreadcrumbLayout>;
    }
    if (layoutTemplate === "ribbon") {
      return <RibbonLayout>{children}</RibbonLayout>;
    }
    if (layoutTemplate === "treeview") {
      return <TreeViewLayout>{children}</TreeViewLayout>;
    }
    if (layoutTemplate === "overlay") {
      return <OverlayLayout>{children}</OverlayLayout>;
    }
    if (layoutTemplate === "hub") {
      return <HubLayout>{children}</HubLayout>;
    }
    if (layoutTemplate === "wizard") {
      return <WizardLayout>{children}</WizardLayout>;
    }
    if (layoutTemplate === "shelf") {
      return <ShelfLayout>{children}</ShelfLayout>;
    }
    if (layoutTemplate === "collapseheader") {
      return <CollapseHeaderLayout>{children}</CollapseHeaderLayout>;
    }
    if (layoutTemplate === "splitpane") {
      return <SplitPaneLayout>{children}</SplitPaneLayout>;
    }
    if (layoutTemplate === "inbox") {
      return <InboxLayout>{children}</InboxLayout>;
    }
    if (layoutTemplate === "dualheader") {
      return <DualHeaderLayout>{children}</DualHeaderLayout>;
    }
    if (layoutTemplate === "topside") {
      return <TopSideLayout>{children}</TopSideLayout>;
    }
    if (layoutTemplate === "focus") {
      return <FocusLayout>{children}</FocusLayout>;
    }
    if (layoutTemplate === "multipanel") {
      return <MultiPanelLayout>{children}</MultiPanelLayout>;
    }
    if (layoutTemplate === "kanban") {
      return <KanbanLayout>{children}</KanbanLayout>;
    }
    if (layoutTemplate === "bento") {
      return <BentoLayout>{children}</BentoLayout>;
    }
    if (layoutTemplate === "chat") {
      return <ChatLayout>{children}</ChatLayout>;
    }
    if (layoutTemplate === "map") {
      return <MapLayout>{children}</MapLayout>;
    }
    if (layoutTemplate === "feed") {
      return <FeedLayout>{children}</FeedLayout>;
    }
    if (layoutTemplate === "calendar") {
      return <CalendarLayout>{children}</CalendarLayout>;
    }
    if (layoutTemplate === "crm") {
      return <CRMLayout>{children}</CRMLayout>;
    }
    if (layoutTemplate === "terminal") {
      return <TerminalLayout>{children}</TerminalLayout>;
    }

    // Navigation Layout (explicit branch)
    if (layoutTemplate === "navigation") {
      return (
        <NavigationLayout sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>
          {children}
        </NavigationLayout>
      );
    }

    // ── Default: Nexus Layout (fallback for any unknown/invalid layout value) ──
    // Nexus is the system default (defaults.ts: layoutTemplate: "nexus").
    return <NexusLayout>{children}</NexusLayout>;
  }; // end renderLayout

  // Nexus needs a flex-column wrapper so the banners flow above it
  if (layoutTemplate === "nexus") {
    return (
      <>
        <PaymentWallDialog />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100dvh",
            overflow: "hidden",
          }}
        >
          <TenantContextBanner />
          <GracePeriodBanner />
          {renderLayout()}
        </div>
      </>
    );
  }

  return (
    <>
      <TenantContextBanner />
      <GracePeriodBanner />
      <PaymentWallDialog />
      {renderLayout()}
    </>
  );
}
