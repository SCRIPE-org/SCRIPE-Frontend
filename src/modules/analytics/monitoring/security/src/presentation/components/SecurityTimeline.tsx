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
  LoginSuccess: { icon: LogIn, color: "text-success" },
  LoginFailed: { icon: LogOut, color: "text-destructive" },
  AccountLocked: { icon: Lock, color: "text-warning" },
  AccountUnlocked: { icon: Unlock, color: "text-info" },
  AccessDenied: { icon: UserX, color: "text-warning" },
  PasswordReset: { icon: Key, color: "text-nx-accent" },
  PermissionGranted: { icon: Shield, color: "text-success" },
  PermissionRevoked: { icon: AlertTriangle, color: "text-destructive" },
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
          <Shield className="h-4 w-4 text-info" aria-hidden="true" />
          <CardTitle className="text-base">{t("security.timeline.title")}</CardTitle>
        </div>
        <CardDescription>{t("security.timeline.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <SectionState
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
          isEmpty={data.length === 0}
          emptyMessage={t("security.noEvents")}
          skeletonType="rows"
          skeletonRows={6}
          height={300}
        >
          <div className="max-h-[400px] space-y-4 overflow-y-auto pe-2">
            {data.map((event) => {
              const config = EVENT_ICONS[event.eventType] ?? {
                icon: Shield,
                color: "text-nx-ink-2",
              };
              const Icon = config.icon;

              return (
                <div key={event.id} className="flex items-start gap-3">
                  <div className={`shrink-0 rounded-full bg-nx-raised p-1.5 ${config.color}`}>
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {event.eventType}
                      </Badge>
                      {event.username && (
                        <span className="text-xs text-nx-ink-2">{event.username}</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs tabular-nums text-nx-ink-3">
                      {formatDateTimeUtc(event.timestamp)}
                    </p>
                  </div>
                  <Badge
                    variant={event.isSuccess ? "success" : "destructive"}
                    className="shrink-0 text-[9px]"
                  >
                    <span aria-hidden="true">{event.isSuccess ? "✓" : "✕"}</span>
                    <span className="sr-only">
                      {event.isSuccess
                        ? t("security.timeline.success")
                        : t("security.timeline.failed")}
                    </span>
                  </Badge>
                </div>
              );
            })}
          </div>
        </SectionState>
      </CardContent>
    </Card>
  );
});
