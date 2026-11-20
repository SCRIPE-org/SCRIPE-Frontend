"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Gauge } from "lucide-react";
import type { SovereignQuotaGaugeItem } from "../../../domain/entities/SovereignAccountEntities";

/**
 * Props for PlanQuotasSection.
 */
export interface PlanQuotasSectionProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  quotas: SovereignQuotaGaugeItem[];
}

/**
 * Displays live quota and resource consumption gauges with unlimited (-1) badges.
 */
export function PlanQuotasSection({ t, quotas }: PlanQuotasSectionProps) {
  return (
    <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
          <CardTitle className="text-sm font-bold text-nx-ink">
            {t("profile.plan.quotasTitle")}
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-nx-ink-3">
          {t("profile.plan.quotasDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {quotas.length === 0 ? (
          <p className="text-xs text-nx-ink-3">{t("profile.plan.noQuotas")}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quotas.map((q) => (
              <div
                key={q.quotaCode}
                className="p-3.5 rounded-xl border border-nx-line bg-nx-raised space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-nx-ink truncate">{q.label}</span>
                  {q.isUnlimited ? (
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] border-nx-accent/40 text-nx-accent bg-nx-accent-wash"
                    >
                      &infin; {t("profile.plan.unlimited")}
                    </Badge>
                  ) : (
                    <span className="text-[11px] font-mono text-nx-ink-2 whitespace-nowrap shrink-0" dir="ltr">
                      {q.used} / {q.limit}
                    </span>
                  )}
                </div>
                <div className="h-1.5 w-full rounded-full bg-nx-surface overflow-hidden">
                  <div
                    className="h-full bg-nx-accent rounded-full"
                    style={{
                      width: q.isUnlimited
                        ? "35%"
                        : `${Math.min(100, Math.round((q.used / Math.max(1, q.limit)) * 100))}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] font-mono text-nx-ink-3 block">{q.quotaCode}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
