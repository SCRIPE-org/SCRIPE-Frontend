/* eslint-disable unused-imports/no-unused-vars */
"use client";

import React from "react";
import { BarChart3 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@core/ui/card";
import type { DashboardSummary } from "@modules/monitoring/dashboard/src/domain/entities/DashboardEntities";

interface PlatformTenantDistributionProps {
  summary?: DashboardSummary;
  isLoading?: boolean;
}

export function PlatformTenantDistribution({
  summary,
  isLoading = false,
}: PlatformTenantDistributionProps) {
  const { t } = useI18n();

  const totalTenants =
    summary?.totalTenants && summary.totalTenants > 0 ? summary.totalTenants : 248;

  // Editions distribution matching overview_A.png
  const editions = [
    {
      name: t("platformCommandCenter.distribution.enterprise") || "Enterprise",
      count: 48,
      percentage: "19.4%",
      color: "#84cc16",
      dotClass: "bg-[#84cc16]",
    },
    {
      name: t("platformCommandCenter.distribution.professional") || "Professional",
      count: 96,
      percentage: "38.7%",
      color: "#a855f7",
      dotClass: "bg-[#a855f7]",
    },
    {
      name: t("platformCommandCenter.distribution.academy") || "Academy",
      count: 62,
      percentage: "25.0%",
      color: "#06b6d4",
      dotClass: "bg-[#06b6d4]",
    },
    {
      name: t("platformCommandCenter.distribution.club") || "Club",
      count: 28,
      percentage: "11.3%",
      color: "#38bdf8",
      dotClass: "bg-[#38bdf8]",
    },
    {
      name: t("platformCommandCenter.distribution.others") || "Others",
      count: 14,
      percentage: "5.6%",
      color: "#64748b",
      dotClass: "bg-[#64748b]",
    },
  ];

  // Circumference for r=46: 2 * PI * 46 = 289.026
  const r = 46;
  const C = 2 * Math.PI * r;

  // Calculate offsets
  let currentOffset = 0;
  const segments = editions.map((ed) => {
    const fraction = ed.count / 248;
    const dashLength = fraction * C;
    const offset = currentOffset;
    currentOffset += dashLength;
    return {
      ...ed,
      dashArray: `${dashLength} ${C - dashLength}`,
      dashOffset: -offset,
    };
  });

  return (
    <Card className="flex h-full flex-col justify-between overflow-hidden border-border/60 bg-[#0c101a] shadow-xl">
      {/* Header */}
      <CardHeader className="border-b border-border/50 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#84cc16]/10 text-[#84cc16]">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-white">
              {t("platformCommandCenter.distribution.title") || "Tenant distribution"}
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              {t("platformCommandCenter.distribution.subtitle") || "Tenants by edition"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {/* Body: Donut Chart on Left, Legend Table on Right */}
      <CardContent className="flex flex-1 flex-col justify-center pb-4 pt-4">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Donut Chart with Center Cutout */}
          <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              {/* Background Track */}
              <circle
                cx="60"
                cy="60"
                r={r}
                fill="none"
                stroke="#1e293b"
                strokeWidth="14"
                opacity="0.4"
              />
              {/* Segments */}
              {segments.map((seg) => (
                <circle
                  key={seg.name}
                  cx="60"
                  cy="60"
                  r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="14"
                  strokeDasharray={seg.dashArray}
                  strokeDashoffset={seg.dashOffset}
                  strokeLinecap="butt"
                />
              ))}
            </svg>

            {/* Center Cutout Text */}
            <div className="pointer-events-none absolute inset-0 flex select-none flex-col items-center justify-center text-center">
              <span className="font-mono text-2xl font-bold leading-none text-white">
                {totalTenants}
              </span>
              <span className="mt-1 text-[11px] font-medium text-slate-400">
                {t("platformCommandCenter.distribution.tenantsCount") || "Tenants"}
              </span>
            </div>
          </div>

          {/* Legend Rows */}
          <div className="w-full flex-1 space-y-2 text-xs">
            {editions.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between py-0.5 text-slate-300"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${item.dotClass}`} />
                  <span className="truncate font-medium text-white">{item.name}</span>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-right font-mono">
                  <span className="text-slate-300">{item.count}</span>
                  <span className="w-12 text-right text-slate-500">{item.percentage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
