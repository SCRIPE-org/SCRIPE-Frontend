/**
 * TransactionsCard — Recent transactions list with type/fee breakdown.
 */
"use client";

import type { PlatformTransaction } from "../../domain/entities/PlatformStripeDashboard";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Activity, ArrowDownRight, ArrowUpRight, ExternalLink } from "lucide-react";
import { formatStripeCurrency } from "./utils";

interface TransactionsCardProps {
  transactions: PlatformTransaction[];
  paymentsLink: string;
}

export function TransactionsCard({ transactions, paymentsLink }: TransactionsCardProps) {
  const { t } = useI18n();

  const txTypeLabels: Record<string, { label: string; color: string }> = {
    charge: { label: t("entitlements.platformStripe.txCharge"), color: "text-emerald-500" },
    payment: { label: t("entitlements.platformStripe.txPayment"), color: "text-emerald-500" },
    refund: { label: t("entitlements.platformStripe.txRefund"), color: "text-red-500" },
    transfer: { label: t("entitlements.platformStripe.txTransfer"), color: "text-blue-500" },
    payout: { label: t("entitlements.platformStripe.txPayout"), color: "text-violet-500" },
    adjustment: { label: t("entitlements.platformStripe.txAdjustment"), color: "text-amber-500" },
    stripe_fee: { label: t("entitlements.platformStripe.txStripeFee"), color: "text-gray-400" },
    application_fee: { label: t("entitlements.platformStripe.txAppFee"), color: "text-indigo-500" },
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#635bff]" />
            <CardTitle className="text-base">{t("entitlements.platformStripe.recentTransactions")}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1"
            onClick={() => window.open(paymentsLink, "_blank")}
          >
            {t("entitlements.platformStripe.viewAll")} <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">{t("entitlements.platformStripe.noTransactions")}</p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {transactions.map((tx) => {
              const txType = txTypeLabels[tx.type] ?? { label: tx.type, color: "text-foreground" };
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 rounded-lg ${tx.isPositive ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                      {tx.isPositive ? (
                        <ArrowDownRight className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <ArrowUpRight className="h-3.5 w-3.5 text-red-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${txType.color}`}>{txType.label}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{tx.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {tx.displayLabel}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-semibold ${tx.isPositive ? "text-emerald-600" : "text-red-500"}`}>
                      {tx.isPositive ? "+" : ""}{formatStripeCurrency(tx.amount, tx.currency)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {t("entitlements.platformStripe.fee")}: {formatStripeCurrency(tx.fee, tx.currency)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
