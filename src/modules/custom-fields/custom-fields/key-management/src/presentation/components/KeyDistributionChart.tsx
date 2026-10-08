"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { CheckCircle2, AlertTriangle, Play } from "lucide-react";
import type { TenantKeyStatus } from "../../domain/entities/TenantKeyStatus";

interface KeyDistributionChartProps {
  status: TenantKeyStatus;
  onStartRewrap: () => void;
  isStartingRewrap?: boolean;
}

/**
 * Documentation for KeyDistributionChart
 */
export function KeyDistributionChart({
  status,
  onStartRewrap,
  isStartingRewrap,
}: KeyDistributionChartProps) {
  const { t } = useI18n();
  const isHealthy = status.isFullyMigrated;

  return (
    <Card className="shadow-sm border border-border">
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold">
            {t("customFieldsSecurity.distributionTitle")}
          </CardTitle>
          <CardDescription>
            {t("customFieldsSecurity.distributionDesc")}
          </CardDescription>
        </div>
        {!isHealthy && !status.hasPendingMigration && (
          <Button
            size="sm"
            onClick={onStartRewrap}
            disabled={isStartingRewrap}
            className="gap-1.5"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            {t("customFieldsSecurity.startRewrapButton")}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {status.distribution.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              {t("customFieldsSecurity.healthyNotice")}
            </p>
          ) : (
            status.distribution.map((item) => {
              const isCurrent =
                item.platformKeyId === status.currentPlatformKeyId &&
                item.tenantKeyVersion === status.activeVersion;

              return (
                <div key={`${item.platformKeyId}-${item.tenantKeyVersion}`} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">
                        Platform #{item.platformKeyId} / Tenant v{item.tenantKeyVersion}
                      </span>
                      {isCurrent && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                          Current
                        </Badge>
                      )}
                    </div>
                    <span className="text-muted-foreground font-mono">
                      {item.recordCount.toLocaleString()} ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCurrent ? "bg-primary" : "bg-amber-500/70"
                      }`}
                      style={{ width: `${Math.max(2, item.percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-2 border-t border-border/50">
          {isHealthy ? (
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{t("customFieldsSecurity.healthyNotice")}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{t("customFieldsSecurity.needsRewrapNotice")}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
