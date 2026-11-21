"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, ChevronRight, RefreshCw, ShieldAlert } from "lucide-react";
import { cn, resolveIntlLocale } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
import { startRoutingProgress } from "@core/ui/routing-progress-bar";
import { Skeleton } from "@core/ui/skeleton";
import type {
  HubNotificationItem,
  HubNotificationsFeed,
} from "../../hub/src/domain/entities/HubPersonalFeed";

/** Props for {@link HubNotificationsPopover}. */
export interface HubNotificationsPopoverProps {
  /** Whether the active session is an admin impersonation session. */
  isImpersonating: boolean;
  /** Personal notifications feed returned by `useHubPersonalFeeds`. */
  notifications?: HubNotificationsFeed;
  /** True while notifications are loading. */
  isLoading: boolean;
  /** True when the notifications fetch failed. */
  isError: boolean;
  /** Callback to retry fetching notifications. */
  onRetry: () => void;
  /** Marks a single notification read by ID. */
  onMarkAsRead: (id: string) => void | Promise<unknown>;
  /** Marks all unread notifications read. */
  onMarkAllAsRead: () => void | Promise<unknown>;
  /** True while any mark-read mutation is in flight. */
  isMarking?: boolean;
  /** Controlled open state (optional). */
  open?: boolean;
  /** Controlled open change handler (optional). */
  onOpenChange?: (open: boolean) => void;
}

type NotificationsTab = "all" | "unread";

function formatTimestamp(isoString: string, language: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return date.toLocaleString(resolveIntlLocale(language), {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Compact topbar popover presenting the operator's personal actionable notifications
 * on `/hub`, featuring `All | Unread` tabs, single/bulk mark-read, and an explicit
 * impersonation protection guard.
 */
export function HubNotificationsPopover({
  isImpersonating,
  notifications,
  isLoading,
  isError,
  onRetry,
  onMarkAsRead,
  onMarkAllAsRead,
  isMarking = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: HubNotificationsPopoverProps) {
  const { t, language, direction } = useI18n();
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NotificationsTab>("all");

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = (next: boolean) => {
    if (controlledOnOpenChange) controlledOnOpenChange(next);
    else setInternalOpen(next);
  };

  const allItems = notifications?.items ?? [];
  const unreadCount = isImpersonating ? 0 : (notifications?.unreadCount ?? 0);
  const visibleItems =
    activeTab === "unread" ? allItems.filter((item) => !item.isRead) : allItems;

  const triggerLabel =
    unreadCount > 0
      ? t("workspaceHub.notifications.triggerUnread", { count: unreadCount })
      : t("workspaceHub.notifications.title");

  const handleItemClick = (item: HubNotificationItem) => {
    if (!item.isRead && !isMarking) {
      void onMarkAsRead(item.id);
    }
    if (item.actionUrl) {
      setIsOpen(false);
      startRoutingProgress();
      router.push(item.actionUrl);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          data-testid="hub-notifications-trigger"
          aria-label={triggerLabel}
          className="relative h-9 w-9 shrink-0 rounded-nx-control border border-nx-line bg-nx-surface text-nx-ink-2 hover:border-nx-line-hi hover:bg-nx-raised hover:text-nx-ink"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          {unreadCount > 0 && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-nx-accent-fill px-1 text-[9px] font-bold tabular-nums leading-none text-nx-on-fill"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        dir={direction}
        data-testid="hub-notifications-popover"
        className="w-[360px] max-w-[calc(100vw-24px)] border-nx-line bg-nx-surface p-0 text-nx-ink"
      >
        <div className="flex items-center justify-between gap-2 border-b border-nx-line px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-sm font-semibold text-nx-ink">
              {t("workspaceHub.notifications.title")}
            </h2>
            {unreadCount > 0 && (
              <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-nx-accent-fill px-1.5 text-[10px] font-bold tabular-nums text-nx-on-fill">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
          {!isImpersonating && unreadCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isMarking}
              onClick={() => void onMarkAllAsRead()}
              className="h-7 shrink-0 gap-1 px-2 text-xs text-nx-ink-2 hover:text-nx-ink"
            >
              <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t("workspaceHub.notifications.markAllRead")}</span>
            </Button>
          )}
        </div>

        {isImpersonating ? (
          <div className="p-3">
            <Alert variant="warning" data-testid="hub-impersonation-alert">
              <ShieldAlert className="h-4 w-4" aria-hidden="true" />
              <AlertDescription className="text-xs leading-relaxed">
                {t("workspaceHub.impersonationHidden")}
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <>
            <div
              role="tablist"
              aria-label={t("workspaceHub.notifications.title")}
              className="flex items-center gap-1.5 border-b border-nx-line px-4 py-2"
            >
              {(["all", "unread"] as const).map((tabKey) => {
                const isSelected = activeTab === tabKey;
                return (
                  <Button
                    key={tabKey}
                    type="button"
                    role="tab"
                    variant="ghost"
                    size="sm"
                    aria-selected={isSelected}
                    onClick={() => setActiveTab(tabKey)}
                    className={cn(
                      "h-7 rounded-nx-sm border px-2.5 text-xs transition-colors",
                      isSelected
                        ? "border-nx-line-hi bg-nx-raised font-semibold text-nx-ink hover:bg-nx-raised"
                        : "border-transparent bg-transparent font-medium text-nx-ink-2 hover:bg-nx-raised/60 hover:text-nx-ink"
                    )}
                  >
                    {t(`workspaceHub.notifications.tabs.${tabKey}`)}
                  </Button>
                );
              })}
            </div>

            <div className="max-h-[320px] overflow-y-auto p-2">
              {isLoading ? (
                <div className="space-y-3 p-2" aria-busy="true">
                  <Skeleton shape="text" className="h-4 w-3/4" />
                  <Skeleton shape="text" className="h-3 w-1/2" />
                  <Skeleton shape="text" className="h-4 w-5/6" />
                </div>
              ) : isError ? (
                <div className="flex flex-col items-start gap-2 rounded-nx-md border border-nx-line bg-nx-raised p-3">
                  <p className="text-xs text-nx-ink-2">{t("workspaceHub.notifications.error")}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    className="h-7 gap-1.5 text-xs"
                  >
                    <RefreshCw className="h-3 w-3" aria-hidden="true" />
                    {t("workspaceHub.notifications.retry")}
                  </Button>
                </div>
              ) : visibleItems.length === 0 ? (
                <EmptyState
                  size="sm"
                  bare
                  icon={Bell}
                  title={
                    activeTab === "unread"
                      ? t("workspaceHub.notifications.emptyUnread")
                      : t("workspaceHub.notifications.empty")
                  }
                />
              ) : (
                <ul className="space-y-1">
                  {visibleItems.map((item) => (
                    <li key={item.id}>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleItemClick(item)}
                        disabled={isMarking && !item.isRead}
                        className="flex h-auto w-full flex-col items-stretch gap-1 whitespace-normal rounded-nx-md border border-transparent px-3 py-2.5 text-start font-normal hover:border-nx-line hover:bg-nx-raised"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={cn(
                              "line-clamp-1 text-xs",
                              item.isRead ? "font-medium text-nx-ink-2" : "font-semibold text-nx-ink"
                            )}
                          >
                            <bdi>{item.title || item.category}</bdi>
                          </span>
                          {!item.isRead && (
                            <span
                              aria-hidden="true"
                              className="mt-1 h-2 w-2 shrink-0 rounded-full bg-nx-accent"
                            />
                          )}
                        </div>
                        {item.body && (
                          <p className="line-clamp-2 text-[11px] leading-snug text-nx-ink-2">
                            <bdi>{item.body}</bdi>
                          </p>
                        )}
                        <div className="flex items-center justify-between gap-2 text-[10.5px] text-nx-ink-3">
                          <span className="truncate">
                            <bdi>{item.category}</bdi>
                          </span>
                          <span className="shrink-0 tabular-nums">
                            <bdi>{formatTimestamp(item.createdAt, language)}</bdi>
                          </span>
                        </div>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        <div className="border-t border-nx-line px-4 py-2.5">
          <Link
            href="/account/notifications"
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center gap-1 text-xs font-medium text-nx-ink-2 transition-colors hover:text-nx-ink"
          >
            <span>{t("workspaceHub.notifications.viewAll")}</span>
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
