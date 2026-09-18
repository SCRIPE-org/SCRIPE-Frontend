"use client";

import React from "react";
import { Zap, ChevronRight } from "lucide-react";
import Link from "next/link";
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
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col h-[280px]">
      {/* Header */}
      <div className="h-[58px] px-4 py-3 flex items-center justify-between border-b border-border bg-muted/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-xs">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight">
              {t("platformCommandCenter.recommendedActions.title") || "Recommended actions"}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {t("platformCommandCenter.recommendedActions.subtitle") ||
                "Next best actions, ordered by urgency"}
            </p>
          </div>
        </div>

        <Link
          href="/overview"
          className="text-xs font-semibold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors group"
        >
          <span>{t("platformCommandCenter.recommendedActions.viewAll") || "View all"}</span>
          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Actions List */}
      <div className="flex-1 p-3 divide-y divide-border/60 overflow-y-auto">
        {actions.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center p-6 text-muted-foreground text-xs">
            {t("platformCommandCenter.recommendedActions.allNominal") ||
              "All operational systems nominal. No pending actions."}
          </div>
        ) : (
          actions.map((action) => {
            const rankColor =
              action.severity === "critical"
                ? "bg-destructive/10 text-destructive border-destructive/20"
                : action.severity === "warning"
                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                : "bg-sky-500/10 text-sky-500 border-sky-500/20";

            return (
              <div key={action.id} className="py-2.5 px-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span
                    className={`w-6 h-6 rounded-md border flex items-center justify-center text-xs font-bold font-mono shrink-0 ${rankColor}`}
                  >
                    {action.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <b className="text-xs font-semibold text-foreground block truncate">
                      {action.title}
                    </b>
                    <small className="text-[10px] text-muted-foreground block mt-0.5 truncate">
                      {action.subtitle}
                    </small>
                  </div>
                </div>

                <Link
                  href={action.href}
                  className="px-2.5 py-1 rounded-md border border-border bg-secondary/60 hover:bg-primary/10 hover:border-primary/30 text-foreground hover:text-primary text-[10px] font-semibold transition-colors shrink-0"
                >
                  {action.buttonLabel}
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
