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
    <section className="my-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Setup Completion */}
      <Card className="shadow-xs flex items-start justify-between border-border bg-card p-3.5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
            <Check className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[11px] font-medium text-muted-foreground">
              {t("tenantCommandCenter.kpis.setupCompletion") || "Setup completion"}
            </span>
            <b className="mt-0.5 block font-mono text-2xl font-extrabold leading-none tracking-tight text-foreground">
              {kpis.setupCompletion.value}%
            </b>
            <div className="mt-2 h-1.5 w-32 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                style={{ width: `${kpis.setupCompletion.value}%` }}
              />
            </div>
            <span className="mt-1.5 block text-[10px] text-muted-foreground">
              {kpis.setupCompletion.sub}
            </span>
          </div>
        </div>
        <span className="font-mono text-[10px] font-bold text-emerald-500">
          {kpis.setupCompletion.trend}
        </span>
      </Card>

      {/* 2. Admins & Users */}
      <Card className="shadow-xs flex items-start justify-between border-border bg-card p-3.5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10 text-sky-500">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[11px] font-medium text-muted-foreground">
              {t("tenantCommandCenter.kpis.adminsAndUsers") || "Admins & users"}
            </span>
            <b className="mt-0.5 block font-mono text-2xl font-extrabold leading-none tracking-tight text-foreground">
              {kpis.adminsAndUsers.value}
            </b>
            <span className="mt-3 block text-[10px] text-muted-foreground">
              {kpis.adminsAndUsers.sub}
            </span>
          </div>
        </div>
        <span className="font-mono text-[10px] font-bold text-emerald-500">
          {kpis.adminsAndUsers.trend}
        </span>
      </Card>

      {/* 3. Branches & Sites */}
      <Card className="shadow-xs flex items-start justify-between border-border bg-card p-3.5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-500">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[11px] font-medium text-muted-foreground">
              {t("tenantCommandCenter.kpis.branchesAndSites") || "Branches & sites"}
            </span>
            <b className="mt-0.5 block font-mono text-2xl font-extrabold leading-none tracking-tight text-foreground">
              {kpis.branchesAndSites.current} / {kpis.branchesAndSites.total}
            </b>
            <div className="mt-2 h-1.5 w-32 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400"
                style={{ width: `${kpis.branchesAndSites.percent}%` }}
              />
            </div>
            <span className="mt-1.5 block text-[10px] text-muted-foreground">
              {kpis.branchesAndSites.sub}
            </span>
          </div>
        </div>
        <span className="font-mono text-[10px] font-bold text-purple-500">
          {kpis.branchesAndSites.trend}
        </span>
      </Card>

      {/* 4. Enabled Products */}
      <Card className="shadow-xs flex items-start justify-between border-border bg-card p-3.5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-500">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[11px] font-medium text-muted-foreground">
              {t("tenantCommandCenter.kpis.enabledProducts") || "Enabled products"}
            </span>
            <b className="mt-0.5 block font-mono text-2xl font-extrabold leading-none tracking-tight text-foreground">
              {kpis.enabledProducts.active} / {kpis.enabledProducts.total}
            </b>
            <span className="mt-3 block text-[10px] text-muted-foreground">
              {kpis.enabledProducts.sub}
            </span>
          </div>
        </div>
        <span className="cursor-pointer text-[10px] font-bold text-amber-500 hover:underline">
          {kpis.enabledProducts.trend}
        </span>
      </Card>
    </section>
  );
}
