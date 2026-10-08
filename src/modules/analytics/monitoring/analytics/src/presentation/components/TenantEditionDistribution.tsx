"use client";

import React from "react";
import { Layers } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import type { EditionDistributionItem } from "../../domain/entities/AnalyticsEntities";

interface TenantEditionDistributionProps {
  data: EditionDistributionItem[];
  isLoading: boolean;
}

/**
 * TenantEditionDistribution
 */
export function TenantEditionDistribution({ data, isLoading }: TenantEditionDistributionProps) {
  const { t } = useI18n();

  const totalAssigned = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="backdrop-blur-xs shadow-xs flex h-full flex-col border-border/80 bg-card/80">
      <CardHeader className="p-4 pb-2 sm:p-5">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-bold text-foreground">
            {t("tenantAnalytics.editions.title") || "Tenants by Edition"}
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          {t("tenantAnalytics.editions.subtitle") ||
            "Distribution across SCRIPE platform editions and subscription tiers"}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex min-h-[240px] flex-1 flex-col justify-between p-4 pt-3 sm:p-5">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded-lg bg-muted/20" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground">
            {t("tenantAnalytics.editions.noData") || "No edition distribution data available"}
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-around gap-3">
            <div className="space-y-3.5">
              {data.map((item, idx) => {
                // Accent color variation based on position
                const barColors = [
                  "bg-primary",
                  "bg-info",
                  "bg-amber-400",
                  "bg-purple-400",
                  "bg-emerald-400",
                ];
                const barColor = barColors[idx % barColors.length];

                return (
                  <div key={item.edition} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="truncate font-semibold text-foreground">{item.edition}</span>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-bold text-foreground">{item.count}</span>
                        <span className="text-[11px]">({item.percentage}%)</span>
                      </div>
                    </div>

                    {/* Bar track */}
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted/30">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all duration-500`}
                        style={{ width: `${Math.max(item.percentage, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom summary info banner */}
            <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Layers className="h-3 w-3 text-primary" />
                <span>
                  {data.length}{" "}
                  {data.length === 1
                    ? t("tenantAnalytics.editions.tierSingular") || "platform tier"
                    : t("tenantAnalytics.editions.tierPlural") || "platform tiers"}
                </span>
              </span>
              <span className="font-semibold text-foreground">
                {totalAssigned}{" "}
                {totalAssigned === 1
                  ? t("tenantAnalytics.editions.licenseSingular") || "tenant assigned"
                  : t("tenantAnalytics.editions.licensePlural") || "tenants assigned"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
