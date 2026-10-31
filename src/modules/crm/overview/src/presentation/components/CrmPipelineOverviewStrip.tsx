"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { ShieldCheck, Lock, ArrowRight } from "lucide-react";
import { cn } from "@core/common/utils";
import type { CrmPipelineOverview, CrmStageKey } from "../../domain/models/crm-overview.types";

interface CrmPipelineOverviewStripProps {
  pipeline: CrmPipelineOverview;
  activeFilterStage?: CrmStageKey;
  onSelectStage?: (stage: CrmStageKey) => void;
  className?: string;
}

export function CrmPipelineOverviewStrip({
  pipeline,
  activeFilterStage,
  onSelectStage,
  className,
}: CrmPipelineOverviewStripProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  return (
    <div
      className={cn(
        "rounded-nx-lg border border-nx-line bg-nx-surface p-4 sm:p-5 space-y-4",
        className
      )}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-0.5">
          <h2 className="text-sm font-bold text-nx-ink flex items-center gap-2">
            <span>{t("crm.pipeline.title")}</span>
            <span className="text-[11px] font-semibold text-nx-ink-3">
              ({pipeline.name})
            </span>
          </h2>
          <p className="text-xs text-nx-ink-2">
            {t("crm.pipeline.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-nx-sm bg-nx-surfaceSubtle border border-nx-line text-nx-ink-2">
            <span className="font-semibold text-nx-ink">{pipeline.totalDeals}</span>
            <span>{t("crm.pipeline.dealsCount")}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-nx-sm bg-nx-surfaceSubtle border border-nx-line text-nx-ink-2">
            <span className="font-bold text-nx-accent">
              {pipeline.currency} {pipeline.totalPipelineValue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {pipeline.stages.map((stage, idx) => {
          const isSelected = activeFilterStage === stage.key;
          const isProposalOrAfter = stage.requiresVerifiedParty;

          return (
            <button
              key={stage.key}
              type="button"
              onClick={() => onSelectStage?.(stage.key)}
              className={cn(
                "group relative flex flex-col justify-between p-3 rounded-nx-md border text-left transition-all duration-nx-micro select-none",
                isSelected
                  ? "border-nx-accent bg-nx-surfaceSubtle ring-1 ring-nx-accent"
                  : "border-nx-line bg-nx-surface hover:border-nx-line-hi hover:bg-nx-surfaceSubtle/40"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-bold uppercase tracking-wider text-nx-ink-2 group-hover:text-nx-ink">
                  {stage.name}
                </span>
                {isProposalOrAfter ? (
                  <span
                    title={t("crm.pipeline.partyRequiredNotice")}
                    className="flex items-center text-warning"
                  >
                    <Lock className="size-3 text-warning" aria-hidden="true" />
                  </span>
                ) : (
                  <span className="text-[10px] text-nx-ink-3">#{idx + 1}</span>
                )}
              </div>

              <div className="mt-2.5 space-y-0.5">
                <div className="text-base font-extrabold text-nx-ink">
                  {stage.count}
                  <span className="text-[10px] font-normal text-nx-ink-3 ml-1">
                    {t("crm.pipeline.dealsCount")}
                  </span>
                </div>
                <div className="text-[11px] font-medium text-nx-ink-2 truncate">
                  {pipeline.currency} {stage.value.toLocaleString()}
                </div>
              </div>

              {isProposalOrAfter && (
                <div className="mt-2 pt-1.5 border-t border-nx-line/50 flex items-center gap-1 text-[9px] text-warning font-semibold">
                  <ShieldCheck className="size-2.5 shrink-0" />
                  <span className="truncate">Party Gate</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
