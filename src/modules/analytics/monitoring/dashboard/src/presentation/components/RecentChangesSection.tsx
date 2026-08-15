"use client";

/**
 * Recent Changes Section
 *
 * Activity feed showing latest entity modifications.
 */
import { useMemo, memo } from "react";
import type { RecentChange } from "../../domain/entities/DashboardEntities";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { SectionState } from "@core/ui/section-state";
import { Badge } from "@core/ui/badge";
import { ScrollArea } from "@core/ui/scroll-area";
import { Plus, Pencil, Trash2, Shield, Key, Activity, History } from "lucide-react";

interface Props {
  data: RecentChange[];
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

const eventIconMap: Record<string, typeof Activity> = {
  Create: Plus,
  Update: Pencil,
  Delete: Trash2,
  RoleAssigned: Shield,
  RoleUnassigned: Shield,
  PermissionGranted: Key,
  PermissionRevoked: Key,
};

const eventColorMap: Record<string, string> = {
  Create: "bg-success/10 text-success",
  Update: "bg-info/10 text-info",
  Delete: "bg-destructive/10 text-destructive",
  RoleAssigned: "bg-nx-accent-wash text-nx-accent",
  RoleUnassigned: "bg-warning/10 text-warning",
  PermissionGranted: "bg-success/10 text-success",
  PermissionRevoked: "bg-destructive/10 text-destructive",
};

function formatTimeAgo(
  timestamp: string,
  t: (key: string, params?: Record<string, string | number>) => string
): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t("common.timeAgo.justNow");
  if (minutes < 60) return t("common.timeAgo.minutesAgo", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("common.timeAgo.hoursAgo", { count: hours });
  const days = Math.floor(hours / 24);
  return t("common.timeAgo.daysAgo", { count: days });
}

/**
 * Exported constant defining parameters and fields for recent changes section configurations.
 */
export const RecentChangesSection = memo(function RecentChangesSection({
  data,
  isLoading,
  error,
  onRetry,
}: Props) {
  const { t } = useI18n();

  const items = useMemo(() => data, [data]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-nx-ink-2" aria-hidden="true" />
          <div>
            <CardTitle>{t("dashboard.recentChanges.title")}</CardTitle>
            <CardDescription>{t("dashboard.recentChanges.description")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <SectionState
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
          isEmpty={data.length === 0}
          emptyMessage={t("dashboard.recentChanges.noChanges")}
          skeletonType="rows"
          skeletonRows={5}
          height={350}
        >
          <ScrollArea className="h-[350px]">
            <div className="space-y-3" aria-live="polite">
              {items.map((change) => {
                const Icon = eventIconMap[change.eventType] ?? Activity;
                const colorClass = eventColorMap[change.eventType] ?? "bg-nx-raised text-nx-ink-2";
                return (
                  <div
                    key={change.id}
                    className="flex items-start gap-3 rounded-nx-md p-2 transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover motion-reduce:transition-none"
                  >
                    <div className={`shrink-0 rounded-full p-2 ${colorClass}`}>
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-nx-ink">
                          {change.username ?? t("dashboard.recentChanges.systemUser")}
                        </span>
                        <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[10px]">
                          {change.eventType}
                        </Badge>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-nx-ink-2">
                        {change.entityType}{" "}
                        {change.entityId ? `#${change.entityId.slice(0, 8)}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 whitespace-nowrap text-[10px] text-nx-ink-3">
                      {formatTimeAgo(change.timestamp, t)}
                    </span>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </SectionState>
      </CardContent>
    </Card>
  );
});
