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
    <Card className="p-4 border-border bg-card shadow-xs">
      {/* Section Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
            <Gauge className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {t("tenantCommandCenter.usage.title") || "Organization Usage"}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {t("tenantCommandCenter.usage.subtitle") ||
                "Current usage across your subscription."}
            </p>
          </div>
        </div>

        <Link
          href="/settings"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>{t("tenantCommandCenter.usage.viewQuotas") || "View quotas"}</span>
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* 4 Usage Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {quotas.map((quota) => {
          return (
            <div
              key={quota.id}
              className="p-3 rounded-xl border border-border bg-card/60 flex flex-col justify-between shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
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
                  <span className="text-[10px] text-muted-foreground block">
                    {quota.label}
                  </span>
                  <b className="text-sm font-extrabold text-foreground font-mono">
                    {quota.current} / {quota.total}
                  </b>
                </div>
              </div>

              <div className="mt-3">
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
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
                <div className="flex items-center justify-between text-[9px] text-muted-foreground mt-1.5">
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
