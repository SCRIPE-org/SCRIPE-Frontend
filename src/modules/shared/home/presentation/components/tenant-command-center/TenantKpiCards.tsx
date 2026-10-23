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
      <Card className="min-w-0 overflow-hidden border-nx-line bg-nx-surface p-3.5 text-nx-ink transition-[border-color,background-color] duration-nx-micro ease-nx-enter hover:border-nx-line-hi sm:p-4">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-nx-md"
            style={{
              background: "color-mix(in oklch, var(--success) 12%, transparent)",
              color: "var(--success)",
            }}
          >
            <Check className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center justify-between gap-1.5">
              <span
                className="truncate text-xs font-medium text-nx-ink-3"
                title={t("tenantCommandCenter.kpis.setupCompletion") || "Setup completion"}
              >
                {t("tenantCommandCenter.kpis.setupCompletion") || "Setup completion"}
              </span>
              <span className="shrink-0 font-mono text-[11px] font-bold text-success">
                {kpis.setupCompletion.trend}
              </span>
            </div>
            <b className="mt-1 block truncate font-mono text-xl font-extrabold leading-tight tracking-tight text-nx-ink sm:text-2xl">
              {kpis.setupCompletion.value}%
            </b>
            <div className="mt-2.5 h-1.5 w-full max-w-[130px] overflow-hidden rounded-full bg-nx-raised-2">
              <div
                className="h-full rounded-full bg-success"
                style={{ width: `${Math.min(100, Math.max(0, kpis.setupCompletion.value))}%` }}
              />
            </div>
            <span
              className="mt-1.5 block truncate text-[10px] text-nx-ink-3"
              title={kpis.setupCompletion.sub}
            >
              {kpis.setupCompletion.sub}
            </span>
          </div>
        </div>
      </Card>

      {/* 2. Admins & Users */}
      <Card className="min-w-0 overflow-hidden border-nx-line bg-nx-surface p-3.5 text-nx-ink transition-[border-color,background-color] duration-nx-micro ease-nx-enter hover:border-nx-line-hi sm:p-4">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-nx-md"
            style={{
              background: "color-mix(in oklch, var(--info) 12%, transparent)",
              color: "var(--info)",
            }}
          >
            <Users className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center justify-between gap-1.5">
              <span
                className="truncate text-xs font-medium text-nx-ink-3"
                title={t("tenantCommandCenter.kpis.adminsAndUsers") || "Admins & users"}
              >
                {t("tenantCommandCenter.kpis.adminsAndUsers") || "Admins & users"}
              </span>
              <span className="shrink-0 font-mono text-[11px] font-bold text-info">
                {kpis.adminsAndUsers.trend}
              </span>
            </div>
            <b className="mt-1 block truncate font-mono text-xl font-extrabold leading-tight tracking-tight text-nx-ink sm:text-2xl">
              {kpis.adminsAndUsers.value}
            </b>
            <span
              className="mt-3 block truncate text-[10px] text-nx-ink-3"
              title={kpis.adminsAndUsers.sub}
            >
              {kpis.adminsAndUsers.sub}
            </span>
          </div>
        </div>
      </Card>

      {/* 3. Branches & Sites */}
      <Card className="min-w-0 overflow-hidden border-nx-line bg-nx-surface p-3.5 text-nx-ink transition-[border-color,background-color] duration-nx-micro ease-nx-enter hover:border-nx-line-hi sm:p-4">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-nx-md"
            style={{
              background: "color-mix(in oklch, var(--primary) 12%, transparent)",
              color: "var(--primary)",
            }}
          >
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center justify-between gap-1.5">
              <span
                className="truncate text-xs font-medium text-nx-ink-3"
                title={t("tenantCommandCenter.kpis.branchesAndSites") || "Branches & sites"}
              >
                {t("tenantCommandCenter.kpis.branchesAndSites") || "Branches & sites"}
              </span>
              <span className="shrink-0 font-mono text-[11px] font-bold text-primary">
                {kpis.branchesAndSites.trend}
              </span>
            </div>
            <b className="mt-1 block truncate font-mono text-xl font-extrabold leading-tight tracking-tight text-nx-ink sm:text-2xl">
              {kpis.branchesAndSites.current} / {kpis.branchesAndSites.total}
            </b>
            <div className="mt-2.5 h-1.5 w-full max-w-[130px] overflow-hidden rounded-full bg-nx-raised-2">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(100, Math.max(0, kpis.branchesAndSites.percent))}%` }}
              />
            </div>
            <span
              className="mt-1.5 block truncate text-[10px] text-nx-ink-3"
              title={kpis.branchesAndSites.sub}
            >
              {kpis.branchesAndSites.sub}
            </span>
          </div>
        </div>
      </Card>

      {/* 4. Enabled Products */}
      <Card className="min-w-0 overflow-hidden border-nx-line bg-nx-surface p-3.5 text-nx-ink transition-[border-color,background-color] duration-nx-micro ease-nx-enter hover:border-nx-line-hi sm:p-4">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-nx-md"
            style={{
              background: "color-mix(in oklch, var(--warning) 12%, transparent)",
              color: "var(--warning)",
            }}
          >
            <Package className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center justify-between gap-1.5">
              <span
                className="truncate text-xs font-medium text-nx-ink-3"
                title={t("tenantCommandCenter.kpis.enabledProducts") || "Enabled products"}
              >
                {t("tenantCommandCenter.kpis.enabledProducts") || "Enabled products"}
              </span>
              <span className="shrink-0 font-mono text-[11px] font-bold text-warning">
                {kpis.enabledProducts.trend}
              </span>
            </div>
            <b className="mt-1 block truncate font-mono text-xl font-extrabold leading-tight tracking-tight text-nx-ink sm:text-2xl">
              {kpis.enabledProducts.active} / {kpis.enabledProducts.total}
            </b>
            <span
              className="mt-3 block truncate text-[10px] text-nx-ink-3"
              title={kpis.enabledProducts.sub}
            >
              {kpis.enabledProducts.sub}
            </span>
          </div>
        </div>
      </Card>
    </section>
  );
}
