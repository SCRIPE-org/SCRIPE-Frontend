/* eslint-disable unused-imports/no-unused-vars */
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
    <div className="flex h-[280px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex h-[58px] items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="shadow-xs flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-foreground">
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
          className="group flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <span>{t("platformCommandCenter.operationalActivity.auditLog") || "Audit log"}</span>
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Activity List */}
      <div className="flex-1 divide-y divide-border/60 overflow-y-auto p-3">
        {activities.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-xs text-muted-foreground">
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
                className="group flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-accent/40"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${iconStyles}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <b className="block truncate text-xs font-semibold text-foreground group-hover:text-primary">
                      {item.title}
                    </b>
                    <small className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                      {item.subtitle}
                    </small>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 font-mono text-[10px] text-muted-foreground">
                  <span>{item.timeAgo}</span>
                  <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
