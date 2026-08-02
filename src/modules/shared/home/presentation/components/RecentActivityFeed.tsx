"use client";

/**
 * Recent Activity Feed
 *
 * Compact list of the last N system events, shown on the Overview page.
 */
import { memo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { SectionState } from "@core/ui/section-state";
import { Activity } from "lucide-react";
import { formatTimeUtc } from "@core/common/utils";
import type { RecentChange } from "@modules/monitoring/dashboard/src/domain/entities/DashboardEntities";

interface Props {
  data: RecentChange[];
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export const RecentActivityFeed = memo(function RecentActivityFeed({
  data,
  isLoading,
  error,
  onRetry,
}: Props) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-info" aria-hidden="true" />
          <CardTitle className="text-base">{t("overview.recentActivity")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <SectionState
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
          isEmpty={data.length === 0}
          emptyMessage={t("overview.noActivity")}
          skeletonType="rows"
          skeletonRows={5}
          height={200}
        >
          <ul className="space-y-3">
            {data.map((event) => (
              <li key={event.id} className="group flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`h-2 w-2 shrink-0 rounded-full ${event.isSuccess ? "bg-success" : "bg-destructive"}`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {event.eventType}
                      </Badge>
                      {event.username && (
                        <span className="truncate text-xs text-nx-ink-3">{event.username}</span>
                      )}
                    </div>
                  </div>
                </div>
                <time className="shrink-0 whitespace-nowrap text-xs tabular-nums text-nx-ink-3">
                  {formatTimeUtc(event.timestamp)}
                </time>
              </li>
            ))}
          </ul>
        </SectionState>
      </CardContent>
    </Card>
  );
});
