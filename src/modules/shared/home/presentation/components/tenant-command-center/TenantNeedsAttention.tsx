"use client";

import React from "react";
import { AlertTriangle, ChevronRight, AlertCircle, CreditCard, MessageSquare, CheckCircle2 } from "lucide-react";
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
    <Card className="p-4 border-border bg-card shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
            <AlertTriangle className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-sm font-bold text-foreground">
            {t("tenantCommandCenter.attention.title") || "Needs Attention"}
          </h3>
          <Badge
            variant={alerts.length > 0 ? "destructive" : "secondary"}
            className="h-5 px-1.5 text-[10px] font-extrabold"
          >
            {alerts.length}
          </Badge>
        </div>

        <Link
          href="/settings"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>{t("tenantCommandCenter.attention.viewAll") || "View all"}</span>
          <ChevronRight className="h-3 w-3 rtl:rotate-180" />
        </Link>
      </div>

      {/* Alert items list or empty state */}
      {alerts.length === 0 ? (
        <div className="py-4 text-center">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1.5" />
          <p className="text-xs text-muted-foreground">
            {t("tenantCommandCenter.attention.noAlerts") || "All operational systems nominal. No pending alerts."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/60">
          {alerts.map((alert) => {
            const isCritical = alert.severity === "critical";

            return (
              <Link
                key={alert.id}
                href={alert.href}
                className="py-2.5 flex items-center justify-between gap-3 group hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isCritical
                        ? "bg-destructive/10 text-destructive border border-destructive/20"
                        : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    }`}
                  >
                    {alert.id.includes("login") ? (
                      <AlertCircle className="h-3.5 w-3.5" />
                    ) : alert.severity === "critical" ? (
                      <AlertCircle className="h-3.5 w-3.5" />
                    ) : alert.id === "alt-3" ? (
                      <CreditCard className="h-3.5 w-3.5" />
                    ) : alert.id === "alt-4" ? (
                      <MessageSquare className="h-3.5 w-3.5" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <b className="text-xs font-semibold text-foreground block truncate group-hover:text-primary transition-colors">
                      {alert.title}
                    </b>
                    <span className="text-[10px] text-muted-foreground block truncate">
                      {alert.description}
                    </span>
                  </div>
                </div>

                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 rtl:rotate-180" />
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}
