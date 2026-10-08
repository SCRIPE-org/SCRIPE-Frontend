"use client";

import React from "react";
import { TrendingUp, BarChart3, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import type { TenantLoginActivityItem } from "./tenantTypes";

interface TenantActivityChartsProps {
  loginActivity?: TenantLoginActivityItem[];
  isPresentationMode?: boolean;
}

export function TenantActivityCharts({
  loginActivity,
  isPresentationMode = false,
}: TenantActivityChartsProps) {
  const { t } = useI18n();

  const livePoints =
    !isPresentationMode && loginActivity && loginActivity.length > 0
      ? loginActivity.slice(-10)
      : null;

  const maxCount = livePoints
    ? Math.max(1, ...livePoints.map((p) => (p.successCount ?? p.count ?? 0) + (p.failedCount || 0)))
    : 1;

  return (
    <div className="charts-container-grid">
      {/* 1. Organization Growth (Multi-line SVG Chart) */}
      <Card className="shadow-xs border-border bg-card p-3.5 sm:p-4 min-w-0 overflow-hidden">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sky-500/20 bg-sky-500/10 text-sky-500">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate">
                {t("tenantCommandCenter.charts.growthTitle") || "Organization Growth"}
              </h3>
              <p className="text-[11px] text-muted-foreground truncate">
                {t("tenantCommandCenter.charts.growthSubtitle") ||
                  "Members, bookings and active staff over the last 30 days."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-medium text-muted-foreground shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#2b83ff]" />
              {t("tenantCommandCenter.charts.members") || "Members"}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#12b981]" />
              {t("tenantCommandCenter.charts.bookings") || "Bookings"}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#8a56f5]" />
              {t("tenantCommandCenter.charts.staff") || "Staff"}
            </span>
          </div>
        </div>

        {/* Growth SVG Chart */}
        <div className="h-44 w-full pt-1">
          <svg className="h-full w-full overflow-visible" viewBox="0 0 620 190">
            <g className="stroke-border" strokeWidth="1">
              <line x1="32" y1="25" x2="600" y2="25" strokeDasharray="3 3" />
              <line x1="32" y1="68" x2="600" y2="68" strokeDasharray="3 3" />
              <line x1="32" y1="111" x2="600" y2="111" strokeDasharray="3 3" />
              <line x1="32" y1="154" x2="600" y2="154" />
            </g>

            {/* Curves */}
            <path
              d="M35 145 C90 140 105 118 150 120 S220 94 270 98 S340 75 395 84 S470 67 520 74 S565 59 598 61"
              fill="none"
              stroke="#2b83ff"
              strokeWidth="2.6"
            />
            <path
              d="M35 159 C90 152 118 142 155 143 S218 125 268 132 S336 112 392 120 S455 105 514 113 S565 97 598 101"
              fill="none"
              stroke="#12b981"
              strokeWidth="2.6"
            />
            <path
              d="M35 169 C100 168 120 159 160 163 S220 149 270 154 S340 143 395 148 S465 138 520 143 S570 136 598 137"
              fill="none"
              stroke="#8a56f5"
              strokeWidth="2.6"
            />

            <g className="select-none fill-muted-foreground font-mono text-[10px]">
              <text x="34" y="180">
                Aug 18
              </text>
              <text x="175" y="180">
                Aug 25
              </text>
              <text x="320" y="180">
                Sep 1
              </text>
              <text x="463" y="180">
                Sep 8
              </text>
              <text x="565" y="180">
                Sep 15
              </text>
            </g>
          </svg>
        </div>
      </Card>

      {/* 2. Login Activity (Bar Chart) */}
      <Card className="shadow-xs border-border bg-card p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {t("tenantCommandCenter.charts.loginTitle") || "Login Activity"}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {t("tenantCommandCenter.charts.loginSubtitle") ||
                  "Admin sign-ins over the last 14 days."}
              </p>
            </div>
          </div>

          <Link
            href="/audit"
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <span>{t("tenantCommandCenter.charts.viewAll") || "View all"}</span>
            <ChevronRight className="h-3 w-3 rtl:rotate-180" />
          </Link>
        </div>

        {/* Login Activity Bar SVG */}
        <div className="h-44 w-full pt-1">
          <svg className="h-full w-full overflow-visible" viewBox="0 0 420 190">
            <g className="stroke-border" strokeWidth="1">
              <line x1="30" y1="25" x2="405" y2="25" strokeDasharray="3 3" />
              <line x1="30" y1="70" x2="405" y2="70" strokeDasharray="3 3" />
              <line x1="30" y1="115" x2="405" y2="115" strokeDasharray="3 3" />
              <line x1="30" y1="160" x2="405" y2="160" />
            </g>

            {/* Dynamic Live Bars or Showcase Mockup */}
            {livePoints ? (
              <g className="fill-emerald-500 transition-opacity hover:opacity-85">
                {livePoints.map((pt, i) => {
                  const barWidth = 16;
                  const step = (375 - 45) / Math.max(1, livePoints.length);
                  const x = 45 + i * step;
                  const count = (pt.successCount ?? pt.count ?? 0) + (pt.failedCount || 0);
                  const height = Math.max(6, Math.round((count / maxCount) * 110));
                  const y = 160 - height;
                  return (
                    <rect key={pt.date || i} x={x} y={y} width={barWidth} height={height} rx={3}>
                      <title>{`${pt.date}: ${count} logins`}</title>
                    </rect>
                  );
                })}
              </g>
            ) : (
              <g className="fill-emerald-500 transition-opacity hover:opacity-85">
                <rect x="48" y="128" width="18" height="32" rx="3" />
                <rect x="92" y="106" width="18" height="54" rx="3" />
                <rect x="136" y="120" width="18" height="40" rx="3" />
                <rect x="180" y="82" width="18" height="78" rx="3" />
                <rect x="224" y="68" width="18" height="92" rx="3" />
                <rect x="268" y="100" width="18" height="60" rx="3" />
                <rect x="312" y="92" width="18" height="68" rx="3" />
                <rect x="356" y="62" width="18" height="98" rx="3" />
              </g>
            )}
          </svg>
        </div>
      </Card>
    </div>
  );
}
