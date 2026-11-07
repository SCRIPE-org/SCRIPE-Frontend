"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@core/ui/card";
import { cn } from "@core/common/utils";
import type { CrmKpiStat } from "../../domain/entities/OverviewEntity";
import { useCrmCurrency } from "../viewmodels/useCrmCurrency";

interface CrmKpiStripProps {
  stats: CrmKpiStat[];
  className?: string;
}

export function CrmKpiStrip({ stats, className }: CrmKpiStripProps) {
  const { baseCurrency, autoConvertToBase, convertAmount } = useCrmCurrency();
  const safeStats = Array.isArray(stats) ? stats : [];

  const renderStatValue = (rawVal: string) => {
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

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
        className
      )}
    >
      {safeStats.map((stat) => {
        const displayValue = renderStatValue(stat.value);
        return (
          <Card
            key={stat.id}
            className="rounded-nx-lg border border-nx-line bg-nx-surface p-4 sm:p-5 flex flex-col justify-between transition-colors duration-nx-micro hover:border-nx-line-hi"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-nx-ink-2">
              <span>{stat.title}</span>
              {stat.changeType === "positive" && (
                <span className="flex items-center gap-0.5 text-success font-bold">
                  <TrendingUp className="size-3" aria-hidden="true" />
                  <span>{stat.change}</span>
                </span>
              )}
              {stat.changeType === "negative" && (
                <span className="flex items-center gap-0.5 text-destructive font-bold">
                  <TrendingDown className="size-3" aria-hidden="true" />
                  <span>{stat.change}</span>
                </span>
              )}
              {stat.changeType === "neutral" && (
                <span className="flex items-center gap-0.5 text-nx-accent font-bold">
                  <Minus className="size-3" aria-hidden="true" />
                  <span>{stat.change}</span>
                </span>
              )}
            </div>

            <div className="my-2 text-2xl font-black text-nx-ink tracking-tight font-heading">
              {displayValue}
            </div>

            <div className="text-[11px] text-nx-ink-3">
              {stat.description}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
