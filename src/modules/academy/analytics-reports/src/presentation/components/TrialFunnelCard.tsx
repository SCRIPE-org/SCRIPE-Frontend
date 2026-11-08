"use client";

import React from "react";
import type { TrialFunnelMetric } from "../../domain/entities/AcademyAnalytics";

interface TrialFunnelCardProps {
  funnel?: TrialFunnelMetric;
  t: (key: string, options?: Record<string, string | number>) => string;
}

export function TrialFunnelCard({ funnel, t }: TrialFunnelCardProps) {
  const total = funnel?.totalTrials ?? 0;
  const requested = funnel?.requestedCount ?? 0;
  const scheduled = funnel?.scheduledCount ?? 0;
  const completed = funnel?.completedCount ?? 0;
  const accepted = funnel?.acceptedCount ?? 0;
  const rejected = funnel?.rejectedCount ?? 0;
  const conversionRate = funnel?.conversionRatePercent ?? 0;

  const stages = [
    { label: t("trialFunnel.requested"), count: requested, color: "text-nx-ink-2", barColor: "bg-nx-ink-3/40" },
    { label: t("trialFunnel.scheduled"), count: scheduled, color: "text-sky-500", barColor: "bg-sky-500" },
    { label: t("trialFunnel.attendedEvaluated"), count: completed, color: "text-amber-500", barColor: "bg-amber-500" },
    { label: t("trialFunnel.accepted"), count: accepted, color: "text-emerald-500", barColor: "bg-emerald-500" },
    { label: t("trialFunnel.rejected"), count: rejected, color: "text-rose-500", barColor: "bg-rose-500" }
  ];

  return (
    <div className="rounded-lg border border-nx-line bg-nx-surface p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-nx-line pb-3">
          <div>
            <h2 className="text-sm font-semibold text-nx-ink">
              {t("trialFunnel.title")}
            </h2>
            <p className="text-xs text-nx-ink-3 mt-0.5">
              {t("trialFunnel.totalTrials")}: <span className="font-mono font-medium text-nx-ink">{total}</span>
            </p>
          </div>
          <div className="text-end">
            <span className="text-xs text-nx-ink-3 block">{t("trialFunnel.conversionRate")}</span>
            <span className="text-lg font-bold font-mono text-emerald-500">
              {conversionRate.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Funnel bars */}
        <div className="mt-4 space-y-3">
          {stages.map((stage) => {
            const pct = total > 0 ? (stage.count / total) * 100 : 0;
            return (
              <div key={stage.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-nx-ink-2">{stage.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-nx-ink-3 text-[11px]">{pct.toFixed(0)}%</span>
                    <span className={`font-mono font-bold ${stage.color}`}>{stage.count}</span>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-nx-ground overflow-hidden">
                  <div
                    className={`h-full rounded-full ${stage.barColor}`}
                    style={{ width: `${Math.max(pct, stage.count > 0 ? 3 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-[11px] text-nx-ink-3 border-t border-nx-line pt-2">
        {t("trialFunnel.conversionNote")}
      </p>
    </div>
  );
}
