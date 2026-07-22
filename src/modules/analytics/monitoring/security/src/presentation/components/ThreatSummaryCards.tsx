"use client";

/**
 * Threat Summary Cards
 *
 * Displays KPI-style cards for security threat categories.
 */
import { memo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { Button } from "@core/ui/button";
import { ShieldAlert, Lock, Ban, KeyRound } from "lucide-react";
import { cn } from "@core/common/utils";

interface ThreatCard {
  type: string;
  count: number;
}

interface Props {
  data: ThreatCard[];
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  cardClasses?: string;
}

const THREAT_ICONS: Record<
  string,
  { icon: typeof ShieldAlert; color: string; bgColor: string; labelKey: string }
> = {
  LoginFailed: {
    icon: ShieldAlert,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    labelKey: "security.threats.failedLogins",
  },
  AccountLocked: {
    icon: Lock,
    color: "text-warning",
    bgColor: "bg-warning/10",
    labelKey: "security.threats.accountLockouts",
  },
  AccessDenied: {
    icon: Ban,
    color: "text-warning",
    bgColor: "bg-warning/10",
    labelKey: "security.threats.accessDenied",
  },
  PrivilegeEscalation: {
    icon: KeyRound,
    color: "text-primary",
    bgColor: "bg-primary/10",
    labelKey: "security.threats.privilegeEscalation",
  },
};

/**
 * Exported constant defining parameters and fields for threat summary cards configurations.
 */
export const ThreatSummaryCards = memo(function ThreatSummaryCards({
  data,
  isLoading,
  error,
  onRetry,
  cardClasses,
}: Props) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div
        className="grid grid-cols-2 gap-4 md:grid-cols-4"
        role="status"
        aria-label={t("common.loading")}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border p-8 text-muted-foreground">
        <p className="text-sm">{t("common.error")}</p>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            {t("common.retry")}
          </Button>
        )}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p className="text-sm">{t("security.noEvents")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4" aria-live="polite">
      {data.map((threat) => {
        const config = THREAT_ICONS[threat.type] ?? {
          icon: ShieldAlert,
          color: "text-muted-foreground",
          bgColor: "bg-muted",
          labelKey: threat.type,
        };
        const Icon = config.icon;

        return (
          <Card
            key={threat.type}
            className={cn("group transition-shadow hover:shadow-md", cardClasses)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t(config.labelKey)}
              </CardTitle>
              <div
                className={`rounded-lg p-2 ${config.bgColor} transition-transform group-hover:scale-110`}
              >
                <Icon className={`h-4 w-4 ${config.color}`} aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{threat.count.toLocaleString()}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});
