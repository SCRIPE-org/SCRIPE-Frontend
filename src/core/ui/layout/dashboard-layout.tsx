"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useAdminSettingsSync } from "@core/providers/useAdminSettingsSync";
import {
  TenantBrandingProvider,
  useTenantBranding,
} from "@core/providers/tenant-branding-provider";
import { TenantContextBanner } from "@core/ui/layout/shared/tenant-context-banner";
import { GracePeriodBanner } from "@core/components/GracePeriodBanner";
import { PaymentWallDialog } from "@core/components/PaymentWallDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@core/ui/avatar";
import { useAppStore } from "@core/store/useAppStore";
import { useWorkspace } from "@core/providers/workspace-provider";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { resolveFileUrl } from "@core/common/utils";

// Nexus is the only shell — statically imported (always needed, no lazy-load
// delay). The multi-layout system was retired in favour of this single
// workspace shell governed entirely by the settings provider tokens/attributes;
// every user renders nexus.
import { NexusLayout } from "@core/ui/layout/nexus/nexus-layout";
import { useIsFetching } from "@tanstack/react-query";

// ── Content gate shimmer ────────────────────────────────────────────────────
// Shown on page refresh while the settings/branding/routes gates settle (see
// shouldBlockContent below). Fresh logins get the richer welcome loader
// instead. Lightweight pulse so the refresh path never flashes a blank frame.
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

function LoginWelcomeLoader() {
  const user = useAppStore((state) => state.user);
  const { t } = useI18n();
  const { accentColor } = useWorkspace();
  // Theme resolves in CSS via the --nx- token layer, not a JS isDark branch:
  // --nx-accent/--nx-accent-fill already carry the correct light/dark value.
  const accent = accentColor ?? "var(--nx-accent)";

  const avatarUrl = user ? resolveFileUrl(user.profileImageUrl) || undefined : undefined;
  const avatarGradient = `linear-gradient(135deg, color-mix(in oklch, ${accent} 80%, transparent) 0%, var(--nx-accent-fill) 100%)`;

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
    <div className="fixed inset-0 z-[9999] flex h-screen w-screen select-none flex-col items-center justify-center overflow-hidden bg-background">
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
      <div className="relative z-10 mx-4 flex w-full max-w-sm flex-col items-center justify-center rounded-2xl border border-border/40 bg-card/40 p-8 shadow-2xl backdrop-blur-md duration-500 animate-in fade-in">
        {/* Avatar Ring glow — one-shot entrance, not an idle loop. It fires
            once when the welcome card mounts and then sits still; a glow
            that breathes forever behind a static avatar is decoration, not
            a loading signal (the shimmer above and the progress bar below
            are the real loading indicators on this screen). */}
        <div className="relative flex items-center justify-center">
          <div
            className="absolute -inset-2 rounded-full opacity-35 blur-sm duration-nx-panel ease-nx-enter animate-in fade-in zoom-in-95 motion-reduce:zoom-in-100"
            style={{
              background: `radial-gradient(circle, ${accent} 0%, transparent 80%)`,
            }}
          />
          <div
            className="absolute -inset-1.5 rounded-full opacity-55"
            style={{
              border: `2px solid ${accent}`,
            }}
          />
          <Avatar className="relative h-24 w-24 border-4 border-background shadow-xl">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={getDisplayName()} />}
            <AvatarFallback
              delayMs={600}
              style={{ background: avatarGradient }}
              className="text-3xl font-bold text-white duration-300 animate-in fade-in"
            >
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Text Details */}
        <h2 className="mt-6 text-center text-2xl font-extrabold tracking-tight text-foreground">
          {getDisplayName()}
        </h2>

        <p className="mt-3 text-center text-base font-semibold text-muted-foreground">
          {t("common.welcomeBack", { name: nameForWelcome })}
        </p>

        <p className="mt-1 text-center text-xs text-muted-foreground/75">
          {t("common.gettingReady")}
        </p>

        {/* Premium Loading Progress Bar */}
        <div className="relative mt-8 h-1 w-48 overflow-hidden rounded-full bg-muted">
          <div
            className="animate-indeterminate absolute bottom-0 left-0 top-0 rounded-full"
            style={{
              background: accent,
            }}
          />
        </div>
      </div>
    </div>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  // Detect "fresh login" vs "page refresh": sessionStorage flag is set by
  // useAppStore.setAuth() and survives the redirect to /dashboard, but
  // does NOT survive a new browser tab or manual URL entry.
  const [isFreshLogin] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(STORAGE_KEYS.JUST_LOGGED_IN) === "1";
    } catch {
      return false;
    }
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
function DashboardLayoutContent({
  children,
  isFreshLogin,
}: {
  children: React.ReactNode;
  isFreshLogin: boolean;
}) {
  const { isSettingsReady, isTransitioning } = useAdminSettingsSync();
  const settings = useSettings();
  const { isLoading: isBrandingLoading } = useTenantBranding();
  const [sidebarOpen, setSidebarOpen] = useState(settings.collapsibleSidebar ? false : true);
  const { direction } = useI18n();
  const { collapsibleSidebar } = settings;

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
  //         with dashboardThemeJson (may change tokens/attributes). Without this
  //         extra-frame gate, React renders with STALE settings for 1 frame
  //         then re-renders with the correct ones → flash. By holding the gate
  //         for one rAF, the re-merge commits and the shell renders with the
  //         FINAL merged settings on first paint.
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
  // On page refresh (isFreshLogin = false), we do NOT block rendering the layout or children.
  // This allows the layout and its skeletonized components to show immediately.
  const shouldBlockContent = isFreshLogin
    ? !isSettingsCompleted || isBrandingLoading || !isSettingsMergeSettled || !isNavReady
    : false;

  const isFetching = useIsFetching();
  const [showWelcomeOverlay, setShowWelcomeOverlay] = useState(isFreshLogin);
  const [hasMinTimePassed, setHasMinTimePassed] = useState(false);

  // Start timer for minimum welcome loader display duration
  useEffect(() => {
    if (isFreshLogin) {
      const timer = setTimeout(() => {
        setHasMinTimePassed(true);
      }, 2200); // 2.2 seconds minimum welcome loader display
      return () => clearTimeout(timer);
    }
  }, [isFreshLogin]);

  // Turn off welcome overlay when gates are ready, minimum time has passed, and active fetches have finished
  useEffect(() => {
    if (isFreshLogin && showWelcomeOverlay && !shouldBlockContent && hasMinTimePassed) {
      // If we are still fetching dashboard data, wait until fetching drops to 0 (or up to a 3-second max timeout)
      if (isFetching > 0) {
        const timeout = setTimeout(() => {
          setShowWelcomeOverlay(false);
        }, 3000); // wait at most 3 additional seconds for queries to settle
        return () => clearTimeout(timeout);
      } else {
        // Defer state update to next microtask/frame to avoid synchronous cascading renders warning
        const timer = setTimeout(() => {
          setShowWelcomeOverlay(false);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [isFreshLogin, showWelcomeOverlay, shouldBlockContent, hasMinTimePassed, isFetching]);

  // ── Both gates passed — clear the "just logged in" flag ──
  // This MUST happen after the welcome loader overlay has finished and is hidden.
  useEffect(() => {
    if (isFreshLogin && !showWelcomeOverlay && typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(STORAGE_KEYS.JUST_LOGGED_IN);
      } catch {
        /* ignore */
      }
    }
  }, [isFreshLogin, showWelcomeOverlay]);

  if (shouldBlockContent) {
    // Fresh login → premium welcome card; Page refresh → lightweight shimmer
    return isFreshLogin ? <LoginWelcomeLoader /> : <LayoutLoadingShimmer />;
  }

  // ── Compute layout content (rendered below the tenant banner) ──
  // The per-layout switch was retired: nexus is the only shell now. Any stored
  // layoutTemplate value — including a corrupt one or a legacy name that no
  // longer exists — renders nexus, so the user always lands somewhere
  // known-good. The merge-engine migration also normalises stored values to
  // "nexus" (see migrateStoredSettings), making this defence in depth.
  const renderLayout = () => <NexusLayout>{children}</NexusLayout>;

  // Nexus is a fixed-viewport shell: it needs a flex-column wrapper so the
  // banners flow above it inside a non-scrolling page.
  return (
    <>
      {showWelcomeOverlay && <LoginWelcomeLoader />}
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
