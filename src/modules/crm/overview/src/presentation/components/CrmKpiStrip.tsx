"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import { cn } from "@core/common/utils";
import type { CrmKpiStat } from "../../domain/entities/OverviewEntity";
import { useCrmCurrency } from "../viewmodels/useCrmCurrency";

interface CrmKpiStripProps {
  stats: CrmKpiStat[];
  onSelectKpi?: (statId: string) => void;
  className?: string;
}

export function CrmKpiStrip({ stats, onSelectKpi, className }: CrmKpiStripProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const { baseCurrency, autoConvertToBase, convertAmount } = useCrmCurrency();
  const safeStats = Array.isArray(stats) ? stats : [];

  const getStatTitle = (stat: CrmKpiStat) => {
    switch (stat.id) {
      case "active-deals":
        return t("crm.kpi.activeDeals");
      case "pipeline-value":
        return t("crm.kpi.pipelineValue");
      case "win-rate":
        return t("crm.kpi.winRate");
      case "avg-cycle":
        return t("crm.kpi.avgDealCycle");
      default:
        return stat.title;
    }
  };

  const getStatDescription = (stat: CrmKpiStat) => {
    switch (stat.id) {
      case "active-deals":
        return t("crm.kpi.scopedBucket", { currency: baseCurrency });
      case "pipeline-value":
        return t("crm.kpi.activePipelineDesc", { currency: baseCurrency });
      case "win-rate":
        return t("crm.kpi.trailing90Days");
      case "avg-cycle":
        return t("crm.kpi.fromIntakeToWon");
      default:
        return stat.description;
    }
  };

  const renderStatValue = (stat: CrmKpiStat) => {
    const rawVal = stat.value;
    if (stat.id === "avg-cycle") {
      const match = rawVal.match(/^(\d+)/);
      if (match) {
        const num = match[1];
        const unit = num === "1" ? t("crm.kpi.daySingle") : t("crm.kpi.daysPlural");
        return `${num} ${unit}`;
      }
      return rawVal;
    }
    if (!autoConvertToBase || !rawVal) return rawVal;
    const match = rawVal.trim().match(/^([A-Z]{3})\s+([\d,]+(?:\.\d+)?)$/);
    if (!match) return rawVal;
    const [, sourceCode, numPart] = match;
    if (sourceCode.toUpperCase() === baseCurrency.toUpperCase()) return rawVal;
    const numeric = parseFloat(numPart.replace(/,/g, ""));
    if (!Number.isFinite(numeric)) return rawVal;
    const converted = convertAmount(numeric, sourceCode, baseCurrency);
    return `${baseCurrency} ${Math.round(converted).toLocaleString()}`;
  };

  const renderStatChange = (rawChange: string) => {
    if (!rawChange || !isRtl) return rawChange;
    return rawChange.replace(/\bdays\b/gi, t("crm.kpi.daysPlural")).replace(/\bday\b/gi, t("crm.kpi.daySingle"));
  };

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
        className
      )}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {safeStats.map((stat) => {
        const displayValue = renderStatValue(stat);
        const displayTitle = getStatTitle(stat);
        const displayDescription = getStatDescription(stat);
        const displayChange = renderStatChange(stat.change);
        return (
          <Card
            key={stat.id}
            role={onSelectKpi ? "button" : undefined}
            tabIndex={onSelectKpi ? 0 : undefined}
            onClick={onSelectKpi ? () => onSelectKpi(stat.id) : undefined}
            onKeyDown={
              onSelectKpi
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectKpi(stat.id);
                    }
                  }
                : undefined
            }
            data-testid={`crm-kpi-card-${stat.id}`}
            className={cn(
              "rounded-nx-lg border border-nx-line bg-nx-surface p-4 sm:p-5 flex flex-col justify-between transition-colors duration-nx-micro hover:border-nx-line-hi",
              onSelectKpi && "cursor-pointer hover:bg-nx-raised/30"
            )}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-nx-ink-2">
              <span>{displayTitle}</span>
              {stat.changeType === "positive" && (
                <span className="flex items-center gap-0.5 text-success font-bold">
                  <TrendingUp className="size-3" aria-hidden="true" />
                  <span>{displayChange}</span>
                </span>
              )}
              {stat.changeType === "negative" && (
                <span className="flex items-center gap-0.5 text-destructive font-bold">
                  <TrendingDown className="size-3" aria-hidden="true" />
                  <span>{displayChange}</span>
                </span>
              )}
              {stat.changeType === "neutral" && (
                <span className="flex items-center gap-0.5 text-nx-accent font-bold">
                  <Minus className="size-3" aria-hidden="true" />
                  <span>{displayChange}</span>
                </span>
              )}
            </div>

            <div className="my-2 text-2xl font-black text-nx-ink tracking-tight font-heading">
              {displayValue}
            </div>

            <div className="text-[11px] text-nx-ink-3">
              {displayDescription}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
