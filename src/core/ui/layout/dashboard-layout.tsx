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
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { useAppStore } from "@core/store/useAppStore";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { useResolvedFileUrl } from "@core/hooks/use-resolved-file-url";

// Nexus is the only shell — statically imported (always needed, no lazy-load
// delay). The multi-layout system was retired in favour of this single
// workspace shell governed entirely by the settings provider tokens/attributes;
// every user renders nexus.
import { NexusLayout } from "@core/ui/layout/nexus/nexus-layout";
import { useIsFetching } from "@tanstack/react-query";

// ── Content gate fallback ───────────────────────────────────────────────────
// Shown on page refresh while the settings/branding/routes gates settle (see
// shouldBlockContent below). Fresh logins get the richer welcome loader
// instead. This used to be a hand-built shimmer — a pulsing block above a
// spinning block — which is two idle animations standing in for the one
// loader the system already owns.
function LayoutLoadingFallback() {
  return (
    <div className="flex h-[100dvh] items-center justify-center bg-nx-ground">
      <LoadingSpinner />
    </div>
  );
}

function LoginWelcomeLoader() {
  const user = useAppStore((state) => state.user);
  const { t } = useI18n();

  // Hook runs unconditionally regardless of `user` — it already handles
  // null/undefined input gracefully.
  const resolvedAvatarUrl = useResolvedFileUrl(user?.profileImageUrl);
  const avatarUrl = user ? resolvedAvatarUrl || undefined : undefined;

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
    return `${firstName} ${lastName}`.trim() || user.username || t("common.user");
  };

  const nameForWelcome = user?.firstName || user?.username || t("common.user");

  return (
    <div className="fixed inset-0 z-modal flex select-none flex-col items-center justify-center overflow-hidden bg-nx-ground">
      {/* Welcome card. The ambient accent wash and the injected keyframe bar
          that used to live here were a second design system: a stylesheet
          smuggled into a component, an indeterminate bar the user could not
          tell apart from a stalled request, and a page-wide glow that spent
          the signature on wallpaper. The card is now structure — a hairline
          on a surface step — and the one lit thing is the avatar. */}
      <div className="mx-4 flex w-full max-w-sm flex-col items-center justify-center rounded-nx-lg border border-nx-line bg-nx-surface p-8 shadow-nx-modal duration-nx-standard ease-nx-enter animate-in fade-in">
        <Avatar className="h-24 w-24 border-2 border-nx-accent shadow-nx-glow">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={getDisplayName()} />}
          <AvatarFallback
            delayMs={600}
            className="bg-nx-accent-fill text-3xl font-bold text-nx-on-fill duration-nx-standard ease-nx-enter animate-in fade-in"
          >
            {getInitials()}
          </AvatarFallback>
        </Avatar>

        <h2 className="mt-6 text-balance text-center text-xl font-bold leading-tight tracking-tight text-nx-ink">
          {getDisplayName()}
        </h2>

        <p className="mt-3 text-pretty text-center text-sm leading-relaxed text-nx-ink-2">
          {t("common.welcomeBack", { name: nameForWelcome })}
        </p>

        <p className="mt-1 text-center text-xs leading-relaxed text-nx-ink-3">
          {t("common.gettingReady")}
        </p>

        <LoadingSpinner size="sm" showText={false} className="mt-4 py-0" />
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
  // No useI18n() here: this component renders no copy of its own and NexusLayout
  // reads the direction itself, so the subscription was a re-render for nothing.
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
    // Fresh login → welcome card; Page refresh → the shared loader
    return isFreshLogin ? <LoginWelcomeLoader /> : <LayoutLoadingFallback />;
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
