"use client";

import React from "react";
import type { AcademyFeesSummaryByCurrency } from "../../fees-receivables/src/domain/entities/AcademyReceivable";

interface ReceivablesSnapshotCardProps {
  financialReceivables?: {
    currencySummaries: AcademyFeesSummaryByCurrency[];
    asOfUtc: string;
  };
  t: (key: string, options?: Record<string, string | number>) => string;
}

export function ReceivablesSnapshotCard({ financialReceivables, t }: ReceivablesSnapshotCardProps) {
  const summaries = financialReceivables?.currencySummaries || [];

  return (
    <div className="rounded-lg border border-nx-line bg-nx-surface p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-nx-line pb-3">
          <div>
            <h2 className="text-sm font-semibold text-nx-ink">
              {t("finance.title")}
            </h2>
            <span className="inline-block mt-0.5 text-[11px] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              {t("finance.sourceBadge")}
            </span>
          </div>
          {financialReceivables?.asOfUtc && (
            <span className="text-[11px] font-mono text-nx-ink-3">
              {new Date(financialReceivables.asOfUtc).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="mt-4 space-y-4">
          {summaries.length === 0 ? (
            <p className="py-4 text-center text-xs text-nx-ink-3">
              {t("finance.noData")}
            </p>
          ) : (
            summaries.map((s) => (
              <div key={s.currencyCode} className="rounded border border-nx-line/80 bg-nx-ground/30 p-3 space-y-2">
                <div className="flex items-center justify-between border-b border-nx-line/50 pb-1.5">
                  <span className="text-xs font-bold font-mono text-nx-ink">
                    {s.currencyCode}
                  </span>
                  <span className="text-[11px] text-nx-ink-3">
                    {s.totalReceivablesCount} records
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-nx-ink-3 block text-[11px]">{t("finance.invoiced")}</span>
                    <span className="font-mono font-semibold text-nx-ink">
                      {s.totalInvoicedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-nx-ink-3 block text-[11px]">{t("finance.paid")}</span>
                    <span className="font-mono font-semibold text-emerald-500">
                      {s.totalPaidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-nx-ink-3 block text-[11px]">{t("finance.outstanding")}</span>
                    <span className="font-mono font-semibold text-nx-accent">
                      {s.totalOutstandingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-nx-ink-3 block text-[11px]">{t("finance.overdue")}</span>
                    <span className={`font-mono font-semibold ${s.totalOverdueAmount > 0 ? "text-rose-500" : "text-nx-ink-3"}`}>
                      {s.totalOverdueAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <p className="mt-4 text-[11px] text-nx-ink-3 border-t border-nx-line pt-2">
        {t("finance.governanceNote")}
      </p>
    </div>
  );
}
