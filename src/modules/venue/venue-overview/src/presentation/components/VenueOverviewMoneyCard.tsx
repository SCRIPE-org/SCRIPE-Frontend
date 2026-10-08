"use client";

import React from "react";
import Link from "next/link";
import { CircleDollarSign, ArrowUpRight, Receipt, CreditCard } from "lucide-react";
import { Button } from "@core/ui/button";
import { Card, CardContent } from "@core/ui/card";
import { usePermission } from "@core/hooks/use-permission";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";

interface Props {
  t: (key: string, values?: Record<string, string | number>) => string;
}

/**
 * Documentation for module export
 */
export function VenueOverviewMoneyCard({ t }: Props) {
  const canViewReceivables = usePermission(VENUE_PERMISSIONS.FINANCE_RECEIVABLES_VIEW);
  const canViewPayments = usePermission(VENUE_PERMISSIONS.FINANCE_PAYMENTS_VIEW);

  if (!canViewReceivables && !canViewPayments) {
    return null;
  }

  const primaryHref = canViewReceivables ? "/venue/money/receivables" : "/venue/money/payments";

  return (
    <Card className="border-nx-line bg-gradient-to-r from-nx-surface via-nx-surface to-emerald-500/5 overflow-hidden" data-testid="venue-overview-money-card">
      <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
