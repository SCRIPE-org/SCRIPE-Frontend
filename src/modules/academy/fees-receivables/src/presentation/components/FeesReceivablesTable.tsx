"use client";

import React from "react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import type { AcademyFeeReceivableItem } from "../../domain/entities/AcademyReceivable";

interface FeesReceivablesTableProps {
  items: AcademyFeeReceivableItem[];
  onSelectItem: (item: AcademyFeeReceivableItem) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
}

export function FeesReceivablesTable({ items, onSelectItem, t }: FeesReceivablesTableProps) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-lg border border-nx-line bg-nx-surface p-12 text-center">
        <h3 className="text-sm font-semibold text-nx-ink">{t("empty.title")}</h3>
        <p className="mt-1 text-xs text-nx-ink-3">{t("empty.description")}</p>
      </div>
    );
  }

  const getStatusBadge = (item: AcademyFeeReceivableItem) => {
    const statusKey = item.billingStatus.toLowerCase();
    const localizedLabel = t(`status.${statusKey}`) || item.billingStatus;

    return (
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
        className="text-[11px]"
      >
        {localizedLabel}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* ── Mobile Compact Ledger Cards (<= 768px Viewport) ── */}
      <div className="block md:hidden space-y-3">
        {items.map((item) => (
          <div
            key={`mobile-${item.enrollmentId}`}
            className="rounded-lg border border-nx-line bg-nx-surface p-4 space-y-3 shadow-xs"
          >
            {/* Header: Athlete & Status */}
            <div className="flex items-start justify-between gap-2 border-b border-nx-line/60 pb-2.5">
              <div>
                <span className="block font-semibold text-nx-ink text-sm">
                  {item.athleteNameEn || "—"}
                </span>
                {item.athleteNameAr && (
                  <span className="block text-xs text-nx-ink-3">
                    {item.athleteNameAr}
                  </span>
                )}
                <span className="block text-xs text-nx-ink-2 mt-0.5">
                  {item.programNameEn} • {item.offeringNameEn}
                </span>
              </div>
              <div className="shrink-0">{getStatusBadge(item)}</div>
            </div>

            {/* Reference & Due Date */}
            <div className="flex items-center justify-between text-xs text-nx-ink-3">
              <div>
                <span className="text-[11px] block">{t("table.invoiceNumber")}</span>
                <span className="font-mono text-nx-ink text-[11px] font-medium">
                  {item.financeInvoiceReference || t("status.unbilled")}
                </span>
              </div>
              <div className="text-end">
                <span className="text-[11px] block">{t("table.dueDate")}</span>
                {item.dueAtUtc ? (
                  <span className="font-mono text-[11px] text-nx-ink">
                    {new Date(item.dueAtUtc).toLocaleDateString()}
                    {item.isOverdue && (
                      <span className="text-rose-500 font-semibold ms-1">
                        ({t("table.daysOverdue", { days: item.daysOverdue })})
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-nx-ink-3">—</span>
                )}
              </div>
            </div>

            {/* Financial Ledger Metrics Row */}
            <div className="grid grid-cols-3 gap-2 rounded-md bg-nx-ground p-2.5 text-center text-xs">
              <div>
                <span className="block text-[10px] text-nx-ink-3">{t("table.invoiced")}</span>
                <span className="font-mono font-medium text-nx-ink text-[11px]">
                  {item.totalInvoicedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-nx-ink-3">{t("table.paid")}</span>
                <span className="font-mono font-medium text-emerald-500 text-[11px]">
                  {item.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-nx-ink-3">{t("table.balance")}</span>
                <span
                  className={`font-mono font-bold text-[11px] ${
                    item.outstandingAmount > 0 ? "text-amber-500" : "text-nx-ink-3"
                  }`}
                >
                  {item.outstandingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {item.priceCurrency}
                </span>
              </div>
            </div>

            {/* Action */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSelectItem(item)}
              className="w-full h-8 text-xs font-medium text-nx-ink"
            >
              {t("table.viewDetails")}
            </Button>
          </div>
        ))}
      </div>

      {/* ── Desktop Full Ledger Table (>= 768px Viewport) ── */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-nx-line bg-nx-surface">
        <table className="w-full text-start text-xs">
          <thead className="border-b border-nx-line bg-nx-ground text-nx-ink-3">
            <tr>
              <th className="px-4 py-3 text-start font-medium">{t("table.athlete")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("table.programOffering")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("table.invoiceNumber")}</th>
              <th className="px-4 py-3 text-end font-medium">{t("table.invoiced")}</th>
              <th className="px-4 py-3 text-end font-medium">{t("table.paid")}</th>
              <th className="px-4 py-3 text-end font-medium">{t("table.balance")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("table.dueDate")}</th>
              <th className="px-4 py-3 text-center font-medium">{t("table.status")}</th>
              <th className="px-4 py-3 text-end font-medium">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nx-line">
            {items.map((item) => (
              <tr
                key={item.enrollmentId}
                className="transition-colors hover:bg-nx-raised/40"
              >
                {/* Athlete */}
                <td className="px-4 py-3">
                  <span className="block font-medium text-nx-ink">
                    {item.athleteNameEn || "—"}
                  </span>
                  {item.athleteNameAr && (
                    <span className="block text-[11px] text-nx-ink-3">
                      {item.athleteNameAr}
                    </span>
                  )}
                </td>

                {/* Program & Offering */}
                <td className="px-4 py-3">
                  <span className="block font-medium text-nx-ink">{item.programNameEn}</span>
                  <span className="block text-[11px] text-nx-ink-3">{item.offeringNameEn}</span>
                </td>

                {/* Invoice Number */}
                <td className="px-4 py-3 font-mono text-[11px] text-nx-ink-2">
                  {item.financeInvoiceReference || t("status.unbilled")}
                </td>

                {/* Invoiced Amount */}
                <td className="px-4 py-3 text-end font-medium text-nx-ink">
                  {item.totalInvoicedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {item.priceCurrency}
                </td>

                {/* Paid Amount */}
                <td className="px-4 py-3 text-end font-medium text-emerald-500">
                  {item.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {item.priceCurrency}
                </td>

                {/* Balance Due */}
                <td className="px-4 py-3 text-end">
                  <span
                    className={`font-semibold ${
                      item.outstandingAmount > 0 ? "text-amber-500" : "text-nx-ink-3"
                    }`}
                  >
                    {item.outstandingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {item.priceCurrency}
                  </span>
                </td>

                {/* Due Date */}
                <td className="px-4 py-3">
                  {item.dueAtUtc ? (
                    <div>
                      <span className="block text-nx-ink">
                        {new Date(item.dueAtUtc).toLocaleDateString()}
                      </span>
                      {item.isOverdue && (
                        <span className="block text-[10px] font-semibold text-rose-500">
                          {t("table.daysOverdue", { days: item.daysOverdue })}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-nx-ink-3">—</span>
                  )}
                </td>

                {/* Status Badge */}
                <td className="px-4 py-3 text-center">
                  {getStatusBadge(item)}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectItem(item)}
                    className="h-7 text-xs text-nx-ink"
                  >
                    {t("table.viewDetails")}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
