"use client";

import Link from "next/link";
import { Building2, CreditCard, Plus, Receipt, Wallet } from "lucide-react";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import type { MoneySummaryItem } from "../../../domain/entities/Money";
import type { DailyShiftChannelSummary } from "../../viewmodels/useMoneyLandingViewModel";
import { formatMoney } from "./moneyLandingFormatters";

interface DailyShiftSummaryCardProps {
  summary: MoneySummaryItem | null;
  currency: string;
  channels: DailyShiftChannelSummary[];
  canRecordPayment: boolean;
  canViewPayments: boolean;
}

const CHANNEL_META: Record<
  DailyShiftChannelSummary["key"],
  { labelKey: string; icon: typeof Wallet }
> = {
  Cash: { labelKey: "money.landing.dailyShift.cash", icon: Wallet },
  Card: { labelKey: "money.landing.dailyShift.cardPos", icon: CreditCard },
  BankTransfer: { labelKey: "money.landing.dailyShift.bankTransfer", icon: Building2 },
};

/**
 * Operational shift summary card rendered when the Today date filter is active.
 */
export function DailyShiftSummaryCard({
  summary,
  currency,
  channels,
  canRecordPayment,
  canViewPayments,
}: DailyShiftSummaryCardProps) {
  const { t, language } = useI18n();

  return (
    <Card className="overflow-hidden" data-testid="today-shift-summary-card">
      <CardHeader className="flex flex-row items-center justify-between border-b border-nx-line bg-nx-raised px-5 py-3.5">
        <div>
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-nx-ink">
            <Receipt className="size-4 text-nx-accent" aria-hidden="true" />
            <span>{t("money.landing.dailyShift.title")}</span>
          </CardTitle>
          <CardDescription className="mt-0.5 text-xs text-nx-ink-2">
            {t("money.landing.dailyShift.subtitle")}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {canRecordPayment && (
            <Button size="sm" variant="default" asChild className="h-7 text-xs">
              <Link href="/venue/money/payments?action=record">
                <Plus className="me-1 size-3" aria-hidden="true" />
                <span>{t("money.landing.dailyShift.recordPaymentAction")}</span>
              </Link>
            </Button>
          )}
          {canViewPayments && (
            <Button size="sm" variant="outline" asChild className="h-7 text-xs">
              <Link href="/venue/money/payments">
                <span>{t("money.landing.dailyShift.viewTodayLedger")}</span>
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-nx-control border border-nx-line bg-nx-raised p-3.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
              {t("money.landing.dailyShift.cashInflow")}
            </span>
            <p className="mt-1 font-mono text-xl font-bold text-success">
              {formatMoney(summary?.collectedToday ?? 0, currency, language)}
            </p>
            <p className="mt-1 text-[11px] text-nx-ink-3">
              {t("money.landing.dailyShift.transactionsTodayCount", {
                count: summary?.paymentsCount ?? 0,
              })}
            </p>
          </div>

          {channels.map((channel) => {
            const meta = CHANNEL_META[channel.key];
            const IconComponent = meta.icon;
            return (
              <div
                key={channel.key}
                className="rounded-nx-control border border-nx-line bg-nx-raised p-3.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
                    {t(meta.labelKey)}
                  </span>
                  <IconComponent className="size-3.5 text-nx-ink-3" aria-hidden="true" />
                </div>
                <p className="mt-1 font-mono text-lg font-bold text-nx-ink">
                  {formatMoney(channel.amount, currency, language)}
                </p>
                <p className="mt-1 text-[11px] text-nx-ink-3">
                  {t("money.landing.transactionsCount", { count: channel.count })} (
                  {channel.percentage}%)
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
