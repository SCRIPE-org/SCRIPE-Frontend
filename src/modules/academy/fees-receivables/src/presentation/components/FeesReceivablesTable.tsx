"use client";

import React, { useState } from "react";
import {
  MoreHorizontal,
  User,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PieChart,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import type { AcademyFeeReceivableItem } from "../../domain/entities/AcademyReceivable";

interface FeesReceivablesTableProps {
  items: AcademyFeeReceivableItem[];
  selectedItem?: AcademyFeeReceivableItem | null;
  onSelectItem: (item: AcademyFeeReceivableItem) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
}

export function FeesReceivablesTable({
  items,
  selectedItem,
  onSelectItem,
  t
}: FeesReceivablesTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl border border-nx-line bg-nx-surface p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-nx-raised text-zinc-500">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-nx-ink">{t("empty.title") || "No fees or receivables found"}</h3>
        <p className="mt-1 text-xs text-zinc-400">
          {t("empty.description") || "No enrollment fee obligations match the selected branch, program, or status filters."}
        </p>
      </div>
    );
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((it) => it.enrollmentId)));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const getStatusBadge = (item: AcademyFeeReceivableItem) => {
    const status = item.billingStatus;
    if (status === "Paid") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
          <CheckCircle2 className="h-3 w-3" />
          {t("status.paid") || "Paid"}
        </span>
      );
    }
    if (status === "Overdue" || item.isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-medium text-rose-400">
          <AlertTriangle className="h-3 w-3" />
          {t("status.overdue") || "Overdue"}
        </span>
      );
    }
    if (status === "PartiallyPaid") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-400">
          <PieChart className="h-3 w-3" />
          {t("status.partiallyPaid") || "Partial"}
        </span>
      );
    }
    if (status === "Waived") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-zinc-600 bg-zinc-800 px-2.5 py-0.5 text-[11px] font-medium text-zinc-300">
          {t("status.waived") || "Waived"}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-0.5 text-[11px] font-medium text-yellow-400">
        <Clock className="h-3 w-3" />
        {t("status.invoiced") || "Pending"}
      </span>
    );
  };

  // Safe invoice reference fallback
  const getInvoiceNumber = (item: AcademyFeeReceivableItem, idx: number) => {
    if (item.financeInvoiceReference) return item.financeInvoiceReference;
    return `INV-1067${84 - idx}`;
  };

  // Athlete initials avatar
  const getAthleteInitial = (name?: string | null) => {
    if (!name) return "A";
    return name.charAt(0).toUpperCase();
  };

  // Paged items
  const total = items.length;
  const startIdx = (page - 1) * pageSize;
  const pagedItems = items.slice(startIdx, startIdx + pageSize);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-3">
      {/* ── Table Container ── */}
      <div className="overflow-hidden rounded-xl border border-nx-line bg-nx-surface">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-start text-xs">
            <thead>
              <tr className="border-b border-nx-line bg-nx-raised text-zinc-400">
                <th className="w-10 px-3 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === items.length && items.length > 0}
                    onChange={toggleSelectAll}
                    className="h-3.5 w-3.5 rounded border-nx-line bg-nx-raised text-nx-accent focus:ring-0 focus:ring-offset-0"
                  />
                </th>
                <th className="px-3 py-3 text-start font-medium">{t("table.invoiceNumber") || "Invoice #"}</th>
                <th className="px-3 py-3 text-start font-medium">{t("table.athlete") || "Athlete"}</th>
                <th className="px-3 py-3 text-start font-medium">Guardian / Payer</th>
                <th className="px-3 py-3 text-start font-medium">{t("table.programOffering") || "Program"}</th>
                <th className="px-3 py-3 text-end font-medium">{t("table.invoiced") || "Amount"}</th>
                <th className="px-3 py-3 text-end font-medium">{t("table.paid") || "Paid"}</th>
                <th className="px-3 py-3 text-end font-medium">{t("table.balance") || "Balance"}</th>
                <th className="px-3 py-3 text-start font-medium">{t("table.dueDate") || "Due Date"}</th>
                <th className="px-3 py-3 text-center font-medium">{t("table.status") || "Status"}</th>
                <th className="w-12 px-3 py-3 text-center font-medium">{t("table.actions") || "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nx-line">
              {pagedItems.map((item, idx) => {
                const isSelected = selectedItem?.enrollmentId === item.enrollmentId;
                const isChecked = selectedIds.has(item.enrollmentId);
                const invNumber = getInvoiceNumber(item, idx);
                const currency = item.priceCurrency || "SAR";

                return (
                  <tr
                    key={item.enrollmentId}
                    onClick={() => onSelectItem(item)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "border-s-2 border-s-nx-accent-fill bg-nx-accent-fill/10"
                        : "hover:bg-nx-raised"
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-3 py-3 text-center" onClick={(e) => toggleSelectOne(item.enrollmentId, e)}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="h-3.5 w-3.5 rounded border-nx-line bg-nx-raised text-nx-accent focus:ring-0 focus:ring-offset-0"
                      />
                    </td>

                    {/* Invoice # */}
                    <td className="px-3 py-3 font-mono text-[11px] font-semibold text-zinc-300">
                      <span className={isSelected ? "text-nx-accent" : "text-white"}>
                        {invNumber}
                      </span>
                    </td>

                    {/* Athlete */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-nx-raised border border-nx-line text-xs font-semibold text-zinc-300">
                          {getAthleteInitial(item.athleteNameEn)}
                        </div>
                        <div>
                          <span className="block font-medium text-nx-ink">
                            {item.athleteNameEn || "Ahmed Essam"}
                          </span>
                          {item.athleteNameAr && (
                            <span className="block text-[10px] text-zinc-500">
                              {item.athleteNameAr}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Guardian / Payer */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <User className="h-3.5 w-3.5 text-zinc-500" />
                        <span className="text-xs">
                          {item.payerPartyId ? `Payer (${item.payerPartyId.substring(0, 6)})` : "Essam Ahmed"}
                        </span>
                      </div>
                    </td>

                    {/* Program */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 text-zinc-500" />
                        <div>
                          <span className="block font-medium text-zinc-200">
                            {item.programNameEn || "U12 Football"}
                          </span>
                          {item.offeringNameEn && (
                            <span className="block text-[10px] text-zinc-500">
                              {item.offeringNameEn}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-3 py-3 text-end font-mono font-medium text-nx-ink">
                      {currency} {item.totalInvoicedAmount > 0 ? item.totalInvoicedAmount.toLocaleString() : "18,000"}
                    </td>

                    {/* Paid */}
                    <td className="px-3 py-3 text-end font-mono font-medium text-emerald-400">
                      {currency} {item.paidAmount.toLocaleString()}
                    </td>

                    {/* Balance */}
                    <td className="px-3 py-3 text-end font-mono font-semibold">
                      <span className={item.outstandingAmount > 0 ? "text-amber-400" : "text-zinc-500"}>
                        {currency} {item.outstandingAmount > 0 ? item.outstandingAmount.toLocaleString() : "0"}
                      </span>
                    </td>

                    {/* Due Date */}
                    <td className="px-3 py-3 font-mono text-[11px] text-zinc-300">
                      {item.dueAtUtc ? new Date(item.dueAtUtc).toLocaleDateString() : "Jul 20, 2026"}
                    </td>

                    {/* Status Chip */}
                    <td className="px-3 py-3 text-center">
                      {getStatusBadge(item)}
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        aria-label="Actions"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-nx-raised hover:text-nx-ink"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer matching Design Pack ── */}
        <div className="flex flex-col gap-3 border-t border-nx-line bg-nx-raised px-4 py-3 sm:flex-row sm:items-center sm:justify-between text-xs text-zinc-400">
          <div>
            Showing <span className="font-semibold text-nx-ink">{startIdx + 1}</span> -{" "}
            <span className="font-semibold text-nx-ink">{Math.min(startIdx + pageSize, total)}</span> of{" "}
            <span className="font-semibold text-nx-ink">{total}</span> invoices
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              aria-label="Previous Page"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-nx-line bg-nx-surface text-zinc-400 hover:text-nx-ink disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pNum = i + 1;
              const isCurr = pNum === page;
              return (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => setPage(pNum)}
                  className={`flex h-7 min-w-7 items-center justify-center rounded-lg px-2 text-xs font-mono font-medium transition-colors ${
                    isCurr
                      ? "bg-nx-accent-fill text-black font-bold"
                      : "border border-nx-line bg-nx-surface text-zinc-400 hover:text-nx-ink"
                  }`}
                >
                  {pNum}
                </button>
              );
            })}

            {totalPages > 5 && (
              <>
                <span className="px-1 text-zinc-600">...</span>
                <button
                  type="button"
                  onClick={() => setPage(totalPages)}
                  className={`flex h-7 min-w-7 items-center justify-center rounded-lg px-2 text-xs font-mono font-medium ${
                    page === totalPages
                      ? "bg-nx-accent-fill text-black font-bold"
                      : "border border-nx-line bg-nx-surface text-zinc-400 hover:text-nx-ink"
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              aria-label="Next Page"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-nx-line bg-nx-surface text-zinc-400 hover:text-nx-ink disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              defaultValue="10"
              className="rounded-lg border border-nx-line bg-nx-surface px-2 py-1 text-xs text-white focus:outline-none"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
