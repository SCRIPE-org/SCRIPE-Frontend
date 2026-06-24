"use client";

/**
 * Security Events Section
 *
 * Summary cards for security-related events (failed logins, lockouts, etc.)
 */
import { memo } from "react";
import type { SecurityEventSummary } from "../../domain/entities/DashboardEntities";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { SectionState } from "@core/ui/section-state";
import { Badge } from "@core/ui/badge";
import { AlertTriangle, Lock, Ban, ShieldX, KeyRound, LogOut, ShieldAlert } from "lucide-react";

interface Props {
  data: SecurityEventSummary[];
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

const eventConfig: Record<string, { icon: typeof AlertTriangle; color: string; bgColor: string }> =
  {
    LoginFailed: { icon: AlertTriangle, color: "text-amber-500", bgColor: "bg-amber-500/10" },
    AccountLocked: { icon: Lock, color: "text-red-500", bgColor: "bg-red-500/10" },
    AccessDenied: { icon: Ban, color: "text-orange-500", bgColor: "bg-orange-500/10" },
    PrivilegeEscalationAttempt: {
      icon: ShieldX,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
    },
    SessionRevoked: { icon: LogOut, color: "text-violet-500", bgColor: "bg-violet-500/10" },
    PasswordReset: { icon: KeyRound, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  };

/**
 * Constant definition representing security events section.
 */
export const SecurityEventsSection = memo(function SecurityEventsSection({
  data,
  isLoading,
  error,
  onRetry,
}: Props) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle>{t("dashboard.securityEvents.title")}</CardTitle>
            <CardDescription>{t("dashboard.securityEvents.description")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <SectionState
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
          isEmpty={data.length === 0}
          emptyMessage={t("dashboard.securityEvents.noEvents")}
          skeletonType="rows"
          skeletonRows={4}
          height={200}
        >
          <div className="space-y-3" aria-live="polite">
            {data.map((event) => {
              const config = eventConfig[event.eventType] ?? {
                icon: AlertTriangle,
                color: "text-gray-500",
                bgColor: "bg-gray-500/10",
              };
              const Icon = config.icon;
              return (
                <div
                  key={event.eventType}
                  className="flex items-center justify-between rounded-lg border p-2.5 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${config.bgColor}`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{event.eventType}</p>
                      {event.latestOccurrence && (
                        <p className="text-[10px] text-muted-foreground">
                          Last: {new Date(event.latestOccurrence).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={event.count > 10 ? "destructive" : "secondary"}
                    className="tabular-nums"
                  >
                    {event.count.toLocaleString()}
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
