"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { CreditCard, CheckCircle2, Clock } from "lucide-react";
import type { GuestFinancialSummary } from "../../domain/entities/GuestBooking";

interface GuestBookingFinancialCardProps {
  financialSummary: GuestFinancialSummary;
  language: string;
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function GuestBookingFinancialCard({
  financialSummary,
  language,
  t,
}: GuestBookingFinancialCardProps) {
  const formatCurrency = (amount: number) => {
    try {
      return new Intl.NumberFormat(language, {
        style: "currency",
        currency: financialSummary.currencyCode || "USD",
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${amount} ${financialSummary.currencyCode}`;
    }
  };

  const isFullyPaid = financialSummary.outstandingAmount <= 0;

  return (
    <Card className="border border-nx-line/80 shadow-sm overflow-hidden bg-nx-surface">
      <CardHeader className="py-3 px-4 sm:px-6 bg-nx-surfaceSubtle/50 border-b border-nx-line/50 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-nx-ink">
          <CreditCard className="size-4 text-nx-accent" aria-hidden="true" />
          {t("guestPortal.finance.title")}
        </CardTitle>

        <div className="flex items-center gap-1.5 text-xs">
          {isFullyPaid ? (
            <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              {t("guestPortal.finance.status.Paid")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
              <Clock className="size-3.5" aria-hidden="true" />
              {t("guestPortal.finance.status.Pending")}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {financialSummary.invoiceNumber && (
          <div className="flex items-center justify-between text-xs text-nx-ink-2 border-b border-nx-line/40 pb-2">
            <span>{t("guestPortal.finance.invoiceNumber")}</span>
            <span className="font-mono font-medium text-nx-ink" dir="ltr">
              {financialSummary.invoiceNumber}
            </span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div className="p-2.5 sm:p-3 rounded-nx-md bg-nx-surfaceSubtle border border-nx-line/40">
            <span className="block text-[11px] font-semibold text-nx-ink-3 uppercase tracking-wider">
              {t("guestPortal.finance.totalAmount")}
            </span>
            <span className="block text-sm sm:text-base font-bold text-nx-ink mt-1">
              {formatCurrency(financialSummary.totalAmount)}
            </span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-nx-md bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20">
            <span className="block text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              {t("guestPortal.finance.paidAmount")}
            </span>
            <span className="block text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrency(financialSummary.paidAmount)}
            </span>
          </div>

          <div
            className={`p-2.5 sm:p-3 rounded-nx-md border ${
              financialSummary.outstandingAmount > 0
                ? "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20"
                : "bg-nx-surfaceSubtle border-nx-line/40"
            }`}
          >
            <span
              className={`block text-[11px] font-semibold uppercase tracking-wider ${
                financialSummary.outstandingAmount > 0
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-nx-ink-3"
              }`}
            >
              {t("guestPortal.finance.outstandingAmount")}
            </span>
            <span
              className={`block text-sm sm:text-base font-bold mt-1 ${
                financialSummary.outstandingAmount > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-nx-ink-3"
              }`}
            >
              {formatCurrency(financialSummary.outstandingAmount)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
