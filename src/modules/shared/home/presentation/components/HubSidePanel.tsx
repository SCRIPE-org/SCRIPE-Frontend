"use client";

/**
 * HubSidePanel — Deferred, impersonation-safe personal operational feed panel for `/hub`.
 *
 * Displays:
 * 1. Actionable Notifications (`/api/v1/account/notifications`)
 * 2. Account & Sign-In Activity (`/api/v1/account/activity?pageSize=5`)
 *
 * During admin impersonation sessions, hides personal operator feeds cleanly with an explicit notice
 * and triggers zero personal `/account/*` network calls.
 */

import React from "react";
import Link from "next/link";
import {
  Activity,
  Bell,
  CheckCheck,
  ChevronRight,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { EmptyState } from "@core/ui/empty-state";
import { Skeleton } from "@core/ui/skeleton";
import type {
  HubNotificationsFeed,
  HubSignInActivityFeed,
} from "../../hub/src/domain/entities/HubPersonalFeed";

export interface HubSidePanelProps {
  isImpersonating: boolean;
  notifications?: HubNotificationsFeed;
  isLoadingNotifications: boolean;
  isNotificationsError: boolean;
  onRetryNotifications: () => void;
  onMarkNotificationAsRead: (id: string) => void | Promise<unknown>;
  onMarkAllNotificationsAsRead: () => void | Promise<unknown>;
  isMarkingNotification?: boolean;
  activity?: HubSignInActivityFeed;
  isLoadingActivity: boolean;
  isActivityError: boolean;
  onRetryActivity: () => void;
}

function formatTimestamp(isoString: string, language: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return date.toLocaleString(language === "ar" ? "ar-EG" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function resolveOutcomeVariant(outcome: string): "success" | "destructive" | "secondary" {
  const normalized = outcome.toLowerCase();
  if (normalized === "success") return "success";
  if (normalized === "blocked" || normalized === "failure") return "destructive";
  return "secondary";
}

function FeedSkeletonRows() {
  return (
    <div className="space-y-3" aria-busy="true">
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-3 w-2/5" />
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export function HubSidePanel({
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
}: HubSidePanelProps) {
  const { t, language } = useI18n();

  if (isImpersonating) {
    return (
      <aside className="flex flex-col gap-3 lg:pt-1" data-testid="hub-side-panel">
        <Alert variant="warning" data-testid="hub-impersonation-alert">
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          <AlertDescription className="text-xs leading-relaxed">
            {t("workspaceHub.impersonationHidden")}
          </AlertDescription>
        </Alert>
      </aside>
    );
  }

  const notificationItems = notifications?.items ?? [];
  const unreadCount = notifications?.unreadCount ?? 0;
  const activityEntries = activity?.entries ?? [];

  return (
    <aside className="flex flex-col gap-4 lg:pt-1" data-testid="hub-side-panel">
      {/* 1. Actionable Notifications */}
      <Card className="border-nx-line bg-nx-surface shadow-none">
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
          <div className="flex min-w-0 items-center gap-2">
            <Bell className="h-4 w-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
            <CardTitle className="truncate text-sm font-semibold text-nx-ink">
              {t("workspaceHub.notifications.title")}
            </CardTitle>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="shrink-0 tabular-nums text-[11px]">
                {t("workspaceHub.notifications.unreadBadge", { count: unreadCount })}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void onMarkAllNotificationsAsRead()}
              disabled={isMarkingNotification}
              className="h-7 shrink-0 px-2 text-xs text-nx-ink-2 hover:text-nx-ink"
            >
              <CheckCheck className="me-1 h-3.5 w-3.5" aria-hidden="true" />
              {t("workspaceHub.notifications.markAllRead")}
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {isLoadingNotifications ? (
            <FeedSkeletonRows />
          ) : isNotificationsError ? (
            <div className="flex flex-col items-start gap-2 rounded-nx-md border border-nx-line bg-nx-raised p-3">
              <p className="text-xs text-nx-ink-2">{t("workspaceHub.notifications.error")}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRetryNotifications}
                className="h-7 gap-1.5 text-xs"
              >
                <RefreshCw className="h-3 w-3" aria-hidden="true" />
                {t("workspaceHub.notifications.retry")}
              </Button>
            </div>
          ) : notificationItems.length === 0 ? (
            <EmptyState
              size="sm"
              bare
              icon={Bell}
              title={t("workspaceHub.notifications.empty")}
            />
          ) : (
            <ul className="space-y-2">
              {notificationItems.map((item) => (
                <li
                  key={item.id}
                  className="rounded-nx-md border border-nx-line bg-nx-raised p-2.5 transition-[border-color] hover:border-nx-line-hi"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 space-y-0.5">
                      {item.actionUrl ? (
                        <Link
                          href={item.actionUrl}
                          className="block truncate text-xs font-semibold text-nx-ink hover:underline"
                        >
                          <bdi>{item.title || item.category}</bdi>
                        </Link>
                      ) : (
                        <p className="truncate text-xs font-semibold text-nx-ink">
                          <bdi>{item.title || item.category}</bdi>
                        </p>
                      )}
                      {item.body && (
                        <p className="line-clamp-2 text-[11px] text-nx-ink-2">
                          <bdi>{item.body}</bdi>
                        </p>
                      )}
                    </div>
                    {!item.isRead && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isMarkingNotification}
                        onClick={() => void onMarkNotificationAsRead(item.id)}
                        className="h-6 shrink-0 px-2 text-[11px] text-nx-ink-2 hover:text-nx-ink"
                      >
                        {t("workspaceHub.notifications.markRead")}
                      </Button>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-2 text-[10.5px] text-nx-ink-3">
                    <span className="truncate">
                      <bdi>{item.category}</bdi>
                    </span>
                    <span className="shrink-0 tabular-nums">
                      <bdi>{formatTimestamp(item.createdAt, language)}</bdi>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-nx-line pt-2.5">
            <Link
              href="/account/notifications"
              className="inline-flex items-center gap-1 text-xs font-medium text-nx-ink-2 transition-colors hover:text-nx-ink"
            >
              <span>{t("workspaceHub.notifications.viewAll")}</span>
              <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 2. Account & Sign-In Activity */}
      <Card className="border-nx-line bg-nx-surface shadow-none">
        <CardHeader className="flex flex-row items-center gap-2 pb-3">
          <Activity className="h-4 w-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
          <CardTitle className="truncate text-sm font-semibold text-nx-ink">
            {t("workspaceHub.signInActivity.title")}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {isLoadingActivity ? (
            <FeedSkeletonRows />
          ) : isActivityError ? (
            <div className="flex flex-col items-start gap-2 rounded-nx-md border border-nx-line bg-nx-raised p-3">
              <p className="text-xs text-nx-ink-2">{t("workspaceHub.signInActivity.error")}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRetryActivity}
                className="h-7 gap-1.5 text-xs"
              >
                <RefreshCw className="h-3 w-3" aria-hidden="true" />
                {t("workspaceHub.signInActivity.retry")}
              </Button>
            </div>
          ) : activityEntries.length === 0 ? (
            <EmptyState
              size="sm"
              bare
              icon={Activity}
              title={t("workspaceHub.signInActivity.empty")}
            />
          ) : (
            <ul className="space-y-2">
              {activityEntries.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-nx-md border border-nx-line bg-nx-raised p-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-semibold text-nx-ink">
                      <bdi>{entry.eventType}</bdi>
                    </span>
                    <Badge
                      variant={resolveOutcomeVariant(entry.outcome)}
                      className="shrink-0 text-[10.5px]"
                    >
                      <bdi>{entry.outcome}</bdi>
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-nx-ink-3">
                    <span className="truncate font-mono">
                      <bdi dir="ltr">
                        {entry.ipAddress || entry.endpoint || t("workspaceHub.signInActivity.unknownIp")}
                      </bdi>
                    </span>
                    <span className="shrink-0 tabular-nums">
                      <bdi>{formatTimestamp(entry.timestampUtc, language)}</bdi>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-nx-line pt-2.5">
            <Link
              href="/account/activity"
              className="inline-flex items-center gap-1 text-xs font-medium text-nx-ink-2 transition-colors hover:text-nx-ink"
            >
              <span>{t("workspaceHub.signInActivity.viewAll")}</span>
              <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
