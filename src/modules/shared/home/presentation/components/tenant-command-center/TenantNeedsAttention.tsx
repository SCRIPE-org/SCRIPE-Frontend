"use client";

import React from "react";
import {
  AlertTriangle,
  ChevronRight,
  AlertCircle,
  CreditCard,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import type { TenantAlertItem } from "./tenantTypes";

interface TenantNeedsAttentionProps {
  alerts: TenantAlertItem[];
}

export function TenantNeedsAttention({ alerts }: TenantNeedsAttentionProps) {
  const { t } = useI18n();

  return (
    <Card className="min-w-0 overflow-hidden border-nx-line bg-nx-surface p-4 text-nx-ink hover:border-nx-line-hi sm:p-5">
      {/* Header */}
      <div className="mb-3.5 flex min-w-0 flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-nx-md"
            style={{
              background: "color-mix(in oklch, var(--warning) 12%, transparent)",
              color: "var(--warning)",
            }}
          >
            <AlertTriangle className="h-4 w-4" />
          </div>
          <h3 className="truncate text-sm font-semibold text-nx-ink">
            {t("tenantCommandCenter.attention.title") || "Needs Attention"}
          </h3>
          <Badge
            variant={alerts.length > 0 ? "destructive" : "secondary"}
            className="h-5 shrink-0 px-1.5 text-[10px] font-bold"
          >
            {alerts.length}
          </Badge>
        </div>

        <Link
          href="/settings"
          className="flex shrink-0 items-center gap-1 text-xs font-semibold text-nx-accent hover:underline"
        >
          <span>{t("tenantCommandCenter.attention.viewAll") || "View all"}</span>
          <ChevronRight className="h-3 w-3 rtl:rotate-180" />
        </Link>
      </div>

      {/* Alert items list or empty state */}
      {alerts.length === 0 ? (
        <div className="py-6 text-center">
          <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-success" />
          <p className="text-xs text-nx-ink-3">
            {t("tenantCommandCenter.attention.noAlerts") ||
              "All operational systems nominal. No pending alerts."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => {
            const isCritical = alert.severity === "critical";

            return (
              <Link
                key={alert.id}
                href={alert.href}
                className="group flex items-center justify-between gap-3 rounded-nx-md border border-nx-line bg-transparent p-2.5 transition-[color,background-color,border-color] duration-nx-micro ease-nx-enter hover:border-nx-line-hi hover:bg-nx-raised"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-nx-md"
                    style={{
                      background: isCritical
                        ? "color-mix(in oklch, var(--destructive) 12%, transparent)"
                        : "color-mix(in oklch, var(--warning) 12%, transparent)",
                      color: isCritical ? "var(--destructive)" : "var(--warning)",
                    }}
                  >
                    {alert.id.includes("login") ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : alert.severity === "critical" ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : alert.id === "alt-3" ? (
                      <CreditCard className="h-4 w-4" />
                    ) : alert.id === "alt-4" ? (
                      <MessageSquare className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <b className="block truncate text-xs font-semibold text-nx-ink transition-colors group-hover:text-nx-accent">
                      {alert.title}
                    </b>
                    <span className="block truncate text-[11px] text-nx-ink-3">
                      {alert.description}
                    </span>
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 shrink-0 text-nx-ink-3 transition-colors group-hover:text-nx-accent rtl:rotate-180" />
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}
