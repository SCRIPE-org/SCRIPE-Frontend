"use client";

import React from "react";
import { Zap, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Card } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import type { RecommendedActionItem } from "../../viewmodels/usePlatformCommandCenterViewModel";

interface PlatformRecommendedActionsProps {
  actions?: RecommendedActionItem[];
}

export function PlatformRecommendedActions({
  actions: propActions,
}: PlatformRecommendedActionsProps) {
  const { t } = useI18n();

  const actions: RecommendedActionItem[] = propActions ?? [];

  return (
    <Card className="flex h-[280px] flex-col overflow-hidden border-nx-line bg-nx-surface p-0 text-nx-ink hover:border-nx-line-hi">
      {/* Header */}
      <div className="flex h-[58px] items-center justify-between border-b border-nx-line bg-nx-raised/40 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-nx-ink">
              {t("platformCommandCenter.recommendedActions.title") || "Recommended actions"}
            </h3>
            <p className="text-[11px] text-nx-ink-3">
              {t("platformCommandCenter.recommendedActions.subtitle") ||
                "Next best actions, ordered by urgency"}
            </p>
          </div>
        </div>

        <Link
          href="/overview"
          className="group flex items-center gap-1 text-xs font-semibold text-nx-ink-3 transition-colors hover:text-primary"
        >
          <span>{t("platformCommandCenter.recommendedActions.viewAll") || "View all"}</span>
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Actions List */}
      <div className="flex-1 divide-y divide-nx-line overflow-y-auto p-3">
        {actions.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-xs text-nx-ink-3">
            {t("platformCommandCenter.recommendedActions.allNominal") ||
              "All operational systems nominal. No pending actions."}
          </div>
        ) : (
          actions.map((action) => {
            const rankColor =
              action.severity === "critical"
                 ? "bg-destructive/10 text-destructive border-destructive/20"
                 : action.severity === "warning"
                   ? "bg-warning/10 text-warning border-warning/20"
                   : "bg-info/10 text-info border-info/20";

            return (
              <div key={action.id} className="flex items-center justify-between gap-3 px-2 py-2.5">
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-mono text-xs font-bold ${rankColor}`}
                  >
                    {action.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <b className="block truncate text-xs font-semibold text-nx-ink">
                      {action.title}
                    </b>
                    <small className="mt-0.5 block truncate text-[10px] text-nx-ink-3">
                      {action.subtitle}
                    </small>
                  </div>
                </div>

                <Link
                  href={action.href}
                  className="shrink-0 rounded-md border border-nx-line bg-nx-raised/60 px-2.5 py-1 text-[10px] font-semibold text-nx-ink transition-colors hover:border-nx-line-hi hover:bg-nx-raised hover:text-primary"
                >
                  {action.buttonLabel}
                </Link>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
