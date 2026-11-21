"use client";

/**
 * Sovereign Account Console Layout
 *
 * Standalone, focused account & security layout for SCRIPE Sovereign Account World v3.0.
 * Completely decoupled from the operational dashboard: NO sidebars, NO workspace rails, and NO module navigation.
 * Hosts the global ⌘K / Ctrl+K <SovereignCommandBar>, Alt+P Broadcast Privacy Mode toggle,
 * back-to-workspace return link, theme/language controls, and the persistent account console viewport.
 */
import React, { Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useSudoStore } from "@core/store/useSudoStore";
import { usePatOneTimeSecretStore } from "@core/store/usePatOneTimeSecretStore";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { useAuthLogout } from "@modules/auth/core/src/presentation/viewmodels/useAuthLogout";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { NxThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import { TenantContextBanner } from "@core/ui/layout/shared/tenant-context-banner";
import { Avatar, AvatarFallback, AvatarImage } from "@core/ui/avatar";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import {
  ArrowLeft,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Search,
  EyeOff,
  Eye,
  User as UserIcon,
} from "lucide-react";
import { SovereignCommandBar } from "@modules/profile/core/src/presentation/components/SovereignCommandBar";
import { useAccountPreferencesSliceViewModel } from "@modules/profile/core/src/presentation/viewmodels/useSovereignAccountSlicesViewModel";
import { startRoutingProgress } from "@core/ui/routing-progress-bar";
import {
  ProfileRailSidebarSkeleton,
  ProfileTelemetryHudSkeleton,
} from "@modules/profile/core/src/presentation/components/AccountSkeletons";

const PRIVACY_BLUR_STORAGE_KEY = "scr_pref_privacy_blur";
const emptySubscribe = () => () => {};
const getClientMountedSnapshot = () => true;
const getServerMountedSnapshot = () => false;

function readInitialStoredPrivacyBlur(): boolean {
  if (typeof window === "undefined") return false;
  if (document.documentElement.hasAttribute("data-privacy-blur")) return true;
  try {
    return window.localStorage.getItem(PRIVACY_BLUR_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function AccountWorldShellFallback() {
  const { t } = useI18n();
  return (
    <output
      aria-busy="true"
      aria-label={t("profile.common.loadingRegion")}
      data-testid="account-world-shell-skeleton"
      className="block w-full min-w-0 max-w-7xl mx-auto py-2 sm:py-4 overflow-x-clip"
    >
      <ProfileTelemetryHudSkeleton />
      <div className="flex flex-col lg:flex-row gap-6 items-start min-w-0 w-full">
        <aside className="w-full lg:w-64 xl:w-72 shrink-0 min-w-0">
          <ProfileRailSidebarSkeleton />
        </aside>
        <section className="flex-1 min-w-0 w-full space-y-5">
          <Card className="border border-nx-line bg-nx-surface p-5 space-y-3">
            <Skeleton shape="title" className="h-5 w-48" />
            <Skeleton shape="text" className="h-3.5 w-72" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <Skeleton shape="block" className="h-16 w-full rounded-xl" />
              <Skeleton shape="block" className="h-16 w-full rounded-xl" />
            </div>
          </Card>
          <Card className="border border-nx-line bg-nx-surface p-5 space-y-3">
            <Skeleton shape="title" className="h-5 w-40" />
            <Skeleton shape="block" className="h-24 w-full rounded-xl" />
          </Card>
        </section>
      </div>
    </output>
  );
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { t } = useI18n();
  const user = useAppStore((s) => s.user);
  const landingResolution = useNavigationStore((s) => s.landingResolution);
  const { handleLogout } = useAuthLogout();
  const { preferences, updatePreferences } = useAccountPreferencesSliceViewModel();
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    getClientMountedSnapshot,
    getServerMountedSnapshot
  );
  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const [privacyBlurOverride, setPrivacyBlurOverride] = useState<boolean | null>(null);

  const persistedPrivacyBlur =
    preferences?.broadcastPrivacyBlurDefault ??
    (isMounted ? readInitialStoredPrivacyBlur() : false);
  const privacyBlur = isMounted ? (privacyBlurOverride ?? persistedPrivacyBlur) : false;

  const togglePrivacyBlur = () => {
    const next = !privacyBlur;
    setPrivacyBlurOverride(next);
    if (typeof window !== "undefined") {
      document.documentElement.toggleAttribute("data-privacy-blur", next);
      try {
        window.localStorage.setItem(PRIVACY_BLUR_STORAGE_KEY, next ? "true" : "false");
      } catch {
        // Ignore storage errors in restricted browsing contexts
      }
    }
    if (preferences) {
      void updatePreferences({ broadcastPrivacyBlurDefault: next })
        .catch(() => {})
        .finally(() => setPrivacyBlurOverride(null));
    }
  };

  const togglePrivacyBlurRef = useRef(togglePrivacyBlur);
  useEffect(() => {
    togglePrivacyBlurRef.current = togglePrivacyBlur;
  });

  useEffect(() => {
    if (!isMounted) return;
    document.documentElement.toggleAttribute("data-privacy-blur", privacyBlur);
    try {
      window.localStorage.setItem(PRIVACY_BLUR_STORAGE_KEY, privacyBlur ? "true" : "false");
    } catch {
      // Ignore storage errors in restricted browsing contexts
    }
  }, [isMounted, privacyBlur]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        togglePrivacyBlurRef.current();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSignOut = () => {
    useSudoStore.getState().reset();
    usePatOneTimeSecretStore.getState().clearPendingReceipt();
    void handleLogout("/login");
  };

  const dashboardBackRoute =
    landingResolution?.route && landingResolution.route !== "/" ? landingResolution.route : "/hub";

  const navigateToDashboard = () => {
    startRoutingProgress();
    router.push(dashboardBackRoute);
  };

  const displayName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.username || ""
    : "";

  const userInitials = user
    ? `${(user.firstName?.[0] ?? "").toUpperCase()}${(user.lastName?.[0] ?? "").toUpperCase()}` ||
      user.username?.slice(0, 2).toUpperCase() ||
      ""
    : "";

  return (
    <div
      data-sovereign-privacy-blur={privacyBlur ? "true" : "false"}
      className="min-h-[100dvh] w-full max-w-full overflow-x-clip flex flex-col bg-nx-ground text-nx-ink selection:bg-nx-accent-wash selection:text-nx-accent"
    >
      <a
        href="#account-content"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-3 focus:z-tooltip focus:inline-flex focus:items-center focus:rounded-nx-md focus:bg-nx-accent-fill focus:px-3 focus:py-2 focus:text-xs focus:font-semibold focus:text-nx-on-fill focus:shadow-nx-focus focus:outline-none"
      >
        {t("nav.skipToContent")}
      </a>

      <TenantContextBanner />

      {/* ── Top Standalone Sovereign Header ───────────────────────────────── */}
      <header className="sticky top-0 z-header w-full border-b border-nx-line bg-nx-surface">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-1.5 sm:gap-3 min-w-0">
          {/* Leading: Return to Dashboard Action + Brand Identity */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateToDashboard}
              aria-label={t("profile.accountPortal.backToDashboard")}
              className="gap-2 px-2 sm:px-3 text-xs sm:text-sm font-medium text-nx-ink-2 hover:text-nx-ink hover:bg-nx-raised transition-colors shrink-0"
            >
              <ArrowLeft className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden="true" />
              <span className="hidden sm:inline">{t("profile.accountPortal.backToDashboard")}</span>
            </Button>

            <div className="h-5 w-px bg-nx-line hidden md:block" />

            <Link
              href={dashboardBackRoute}
              className="hidden md:flex items-center gap-2.5 min-w-0 group rounded-nx-sm text-nx-ink focus-visible:outline-none focus-visible:shadow-nx-focus"
            >
              <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-nx-line bg-nx-raised text-nx-ink flex items-center justify-center p-1.5 shrink-0">
                <Image
                  src="/brand/app-logo.svg"
                  alt=""
                  width={20}
                  height={20}
                  aria-hidden="true"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm font-semibold tracking-tight text-nx-ink group-hover:text-nx-accent transition-colors leading-tight truncate">
                  {t("profile.accountPortal.brandTitle")}
                </span>
                <span className="text-[11px] font-medium text-nx-ink-2 font-mono leading-tight mt-0.5 truncate">
                  {t("profile.accountPortal.brandSubtitle")}
                </span>
              </div>
            </Link>
          </div>

          {/* Center / Trailing: ⌘K Command Bar, Alt+P Privacy Blur, Theme, Language, User Menu */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* ⌘K Sovereign Command Bar Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommandBarOpen(true)}
              aria-label={t("profile.commandBar.triggerLabel")}
              className="h-8 gap-1.5 sm:gap-2 border-nx-line bg-nx-raised text-nx-ink-2 hover:text-nx-ink text-xs px-2 sm:px-2.5"
              data-testid="sovereign-command-bar-trigger"
            >
              <Search className="h-3.5 w-3.5 text-nx-accent shrink-0" aria-hidden="true" />
              <span className="hidden md:inline">{t("profile.commandBar.triggerLabel")}</span>
              <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-mono border-nx-line text-nx-ink-3 px-1 py-0">
                ⌘K
              </Badge>
            </Button>

            {/* Alt+P Broadcast Privacy Mode Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={togglePrivacyBlur}
              aria-pressed={privacyBlur}
              aria-label={
                privacyBlur ? t("profile.privacyBlur.active") : t("profile.privacyBlur.toggle")
              }
              className={
                privacyBlur
                  ? "h-8 gap-1.5 border-nx-accent bg-nx-accent-wash text-nx-accent text-xs px-2 sm:px-2.5 font-semibold"
                  : "h-8 gap-1.5 border-nx-line bg-nx-raised text-nx-ink-2 hover:text-nx-ink text-xs px-2 sm:px-2.5"
              }
              data-testid="sovereign-privacy-blur-toggle"
            >
              {privacyBlur ? (
                <EyeOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              )}
              <span className="hidden lg:inline">
                {privacyBlur ? t("profile.privacyBlur.active") : t("profile.privacyBlur.toggle")}
              </span>
            </Button>

            <NxThemeSwitcher variant="ghost" />
            <LanguageSwitcher buttonClassName="px-2 sm:px-2.5 text-xs" />

            <div className="hidden sm:block h-5 w-px bg-nx-line mx-0.5 sm:mx-1" aria-hidden="true" />

            {/* User Account Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full p-0.5 hover:border-nx-line-hi focus-visible:outline-none focus-visible:shadow-nx-focus transition-colors h-8 w-8"
                  aria-label={t("profile.accountPortal.userAccountMenu")}
                >
                  {user ? (
                    <Avatar className="h-8 w-8 border border-nx-line">
                      {user.profileImageUrl && <AvatarImage src={user.profileImageUrl} alt={displayName} />}
                      <AvatarFallback className="bg-nx-accent-wash text-nx-accent text-xs font-bold">
                        {userInitials || <UserIcon className="h-4 w-4" aria-hidden="true" />}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Skeleton shape="circle" className="h-8 w-8" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 mt-1 border-nx-line bg-nx-surface text-nx-ink"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    {user ? (
                      <p className="text-sm font-semibold leading-none text-nx-ink truncate">
                        {displayName || `@${user.username}`}
                      </p>
                    ) : (
                      <Skeleton shape="text" className="h-3.5 w-28" />
                    )}
                    {user?.username && (
                      <p className="text-xs leading-none text-nx-ink-3 font-mono truncate">
                        @{user.username}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-nx-line" />
                <DropdownMenuItem
                  onClick={navigateToDashboard}
                  className="text-nx-ink hover:bg-nx-raised cursor-pointer"
                >
                  <LayoutDashboard className="me-2 h-4 w-4 text-nx-ink-3" aria-hidden="true" />
                  <span>{t("profile.accountPortal.mainDashboard")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-nx-line" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-nx-danger focus:text-nx-danger focus:bg-nx-danger/10 cursor-pointer"
                >
                  <LogOut className="me-2 h-4 w-4" aria-hidden="true" />
                  <span>{t("profile.accountPortal.signOut")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Broadcast Privacy Blur Active Banner */}
      {privacyBlur && (
        <div className="w-full border-b border-nx-line-hi bg-nx-accent-wash px-4 py-1.5 text-center text-xs font-medium text-nx-accent">
          {t("profile.privacyBlur.bannerNotice")}
        </div>
      )}

      {/* ── Main Sovereign Viewport (NO sidebars, clean width) ─────────────── */}
      <main
        id="account-content"
        tabIndex={-1}
        className={
          privacyBlur
            ? "flex-1 w-full min-w-0 overflow-x-clip max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 outline-none [&_code]:blur-xs [&_.font-mono]:blur-[3px]"
            : "flex-1 w-full min-w-0 overflow-x-clip max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 outline-none"
        }
      >
        <Suspense fallback={<AccountWorldShellFallback />}>{children}</Suspense>
      </main>

      {/* ── Clean Security & Compliance Footer ─────────────────────────────── */}
      <footer className="border-t border-nx-line py-5 text-center text-xs text-nx-ink-3 bg-nx-ground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 font-medium text-nx-ink-2">
            <ShieldCheck className="h-4 w-4 text-nx-accent shrink-0" aria-hidden="true" />
            <span>{t("profile.accountPortal.footerOrg")}</span>
          </div>
          <div className="text-[11px] text-nx-ink-3 font-mono">
            {t("profile.accountPortal.cryptoStandard")}
          </div>
        </div>
      </footer>

      <SovereignCommandBar
        open={commandBarOpen}
        onOpenChange={setCommandBarOpen}
        onTogglePrivacyBlur={togglePrivacyBlur}
      />
    </div>
  );
}
