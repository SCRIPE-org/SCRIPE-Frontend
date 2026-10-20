"use client";

import React from "react";
import { Gauge, ChevronRight, Users, Building2, Cloud, Zap } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import type { TenantQuotaItem } from "./tenantTypes";

interface TenantUsageGridProps {
  quotas: TenantQuotaItem[];
}

export function TenantUsageGrid({ quotas }: TenantUsageGridProps) {
  const { t } = useI18n();

  return (
    <Card className="shadow-xs min-w-0 overflow-hidden border-border bg-card p-3.5 sm:p-4">
      {/* Section Header */}
      <div className="mb-3 flex min-w-0 flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Gauge className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-foreground">
              {t("tenantCommandCenter.usage.title") || "Organization Usage"}
            </h3>
            <p className="truncate text-[11px] text-muted-foreground">
              {t("tenantCommandCenter.usage.subtitle") || "Current usage across your subscription."}
            </p>
          </div>
        </div>

        <Link
          href="/settings"
          className="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <span>{t("tenantCommandCenter.usage.viewQuotas") || "View quotas"}</span>
          <ChevronRight className="h-3 w-3 rtl:rotate-180" />
        </Link>
      </div>

      {/* 4 Usage Items Container Grid */}
      <div className="usage-container-grid">
        {quotas.map((quota) => {
          return (
            <div
              key={quota.id}
              className="shadow-xs flex min-w-0 flex-col justify-between rounded-xl border border-border bg-card/60 p-3"
            >
              <div className="flex min-w-0 items-start gap-2.5">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    quota.color === "green"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : quota.color === "blue"
                        ? "bg-sky-500/10 text-sky-500"
                        : quota.color === "violet"
                          ? "bg-purple-500/10 text-purple-500"
                          : "bg-amber-500/10 text-amber-500"
                  }`}
                >
                  {quota.id === "staff" && <Users className="h-4 w-4" />}
                  {quota.id === "sites" && <Building2 className="h-4 w-4" />}
                  {quota.id === "storage" && <Cloud className="h-4 w-4" />}
                  {quota.id === "api" && <Zap className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <span
                    className="block truncate text-[10px] text-muted-foreground"
                    title={quota.label}
                  >
                    {quota.label}
                  </span>
                  <div className="flex flex-wrap items-baseline gap-x-1 font-mono text-xs font-extrabold text-foreground sm:text-sm">
                    <span className="whitespace-nowrap">{quota.current}</span>
                    <span className="font-normal text-muted-foreground">/</span>
                    <span className="whitespace-nowrap text-muted-foreground">{quota.total}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${
                      quota.color === "green"
                        ? "bg-emerald-500"
                        : quota.color === "blue"
                          ? "bg-sky-500"
                          : quota.color === "violet"
                            ? "bg-purple-500"
                            : "bg-amber-500"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, quota.percent))}%` }}
                  />
                </div>
                <div className="mt-1.5 flex min-w-0 items-center justify-between text-[9px] text-muted-foreground">
                  <span className="truncate">{quota.subLeft}</span>
                  <span className="shrink-0">{quota.subRight}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
