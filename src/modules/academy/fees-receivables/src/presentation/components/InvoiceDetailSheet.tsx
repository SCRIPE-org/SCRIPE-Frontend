"use client";

import React from "react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import type { AcademyFeeReceivableItem } from "../../domain/entities/AcademyReceivable";

interface InvoiceDetailSheetProps {
  item: AcademyFeeReceivableItem | null;
  onClose: () => void;
  t: (key: string, options?: Record<string, string | number>) => string;
}

export function InvoiceDetailSheet({ item, onClose, t }: InvoiceDetailSheetProps) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
      <div className="flex h-full w-full max-w-lg flex-col border-s border-nx-line bg-nx-surface p-6 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-nx-line pb-4">
          <div>
            <h2 className="text-base font-bold text-nx-ink">{t("details.title")}</h2>
            <p className="mt-1 text-xs text-nx-ink-3">
              {item.athleteNameEn || "Athlete"} — {item.programNameEn}
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            ✕
          </Button>
        </div>

        {/* Content */}
        <div className="mt-6 flex-1 space-y-6">
          {/* Overdue alert if applicable */}
          {item.isOverdue && (
            <div className="rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-500">
              <span className="font-semibold">{t("details.overdueAlert", { days: item.daysOverdue })}</span>
            </div>
          )}

          {/* Overview Grid */}
          <div className="grid grid-cols-2 gap-4 rounded-md border border-nx-line bg-nx-ground p-4 text-xs">
            <div>
              <span className="block text-nx-ink-3">{t("table.invoiceNumber")}</span>
              <span className="font-semibold text-nx-ink">
                {item.financeInvoiceReference || t("status.unbilled")}
              </span>
            </div>
            <div>
              <span className="block text-nx-ink-3">{t("table.status")}</span>
              <Badge
                variant={
                  item.billingStatus === "Paid"
                    ? "default"
                    : item.isOverdue
                    ? "destructive"
                    : item.billingStatus === "Waived"
                    ? "outline"
                    : "secondary"
                }
                className="mt-0.5 text-[11px]"
              >
                {item.billingStatus}
              </Badge>
            </div>
            <div>
              <span className="block text-nx-ink-3">{t("details.issuedAt")}</span>
              <span className="text-nx-ink">
                {item.issuedAtUtc ? new Date(item.issuedAtUtc).toLocaleDateString() : "—"}
              </span>
            </div>
            <div>
              <span className="block text-nx-ink-3">{t("details.dueAt")}</span>
              <span className="text-nx-ink">
                {item.dueAtUtc ? new Date(item.dueAtUtc).toLocaleDateString() : "—"}
              </span>
            </div>
            <div>
              <span className="block text-nx-ink-3">{t("table.invoiced")}</span>
              <span className="font-bold text-nx-ink">
                {item.totalInvoicedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {item.priceCurrency}
              </span>
            </div>
            <div>
              <span className="block text-nx-ink-3">{t("table.paid")}</span>
              <span className="font-bold text-emerald-500">
                {item.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {item.priceCurrency}
              </span>
            </div>
            <div className="col-span-2 border-t border-nx-line pt-2">
              <span className="block text-nx-ink-3">{t("table.balance")}</span>
              <span className="text-sm font-bold text-amber-500">
                {item.outstandingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {item.priceCurrency}
              </span>
            </div>
          </div>

          {/* Commercial Waiver Provenance */}
          {item.billingStatus === "Waived" && (
            <div className="rounded-md border border-nx-line bg-nx-ground p-4 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
                {t("details.waiverProvenance")}
              </span>
              <p className="text-xs text-nx-ink-2">{t("details.waiverNotice")}</p>
              {item.notes && (
                <div className="rounded border border-nx-line/60 bg-nx-surface p-2 text-xs font-mono text-nx-ink-2">
                  {item.notes}
                </div>
              )}
            </div>
          )}

          {/* Payment & Receipt Allocations */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
              {t("details.paymentAllocations")}
            </span>
            {item.allocations && item.allocations.length > 0 ? (
              <div className="divide-y divide-nx-line rounded-md border border-nx-line bg-nx-ground">
                {item.allocations.map((alloc) => (
                  <div key={alloc.paymentId} className="flex items-center justify-between p-3 text-xs">
                    <div>
                      <span className="block font-medium text-nx-ink">{alloc.paymentNumber}</span>
                      <span className="block text-[11px] text-nx-ink-3">
                        {new Date(alloc.allocatedAtUtc).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-end">
                      <span className="block font-semibold text-emerald-500">
                        {alloc.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {alloc.currencyCode}
                      </span>
                      {alloc.receiptNumber && (
                        <span className="block text-[11px] text-nx-ink-3">
                          {alloc.receiptNumber}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-nx-line/50 p-4 text-center text-xs text-nx-ink-3">
                {t("details.noAllocations")}
              </div>
            )}
          </div>

          {/* Blocked capability disclosure: Installments */}
          <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-nx-ink-3">
            <span className="block font-semibold text-amber-500">{t("blocked.title")}</span>
            <p className="mt-1 text-[11px] leading-relaxed">{t("blocked.installments")}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 border-t border-nx-line pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="w-full text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
