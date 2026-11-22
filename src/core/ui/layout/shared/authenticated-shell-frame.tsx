"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
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
import { useIsFetching } from "@tanstack/react-query";
import { DataExchangeFloatingDock } from "@core/data-exchange/presentation/components/DataExchangeFloatingDock";

// ── Content gate fallback ───────────────────────────────────────────────────
// Shown on page refresh while the settings/branding/routes gates settle (see
// shouldBlockContent below). Fresh logins get the richer welcome loader instead.
function LayoutLoadingFallback() {
  return (
    <div className="flex h-[100dvh] items-center justify-center bg-nx-ground">
      <LoadingSpinner />
    </div>
  );
}

/**
 * Full-screen welcome curtain shown briefly after a fresh sign-in while initial
 * branding, settings, and navigation bootstrap settle.
 */
function LoginWelcomeLoader() {
  const user = useAppStore((state) => state.user);
  const { t } = useI18n();

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

/** Props for {@link AuthenticatedShellFrame}. */
export interface AuthenticatedShellFrameProps {
  /** Shell or standalone launchpad content rendered inside the authenticated frame. */
  children: React.ReactNode;
}

/**
 * Shared authenticated bootstrap frame used by both `(modules)` (`DashboardLayout` -> `NexusLayout`)
 * and standalone `(hub)` (`/hub` Launchpad). Encapsulates tenant branding hydration, settings
 * merge settlement, fresh-login welcome curtain, payment wall, context/grace banners, and
 * background Data Exchange dock without imposing the dual-rail shell.
 */
export function AuthenticatedShellFrame({ children }: AuthenticatedShellFrameProps) {
  const [isFreshLogin] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(STORAGE_KEYS.JUST_LOGGED_IN) === "1";
    } catch {
      return false;
    }
  });

  return (
    <TenantBrandingProvider>
      <AuthenticatedShellFrameContent isFreshLogin={isFreshLogin}>
        {children}
      </AuthenticatedShellFrameContent>
    </TenantBrandingProvider>
  );
}

function AuthenticatedShellFrameContent({
  children,
  isFreshLogin,
}: {
  children: React.ReactNode;
  isFreshLogin: boolean;
}) {
  const { isSettingsReady, isTransitioning } = useAdminSettingsSync();
  const { isLoading: isBrandingLoading } = useTenantBranding();

  const isInitialLoading = useNavigationStore((s) => s.isInitialLoading);
  const routesLoadedAt = useNavigationStore((s) => s.routesLoadedAt);
  const routesError = useNavigationStore((s) => s.routesError);

  const [isSettingsMergeSettled, setIsSettingsMergeSettled] = useState(!isFreshLogin);

  useEffect(() => {
    if (!isBrandingLoading && !isSettingsMergeSettled) {
      const raf = requestAnimationFrame(() => setIsSettingsMergeSettled(true));
      const fallback = setTimeout(() => setIsSettingsMergeSettled(true), 500);
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(fallback);
      };
    }
  }, [isBrandingLoading, isSettingsMergeSettled]);

  const isNavReady = !isInitialLoading && routesLoadedAt !== null;
  const isSettingsCompleted = isSettingsReady && !isTransitioning;

  // Release the fresh-login blocking curtain immediately if navigation bootstrap errors
  // so <NavigationErrorRecovery> can mount without waiting for routesLoadedAt or timeout.
  const shouldBlockContent =
    routesError !== null
      ? false
      : isFreshLogin
        ? !isSettingsCompleted || isBrandingLoading || !isSettingsMergeSettled || !isNavReady
        : false;

  const isFetching = useIsFetching();
  const [showWelcomeOverlay, setShowWelcomeOverlay] = useState(isFreshLogin);
  const [hasMinTimePassed, setHasMinTimePassed] = useState(false);

  useEffect(() => {
    if (isFreshLogin) {
      const timer = setTimeout(() => {
        setHasMinTimePassed(true);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [isFreshLogin]);

  useEffect(() => {
    if (isFreshLogin && showWelcomeOverlay && !shouldBlockContent && hasMinTimePassed) {
      if (isFetching > 0) {
        const timeout = setTimeout(() => {
          setShowWelcomeOverlay(false);
        }, 3000);
        return () => clearTimeout(timeout);
      } else {
        const timer = setTimeout(() => {
          setShowWelcomeOverlay(false);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [isFreshLogin, showWelcomeOverlay, shouldBlockContent, hasMinTimePassed, isFetching]);

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
    return isFreshLogin ? <LoginWelcomeLoader /> : <LayoutLoadingFallback />;
  }

  return (
    <>
      {showWelcomeOverlay && !routesError && <LoginWelcomeLoader />}
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
        {children}
      </div>
      <DataExchangeFloatingDock />
    </>
  );
}
