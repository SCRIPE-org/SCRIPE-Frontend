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
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-3">
      {/* 1. Setup Completion */}
      <Card className="p-3.5 flex items-start justify-between border-border bg-card shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <Check className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground block font-medium">
              {t("tenantCommandCenter.kpis.setupCompletion") || "Setup completion"}
            </span>
            <b className="text-2xl font-extrabold tracking-tight text-foreground block mt-0.5 leading-none font-mono">
              {kpis.setupCompletion.value}%
            </b>
            <div className="w-32 h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                style={{ width: `${kpis.setupCompletion.value}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground block mt-1.5">
              {kpis.setupCompletion.sub}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-emerald-500 font-mono">
          {kpis.setupCompletion.trend}
        </span>
      </Card>

      {/* 2. Admins & Users */}
      <Card className="p-3.5 flex items-start justify-between border-border bg-card shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0 border border-sky-500/20">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground block font-medium">
              {t("tenantCommandCenter.kpis.adminsAndUsers") || "Admins & users"}
            </span>
            <b className="text-2xl font-extrabold tracking-tight text-foreground block mt-0.5 leading-none font-mono">
              {kpis.adminsAndUsers.value}
            </b>
            <span className="text-[10px] text-muted-foreground block mt-3">
              {kpis.adminsAndUsers.sub}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-emerald-500 font-mono">
          {kpis.adminsAndUsers.trend}
        </span>
      </Card>

      {/* 3. Branches & Sites */}
      <Card className="p-3.5 flex items-start justify-between border-border bg-card shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 border border-purple-500/20">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground block font-medium">
              {t("tenantCommandCenter.kpis.branchesAndSites") || "Branches & sites"}
            </span>
            <b className="text-2xl font-extrabold tracking-tight text-foreground block mt-0.5 leading-none font-mono">
              {kpis.branchesAndSites.current} / {kpis.branchesAndSites.total}
            </b>
            <div className="w-32 h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400"
                style={{ width: `${kpis.branchesAndSites.percent}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground block mt-1.5">
              {kpis.branchesAndSites.sub}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-purple-500 font-mono">
          {kpis.branchesAndSites.trend}
        </span>
      </Card>

      {/* 4. Enabled Products */}
      <Card className="p-3.5 flex items-start justify-between border-border bg-card shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground block font-medium">
              {t("tenantCommandCenter.kpis.enabledProducts") || "Enabled products"}
            </span>
            <b className="text-2xl font-extrabold tracking-tight text-foreground block mt-0.5 leading-none font-mono">
              {kpis.enabledProducts.active} / {kpis.enabledProducts.total}
            </b>
            <span className="text-[10px] text-muted-foreground block mt-3">
              {kpis.enabledProducts.sub}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-amber-500 cursor-pointer hover:underline">
          {kpis.enabledProducts.trend}
        </span>
      </Card>
    </section>
  );
}
