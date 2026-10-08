"use client";

import React from "react";
import { Check, Users, Building2, Package } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import type { TenantKpisData } from "./tenantTypes";

interface TenantKpiCardsProps {
  kpis: TenantKpisData;
}

export function TenantKpiCards({ kpis }: TenantKpiCardsProps) {
  const { t } = useI18n();

  return (
    <section className="kpi-container-grid">
      {/* 1. Setup Completion */}
      <Card className="shadow-xs border-border bg-card p-3 sm:p-3.5 min-w-0 overflow-hidden">
        <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
            <Check className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1.5 min-w-0">
              <span
                className="truncate text-[11px] font-medium text-muted-foreground"
                title={t("tenantCommandCenter.kpis.setupCompletion") || "Setup completion"}
              >
                {t("tenantCommandCenter.kpis.setupCompletion") || "Setup completion"}
              </span>
              <span className="shrink-0 font-mono text-[10px] font-bold text-emerald-500">
                {kpis.setupCompletion.trend}
              </span>
            </div>
            <b className="mt-1 block font-mono text-xl sm:text-2xl font-extrabold leading-tight tracking-tight text-foreground truncate">
              {kpis.setupCompletion.value}%
            </b>
            <div className="mt-2 h-1.5 w-full max-w-[130px] overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                style={{ width: `${Math.min(100, Math.max(0, kpis.setupCompletion.value))}%` }}
              />
            </div>
            <span className="mt-1.5 block text-[10px] text-muted-foreground truncate" title={kpis.setupCompletion.sub}>
              {kpis.setupCompletion.sub}
            </span>
          </div>
        </div>
      </Card>

      {/* 2. Admins & Users */}
      <Card className="shadow-xs border-border bg-card p-3 sm:p-3.5 min-w-0 overflow-hidden">
        <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10 text-sky-500">
            <Users className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1.5 min-w-0">
              <span
                className="truncate text-[11px] font-medium text-muted-foreground"
                title={t("tenantCommandCenter.kpis.adminsAndUsers") || "Admins & users"}
              >
                {t("tenantCommandCenter.kpis.adminsAndUsers") || "Admins & users"}
              </span>
              <span className="shrink-0 font-mono text-[10px] font-bold text-sky-500">
                {kpis.adminsAndUsers.trend}
              </span>
            </div>
            <b className="mt-1 block font-mono text-xl sm:text-2xl font-extrabold leading-tight tracking-tight text-foreground truncate">
              {kpis.adminsAndUsers.value}
            </b>
            <span className="mt-2.5 block text-[10px] text-muted-foreground truncate" title={kpis.adminsAndUsers.sub}>
              {kpis.adminsAndUsers.sub}
            </span>
          </div>
        </div>
      </Card>

      {/* 3. Branches & Sites */}
      <Card className="shadow-xs border-border bg-card p-3 sm:p-3.5 min-w-0 overflow-hidden">
        <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-500">
            <Building2 className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1.5 min-w-0">
              <span
                className="truncate text-[11px] font-medium text-muted-foreground"
                title={t("tenantCommandCenter.kpis.branchesAndSites") || "Branches & sites"}
              >
                {t("tenantCommandCenter.kpis.branchesAndSites") || "Branches & sites"}
              </span>
              <span className="shrink-0 font-mono text-[10px] font-bold text-purple-500">
                {kpis.branchesAndSites.trend}
              </span>
            </div>
            <b className="mt-1 block font-mono text-xl sm:text-2xl font-extrabold leading-tight tracking-tight text-foreground truncate">
              {kpis.branchesAndSites.current} / {kpis.branchesAndSites.total}
            </b>
            <div className="mt-2 h-1.5 w-full max-w-[130px] overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400"
                style={{ width: `${Math.min(100, Math.max(0, kpis.branchesAndSites.percent))}%` }}
              />
            </div>
            <span className="mt-1.5 block text-[10px] text-muted-foreground truncate" title={kpis.branchesAndSites.sub}>
              {kpis.branchesAndSites.sub}
            </span>
          </div>
        </div>
      </Card>

      {/* 4. Enabled Products */}
      <Card className="shadow-xs border-border bg-card p-3 sm:p-3.5 min-w-0 overflow-hidden">
        <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-500">
            <Package className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1.5 min-w-0">
              <span
                className="truncate text-[11px] font-medium text-muted-foreground"
                title={t("tenantCommandCenter.kpis.enabledProducts") || "Enabled products"}
              >
                {t("tenantCommandCenter.kpis.enabledProducts") || "Enabled products"}
              </span>
              <span className="shrink-0 font-mono text-[10px] font-bold text-amber-500">
                {kpis.enabledProducts.trend}
              </span>
            </div>
            <b className="mt-1 block font-mono text-xl sm:text-2xl font-extrabold leading-tight tracking-tight text-foreground truncate">
              {kpis.enabledProducts.active} / {kpis.enabledProducts.total}
            </b>
            <span className="mt-2.5 block text-[10px] text-muted-foreground truncate" title={kpis.enabledProducts.sub}>
              {kpis.enabledProducts.sub}
            </span>
          </div>
        </div>
      </Card>
    </section>
  );
}
