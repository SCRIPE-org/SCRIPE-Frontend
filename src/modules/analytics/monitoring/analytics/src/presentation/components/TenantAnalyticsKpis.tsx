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
            className="h-28 animate-pulse rounded-xl border border-nx-line bg-nx-raised/40 p-4"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Tenants */}
      <Card className="border-nx-line bg-nx-surface text-nx-ink transition-colors hover:border-nx-line-hi">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-nx-line bg-nx-raised text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            {kpis.newTenants > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                <ArrowUpRight className="h-3 w-3" />+{kpis.newTenants}
              </span>
            )}
          </div>
          <div className="mt-3">
            <p className="text-xs font-medium uppercase tracking-wider text-nx-ink-3">
              {t("tenantAnalytics.kpis.totalTenants") || "Total Tenants"}
            </p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black tracking-tight text-nx-ink sm:text-3xl">
                {kpis.totalTenants}
              </span>
              <span className="text-[11px] text-nx-ink-3">
                {kpis.loginsToday} {t("tenantAnalytics.kpis.loginsToday") || "logins today"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Active Tenants */}
      <Card className="border-nx-line bg-nx-surface text-nx-ink transition-colors hover:border-nx-line-hi">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-success/20 bg-success/10 text-success">
              <Users2 className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center rounded-md bg-success/10 px-2 py-0.5 text-[11px] font-bold text-success">
              {kpis.activePercentage}%
            </span>
          </div>
          <div className="mt-3">
            <p className="text-xs font-medium uppercase tracking-wider text-nx-ink-3">
              {t("tenantAnalytics.kpis.activeTenants") || "Active Tenants"}
            </p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black tracking-tight text-nx-ink sm:text-3xl">
                {kpis.activeTenants}
              </span>
              <span className="text-[11px] text-nx-ink-3">
                {t("tenantAnalytics.kpis.currentlyActive") || "currently active"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. New Tenants */}
      <Card className="border-nx-line bg-nx-surface text-nx-ink transition-colors hover:border-nx-line-hi">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-info/20 bg-info/10 text-info">
              <UserPlus className="h-5 w-5" />
            </div>
            {kpis.newGrowthPercent !== null && (
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                  kpis.newGrowthPercent >= 0
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive"
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
            <p className="text-xs font-medium uppercase tracking-wider text-nx-ink-3">
              {t("tenantAnalytics.kpis.newTenants") || "New Tenants"}
            </p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black tracking-tight text-nx-ink sm:text-3xl">
                {kpis.newTenants}
              </span>
              <span className="text-[11px] text-nx-ink-3">
                {t("tenantAnalytics.kpis.inPeriod") || `in ${timeRangeLabel.toLowerCase()}`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Suspended / Churned */}
      <Card className="border-nx-line bg-nx-surface text-nx-ink transition-colors hover:border-nx-line-hi">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-warning/20 bg-warning/10 text-warning">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center rounded-md bg-warning/10 px-2 py-0.5 text-[11px] font-bold text-warning">
              {kpis.suspendedPercentage}%
            </span>
          </div>
          <div className="mt-3">
            <p className="text-xs font-medium uppercase tracking-wider text-nx-ink-3">
              {t("tenantAnalytics.kpis.suspendedChurned") || "Suspended / Churned"}
            </p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black tracking-tight text-nx-ink sm:text-3xl">
                {kpis.suspendedTenants}
              </span>
              <span className="text-[11px] text-nx-ink-3">
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
