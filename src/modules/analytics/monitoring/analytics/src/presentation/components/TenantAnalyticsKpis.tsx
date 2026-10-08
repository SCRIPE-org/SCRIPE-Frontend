"use client";

import React from "react";
import {
  Building2,
  Users2,
  UserPlus,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";

interface KpiData {
  totalTenants: number;
  activeTenants: number;
  activePercentage: number;
  newTenants: number;
  newGrowthPercent: number | null;
  suspendedTenants: number;
  suspendedPercentage: number;
  churnRate: number;
  totalUsers: number;
  loginsToday: number;
}

interface TenantAnalyticsKpisProps {
  kpis: KpiData;
  isLoading: boolean;
  timeRangeLabel: string;
}

/**
 * TenantAnalyticsKpis
 */
export function TenantAnalyticsKpis({ kpis, isLoading, timeRangeLabel }: TenantAnalyticsKpisProps) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl border border-border/70 bg-card/60 p-4"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Tenants */}
      <Card className="backdrop-blur-xs shadow-xs border-border/80 bg-card/80 transition-colors hover:border-border">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/80 bg-background/80 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            {kpis.newTenants > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                <ArrowUpRight className="h-3 w-3" />+{kpis.newTenants}
              </span>
            )}
          </div>
          <div className="mt-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("tenantAnalytics.kpis.totalTenants") || "Total Tenants"}
            </p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                {kpis.totalTenants}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {kpis.loginsToday} {t("tenantAnalytics.kpis.loginsToday") || "logins today"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Active Tenants */}
      <Card className="backdrop-blur-xs shadow-xs border-border/80 bg-card/80 transition-colors hover:border-border">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
              <Users2 className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-500">
              {kpis.activePercentage}%
            </span>
          </div>
          <div className="mt-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("tenantAnalytics.kpis.activeTenants") || "Active Tenants"}
            </p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                {kpis.activeTenants}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {t("tenantAnalytics.kpis.currentlyActive") || "currently active"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. New Tenants */}
      <Card className="backdrop-blur-xs shadow-xs border-border/80 bg-card/80 transition-colors hover:border-border">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-info/20 bg-info/10 text-info">
              <UserPlus className="h-5 w-5" />
            </div>
            {kpis.newGrowthPercent !== null && (
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                  kpis.newGrowthPercent >= 0
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-rose-500/10 text-rose-500"
                }`}
              >
                {kpis.newGrowthPercent >= 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {kpis.newGrowthPercent >= 0
                  ? `+${kpis.newGrowthPercent}%`
                  : `${kpis.newGrowthPercent}%`}
              </span>
            )}
          </div>
          <div className="mt-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("tenantAnalytics.kpis.newTenants") || "New Tenants"}
            </p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                {kpis.newTenants}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {t("tenantAnalytics.kpis.inPeriod") || `in ${timeRangeLabel.toLowerCase()}`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Suspended / Churned */}
      <Card className="backdrop-blur-xs shadow-xs border-border/80 bg-card/80 transition-colors hover:border-border">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-500">
              {kpis.suspendedPercentage}%
            </span>
          </div>
          <div className="mt-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("tenantAnalytics.kpis.suspendedChurned") || "Suspended / Churned"}
            </p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                {kpis.suspendedTenants}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {kpis.churnRate > 0
                  ? `${kpis.churnRate}% ${t("tenantAnalytics.kpis.churnRate") || "churn rate"}`
                  : t("tenantAnalytics.kpis.ofTotalTenants") || "of total tenants"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
