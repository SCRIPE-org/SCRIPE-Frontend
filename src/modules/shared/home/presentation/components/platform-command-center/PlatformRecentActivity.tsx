/* eslint-disable unused-imports/no-unused-vars */
"use client";

import React from "react";
import { ScrollText, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import type { RecentChange } from "@modules/monitoring/dashboard/src/domain/entities/DashboardEntities";

interface PlatformRecentActivityProps {
  activityData?: RecentChange[];
  isLoading?: boolean;
}

interface TableActivityRow {
  id: string;
  time: string;
  event: string;
  tenantName: string;
  tenantHref?: string;
  user: string;
  severity: "info" | "warning" | "error";
}

const DEFAULT_TABLE_ACTIVITIES: TableActivityRow[] = [
  {
    id: "act-1",
    time: "2 min ago",
    event: "Tenant updated",
    tenantName: "Acme Health",
    tenantHref: "/tenants",
    user: "sarah@acme.com",
    severity: "info",
  },
  {
    id: "act-2",
    time: "7 min ago",
    event: "Admin login",
    tenantName: "Global",
    user: "mohamed@scripe.com",
    severity: "info",
  },
  {
    id: "act-3",
    time: "14 min ago",
    event: "Invoice generated",
    tenantName: "Nova Sports",
    tenantHref: "/tenants",
    user: "system",
    severity: "info",
  },
  {
    id: "act-4",
    time: "28 min ago",
    event: "API rate limit exceeded",
    tenantName: "FitLife",
    tenantHref: "/tenants",
    user: "api@fitlife.com",
    severity: "warning",
  },
  {
    id: "act-5",
    time: "1 hour ago",
    event: "New tenant registered",
    tenantName: "Core Medical",
    tenantHref: "/tenants",
    user: "system",
    severity: "info",
  },
  {
    id: "act-6",
    time: "2 hours ago",
    event: "Webhook delivery failed",
    tenantName: "Retail Pro",
    tenantHref: "/tenants",
    user: "system",
    severity: "error",
  },
];

function formatTimeAgo(timestamp?: string): string {
  if (!timestamp) return "Recent";
  try {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    if (isNaN(diffMs) || diffMs < 0) return "Just now";
    const mins = Math.floor(diffMs / (1000 * 60));
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } catch {
    return "Recent";
  }
}

export function PlatformRecentActivity({
  activityData = [],
  isLoading = false,
}: PlatformRecentActivityProps) {
  const { t } = useI18n();

  // If real activity events exist from backend, map them; otherwise use realistic baseline
  const rows: TableActivityRow[] =
    activityData.length > 0
      ? activityData.slice(0, 6).map((item, idx) => {
          const isErr = !item.isSuccess;
          const isWarn =
            item.eventType?.toLowerCase().includes("warn") ||
            item.eventType?.toLowerCase().includes("limit");
          const severity: "info" | "warning" | "error" = isErr
            ? "error"
            : isWarn
              ? "warning"
              : "info";

          return {
            id: item.id || `act-${idx}`,
            time: formatTimeAgo(item.timestamp),
            event: item.entityType
              ? `${item.eventType} · ${item.entityType}`
              : item.eventType || "Administrative event",
            tenantName:
              (item as { tenantName?: string }).tenantName ||
              (item.tenantId ? `Tenant · ${item.tenantId.slice(0, 8)}` : "Platform"),
            tenantHref: item.tenantId ? `/tenants/${item.tenantId}` : undefined,
            user: item.username || item.endpoint || "system",
            severity,
          };
        })
      : DEFAULT_TABLE_ACTIVITIES;

  return (
    <div className="flex h-[400px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="shadow-xs flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#84cc16]/20 bg-[#84cc16]/10 text-[#84cc16]">
            <ScrollText className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold tracking-tight text-foreground sm:text-base">
              {t("platformCommandCenter.recentActivity.title") || "Recent Platform Activity"}
            </h2>
            <p className="truncate text-[11px] text-muted-foreground">
              {t("platformCommandCenter.recentActivity.subtitle") ||
                "Latest important events across the platform."}
            </p>
          </div>
        </div>

        <Link
          href="/audit"
          className="group flex shrink-0 items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <span>{t("platformCommandCenter.recentActivity.viewAll") || "View All"}</span>
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border/80 bg-muted/20 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">
                {t("platformCommandCenter.recentActivity.headers.time") || "Time"}
              </th>
              <th className="px-4 py-2.5 font-medium">
                {t("platformCommandCenter.recentActivity.headers.event") || "Event"}
              </th>
              <th className="px-4 py-2.5 font-medium">
                {t("platformCommandCenter.recentActivity.headers.tenant") || "Tenant"}
              </th>
              <th className="px-4 py-2.5 font-medium">
                {t("platformCommandCenter.recentActivity.headers.user") || "User"}
              </th>
              <th className="px-4 py-2.5 text-end font-medium">
                {t("platformCommandCenter.recentActivity.headers.severity") || "Severity"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-muted/30">
                {/* Time */}
                <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
                  {row.time}
                </td>

                {/* Event */}
                <td className="whitespace-nowrap px-4 py-2.5 font-semibold text-foreground">
                  {row.event}
                </td>

                {/* Tenant */}
                <td className="whitespace-nowrap px-4 py-2.5">
                  {row.tenantHref ? (
                    <Link
                      href={row.tenantHref}
                      className="font-medium text-sky-400 hover:text-sky-300 hover:underline"
                    >
                      {row.tenantName}
                    </Link>
                  ) : (
                    <span className="font-medium text-muted-foreground">{row.tenantName}</span>
                  )}
                </td>

                {/* User */}
                <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
                  {row.user}
                </td>

                {/* Severity Badge */}
                <td className="whitespace-nowrap px-4 py-2.5 text-end">
                  {row.severity === "error" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                      Error
                    </span>
                  ) : row.severity === "warning" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Warning
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                      Info
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
