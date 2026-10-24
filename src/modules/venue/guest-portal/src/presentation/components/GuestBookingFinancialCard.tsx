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
    <Card className="border-nx-line/80 overflow-hidden border bg-nx-surface shadow-sm">
      <CardHeader className="bg-nx-surfaceSubtle/50 border-nx-line/50 flex flex-row items-center justify-between border-b px-4 py-3 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-nx-ink">
          <CreditCard className="size-4 text-nx-accent" aria-hidden="true" />
          {t("guestPortal.finance.title")}
        </CardTitle>

        <div className="flex items-center gap-1.5 text-xs">
          {isFullyPaid ? (
            <span className="inline-flex items-center gap-1 font-medium text-success">
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              {t("guestPortal.finance.status.Paid")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-medium text-warning">
              <Clock className="size-3.5" aria-hidden="true" />
              {t("guestPortal.finance.status.Pending")}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4 sm:p-6">
        {financialSummary.invoiceNumber && (
          <div className="border-nx-line/40 flex items-center justify-between border-b pb-2 text-xs text-nx-ink-2">
            <span>{t("guestPortal.finance.invoiceNumber")}</span>
            <span className="font-mono font-medium text-nx-ink" dir="ltr">
              {financialSummary.invoiceNumber}
            </span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 text-center sm:gap-4">
          <div className="bg-nx-surfaceSubtle border-nx-line/40 rounded-nx-md border p-2.5 sm:p-3">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
              {t("guestPortal.finance.totalAmount")}
            </span>
            <span className="mt-1 block text-sm font-bold text-nx-ink sm:text-base">
              {formatCurrency(financialSummary.totalAmount)}
            </span>
          </div>

          <div className="rounded-nx-md border border-success/20 bg-success/10 p-2.5 sm:p-3">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-success">
              {t("guestPortal.finance.paidAmount")}
            </span>
            <span className="mt-1 block text-sm font-bold text-success sm:text-base">
              {formatCurrency(financialSummary.paidAmount)}
            </span>
          </div>

          <div
            className={`rounded-nx-md border p-2.5 sm:p-3 ${
              financialSummary.outstandingAmount > 0
                ? "border-warning/20 bg-warning/10"
                : "bg-nx-surfaceSubtle border-nx-line/40"
            }`}
          >
            <span
              className={`block text-[11px] font-semibold uppercase tracking-wider ${
                financialSummary.outstandingAmount > 0
                  ? "text-warning"
                  : "text-nx-ink-3"
              }`}
            >
              {t("guestPortal.finance.outstandingAmount")}
            </span>
            <span
              className={`mt-1 block text-sm font-bold sm:text-base ${
                financialSummary.outstandingAmount > 0
                  ? "text-warning"
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
