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
    <Card className="shadow-xs border-border bg-card p-4">
      {/* Section Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Gauge className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {t("tenantCommandCenter.usage.title") || "Organization Usage"}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {t("tenantCommandCenter.usage.subtitle") || "Current usage across your subscription."}
            </p>
          </div>
        </div>

        <Link
          href="/settings"
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <span>{t("tenantCommandCenter.usage.viewQuotas") || "View quotas"}</span>
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* 4 Usage Items Grid */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {quotas.map((quota) => {
          return (
            <div
              key={quota.id}
              className="shadow-xs flex flex-col justify-between rounded-xl border border-border bg-card/60 p-3"
            >
              <div className="flex items-center gap-2.5">
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
                <div>
                  <span className="block text-[10px] text-muted-foreground">{quota.label}</span>
                  <b className="font-mono text-sm font-extrabold text-foreground">
                    {quota.current} / {quota.total}
                  </b>
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
                    style={{ width: `${quota.percent}%` }}
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[9px] text-muted-foreground">
                  <span>{quota.subLeft}</span>
                  <span>{quota.subRight}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
