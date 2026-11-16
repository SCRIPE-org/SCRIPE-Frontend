"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import type { RecentNotificationAlertItem } from "../../../domain/entities/SovereignAccountEntities";
import { resolveNotificationRuleCopy } from "./NotificationMatrixSection";
import { CheckCheck, Inbox, Trash2 } from "lucide-react";

/**
 * Props for RecentNotificationFeedSection.
 */
export interface RecentNotificationFeedSectionProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  recentAlerts: RecentNotificationAlertItem[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Integrated personal alert feed supporting per-item read, bulk mark-all-read, and dismissal.
 */
export function RecentNotificationFeedSection({
  t,
  recentAlerts,
  unreadCount,
  onMarkAllRead,
  onMarkRead,
  onDelete,
}: RecentNotificationFeedSectionProps) {
  return (
    <Card
      data-testid="recent-notifications-feed-card"
      className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors"
    >
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Inbox className="h-4 w-4 text-nx-accent shrink-0" />
          <CardTitle className="text-sm font-bold text-nx-ink">
            {t("profile.notifications.recentFeedTitle")}
          </CardTitle>
          <Badge variant="outline" className="text-[10px] font-mono border-nx-line text-nx-ink-3">
            {unreadCount} {t("profile.notifications.unreadLabel")}
          </Badge>
        </div>
        {recentAlerts.some((a) => !a.isRead) && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onMarkAllRead}
            data-testid="mark-all-notifications-read-btn"
            className="h-7 px-2.5 text-[11px] font-semibold gap-1.5 border-nx-line bg-nx-raised text-nx-ink-2 hover:text-nx-ink"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            <span>{t("profile.notifications.markAllReadBtn")}</span>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {recentAlerts.length === 0 ? (
          <p className="text-xs text-nx-ink-3">{t("profile.notifications.noRecentAlerts")}</p>
        ) : (
          recentAlerts.map((alert) => {
            const categoryLabel = resolveNotificationRuleCopy(t, alert.category).title;
            return (
              <div
                key={alert.id}
                className="p-3 rounded-xl border border-nx-line bg-nx-raised flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-nx-ink">{alert.title}</span>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono border-nx-line text-nx-ink-3"
                    >
                      {categoryLabel}
                    </Badge>
                  </div>
                  <p className="text-xs text-nx-ink-2">{alert.message}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-nx-ink-3">
                    {new Date(alert.createdAt).toLocaleString()}
                  </span>
                  {!alert.isRead && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkRead(alert.id)}
                      data-testid={`mark-notification-read-${alert.id}`}
                      className="h-7 px-2 text-[10px] font-semibold text-nx-accent hover:text-nx-ink"
                    >
                      {t("profile.notifications.markReadBtn")}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(alert.id)}
                    data-testid={`delete-notification-${alert.id}`}
                    aria-label={t("profile.notifications.deleteAlertAria")}
                    className="h-7 w-7 p-0 text-nx-ink-3 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
