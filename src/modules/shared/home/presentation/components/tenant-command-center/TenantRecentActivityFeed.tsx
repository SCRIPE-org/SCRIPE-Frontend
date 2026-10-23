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
    <Card className="min-w-0 overflow-hidden border-nx-line bg-nx-surface p-4 text-nx-ink hover:border-nx-line-hi sm:p-5">
      {/* Header */}
      <div className="mb-3 flex min-w-0 flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-nx-md"
            style={{
              background: "color-mix(in oklch, var(--info) 12%, transparent)",
              color: "var(--info)",
            }}
          >
            <History className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-nx-ink">
              {t("tenantCommandCenter.activity.title") || "Activity Feed"}
            </h3>
            <p className="truncate text-xs text-nx-ink-3">
              {t("tenantCommandCenter.activity.subtitle") || "Recent administrative changes."}
            </p>
          </div>
        </div>

        <Link
          href="/audit"
          className="flex shrink-0 items-center gap-1 text-xs font-semibold text-nx-accent hover:underline"
        >
          <span>{t("tenantCommandCenter.activity.viewAll") || "View all"}</span>
          <ChevronRight className="h-3 w-3 rtl:rotate-180" />
        </Link>
      </div>

      {/* Activity Feed rows or empty state */}
      {activityFeed.length === 0 ? (
        <div className="py-6 text-center">
          <History className="mx-auto mb-2 h-6 w-6 text-nx-ink-3 opacity-60" />
          <p className="text-xs text-nx-ink-3">
            {t("tenantCommandCenter.activity.noActivity") ||
              "No recent administrative activity recorded."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-nx-line">
          {activityFeed.map((item) => {
            const avatarColor = item.avatarColor ?? "var(--info)";

            return (
              <div key={item.id} className="flex min-w-0 items-center justify-between gap-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                    style={{
                      backgroundColor: `color-mix(in oklch, ${avatarColor} 14%, transparent)`,
                      color: avatarColor,
                    }}
                  >
                    {item.avatarText}
                  </div>
                  <div className="min-w-0">
                    <b className="block truncate text-xs font-semibold text-nx-ink">
                      {item.author}
                    </b>
                    <span className="block truncate text-[11px] text-nx-ink-3">{item.action}</span>
                  </div>
                </div>

                <time className="shrink-0 font-mono text-[10px] text-nx-ink-3">{item.timeAgo}</time>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
