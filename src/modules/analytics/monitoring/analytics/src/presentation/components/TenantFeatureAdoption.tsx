"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import type { FeatureAdoptionItem } from "../../domain/entities/AnalyticsEntities";

interface TenantFeatureAdoptionProps {
  data: FeatureAdoptionItem[];
  isLoading: boolean;
}

/**
 * TenantFeatureAdoption
 */
export function TenantFeatureAdoption({
  data,
  isLoading,
}: TenantFeatureAdoptionProps) {
  const { t } = useI18n();

  return (
    <Card className="h-full flex flex-col border-border/80 bg-card/80 backdrop-blur-xs shadow-xs">
      <CardHeader className="p-4 sm:p-5 pb-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-bold text-foreground">
            {t("tenantAnalytics.features.title") || "Capability & Feature Adoption"}
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          {t("tenantAnalytics.features.subtitle") ||
            "Platform module enablement and capability usage across the tenant base"}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-3 flex-1 flex flex-col justify-between min-h-[240px]">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 rounded-lg bg-muted/20 animate-pulse" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground">
            {t("tenantAnalytics.features.noData") || "No capability adoption data available"}
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between gap-3">
            <div className="space-y-3">
              {data.map((item, idx) => {
                const barColors = [
                  "bg-primary",
                  "bg-info",
                  "bg-amber-400",
                  "bg-purple-400",
                  "bg-teal-400",
                  "bg-emerald-400",
                ];
                const barColor = barColors[idx % barColors.length];

                return (
                  <div key={item.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground truncate">{item.name}</span>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-bold text-foreground">{item.count}</span>
                        <span className="text-[11px]">({item.percentage}%)</span>
                      </div>
                    </div>

                    {/* Progress bar */}
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
            <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-primary" />
                <span>
                  {data.length} {t("tenantAnalytics.features.modulesActive") || "capabilities tracked"}
                </span>
              </span>
              <span className="font-semibold text-foreground">
                {t("tenantAnalytics.features.platformWide") || "Platform-wide"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
