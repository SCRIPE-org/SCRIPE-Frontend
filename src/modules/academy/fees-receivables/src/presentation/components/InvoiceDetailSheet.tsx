"use client";

import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PieChart,
  User,
  Phone,
  Mail,
  Send,
  CreditCard,
  Receipt,
  Check
} from "lucide-react";
import type { AcademyFeeReceivableItem } from "../../domain/entities/AcademyReceivable";

interface InvoiceDetailSheetProps {
  item: AcademyFeeReceivableItem | null;
  onClose: () => void;
  t: (key: string, options?: Record<string, string | number>) => string;
  isInline?: boolean;
}

export function InvoiceDetailSheet({
  item,
  onClose,
  t,
  isInline = false
}: InvoiceDetailSheetProps) {
  const [reminderSent, setReminderSent] = useState(false);

  if (!item) return null;

  const currency = item.priceCurrency || "SAR";
  const invNumber = item.financeInvoiceReference || "INV-106784";
  const athleteName = item.athleteNameEn || "Ahmed Essam";
  const issuedDate = item.issuedAtUtc ? new Date(item.issuedAtUtc).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Jun 20, 2026";
  const dueDate = item.dueAtUtc ? new Date(item.dueAtUtc).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Jul 20, 2026";

  const getStatusBadge = () => {
    if (item.billingStatus === "Paid") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {t("status.paid") || "Paid"}
        </span>
      );
    }
    if (item.billingStatus === "Overdue" || item.isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400">
          <AlertTriangle className="h-3.5 w-3.5" />
          {t("status.overdue") || "Overdue"}
        </span>
      );
    }
    if (item.billingStatus === "PartiallyPaid") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
          <PieChart className="h-3.5 w-3.5" />
          {t("status.partiallyPaid") || "Partial"}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-0.5 text-xs font-semibold text-yellow-400">
        <Clock className="h-3.5 w-3.5" />
        {t("status.invoiced") || "Pending"}
      </span>
    );
  };

  const handleSendReminder = () => {
    setReminderSent(true);
    setTimeout(() => setReminderSent(false), 3000);
  };

  const content = (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start justify-between border-b border-nx-line pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold font-mono tracking-tight text-white">{invNumber}</h2>
            {getStatusBadge()}
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Issued: <span className="text-zinc-300 font-mono">{issuedDate}</span> • Due:{" "}
            <span className="text-zinc-300 font-mono">{dueDate}</span>
            {item.isOverdue && (
              <span className="text-rose-400 font-semibold ms-1">
                ({item.daysOverdue || 5} days overdue)
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-nx-raised hover:text-nx-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* ── Athlete & Guardian Information Card ── */}
      <div className="rounded-xl border border-nx-line bg-nx-raised p-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Athlete Info */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-nx-raised border border-nx-line text-sm font-bold text-nx-ink">
              {athleteName.charAt(0)}
            </div>
            <div>
              <span className="block font-semibold text-nx-ink text-xs">{athleteName}</span>
              <span className="block text-[11px] font-mono text-zinc-400">
                ATH-001245 • 8 yrs
              </span>
            </div>
          </div>

          {/* Guardian Info */}
          <div className="space-y-1 text-xs text-zinc-400 sm:border-s sm:border-nx-line sm:ps-3">
            <div className="flex items-center gap-1.5 text-zinc-200">
              <User className="h-3.5 w-3.5 text-zinc-500" />
              <span className="font-medium">Essam Ahmed (Guardian)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-zinc-500" />
              <span className="font-mono text-[11px] text-zinc-400">+20 100 456 7890</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-zinc-500" />
              <span className="font-mono text-[11px] text-zinc-400">essam.ahmed@email.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Payment Timeline Stepper matching Design Pack ── */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Payment Timeline
        </h3>
        <div className="rounded-xl border border-nx-line bg-nx-raised p-4">
          <div className="relative flex items-center justify-between">
            {/* Horizontal Track Line */}
            <div className="absolute left-6 right-6 top-3 h-0.5 bg-nx-raised" />
            <div
              className="absolute left-6 top-3 h-0.5 bg-emerald-500 transition-all"
              style={{ width: item.billingStatus === "Paid" ? "100%" : "50%" }}
            />

            {/* Step 1: Invoice Issued */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-black">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </div>
              <span className="mt-1.5 text-[11px] font-medium text-nx-ink">Invoice Issued</span>
              <span className="font-mono text-[10px] text-zinc-500">{issuedDate}</span>
            </div>

            {/* Step 2: Payment Received */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-black">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </div>
              <span className="mt-1.5 text-[11px] font-medium text-nx-ink">Payment Received</span>
              <span className="font-mono text-[10px] text-emerald-400 font-semibold">
                {currency} {item.paidAmount > 0 ? item.paidAmount.toLocaleString() : "6,000"}
              </span>
            </div>

            {/* Step 3: Due Date */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-amber-400 bg-nx-surface">
                <div className="h-2 w-2 rounded-full bg-amber-400" />
              </div>
              <span className="mt-1.5 text-[11px] font-medium text-nx-ink">Due Date</span>
              <span className="font-mono text-[10px] text-rose-400 font-medium">Overdue</span>
            </div>

            {/* Step 4: Fully Paid */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-600 bg-nx-surface">
                <div className="h-2 w-2 rounded-full bg-zinc-600" />
              </div>
              <span className="mt-1.5 text-[11px] font-medium text-zinc-500">Fully Paid</span>
              <span className="font-mono text-[10px] text-zinc-600">—</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Billing Items Breakdown Table matching Design Pack ── */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Billing Items
        </h3>
        <div className="overflow-hidden rounded-xl border border-nx-line bg-nx-raised">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-nx-line bg-nx-raised text-zinc-400">
                <th className="px-3 py-2 text-start font-medium">Item</th>
                <th className="px-3 py-2 text-center font-medium">Qty</th>
                <th className="px-3 py-2 text-end font-medium">Unit Price</th>
                <th className="px-3 py-2 text-end font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nx-line">
              <tr>
                <td className="px-3 py-2 text-zinc-200">
                  {item.programNameEn || "U12 Football"} – Term Fee (Season 2026)
                </td>
                <td className="px-3 py-2 text-center font-mono text-zinc-400">1</td>
                <td className="px-3 py-2 text-end font-mono text-zinc-300">
                  {currency} 15,000
                </td>
                <td className="px-3 py-2 text-end font-mono font-medium text-nx-ink">
                  {currency} 15,000
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-zinc-200">Training Kit & Gear</td>
                <td className="px-3 py-2 text-center font-mono text-zinc-400">1</td>
                <td className="px-3 py-2 text-end font-mono text-zinc-300">
                  {currency} 3,000
                </td>
                <td className="px-3 py-2 text-end font-mono font-medium text-nx-ink">
                  {currency} 3,000
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t border-nx-line bg-nx-raised">
                <td colSpan={3} className="px-3 py-2.5 font-semibold text-nx-ink">
                  Total Amount
                </td>
                <td className="px-3 py-2.5 text-end font-mono font-bold text-nx-ink">
                  {currency} {item.totalInvoicedAmount > 0 ? item.totalInvoicedAmount.toLocaleString() : "18,000"}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Quick Actions matching Design Pack ── */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Quick Actions
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* Send Reminder CTA */}
          <button
            type="button"
            onClick={handleSendReminder}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-nx-accent-fill px-4 py-2.5 text-xs font-bold text-black hover:bg-nx-accent-fill transition-colors shadow-[0_0_15px_rgba(200,255,5,0.2)]"
          >
            <Send className="h-3.5 w-3.5" />
            {reminderSent ? "Reminder Sent!" : "Send Reminder"}
          </button>

          {/* Record Payment */}
          <button
            type="button"
            onClick={() => alert("Payment processing is governed exclusively by SCRIPE Finance (ADR-ACAD-A7-01).")}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-nx-line bg-nx-raised px-3.5 py-2.5 text-xs font-medium text-nx-ink hover:border-zinc-700 hover:bg-nx-raised transition-colors"
          >
            <CreditCard className="h-3.5 w-3.5 text-zinc-400" />
            Record Payment
          </button>

          {/* View Receipt */}
          <button
            type="button"
            onClick={() => alert("Finance receipt viewer opened.")}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-nx-line bg-nx-raised px-3.5 py-2.5 text-xs font-medium text-nx-ink hover:border-zinc-700 hover:bg-nx-raised transition-colors"
          >
            <Receipt className="h-3.5 w-3.5 text-zinc-400" />
            View Receipt
          </button>
        </div>
      </div>
    </div>
  );

  // If inline, render in a contained card
  if (isInline) {
    return (
      <div className="rounded-xl border border-nx-line bg-nx-surface p-5 shadow-xl">
        {content}
      </div>
    );
  }

  // Otherwise, slide-over / drawer overlay
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="flex h-full w-full max-w-lg flex-col border-s border-nx-line bg-nx-surface p-6 shadow-2xl overflow-y-auto">
        {content}
      </div>
    </div>
  );
}
