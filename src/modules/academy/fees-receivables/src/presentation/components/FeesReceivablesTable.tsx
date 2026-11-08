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

  return (
    <div className="overflow-x-auto rounded-lg border border-nx-line bg-nx-surface">
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
                {item.financeInvoiceReference || "Unbilled"}
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
                        {item.daysOverdue}d overdue
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-nx-ink-3">—</span>
                )}
              </td>

              {/* Status Badge */}
              <td className="px-4 py-3 text-center">
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
                  {item.billingStatus}
                </Badge>
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
  );
}
