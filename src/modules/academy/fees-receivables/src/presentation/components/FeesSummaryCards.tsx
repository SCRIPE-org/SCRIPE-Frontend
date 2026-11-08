"use client";

import React from "react";
import type { AcademyFeesSummaryByCurrency } from "../../domain/entities/AcademyReceivable";

interface FeesSummaryCardsProps {
  summaries: AcademyFeesSummaryByCurrency[];
  t: (key: string, options?: Record<string, string | number>) => string;
}

export function FeesSummaryCards({ summaries, t }: FeesSummaryCardsProps) {
  if (!summaries || summaries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {summaries.map((summary) => (
        <div key={summary.currencyCode} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
              {summary.currencyCode} {t("summary.currencyBreakdown") || "Settlement Scope"}
            </span>
            <div className="h-px flex-1 bg-nx-line" />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {/* Total Invoiced */}
            <div className="rounded-md border border-nx-line bg-nx-surface p-3 transition-colors hover:border-nx-line-hi">
              <span className="block text-xs font-medium text-nx-ink-3">
                {t("summary.totalInvoiced")}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-bold text-nx-ink">
                  {summary.totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-nx-ink-3">{summary.currencyCode}</span>
              </div>
              <span className="mt-1 block text-[11px] text-nx-ink-3">
                {summary.invoicedCount} {t("status.invoiced")}
              </span>
            </div>

            {/* Total Paid */}
            <div className="rounded-md border border-nx-line bg-nx-surface p-3 transition-colors hover:border-nx-line-hi">
              <span className="block text-xs font-medium text-nx-ink-3">
                {t("summary.totalPaid")}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-bold text-emerald-500">
                  {summary.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-nx-ink-3">{summary.currencyCode}</span>
              </div>
              <span className="mt-1 block text-[11px] text-nx-ink-3">
                {summary.paidCount} {t("status.paid")}
              </span>
            </div>

            {/* Outstanding Balance */}
            <div className="rounded-md border border-nx-line bg-nx-surface p-3 transition-colors hover:border-nx-line-hi">
              <span className="block text-xs font-medium text-nx-ink-3">
                {t("summary.totalOutstanding")}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-bold text-amber-500">
                  {summary.totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-nx-ink-3">{summary.currencyCode}</span>
              </div>
              <span className="mt-1 block text-[11px] text-nx-ink-3">
                {summary.outstandingCount} {t("summary.activeObligations") || "Obligations"}
              </span>
            </div>

            {/* Overdue Total */}
            <div className="rounded-md border border-nx-line bg-nx-surface p-3 transition-colors hover:border-nx-line-hi">
              <span className="block text-xs font-medium text-nx-ink-3">
                {t("summary.totalOverdue")}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-bold text-rose-500">
                  {summary.totalOverdue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-nx-ink-3">{summary.currencyCode}</span>
              </div>
              <span className="mt-1 block text-[11px] text-rose-500">
                {summary.overdueCount} {t("status.overdue")}
              </span>
            </div>

            {/* Waived Count */}
            <div className="rounded-md border border-nx-line bg-nx-surface p-3 transition-colors hover:border-nx-line-hi">
              <span className="block text-xs font-medium text-nx-ink-3">
                {t("summary.waivedCount")}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-bold text-nx-ink">
                  {summary.waivedCount}
                </span>
              </div>
              <span className="mt-1 block text-[11px] text-nx-ink-3">
                {t("status.waived")}
              </span>
            </div>

            {/* Unbilled Queue */}
            <div className="rounded-md border border-nx-line bg-nx-surface p-3 transition-colors hover:border-nx-line-hi">
              <span className="block text-xs font-medium text-nx-ink-3">
                {t("summary.unbilledCount")}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-bold text-nx-ink">
                  {summary.unbilledCount}
                </span>
              </div>
              <span className="mt-1 block text-[11px] text-nx-ink-3">
                {t("status.unbilled")}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
