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
    <aside className="flex flex-col justify-between overflow-hidden border-t border-border bg-card/50 p-3 lg:border-l lg:border-t-0">
      <div>
        <div className="flex items-center justify-between border-b border-border pb-2">
          <b className="text-xs font-bold text-foreground">
            {t("platformCommandCenter.activity.liveFeed") || "Live feed"}
          </b>
          <span className="text-[10px] text-muted-foreground">
            {t("platformCommandCenter.activity.last24h") || "last 24h"}
          </span>
        </div>

        <div className="mt-1 divide-y divide-border/60">
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
                <div key={rc.id} className="flex items-start gap-2 py-2 text-left">
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${dotClass}`}></span>
                  <div className="min-w-0 flex-1">
                    <b className="block truncate text-[11px] font-semibold text-foreground">
                      {rc.entityType ? `${rc.eventType}: ${rc.entityType}` : rc.eventType}
                    </b>
                    <small className="block truncate text-[9.5px] text-muted-foreground">
                      {rc.username
                        ? `${rc.username} · ${rc.ipAddress || "edge"}`
                        : rc.endpoint || "Audit event"}
                    </small>
                  </div>
                  <span className="font-mono text-[9px] text-muted-foreground">
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
        className="mt-3 flex h-8 w-full items-center justify-center gap-1 rounded-lg border border-border bg-secondary/50 text-[11px] font-semibold text-secondary-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
      >
        <span>{t("platformCommandCenter.activity.viewAllActivity") || "View all activity"}</span>
        <ChevronRight className="h-3 w-3" />
      </Link>
    </aside>
  );
}
