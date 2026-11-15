"use client";

/**
 * HubTopBar — Minimal topbar for the Hub page.
 *
 * Design: SCRIPE logo | spacer | "Jump to anything · /" | (⊞ optional) | 🔔 | 🌐 | ☀ | divider | UserProfileDropdown
 * Background: opaque nx-surface behind a hairline (56px / h-14), aligned with NexusTopbar.
 */

import React, { useCallback } from "react";
import Image from "next/image";
import { Search, Grid3x3 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { BRAND } from "@core/config/branding";
import { Button } from "@core/ui/button";
import { NotificationBell } from "@core/ui/notification/NotificationBell";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { NxThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { cn } from "@core/common/utils";

interface HubTopBarProps {
  onSearchClick?: () => void;
  onAppLauncherClick?: () => void;
}

const ICON_BUTTON =
  "inline-flex h-[34px] w-[34px] items-center justify-center rounded-nx-md border border-nx-line text-nx-ink-2 transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover hover:text-nx-ink focus-visible:outline-none focus-visible:shadow-nx-focus motion-reduce:transition-none";

export function HubTopBar({ onSearchClick, onAppLauncherClick }: HubTopBarProps) {
  const { t } = useI18n();

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

  return (
    <header className="relative z-header flex h-14 shrink-0 items-center gap-2 border-b border-nx-line bg-nx-surface px-4 sm:gap-3 sm:px-6 lg:px-8">
      {/* SCRIPE wordmark — canonical flat Relay Grid mark */}
      <div className="inline-flex shrink-0 items-center gap-2">
        <Image src="/brand/app-logo.svg" alt="" width={22} height={22} aria-hidden="true" />
        <span className="text-sm font-bold tracking-[0.12em] text-nx-ink">
          {BRAND?.name ?? "SCRIPE"}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search shortcut (opens NexusSearchPalette or focuses HubSearch) */}
      <Button
        type="button"
        variant="ghost"
        onClick={handleSearchTrigger}
        aria-label={t("workspaceHub.jumpTo")}
        className="inline-flex h-[34px] cursor-pointer items-center gap-2 rounded-nx-md border border-nx-line px-2.5 text-nx-ink-2 transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover hover:text-nx-ink focus-visible:shadow-nx-focus focus-visible:outline-none sm:gap-2.5 sm:px-3 motion-reduce:transition-none"
      >
        <Search size={14} strokeWidth={1.75} aria-hidden="true" />
        <span className="hidden text-xs sm:inline">{t("workspaceHub.jumpTo")}</span>
        <span aria-hidden="true" className="hidden text-nx-ink-3 sm:inline">
          ·
        </span>
        <kbd className="hidden rounded-nx-sm border border-nx-line bg-nx-raised px-1.5 py-0.5 text-[11px] font-medium text-nx-ink-2 sm:inline-block">
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
      <LanguageSwitcher buttonClassName="h-[34px] border border-nx-line" />
      <NxThemeSwitcher
        variant="ghost"
        buttonClassName="h-[34px] w-[34px] rounded-nx-md border border-nx-line text-nx-ink-2 hover:text-nx-ink"
      />

      {/* Divider */}
      <div aria-hidden="true" className="hidden h-[22px] w-px bg-nx-line sm:block" />

      {/* Single Identity cluster */}
      <UserProfileDropdown
        variant="compact"
        showName
        align="end"
        className="h-9 rounded-full border border-nx-line bg-nx-surface hover:bg-nx-hover"
      />
    </header>
  );
}
