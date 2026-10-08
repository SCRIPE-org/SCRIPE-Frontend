"use client";

import React from "react";
import { Info, CheckCircle2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import type { TenantSystemNoticeItem } from "./tenantTypes";

interface TenantSystemNoticesProps {
  notices: TenantSystemNoticeItem[];
}

export function TenantSystemNotices({ notices }: TenantSystemNoticesProps) {
  const { t } = useI18n();

  return (
    <Card className="shadow-xs border-border bg-card p-4">
      {/* Header */}
      <div className="mb-2.5 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">
            {t("tenantCommandCenter.notices.title") || "System Notices"}
          </h3>
          <p className="text-[11px] text-muted-foreground">
            {t("tenantCommandCenter.notices.subtitle") || "Updates relevant to your workspace."}
          </p>
        </div>
      </div>

      {/* Notices */}
      <div className="divide-y divide-border/60">
        {notices.map((notice) => {
          const title =
            notice.id === "sn-1"
              ? t("tenantCommandCenter.notices.operationalTitle") || notice.title
              : notice.id === "sn-2"
                ? t("tenantCommandCenter.notices.customFieldsTitle") || notice.title
                : notice.title;

          const desc =
            notice.id === "sn-1"
              ? t("tenantCommandCenter.notices.operationalDesc") || notice.description
              : notice.id === "sn-2"
                ? t("tenantCommandCenter.notices.customFieldsDesc") || notice.description
                : notice.description;

          return (
            <div
              key={notice.id}
              className="flex items-center justify-between gap-3 py-2.5 text-left"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    notice.isSuccess
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-sky-500/10 text-sky-500"
                  }`}
                >
                  {notice.isSuccess ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Info className="h-3.5 w-3.5" />
                  )}
                </div>
                <div className="min-w-0">
                  <b className="block truncate text-xs font-semibold text-foreground">{title}</b>
                  <span className="block truncate text-[10px] text-muted-foreground">{desc}</span>
                </div>
              </div>

              <time className="shrink-0 font-mono text-[10px] text-muted-foreground">
                {notice.timeAgo === "Now"
                  ? t("tenantCommandCenter.notices.now") || notice.timeAgo
                  : notice.timeAgo}
              </time>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
