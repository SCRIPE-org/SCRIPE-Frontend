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
    <Card className="min-w-0 overflow-hidden border-nx-line bg-nx-surface p-3.5 text-nx-ink hover:border-nx-line-hi sm:p-4">
      {/* Header */}
      <div className="mb-2.5 flex min-w-0 items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-success/20 bg-success/10 text-success">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-nx-ink">
            {t("tenantCommandCenter.notices.title") || "System Notices"}
          </h3>
          <p className="truncate text-[11px] text-nx-ink-3">
            {t("tenantCommandCenter.notices.subtitle") || "Updates relevant to your workspace."}
          </p>
        </div>
      </div>

      {/* Notices */}
      <div className="divide-y divide-nx-line">
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
              className="flex min-w-0 items-center justify-between gap-2.5 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    notice.isSuccess
                      ? "bg-success/10 text-success"
                      : "bg-info/10 text-info"
                  }`}
                >
                  {notice.isSuccess ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Info className="h-3.5 w-3.5" />
                  )}
                </div>
                <div className="min-w-0">
                  <b className="block truncate text-xs font-semibold text-nx-ink">{title}</b>
                  <span className="block truncate text-[10px] text-nx-ink-3">{desc}</span>
                </div>
              </div>

              <time className="shrink-0 font-mono text-[10px] text-nx-ink-3">
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
