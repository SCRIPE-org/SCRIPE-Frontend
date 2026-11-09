"use client";

import React from "react";
import type { DeferredCodexMetrics } from "../../domain/entities/AcademyAnalytics";

interface DeferredMetricsNoticeProps {
  deferred?: DeferredCodexMetrics;
  t: (key: string, options?: Record<string, string | number>) => string;
}

export function DeferredMetricsNotice({ deferred, t }: DeferredMetricsNoticeProps) {
  const status = deferred?.status || "DEFERRED_PENDING_CODEX_S5_S6";
  const expected = deferred?.expectedMetrics?.length
    ? deferred.expectedMetrics.join(", ")
    : "AttendanceRatePercent, CoachSessionWorkloadHours, SessionUtilizationRatePercent";

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-amber-500/20 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <h2 className="text-xs sm:text-sm font-semibold text-nx-ink">
            {t("deferredNotice.title")}
          </h2>
        </div>
        <span className="font-mono text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 w-fit">
          {status}
        </span>
      </div>

      <p className="text-xs text-nx-ink-2 leading-relaxed">
        {t("deferredNotice.description")}
      </p>

      {/* Metric placeholders explicitly withheld */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="rounded border border-nx-line bg-nx-surface/80 p-2.5">
          <span className="text-[11px] text-nx-ink-3 block">
            {t("deferredNotice.attendanceRate")}
          </span>
          <span className="font-mono text-xs font-semibold text-amber-500 mt-1 block">
            — [{t("deferredNotice.pendingValue")}]
          </span>
        </div>

        <div className="rounded border border-nx-line bg-nx-surface/80 p-2.5">
          <span className="text-[11px] text-nx-ink-3 block">
            {t("deferredNotice.coachWorkload")}
          </span>
          <span className="font-mono text-xs font-semibold text-amber-500 mt-1 block">
            — [{t("deferredNotice.pendingValue")}]
          </span>
        </div>

        <div className="rounded border border-nx-line bg-nx-surface/80 p-2.5">
          <span className="text-[11px] text-nx-ink-3 block">
            {t("deferredNotice.sessionUtilization")}
          </span>
          <span className="font-mono text-xs font-semibold text-amber-500 mt-1 block">
            — [{t("deferredNotice.pendingValue")}]
          </span>
        </div>
      </div>

      <div className="text-[11px] text-nx-ink-3 font-mono pt-1">
        <span className="text-nx-ink-2">{t("deferredNotice.contractTitle")} </span>
        <span className="text-nx-accent">{expected}</span>
      </div>
    </div>
  );
}
