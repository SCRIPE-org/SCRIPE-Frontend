"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, MoreHorizontal, Search } from "lucide-react";
import { BRAND } from "@core/config/branding";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { cn } from "@core/common/utils";
import { useAdminContext } from "@core/hooks/useAdminContext";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/providers/permission-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useTenantBranding } from "@core/providers/tenant-branding-provider";
import { useAppStore } from "@core/store/useAppStore";
import { Button } from "@core/ui/button";
import { LanguageSwitcher, NxThemeSwitcher } from "@core/ui/layout/common";
import { TopbarContextPill } from "@core/ui/layout/shared";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import type {
  HubNotificationsFeed,
  HubSignInActivityFeed,
} from "../../hub/src/domain/entities/HubPersonalFeed";
import { HubActivityPopover } from "./HubActivityPopover";
import { HubNotificationsPopover } from "./HubNotificationsPopover";

/** Props for {@link HubTopbar}. */
export interface HubTopbarProps {
  /** Unlocked previous workspace eligible for one-click / Esc return, or null. */
  previousWorkspace: { key: string; name: string } | null;
  /** Switches back to `previousWorkspace.key`. */
  onReturnToWorkspace: () => void;
  /** Opens and focuses the Type-Anywhere search bar. */
  onOpenSearch: () => void;
  /** Whether the Type-Anywhere search bar is currently open. */
  isSearchOpen: boolean;
  /** Opens the `TenantContextSwitcherDialog`. */
  onOpenContextSwitcher: () => void;
  /** Optional AI Copilot trigger slot rendered when demo mode is enabled. */
  copilotTrigger?: React.ReactNode;
  /** Whether the active session is an admin impersonation session. */
  isImpersonating: boolean;
  /** Notifications feed from `useHubPersonalFeeds`. */
  notifications?: HubNotificationsFeed;
  /** Loading flag for notifications. */
  isLoadingNotifications: boolean;
  /** Error flag for notifications. */
  isNotificationsError: boolean;
  /** Retry handler for notifications. */
  onRetryNotifications: () => void;
  /** Single-item mark-read handler. */
  onMarkNotificationAsRead: (id: string) => void | Promise<unknown>;
  /** Bulk mark-all-read handler. */
  onMarkAllNotificationsAsRead: () => void | Promise<unknown>;
  /** Pending flag for mark-read mutations. */
  isMarkingNotification?: boolean;
  /** Activity feed from `useHubPersonalFeeds`. */
  activity?: HubSignInActivityFeed;
  /** Loading flag for activity feed. */
  isLoadingActivity: boolean;
  /** Error flag for activity feed. */
  isActivityError: boolean;
  /** Retry handler for activity feed. */
  onRetryActivity: () => void;
}

function getHeaderBackdropClasses(cardStyle: string | undefined): string {
  if (cardStyle === "glass") return "bg-nx-surface/70 backdrop-blur-md";
  if (cardStyle === "solid") return "bg-nx-surface";
  return "bg-nx-ground/90 backdrop-blur-sm";
}

/**
 * Quiet 56px Launchpad topbar for `/hub`. Hosts the tenant/SCRIPE mark, conditional
 * `Return to <Workspace>` button (`Esc`), Type-Anywhere search trigger (`⌘K`), compact
 * Notifications & Activity popovers, AI Copilot trigger, context switcher pill, theme,
 * language, and profile controls.
 */
export function HubTopbar({
  previousWorkspace,
  onReturnToWorkspace,
  onOpenSearch,
  isSearchOpen,
  onOpenContextSwitcher,
  copilotTrigger,
  isImpersonating,
  notifications,
  isLoadingNotifications,
  isNotificationsError,
  onRetryNotifications,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  isMarkingNotification = false,
  activity,
  isLoadingActivity,
  isActivityError,
  onRetryActivity,
}: HubTopbarProps) {
  const { t, direction } = useI18n();
  const { cardStyle } = useSettings();
  const { logoUrl, appName, isTenantContext } = useTenantBranding();
  const { activeTenantName, isPlatform } = useAdminContext();
  const { hasPermission } = usePermissions();
  const user = useAppStore((s) => s.user);

  const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);

  const previousWorkspaceKey = previousWorkspace?.key ?? null;
  const previousWorkspaceName = previousWorkspace?.name ?? "";

  useEffect(() => {
    if (!previousWorkspaceKey || isSearchOpen || notificationsOpen || activityOpen || mobileActionsOpen) {
      return;
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      if (
        document.querySelector(
          '[role="dialog"], [role="alertdialog"], [role="menu"], [data-state="open"][data-radix-popper-content-wrapper]'
        )
      ) {
        return;
      }
      e.preventDefault();
      onReturnToWorkspace();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [
    previousWorkspaceKey,
    isSearchOpen,
    notificationsOpen,
    activityOpen,
    mobileActionsOpen,
    onReturnToWorkspace,
  ]);

  const canSwitchContext =
    typeof hasPermission === "function" &&
    (hasPermission(SYSTEM_PERMISSIONS.TENANTS_DRILL_DOWN) ||
      hasPermission(SYSTEM_PERMISSIONS.IDENTITY_CONTEXT_SWITCH));

  const userTenantName = (user as { tenantName?: string | null } | null)?.tenantName ?? null;
  const contextDisplayName = isPlatform
    ? t("chrome.section.platform")
    : (activeTenantName ?? userTenantName ?? t("chrome.section.organization"));

  const showTenantLogo = Boolean(
    isTenantContext &&
      logoUrl &&
      logoUrl !== "/brand/app-logo-1024.png" &&
      failedLogoUrl !== logoUrl
  );

  return (
    <header
      data-testid="hub-topbar"
      dir={direction}
      className={cn(
        "sticky top-0 z-30 flex h-14 min-h-[56px] w-full max-w-full shrink-0 items-center justify-between gap-1 overflow-x-clip border-b border-nx-line/70 px-2.5 sm:gap-2 sm:px-5",
        getHeaderBackdropClasses(cardStyle)
      )}
    >
      {/* Top-Start: Brand Mark + Conditional Return-to-Workspace Pill */}
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
        <div
          className="flex min-w-0 items-center gap-2"
          aria-label={t("workspaceHub.launchpad.brandMarkAria")}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-nx-md border border-nx-line bg-nx-surface">
            {showTenantLogo && logoUrl ? (
              <Image
                src={logoUrl}
                alt={appName}
                width={32}
                height={32}
                unoptimized
                className="h-8 w-8 object-contain"
                onError={() => setFailedLogoUrl(logoUrl)}
              />
            ) : (
              <Image
                src="/brand/app-logo.svg"
                alt=""
                width={20}
                height={20}
                aria-hidden="true"
                className="h-5 w-5 object-contain"
              />
            )}
          </div>
          <span className="hidden truncate text-xs font-semibold tracking-tight text-nx-ink sm:inline">
            <bdi>{isTenantContext ? appName : BRAND.name}</bdi>
          </span>
        </div>

        {previousWorkspace && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-testid="hub-return-workspace-btn"
            onClick={onReturnToWorkspace}
            aria-label={t("workspaceHub.launchpad.returnToWorkspace", {
              name: previousWorkspaceName,
            })}
            className="h-8 w-8 shrink-0 gap-1.5 rounded-full border-nx-line bg-nx-surface px-0 text-xs font-medium text-nx-ink-2 hover:border-nx-line-hi hover:bg-nx-raised hover:text-nx-ink sm:w-auto sm:max-w-[280px] sm:shrink sm:px-2.5"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0 rtl:rotate-180" aria-hidden="true" />
            <span className="hidden truncate sm:inline">
              {t("workspaceHub.launchpad.returnToWorkspace", { name: previousWorkspaceName })}
            </span>
            <kbd className="hidden rounded-nx-sm border border-nx-line bg-nx-raised px-1.5 py-0.5 font-mono text-[10px] font-semibold text-nx-ink-3 md:inline-block">
              Esc
            </kbd>
          </Button>
        )}
      </div>

      {/* Top-End Utility Cluster */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-testid="hub-search-trigger"
          onClick={onOpenSearch}
          aria-label={t("workspaceHub.launchpad.searchTriggerAria")}
          className="h-8 w-8 shrink-0 gap-2 rounded-nx-control border-nx-line bg-nx-surface px-0 text-xs font-medium text-nx-ink-2 hover:border-nx-line-hi hover:bg-nx-raised hover:text-nx-ink sm:h-9 sm:w-auto sm:px-2.5"
        >
          <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="hidden lg:inline">{t("workspaceHub.launchpad.searchShort")}</span>
          <kbd className="hidden rounded-nx-sm border border-nx-line bg-nx-raised px-1.5 py-0.5 font-mono text-[10px] font-semibold text-nx-ink-3 sm:inline-block">
            ⌘K
          </kbd>
        </Button>

        <HubNotificationsPopover
          open={notificationsOpen}
          onOpenChange={setNotificationsOpen}
          isImpersonating={isImpersonating}
          notifications={notifications}
          isLoading={isLoadingNotifications}
          isError={isNotificationsError}
          onRetry={onRetryNotifications}
          onMarkAsRead={onMarkNotificationAsRead}
          onMarkAllAsRead={onMarkAllNotificationsAsRead}
          isMarking={isMarkingNotification}
        />

        <HubActivityPopover
          open={activityOpen}
          onOpenChange={setActivityOpen}
          isImpersonating={isImpersonating}
          activity={activity}
          isLoading={isLoadingActivity}
          isError={isActivityError}
          onRetry={onRetryActivity}
        />

        {copilotTrigger && (
          <div data-testid="hub-desktop-copilot-slot" className="hidden md:flex items-center">
            {copilotTrigger}
          </div>
        )}

        <TopbarContextPill
          isModuleMode={false}
          tenantName={contextDisplayName}
          canSwitchContext={canSwitchContext}
          switchAriaLabel={t("contextGates.switcher.openSwitcher")}
          onOpenSwitcher={onOpenContextSwitcher}
        />

        <div data-testid="hub-desktop-utilities" className="hidden md:flex items-center gap-1.5">
          <NxThemeSwitcher buttonClassName="h-9 w-9 rounded-nx-control border border-transparent text-nx-ink-2 hover:border-nx-line-hi hover:bg-nx-raised hover:text-nx-ink" />
          <LanguageSwitcher buttonClassName="h-9 min-w-[36px] rounded-nx-control border border-transparent px-2 text-nx-ink-2 hover:border-nx-line-hi hover:bg-nx-raised hover:text-nx-ink" />
        </div>

        <Popover open={mobileActionsOpen} onOpenChange={setMobileActionsOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              data-testid="hub-mobile-actions-trigger"
              aria-label={t("workspaceHub.launchpad.moreActions")}
              className="h-8 w-8 shrink-0 rounded-nx-control border border-nx-line bg-nx-surface text-nx-ink-2 hover:border-nx-line-hi hover:bg-nx-raised hover:text-nx-ink md:hidden"
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            dir={direction}
            data-testid="hub-mobile-actions-popover"
            onInteractOutside={(event) => {
              const target = event.target as HTMLElement | null;
              if (target?.closest('[role="menu"]')) {
                event.preventDefault();
              }
            }}
            className="w-auto max-w-[calc(100vw-24px)] border-nx-line bg-nx-surface p-2 text-nx-ink"
          >
            <div className="flex items-center gap-1.5">
              {copilotTrigger}
              <NxThemeSwitcher buttonClassName="h-9 w-9 rounded-nx-control border border-nx-line bg-nx-raised text-nx-ink-2 hover:border-nx-line-hi hover:bg-nx-hover hover:text-nx-ink" />
              <LanguageSwitcher
                buttonClassName="h-9 min-w-[36px] rounded-nx-control border border-nx-line bg-nx-raised px-2 text-nx-ink-2 hover:border-nx-line-hi hover:bg-nx-hover hover:text-nx-ink"
                contentClassName="z-popover"
              />
            </div>
          </PopoverContent>
        </Popover>

        <UserProfileDropdown
          variant="compact"
          showName={false}
          align="end"
          className="h-8 w-8 shrink-0 rounded-full p-0 sm:h-9 sm:w-9"
        />
      </div>
    </header>
  );
}
