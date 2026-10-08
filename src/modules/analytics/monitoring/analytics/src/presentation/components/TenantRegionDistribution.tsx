"use client";

import React from "react";
import { Globe, MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import type { RegionDistributionItem } from "../../domain/entities/AnalyticsEntities";

interface TenantRegionDistributionProps {
  data: RegionDistributionItem[];
  isLoading: boolean;
}

/**
 * TenantRegionDistribution
 */
export function TenantRegionDistribution({ data, isLoading }: TenantRegionDistributionProps) {
  const { t } = useI18n();

  const totalTenants = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="backdrop-blur-xs shadow-xs flex h-full flex-col border-border/80 bg-card/80">
      <CardHeader className="p-4 pb-2 sm:p-5">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-bold text-foreground">
            {t("tenantAnalytics.regions.title") || "Tenants by Region"}
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          {t("tenantAnalytics.regions.subtitle") ||
            "Distribution of tenant workspaces across global operational regions"}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex min-h-[220px] flex-1 flex-col justify-between p-4 pt-3 sm:p-5">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded-lg bg-muted/20" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground">
            {t("tenantAnalytics.regions.noData") || "No regional distribution data available"}
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-around gap-3">
            <div className="space-y-3.5">
              {data.map((item) => (
                <div key={item.region} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="rounded-xs flex h-5 w-7 items-center justify-center bg-muted/40 font-mono text-[10px] font-bold text-muted-foreground">
                        {item.code}
                      </span>
                      <span className="font-medium text-foreground">{item.region}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-semibold text-foreground">{item.count}</span>
                      <span className="text-[11px]">({item.percentage}%)</span>
                    </div>
                  </div>

                  {/* Progress track */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted/30">
                    <div
                      className="h-full rounded-full bg-primary/80 transition-all duration-500"
                      style={{ width: `${Math.max(item.percentage, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom summary info banner */}
            <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-primary" />
                <span>
                  {data.length}{" "}
                  {data.length === 1
                    ? t("tenantAnalytics.regions.singular") || "operational region"
                    : t("tenantAnalytics.regions.plural") || "operational regions"}
                </span>
              </span>
              <span className="font-semibold text-foreground">
                {totalTenants}{" "}
                {totalTenants === 1
                  ? t("tenantAnalytics.regions.workspaceSingular") || "workspace mapped"
                  : t("tenantAnalytics.regions.workspacePlural") || "workspaces mapped"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
