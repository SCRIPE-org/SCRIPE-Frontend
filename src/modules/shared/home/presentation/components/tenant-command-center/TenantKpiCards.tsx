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
      <Card className="p-3.5 sm:p-4 min-w-0 overflow-hidden border-nx-line bg-nx-surface text-nx-ink hover:border-nx-line-hi transition-[border-color,background-color] duration-nx-micro ease-nx-enter">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-nx-md"
            style={{
              background: "color-mix(in oklch, var(--success) 12%, transparent)",
              color: "var(--success)",
            }}
          >
            <Check className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1.5 min-w-0">
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
            <b className="mt-1 block font-mono text-xl sm:text-2xl font-extrabold leading-tight tracking-tight text-nx-ink truncate">
              {kpis.setupCompletion.value}%
            </b>
            <div className="mt-2.5 h-1.5 w-full max-w-[130px] overflow-hidden rounded-full bg-nx-raised-2">
              <div
                className="h-full rounded-full bg-success"
                style={{ width: `${Math.min(100, Math.max(0, kpis.setupCompletion.value))}%` }}
              />
            </div>
            <span
              className="mt-1.5 block text-[10px] text-nx-ink-3 truncate"
              title={kpis.setupCompletion.sub}
            >
              {kpis.setupCompletion.sub}
            </span>
          </div>
        </div>
      </Card>

      {/* 2. Admins & Users */}
      <Card className="p-3.5 sm:p-4 min-w-0 overflow-hidden border-nx-line bg-nx-surface text-nx-ink hover:border-nx-line-hi transition-[border-color,background-color] duration-nx-micro ease-nx-enter">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-nx-md"
            style={{
              background: "color-mix(in oklch, #0ea5e9 12%, transparent)",
              color: "#0ea5e9",
            }}
          >
            <Users className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1.5 min-w-0">
              <span
                className="truncate text-xs font-medium text-nx-ink-3"
                title={t("tenantCommandCenter.kpis.adminsAndUsers") || "Admins & users"}
              >
                {t("tenantCommandCenter.kpis.adminsAndUsers") || "Admins & users"}
              </span>
              <span className="shrink-0 font-mono text-[11px] font-bold text-sky-500">
                {kpis.adminsAndUsers.trend}
              </span>
            </div>
            <b className="mt-1 block font-mono text-xl sm:text-2xl font-extrabold leading-tight tracking-tight text-nx-ink truncate">
              {kpis.adminsAndUsers.value}
            </b>
            <span
              className="mt-3 block text-[10px] text-nx-ink-3 truncate"
              title={kpis.adminsAndUsers.sub}
            >
              {kpis.adminsAndUsers.sub}
            </span>
          </div>
        </div>
      </Card>

      {/* 3. Branches & Sites */}
      <Card className="p-3.5 sm:p-4 min-w-0 overflow-hidden border-nx-line bg-nx-surface text-nx-ink hover:border-nx-line-hi transition-[border-color,background-color] duration-nx-micro ease-nx-enter">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-nx-md"
            style={{
              background: "color-mix(in oklch, #8b5cf6 12%, transparent)",
              color: "#8b5cf6",
            }}
          >
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1.5 min-w-0">
              <span
                className="truncate text-xs font-medium text-nx-ink-3"
                title={t("tenantCommandCenter.kpis.branchesAndSites") || "Branches & sites"}
              >
                {t("tenantCommandCenter.kpis.branchesAndSites") || "Branches & sites"}
              </span>
              <span className="shrink-0 font-mono text-[11px] font-bold text-purple-500">
                {kpis.branchesAndSites.trend}
              </span>
            </div>
            <b className="mt-1 block font-mono text-xl sm:text-2xl font-extrabold leading-tight tracking-tight text-nx-ink truncate">
              {kpis.branchesAndSites.current} / {kpis.branchesAndSites.total}
            </b>
            <div className="mt-2.5 h-1.5 w-full max-w-[130px] overflow-hidden rounded-full bg-nx-raised-2">
              <div
                className="h-full rounded-full bg-purple-500"
                style={{ width: `${Math.min(100, Math.max(0, kpis.branchesAndSites.percent))}%` }}
              />
            </div>
            <span
              className="mt-1.5 block text-[10px] text-nx-ink-3 truncate"
              title={kpis.branchesAndSites.sub}
            >
              {kpis.branchesAndSites.sub}
            </span>
          </div>
        </div>
      </Card>

      {/* 4. Enabled Products */}
      <Card className="p-3.5 sm:p-4 min-w-0 overflow-hidden border-nx-line bg-nx-surface text-nx-ink hover:border-nx-line-hi transition-[border-color,background-color] duration-nx-micro ease-nx-enter">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-nx-md"
            style={{
              background: "color-mix(in oklch, var(--warning) 12%, transparent)",
              color: "var(--warning)",
            }}
          >
            <Package className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1.5 min-w-0">
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
            <b className="mt-1 block font-mono text-xl sm:text-2xl font-extrabold leading-tight tracking-tight text-nx-ink truncate">
              {kpis.enabledProducts.active} / {kpis.enabledProducts.total}
            </b>
            <span
              className="mt-3 block text-[10px] text-nx-ink-3 truncate"
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
