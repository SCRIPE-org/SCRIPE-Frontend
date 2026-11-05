"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { ShieldCheck, Lock } from "lucide-react";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { cn } from "@core/common/utils";
import type { CrmPipelineOverview, CrmStageKey } from "../../domain/entities/OverviewEntity";
import { useCrmCurrency } from "../viewmodels/useCrmSettingsStore";

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
  const { baseCurrency, autoConvertToBase, convertAmount } = useCrmCurrency();
  const sourceCurrency = pipeline?.currency ?? "SAR";
  const displayCurrency = autoConvertToBase ? baseCurrency : sourceCurrency;
  const convertedTotal = convertAmount(
    pipeline?.totalPipelineValue ?? 0,
    sourceCurrency,
    displayCurrency
  );

  return (
    <Card
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
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-nx-sm bg-nx-raised border border-nx-line text-nx-ink-2">
            <span className="font-semibold text-nx-ink">{pipeline.totalDeals}</span>
            <span>{t("crm.pipeline.dealsCount")}</span>
          </div>
          <div
            data-testid="crm-overview-pipeline-total"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-nx-sm bg-nx-raised border border-nx-line text-nx-ink-2"
          >
            <span className="font-bold text-nx-accent font-mono">
              {displayCurrency} {convertedTotal.toLocaleString()}
            </span>
            {autoConvertToBase && sourceCurrency !== displayCurrency && (
              <span className="text-[10px] text-nx-ink-3 font-mono">
                ({sourceCurrency} {(pipeline?.totalPipelineValue ?? 0).toLocaleString()})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {(Array.isArray(pipeline?.stages)
          ? [...pipeline.stages].sort((a, b) => a.sortOrder - b.sortOrder)
          : []
        ).map((stage, idx) => {
          const isSelected = activeFilterStage === stage.key;
          const isProposalOrAfter = stage.requiresVerifiedParty;

          return (
            <Button
              key={stage.key}
              type="button"
              variant="ghost"
              onClick={() => onSelectStage?.(stage.key)}
              className={cn(
                "group relative flex h-auto flex-col items-stretch justify-between p-3.5 rounded-nx-md border text-left transition-all duration-nx-micro select-none whitespace-normal",
                isSelected
                  ? "border-nx-accent bg-nx-raised ring-1 ring-nx-accent"
                  : "border-nx-line bg-nx-surface hover:border-nx-line-hi hover:bg-nx-raised/40"
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

              <div className="mt-2.5 space-y-0.5 w-full">
                <div className="text-base font-extrabold text-nx-ink">
                  {stage.count}
                  <span className="text-[10px] font-normal text-nx-ink-3 ml-1">
                    {t("crm.pipeline.dealsCount")}
                  </span>
                </div>
                <div className="text-[11px] font-medium font-mono text-nx-ink-2 truncate">
                  {displayCurrency}{" "}
                  {convertAmount(stage.value, sourceCurrency, displayCurrency).toLocaleString()}
                </div>
              </div>

              {isProposalOrAfter && (
                <div className="mt-2 pt-1.5 border-t border-nx-line/50 flex items-center gap-1 text-[10px] text-warning font-semibold w-full">
                  <ShieldCheck className="size-3 shrink-0" />
                  <span className="truncate">
                    {t("crm.pipeline.partyGate", { defaultValue: "Account / Contact Required" })}
                  </span>
                </div>
              )}
            </Button>
          );
        })}
      </div>
    </Card>
  );
}
