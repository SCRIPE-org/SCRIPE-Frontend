"use client";

import React from "react";
import { History, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import type { OperationalActivityItem } from "../../viewmodels/usePlatformCommandCenterViewModel";
import type { RecentChange } from "@modules/monitoring/dashboard/src/domain/entities/DashboardEntities";

interface PlatformOperationalActivityProps {
  activityData?: RecentChange[];
  activities?: OperationalActivityItem[];
  isLoading?: boolean;
}

export function PlatformOperationalActivity({
  activities: propActivities,
  isLoading = false,
}: PlatformOperationalActivityProps) {
  const { t } = useI18n();

  const activities: OperationalActivityItem[] = propActivities ?? [];

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col h-[280px]">
      {/* Header */}
      <div className="h-[58px] px-4 py-3 flex items-center justify-between border-b border-border bg-muted/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-xs">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight">
              {t("platformCommandCenter.operationalActivity.title") || "Operational activity"}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {t("platformCommandCenter.operationalActivity.subtitle") ||
                "Recent changes that may affect the platform"}
            </p>
          </div>
        </div>

        <Link
          href="/audit"
          className="text-xs font-semibold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors group"
        >
          <span>{t("platformCommandCenter.operationalActivity.auditLog") || "Audit log"}</span>
          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Activity List */}
      <div className="flex-1 p-3 divide-y divide-border/60 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center p-6 text-muted-foreground text-xs">
            {t("platformCommandCenter.operationalActivity.noActivity") ||
              "No recent operational activity recorded"}
          </div>
        ) : (
          activities.map((item) => {
            const Icon = item.icon;

            const iconStyles =
              item.iconTheme === "destructive"
                ? "bg-destructive/10 border-destructive/20 text-destructive"
                : item.iconTheme === "info"
                ? "bg-sky-500/10 border-sky-500/20 text-sky-500"
                : item.iconTheme === "warning"
                ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                : "bg-primary/10 border-primary/20 text-primary";

            return (
              <Link
                key={item.id}
                href="/audit"
                className="py-2.5 px-2 flex items-center justify-between gap-3 hover:bg-accent/40 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${iconStyles}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <b className="text-xs font-semibold text-foreground group-hover:text-primary block truncate">
                      {item.title}
                    </b>
                    <small className="text-[10px] text-muted-foreground block mt-0.5 truncate">
                      {item.subtitle}
                    </small>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-muted-foreground font-mono text-[10px]">
                  <span>{item.timeAgo}</span>
                  <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
