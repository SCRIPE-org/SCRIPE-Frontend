"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { formatRelativeTime } from "./types";
import type { RecentChange } from "@modules/monitoring/dashboard/src/domain/entities/DashboardEntities";

interface MapLiveFeedProps {
  recentActivity?: RecentChange[];
}

export function MapLiveFeed({ recentActivity = [] }: MapLiveFeedProps) {
  const { t } = useI18n();

  return (
    <aside className="border-t lg:border-t-0 lg:border-l border-border bg-card/50 p-3 flex flex-col justify-between overflow-hidden">
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <b className="text-xs font-bold text-foreground">
            {t("platformCommandCenter.activity.liveFeed") || "Live feed"}
          </b>
          <span className="text-[10px] text-muted-foreground">
            {t("platformCommandCenter.activity.last24h") || "last 24h"}
          </span>
        </div>

        <div className="divide-y divide-border/60 mt-1">
          {recentActivity.length > 0 ? (
            recentActivity.slice(0, 5).map((rc) => {
              const isErr = !rc.isSuccess;
              const isAdm = rc.isAdmin;
              const dotClass = isErr
                ? "bg-destructive shadow-[0_0_6px_rgba(239,68,68,0.6)]"
                : isAdm
                ? "bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.6)]"
                : "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]";

              return (
                <div key={rc.id} className="py-2 flex items-start gap-2 text-left">
                  <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${dotClass}`}></span>
                  <div className="min-w-0 flex-1">
                    <b className="text-[11px] font-semibold text-foreground block truncate">
                      {rc.entityType ? `${rc.eventType}: ${rc.entityType}` : rc.eventType}
                    </b>
                    <small className="text-[9.5px] text-muted-foreground block truncate">
                      {rc.username ? `${rc.username} · ${rc.ipAddress || "edge"}` : (rc.endpoint || "Audit event")}
                    </small>
                  </div>
                  <span className="text-[9px] text-muted-foreground font-mono">
                    {formatRelativeTime(rc.timestamp)}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-[10px] text-muted-foreground">
              {t("platformCommandCenter.activity.noActivity") || "No live events recorded"}
            </div>
          )}
        </div>
      </div>

      <Link
        href="/audit"
        className="mt-3 w-full h-8 rounded-lg border border-border bg-secondary/50 hover:bg-primary/10 hover:border-primary/30 text-secondary-foreground hover:text-primary text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
      >
        <span>{t("platformCommandCenter.activity.viewAllActivity") || "View all activity"}</span>
        <ChevronRight className="h-3 w-3" />
      </Link>
    </aside>
  );
}
