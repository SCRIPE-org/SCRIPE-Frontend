"use client";

import React from "react";
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

  const currency = summary?.currencyCode || "EGP";

  return (
    <Card className="border-nx-line bg-gradient-to-r from-nx-surface via-nx-surface to-emerald-500/5 overflow-hidden shadow-xs" data-testid="venue-overview-money-card">
      <CardContent className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="flex size-10 items-center justify-center rounded-nx-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <CircleDollarSign className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-nx-ink">
              {t("venueOverview.moneyCard.title", { defaultValue: "Money & Commercial Operations" })}
            </h2>
            <p className="text-xs text-nx-ink-2 mt-0.5 max-w-xl">
              {t("venueOverview.moneyCard.description", {
                defaultValue: "View customer outstanding balances, manual payments, payment allocations, receipts, and refund reconciliation.",
              })}
            </p>
          </div>
        </div>

        {/* Live Financial Metrics Pill (when available from authoritative Finance contract) */}
        {summary && !loading && (
          <div className="flex flex-wrap items-center gap-4 px-4 py-2 rounded-nx-lg bg-nx-surfaceSubtle/80 border border-nx-line text-xs">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Wallet className="size-3.5" aria-hidden="true" />
              </div>
              <div>
                <span className="text-[10px] text-nx-ink-3 uppercase block leading-none font-semibold">
                  {t("venueOverview.moneyCard.collectedToday", { defaultValue: "Collected Today" })}
                </span>
                <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {formatMoney(summary.collectedToday, currency, language)}
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-nx-line" />

            <div className="flex items-center gap-2">
              <div className="p-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock className="size-3.5" aria-hidden="true" />
              </div>
              <div>
                <span className="text-[10px] text-nx-ink-3 uppercase block leading-none font-semibold">
                  {t("venueOverview.moneyCard.outstanding", { defaultValue: "Outstanding" })}
                </span>
                <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400">
                  {formatMoney(summary.outstanding, currency, language)}
                </span>
              </div>
            </div>

            {summary.unallocatedPaymentsCount > 0 && (
              <Badge variant="warning" className="text-[10px] px-1.5 py-0.5">
                {summary.unallocatedPaymentsCount} {t("venueOverview.moneyCard.unallocated", { defaultValue: "unallocated" })}
              </Badge>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {canViewReceivables && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs font-semibold border-nx-line hover:border-nx-accent hover:text-nx-accent"
            >
              <Link href="/venue/money/receivables">
                <Receipt className="size-3.5 text-emerald-500" aria-hidden="true" />
                <span>{t("venueOverview.quickActions.receivables", { defaultValue: "Receivables" })}</span>
              </Link>
            </Button>
          )}

          {canViewPayments && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs font-semibold border-nx-line hover:border-nx-accent hover:text-nx-accent"
            >
              <Link href="/venue/money/payments">
                <CreditCard className="size-3.5 text-nx-accent" aria-hidden="true" />
                <span>{t("venueOverview.quickActions.payments", { defaultValue: "Payments" })}</span>
              </Link>
            </Button>
          )}

          <Button
            asChild
            size="sm"
            className="h-8 gap-1.5 text-xs font-semibold shadow-nx-sm"
          >
            <Link href={primaryHref}>
              <span>{t("venueOverview.moneyCard.openWorkspace", { defaultValue: "Open Money Workspace" })}</span>
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

