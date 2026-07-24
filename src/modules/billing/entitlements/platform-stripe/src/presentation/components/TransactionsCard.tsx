/**
 * TransactionsCard — Recent transactions list with type/fee breakdown.
 */
"use client";

import type { PlatformTransaction } from "../../domain/entities/PlatformStripeDashboard";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { SectionState } from "@core/ui/section-state";
import { Activity, ArrowDownRight, ArrowUpRight, ExternalLink } from "lucide-react";
import { formatStripeCurrency } from "./utils";

interface TransactionsCardProps {
  transactions: PlatformTransaction[];
  paymentsLink: string;
}

/**
 * Presentation UI component rendering the transactions card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function TransactionsCard({ transactions, paymentsLink }: TransactionsCardProps) {
  const { t } = useI18n();

  // Type is a category, so it is tinted; the ledger direction is carried by the
  // sign and the arrow, never by the tint alone.
  const txTypes: Record<string, { label: string; ink: string }> = {
    charge: { label: t("entitlements.platformStripe.txCharge"), ink: "text-success" },
    payment: { label: t("entitlements.platformStripe.txPayment"), ink: "text-success" },
    refund: { label: t("entitlements.platformStripe.txRefund"), ink: "text-destructive" },
    transfer: { label: t("entitlements.platformStripe.txTransfer"), ink: "text-info" },
    payout: { label: t("entitlements.platformStripe.txPayout"), ink: "text-nx-accent" },
    adjustment: { label: t("entitlements.platformStripe.txAdjustment"), ink: "text-warning" },
    stripe_fee: { label: t("entitlements.platformStripe.txStripeFee"), ink: "text-nx-ink-2" },
    application_fee: { label: t("entitlements.platformStripe.txAppFee"), ink: "text-info" },
  };

  // Stripe reports balance-transaction status in English; anything outside the
  // two documented values falls through to the raw string rather than blanking.
  const txStatuses: Record<string, string> = {
    available: t("entitlements.platformStripe.txStatusAvailable"),
    pending: t("entitlements.platformStripe.txStatusPending"),
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Activity className="h-4 w-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
            <CardTitle className="text-base">
              {t("entitlements.platformStripe.recentTransactions")}
            </CardTitle>
          </div>
          <Button asChild variant="ghost" size="sm" className="shrink-0 gap-1">
            <a href={paymentsLink} target="_blank" rel="noopener noreferrer">
              {t("entitlements.platformStripe.viewAll")}
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only">{t("entitlements.platformStripe.opensInNewTab")}</span>
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <SectionState
          // The view gates the whole page on loading, so by the time this card
          // renders its data has already landed.
          isLoading={false}
          isEmpty={transactions.length === 0}
          emptyMessage={t("entitlements.platformStripe.noTransactions")}
          height={160}
        >
          <div className="nexus-custom-scrollbar max-h-96 space-y-2 overflow-y-auto pe-1">
            {transactions.map((tx) => {
              const txType = txTypes[tx.type] ?? { label: tx.type, ink: "text-nx-ink" };
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between gap-3 rounded-nx-md border border-nx-line bg-nx-raised p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={cn(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-nx-sm border",
                        tx.isPositive
                          ? "border-success/30 bg-success/10 text-success"
                          : "border-destructive/30 bg-destructive/10 text-destructive"
                      )}
                      aria-hidden="true"
                    >
                      {tx.isPositive ? (
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn("text-xs font-medium", txType.ink)}>{txType.label}</span>
                        <Badge variant="outline">{txStatuses[tx.status] ?? tx.status}</Badge>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-nx-ink-3">{tx.displayLabel}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-end">
                    <p
                      className={cn(
                        "text-sm font-semibold tabular-nums",
                        tx.isPositive ? "text-success" : "text-destructive"
                      )}
                    >
                      {tx.isPositive ? "+" : ""}
                      {formatStripeCurrency(tx.amount, tx.currency)}
                    </p>
                    <p className="mt-0.5 text-xs tabular-nums text-nx-ink-3">
                      {t("entitlements.platformStripe.fee")}:{" "}
                      {formatStripeCurrency(tx.fee, tx.currency)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionState>
      </CardContent>
    </Card>
  );
}
