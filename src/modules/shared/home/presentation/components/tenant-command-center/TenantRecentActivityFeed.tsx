"use client";

import React from "react";
import { History, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import type { TenantActivityItem } from "./tenantTypes";

interface TenantRecentActivityFeedProps {
  activityFeed: TenantActivityItem[];
}

export function TenantRecentActivityFeed({
  activityFeed,
}: TenantRecentActivityFeedProps) {
  const { t } = useI18n();

  return (
    <Card className="p-4 border-border bg-card shadow-xs">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {t("tenantCommandCenter.activity.title") || "Activity Feed"}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {t("tenantCommandCenter.activity.subtitle") ||
                "Recent administrative changes."}
            </p>
          </div>
        </div>

        <Link
          href="/audit"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>{t("tenantCommandCenter.activity.viewAll") || "View all"}</span>
          <ChevronRight className="h-3 w-3 rtl:rotate-180" />
        </Link>
      </div>

      {/* Activity Feed rows or empty state */}
      {activityFeed.length === 0 ? (
        <div className="py-4 text-center">
          <History className="h-5 w-5 text-muted-foreground mx-auto mb-1.5 opacity-60" />
          <p className="text-xs text-muted-foreground">
            {t("tenantCommandCenter.activity.noActivity") || "No recent administrative activity recorded."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/60">
          {activityFeed.map((item) => {
            return (
              <div
                key={item.id}
                className="py-2.5 flex items-center justify-between gap-3 text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{
                      backgroundColor: item.avatarColor ? `${item.avatarColor}18` : "rgba(14,165,233,0.15)",
                      color: item.avatarColor ?? "rgb(14,165,233)",
                    }}
                  >
                    {item.avatarText}
                  </div>
                  <div className="min-w-0">
                    <b className="text-xs font-semibold text-foreground block truncate">
                      {item.author}
                    </b>
                    <span className="text-[10px] text-muted-foreground block truncate">
                      {item.action}
                    </span>
                  </div>
                </div>

                <time className="text-[10px] text-muted-foreground font-mono shrink-0">
                  {item.timeAgo}
                </time>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
