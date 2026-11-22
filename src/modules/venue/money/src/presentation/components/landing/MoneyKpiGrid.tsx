"use client";

import { Clock, CreditCard, RotateCcw, ShieldCheck, TrendingUp, Wallet } from "lucide-react";
import { Card } from "@core/ui/card";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import type { MoneySummaryItem } from "../../../domain/entities/Money";
import { formatMoney } from "./moneyLandingFormatters";

interface MoneyKpiGridProps {
  summary: MoneySummaryItem | null;
  currency: string;
}

/**
 * 6-tile primary financial KPI strip for MoneyLandingView.
 */
export function MoneyKpiGrid({ summary, currency }: MoneyKpiGridProps) {
  const { t, language } = useI18n();

  const items = [
    {
      key: "amountDue",
      title: t("money.landing.kpis.amountDue"),
      subtitle: t("money.landing.kpis.amountDueSubtitle"),
      value: formatMoney(summary?.commercialValue ?? 0, currency, language),
      valueClassName: "text-nx-ink",
      iconWrapClassName: "bg-nx-accent-wash text-nx-accent",
      icon: TrendingUp,
    },
    {
      key: "amountCollected",
      title: t("money.landing.kpis.amountCollected"),
      subtitle: t("money.landing.kpis.amountCollectedSubtitle"),
      value: formatMoney(summary?.collected ?? 0, currency, language),
      valueClassName: "text-success",
      iconWrapClassName: "bg-success/10 text-success",
      icon: Wallet,
    },
    {
      key: "collectedToday",
      title: t("money.landing.kpis.collectedToday"),
      subtitle: t("money.landing.kpis.collectedTodaySubtitle"),
      value: formatMoney(summary?.collectedToday ?? 0, currency, language),
      valueClassName: "text-success",
      iconWrapClassName: "bg-success/10 text-success",
      icon: CreditCard,
    },
    {
      key: "outstandingBalance",
      title: t("money.landing.kpis.outstandingBalance"),
      subtitle: t("money.landing.kpis.outstandingBalanceSubtitle", {
        count: summary?.openReceivablesCount ?? 0,
      }),
      value: formatMoney(summary?.outstanding ?? 0, currency, language),
      valueClassName: "text-warning",
      iconWrapClassName: "bg-warning/10 text-warning",
      icon: Clock,
    },
    {
      key: "refundStatus",
      title: t("money.landing.kpis.refundStatus"),
      subtitle: t("money.landing.kpis.refundStatusSubtitle"),
      value: formatMoney(summary?.refunds ?? 0, currency, language),
      valueClassName: "text-nx-ink",
      iconWrapClassName: "bg-nx-raised text-nx-ink-2",
      icon: RotateCcw,
    },
    {
      key: "netCollected",
      title: t("money.landing.kpis.netCollected"),
      subtitle: t("money.landing.kpis.netCollectedSubtitle"),
      value: formatMoney(summary?.netCollected ?? 0, currency, language),
      valueClassName: "text-nx-ink",
      iconWrapClassName: "bg-info/10 text-info",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-6">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.key} className="flex flex-col justify-between p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
                {item.title}
              </span>
              <div className={cn("rounded-full p-1.5", item.iconWrapClassName)}>
                <Icon className="size-3.5" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-2">
              <p className={cn("font-mono text-xl font-bold", item.valueClassName)}>
                {item.value}
              </p>
              <p className="mt-0.5 text-[10px] text-nx-ink-3">{item.subtitle}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
