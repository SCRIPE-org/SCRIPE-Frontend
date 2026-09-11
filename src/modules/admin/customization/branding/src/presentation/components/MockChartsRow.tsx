/**
 * MockChartsRow Component
 *
 * Renders the preview charts row inside the customizer studio dashboard preview.
 * Includes a monthly revenue bar chart simulation and a traffic source distribution donut chart.
 */
"use client";

import { MoreHorizontal } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";

/**
 * Properties for the MockChartsRow component.
 */
export interface MockChartsRowProps {
  /** Optional custom CSS class name. */
  className?: string;
}

/**
 * Renders the two mock analytical chart cards for revenue and traffic sources.
 */
export function MockChartsRow({ className }: MockChartsRowProps) {
  const { t } = useI18n();

  return (
    <div className={cn("grid grid-cols-1 gap-4 lg:grid-cols-3", className)}>
      {/* Monthly Revenue Bar Chart Simulation */}
      <div className="rounded-nx-md border border-nx-line bg-nx-surface p-4 shadow-nx-sm lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-nx-ink">
              {t("studio.dashboardPreview.revenueOverview")}
            </h3>
            <p className="text-xs text-nx-ink-3">{t("studio.dashboardPreview.monthlyRevenue")}</p>
          </div>
          <div className="flex gap-1">
            {["7d", "30d", "90d"].map((period, i) => (
              <button
                key={period}
                className={cn(
                  "rounded-nx-control px-2 py-1 text-xs",
                  i === 1
                    ? "bg-nx-accent-fill text-nx-on-fill"
                    : "text-nx-ink-3 hover:bg-nx-hover"
                )}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        <div className="flex h-[140px] items-end gap-1.5 px-2">
          {[35, 50, 70, 45, 80, 60, 90, 55, 72, 42, 85, 68].map((heightPct, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t-nx-control transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none"
                style={{
                  height: `${heightPct}%`,
                  background: "color-mix(in srgb, var(--nx-accent-fill) 80%, transparent)",
                }}
              />
              <span className="text-[11px] text-nx-ink-3">
                {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Traffic Sources Donut Chart Simulation */}
      <div className="rounded-nx-md border border-nx-line bg-nx-surface p-4 shadow-nx-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-nx-ink">{t("studio.dashboardPreview.sources")}</h3>
          <MoreHorizontal className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
        </div>
        <div className="my-4 flex items-center justify-center">
          <div className="relative h-[100px] w-[100px]">
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="var(--nx-line-hi)"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="var(--nx-accent)"
                strokeWidth="3"
                strokeDasharray="55 45"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-nx-ink">68%</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { l: t("studio.dashboardPreview.sourceLabels.direct"), p: "42%", opacity: "100%" },
            { l: t("studio.dashboardPreview.sourceLabels.social"), p: "28%", opacity: "60%" },
            { l: t("studio.dashboardPreview.sourceLabels.referral"), p: "18%", opacity: "30%" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: "var(--nx-accent-fill)", opacity: item.opacity }}
                />
                <span className="text-xs text-nx-ink-3">{item.l}</span>
              </div>
              <span className="text-xs font-medium text-nx-ink">{item.p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
