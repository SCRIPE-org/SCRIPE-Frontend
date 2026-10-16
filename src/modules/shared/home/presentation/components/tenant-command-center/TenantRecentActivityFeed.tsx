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

export function TenantRecentActivityFeed({ activityFeed }: TenantRecentActivityFeedProps) {
  const { t } = useI18n();

  return (
    <Card className="shadow-xs border-border bg-card p-4">
      {/* Header */}
      <div className="mb-2.5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-500/20 bg-sky-500/10 text-sky-500">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {t("tenantCommandCenter.activity.title") || "Activity Feed"}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {t("tenantCommandCenter.activity.subtitle") || "Recent administrative changes."}
            </p>
          </div>
        </div>

        <Link
          href="/audit"
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <span>{t("tenantCommandCenter.activity.viewAll") || "View all"}</span>
          <ChevronRight className="h-3 w-3 rtl:rotate-180" />
        </Link>
      </div>

      {/* Activity Feed rows or empty state */}
      {activityFeed.length === 0 ? (
        <div className="py-4 text-center">
          <History className="mx-auto mb-1.5 h-5 w-5 text-muted-foreground opacity-60" />
          <p className="text-xs text-muted-foreground">
            {t("tenantCommandCenter.activity.noActivity") ||
              "No recent administrative activity recorded."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/60">
          {activityFeed.map((item) => {
            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 py-2.5 text-left"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                    style={{
                      backgroundColor: item.avatarColor
                        ? `${item.avatarColor}18`
                        : "rgba(14,165,233,0.15)",
                      color: item.avatarColor ?? "rgb(14,165,233)",
                    }}
                  >
                    {item.avatarText}
                  </div>
                  <div className="min-w-0">
                    <b className="block truncate text-xs font-semibold text-foreground">
                      {item.author}
                    </b>
                    <span className="block truncate text-[10px] text-muted-foreground">
                      {item.action}
                    </span>
                  </div>
                </div>

                <time className="shrink-0 font-mono text-[10px] text-muted-foreground">
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
