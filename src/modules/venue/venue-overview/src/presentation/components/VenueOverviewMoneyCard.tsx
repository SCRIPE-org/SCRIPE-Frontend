"use client";

import Link from "next/link";
import { CircleDollarSign, ArrowUpRight, Receipt, CreditCard, Clock, Wallet } from "lucide-react";
import { Button } from "@core/ui/button";
import { Card, CardContent } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import { useVenueOverviewMoneyCardViewModel } from "../viewmodels/useVenueOverviewMoneyCardViewModel";

interface Props {
  t: (key: string, values?: Record<string, string | number>) => string;
}

function formatMoney(value: number, currency: string, locale: string) {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

export function VenueOverviewMoneyCard({ t }: Props) {
  const { language } = useI18n();
  const { summary, loading, canView, canViewReceivables, canViewPayments, primaryHref } =
    useVenueOverviewMoneyCardViewModel();

  if (!canView) {
    return null;
  }

  const currency = summary?.currencyCode;

  return (
    <Card
      className="overflow-hidden border-nx-line bg-gradient-to-r from-nx-surface via-nx-surface to-emerald-500/5"
      data-testid="venue-overview-money-card"
    >
      <CardContent className="flex flex-col justify-between gap-4 p-4 sm:p-5 md:flex-row md:items-center">
        <div className="flex items-start gap-3.5 sm:items-center">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-nx-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CircleDollarSign className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-nx-ink">
              {t("venueOverview.moneyCard.title", {
                defaultValue: "Money & Commercial Operations",
              })}
            </h2>
            <p className="mt-0.5 max-w-xl text-xs text-nx-ink-2">
              {t("venueOverview.moneyCard.description", {
                defaultValue:
                  "View customer outstanding balances, manual payments, payment allocations, receipts, and refund reconciliation.",
              })}
            </p>
          </div>
        </div>

        {/* Live Financial Metrics Pill (when available from authoritative Finance contract) */}
        {summary && currency && !loading && (
          <div className="bg-nx-surfaceSubtle/80 flex flex-wrap items-center gap-4 rounded-nx-lg border border-nx-line px-4 py-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-emerald-500/10 p-1 text-emerald-600 dark:text-emerald-400">
                <Wallet className="size-3.5" aria-hidden="true" />
              </div>
              <div>
                <span className="block text-[10px] font-semibold uppercase leading-none text-nx-ink-3">
                  {t("venueOverview.moneyCard.collectedToday", { defaultValue: "Collected Today" })}
                </span>
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {formatMoney(summary.collectedToday, currency, language)}
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-nx-line" />

            <div className="flex items-center gap-2">
              <div className="rounded-full bg-amber-500/10 p-1 text-amber-600 dark:text-amber-400">
                <Clock className="size-3.5" aria-hidden="true" />
              </div>
              <div>
                <span className="block text-[10px] font-semibold uppercase leading-none text-nx-ink-3">
                  {t("venueOverview.moneyCard.outstanding", { defaultValue: "Outstanding" })}
                </span>
                <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                  {formatMoney(summary.outstanding, currency, language)}
                </span>
              </div>
            </div>

            {summary.unallocatedPaymentsCount > 0 && (
              <Badge variant="warning" className="px-1.5 py-0.5 text-[10px]">
                {summary.unallocatedPaymentsCount}{" "}
                {t("venueOverview.moneyCard.unallocated", { defaultValue: "unallocated" })}
              </Badge>
            )}
          </div>
        )}

        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          {canViewReceivables && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-nx-line text-xs font-semibold hover:border-nx-accent hover:text-nx-accent"
            >
              <Link href="/venue/money/receivables">
                <Receipt className="size-3.5 text-emerald-500" aria-hidden="true" />
                <span>
                  {t("venueOverview.quickActions.receivables", { defaultValue: "Receivables" })}
                </span>
              </Link>
            </Button>
          )}

          {canViewPayments && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-nx-line text-xs font-semibold hover:border-nx-accent hover:text-nx-accent"
            >
              <Link href="/venue/money/payments">
                <CreditCard className="size-3.5 text-nx-accent" aria-hidden="true" />
                <span>
                  {t("venueOverview.quickActions.payments", { defaultValue: "Payments" })}
                </span>
              </Link>
            </Button>
          )}

          <Button asChild size="sm" className="h-8 gap-1.5 text-xs font-semibold shadow-nx-sm">
            <Link href={primaryHref}>
              <span>
                {t("venueOverview.moneyCard.openWorkspace", {
                  defaultValue: "Open Money Workspace",
                })}
              </span>
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
