"use client";

/**
 * HubTopBar — Minimal topbar for the Hub page.
 *
 * Design: SCRIPE logo | spacer | "Jump to anything · /" | (⊞ optional) | 🔔 | 🌐 | ☀ | divider | UserProfileDropdown
 * Background: opaque nx-surface behind a hairline (56px / h-14), aligned with NexusTopbar.
 */

import React, { useCallback, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Grid3x3, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { BRAND } from "@core/config/branding";
import { Button } from "@core/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@core/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { NotificationBell } from "@core/ui/notification/NotificationBell";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { NxThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import { useAppStore } from "@core/store/useAppStore";
import { useAuthLogout } from "@modules/auth/core/src/presentation/viewmodels/useAuthLogout";
import { useResolvedFileUrl } from "@core/hooks/use-resolved-file-url";
import { useSettings } from "@core/providers/settings-provider";
import { appLogger } from "@core/common/logger";
import { cn } from "@core/common/utils";

interface HubTopBarProps {
  onSearchClick?: () => void;
  onAppLauncherClick?: () => void;
}

const ICON_BUTTON =
  "inline-flex h-8 w-8 sm:h-[34px] sm:w-[34px] shrink-0 items-center justify-center rounded-nx-md border border-nx-line text-nx-ink-2 transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover hover:text-nx-ink focus-visible:outline-none focus-visible:shadow-nx-focus motion-reduce:transition-none";

export function HubTopBar({ onSearchClick, onAppLauncherClick }: HubTopBarProps) {
  const { t } = useI18n();
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const { logout } = useAuthLogout();
  const settings = useSettings();
  const resolvedAvatarUrl = useResolvedFileUrl(user?.profileImageUrl);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearchTrigger = useCallback(() => {
    if (onSearchClick) {
      onSearchClick();
      return;
    }
    const input = document.getElementById("hub-search-input");
    if (input instanceof HTMLInputElement) {
      input.focus();
      input.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [onSearchClick]);

  const firstInitial = user?.firstName?.charAt(0)?.toUpperCase() || "";
  const lastInitial = user?.lastName?.charAt(0)?.toUpperCase() || "";
  const userInitials =
    `${firstInitial}${lastInitial}` || user?.username?.slice(0, 2).toUpperCase() || "U";
  const displayName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.username || t("common.user")
    : t("common.user");
  const emailLine = (user?.email || user?.username || "").trim();
  const showEmailLine = emailLine.length > 0 && emailLine !== displayName;

  const handleSignOut = async () => {
    try {
      await logout();
      setMenuOpen(false);
    } catch (error) {
      appLogger.error("Logout failed:", error);
    }
  };

  return (
    <header className="relative z-header flex h-14 w-full max-w-full min-w-0 shrink-0 items-center gap-1.5 overflow-x-clip border-b border-nx-line bg-nx-surface px-2.5 sm:gap-2.5 sm:px-6 lg:px-8">
      {/* SCRIPE wordmark — canonical flat Relay Grid mark */}
      <div className="inline-flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
        <Image src="/brand/app-logo.svg" alt="" width={22} height={22} aria-hidden="true" />
        <span className="text-xs sm:text-sm font-bold tracking-[0.06em] sm:tracking-[0.12em] text-nx-ink">
          {BRAND?.name ?? "SCRIPE"}
        </span>
      </div>

      {/* Spacer */}
      <div className="min-w-0 flex-1" />

      {/* Search shortcut (opens NexusSearchPalette or focuses HubSearch) */}
      <Button
        type="button"
        variant="ghost"
        onClick={handleSearchTrigger}
        aria-label={t("workspaceHub.jumpTo")}
        className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-nx-md border border-nx-line p-0 text-nx-ink-2 transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover hover:text-nx-ink focus-visible:shadow-nx-focus focus-visible:outline-none sm:h-[34px] md:w-auto md:gap-2.5 md:px-3 motion-reduce:transition-none"
      >
        <Search size={14} strokeWidth={1.75} aria-hidden="true" />
        <span className="hidden text-xs md:inline">{t("workspaceHub.jumpTo")}</span>
        <span aria-hidden="true" className="hidden text-nx-ink-3 md:inline">
          ·
        </span>
        <kbd className="hidden rounded-nx-sm border border-nx-line bg-nx-raised px-1.5 py-0.5 text-[11px] font-medium text-nx-ink-2 md:inline-block">
          /
        </kbd>
      </Button>

      {/* App switcher → opens NexusAppLauncher when mounted inside NexusLayout */}
      {onAppLauncherClick && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("workspaceHub.topbar.appSwitcher")}
          onClick={onAppLauncherClick}
          className={cn("cursor-pointer", ICON_BUTTON)}
        >
          <Grid3x3 size={16} strokeWidth={1.75} aria-hidden="true" />
        </Button>
      )}

      {/* Real-time Notifications bell + popover */}
      <NotificationBell className={ICON_BUTTON} />

      {/* Language & Theme switchers aligned with NexusTopbar */}
      <LanguageSwitcher buttonClassName="h-8 sm:h-[34px] shrink-0 border border-nx-line px-2 sm:px-2.5 text-xs" />
      <NxThemeSwitcher
        variant="ghost"
        buttonClassName="h-8 w-8 sm:h-[34px] sm:w-[34px] shrink-0 rounded-nx-md border border-nx-line text-nx-ink-2 hover:text-nx-ink"
      />

      {/* Divider */}
      <div aria-hidden="true" className="hidden h-[22px] w-px bg-nx-line md:block" />

      {/* Single Identity cluster — crisp high-contrast initials in Dark & Light, compact on mobile */}
      {user && settings.showUserAvatar && (
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              aria-label={displayName}
              className="flex h-8 sm:h-9 shrink-0 items-center gap-2 rounded-full border border-nx-line bg-nx-surface p-0.5 md:pe-2.5 text-nx-ink hover:bg-nx-hover focus-visible:outline-none focus-visible:shadow-nx-focus"
            >
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border border-nx-line shrink-0">
                {resolvedAvatarUrl && <AvatarImage src={resolvedAvatarUrl} alt={displayName} />}
                <AvatarFallback className="bg-nx-accent-fill text-nx-on-fill text-xs font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline max-w-[140px] truncate text-xs font-medium text-nx-ink">
                {displayName}
              </span>
              <ChevronDown
                className="hidden md:inline h-3.5 w-3.5 text-nx-ink-3 shrink-0"
                aria-hidden="true"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-nx-popover border-nx-line text-nx-ink">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1 min-w-0">
                <p className="text-sm font-medium leading-none truncate">{displayName}</p>
                {showEmailLine && (
                  <p className="text-xs leading-none text-nx-ink-3 font-mono truncate">{emailLine}</p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-nx-line" />
            <DropdownMenuItem
              onClick={() => {
                router.push("/account/dossier");
                setMenuOpen(false);
              }}
              className="cursor-pointer hover:bg-nx-hover"
            >
              <User className="me-2 h-4 w-4 text-nx-ink-3" aria-hidden="true" />
              <span>{t("nav.profile")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                router.push("/settings");
                setMenuOpen(false);
              }}
              className="cursor-pointer hover:bg-nx-hover"
            >
              <Settings className="me-2 h-4 w-4 text-nx-ink-3" aria-hidden="true" />
              <span>{t("nav.settings")}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-nx-line" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{t("nav.logout")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
