"use client";

/**
 * Security Timeline
 *
 * Chronological feed of recent security-related events.
 */
import { memo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { formatDateTimeUtc } from "@core/common/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Skeleton } from "@core/ui/skeleton";
import { SectionState } from "@core/ui/section-state";
import { Shield, LogIn, LogOut, Lock, Unlock, UserX, Key, AlertTriangle } from "lucide-react";
import type { SecurityChange } from "../../domain/entities/SecurityEntities";

interface Props {
  data: SecurityChange[];
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  cardClasses?: string;
}

const EVENT_ICONS: Record<string, { icon: typeof Shield; color: string }> = {
  LoginSuccess: { icon: LogIn, color: "text-green-500" },
  LoginFailed: { icon: LogOut, color: "text-red-500" },
  AccountLocked: { icon: Lock, color: "text-orange-500" },
  AccountUnlocked: { icon: Unlock, color: "text-blue-500" },
  AccessDenied: { icon: UserX, color: "text-yellow-500" },
  PasswordReset: { icon: Key, color: "text-violet-500" },
  PermissionGranted: { icon: Shield, color: "text-emerald-500" },
  PermissionRevoked: { icon: AlertTriangle, color: "text-rose-500" },
};

/**
 * Exported constant defining parameters and fields for security timeline configurations.
 */
export const SecurityTimeline = memo(function SecurityTimeline({
  data,
  isLoading,
  error,
  onRetry,
  cardClasses,
}: Props) {
  const { t } = useI18n();

  return (
    <Card className={cardClasses}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-500" aria-hidden="true" />
          <CardTitle className="text-base">{t("security.timeline.title")}</CardTitle>
        </div>
        <CardDescription>{t("security.timeline.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4" role="status" aria-label={t("common.loading")}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <SectionState
            isLoading={false}
            error={error}
            onRetry={onRetry}
            isEmpty={data.length === 0}
            emptyMessage={t("security.noEvents")}
            height={200}
          >
            <div className="max-h-[400px] space-y-4 overflow-y-auto pr-2">
              {data.map((event) => {
                const config = EVENT_ICONS[event.eventType] ?? {
                  icon: Shield,
                  color: "text-gray-500",
                };
                const Icon = config.icon;

                return (
                  <div key={event.id} className="group flex items-start gap-3">
                    <div
                      className={`rounded-full bg-muted p-1.5 ${config.color} shrink-0 transition-transform group-hover:scale-110`}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {event.eventType}
                        </Badge>
                        {event.username && (
                          <span className="text-xs text-muted-foreground">{event.username}</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                        {formatDateTimeUtc(event.timestamp)}
                      </p>
                    </div>
                    <Badge
                      variant={event.isSuccess ? "default" : "destructive"}
                      className="shrink-0 text-[9px]"
                    >
                      {event.isSuccess ? "✓" : "✕"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </SectionState>
        )}
      </CardContent>
    </Card>
  );
});
