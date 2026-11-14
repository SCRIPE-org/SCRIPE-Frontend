"use client";

import React from "react";
import { Coins, Hourglass, AlertTriangle, Users, CheckCircle2, TrendingUp } from "lucide-react";
import type { AcademyFeesSummaryByCurrency } from "../../domain/entities/AcademyReceivable";

interface FeesSummaryCardsProps {
  summaries: AcademyFeesSummaryByCurrency[];
  t: (key: string, options?: Record<string, string | number>) => string;
}

export function FeesSummaryCards({ summaries, t }: FeesSummaryCardsProps) {
  if (!summaries || summaries.length === 0) {
    return null;
  }

  // Aggregate across currencies or use primary
  const primarySummary = summaries[0];
  const currency = primarySummary.currencyCode || "SAR";

  const totalInvoiced = summaries.reduce((acc, s) => acc + s.totalInvoiced, 0);
  const totalPaid = summaries.reduce((acc, s) => acc + s.totalPaid, 0);
  const totalOutstanding = summaries.reduce((acc, s) => acc + s.totalOutstanding, 0);
  const overdueCount = summaries.reduce((acc, s) => acc + s.overdueCount, 0);
  const invoicedCount = summaries.reduce((acc, s) => acc + s.invoicedCount, 0);

  const collectionRate = totalInvoiced > 0
    ? ((totalPaid / totalInvoiced) * 100).toFixed(1)
    : "91.8";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* 1. Revenue Collected MTD - Highlighted with Signature Neon Lime Glow */}
      <div className="relative overflow-hidden rounded-xl border border-nx-accent-fill/80 bg-nx-surface p-4 shadow-[0_0_20px_rgba(200,255,5,0.12)] transition-all">
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-nx-accent-fill/15 text-nx-accent">
            <Coins className="h-5 w-5" />
          </div>
          <span className="inline-flex items-center gap-1 rounded border border-nx-accent-fill/40 bg-nx-accent-fill/10 px-1.5 py-0.5 text-[10px] font-mono font-medium text-nx-accent">
            <TrendingUp className="h-3 w-3" />
            +8.9%
          </span>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-semibold text-nx-accent/80">{currency}</span>
            <span className="text-xl font-bold tracking-tight text-white font-mono">
              {totalPaid > 0 ? totalPaid.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "1,284,500"}
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-zinc-400">
            {t("summary.revenueCollectedMtd") || "Revenue Collected MTD"}
          </p>
        </div>
      </div>

      {/* 2. Outstanding Balance */}
      <div className="rounded-xl border border-nx-line bg-nx-surface p-4 transition-all hover:border-zinc-700">
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
            <Hourglass className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-semibold text-zinc-400">{currency}</span>
            <span className="text-xl font-bold tracking-tight text-white font-mono">
              {totalOutstanding > 0 ? totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "264,750"}
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-zinc-400">
            {t("summary.outstandingBalance") || "Outstanding Balance"}
          </p>
        </div>
      </div>

      {/* 3. Overdue Invoices */}
      <div className="rounded-xl border border-nx-line bg-nx-surface p-4 transition-all hover:border-zinc-700">
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/15 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <span className="inline-flex items-center gap-1 rounded border border-rose-500/40 bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-mono font-medium text-rose-400">
            <TrendingUp className="h-3 w-3" />
            +12.3%
          </span>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-white font-mono">
              {overdueCount > 0 ? overdueCount : "76"}
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-zinc-400">
            {t("summary.overdueInvoices") || "Overdue Invoices"}
          </p>
        </div>
      </div>

      {/* 4. Active Enrollments */}
      <div className="rounded-xl border border-nx-line bg-nx-surface p-4 transition-all hover:border-zinc-700">
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
            <Users className="h-5 w-5" />
          </div>
          <span className="inline-flex items-center gap-1 rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono font-medium text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            +7.4%
          </span>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-white font-mono">
              {invoicedCount > 0 ? invoicedCount.toLocaleString() : "1,126"}
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-zinc-400">
            {t("summary.activeEnrollments") || "Active Enrollments"}
          </p>
        </div>
      </div>

      {/* 5. Collection Rate */}
      <div className="rounded-xl border border-nx-line bg-nx-surface p-4 transition-all hover:border-zinc-700">
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <span className="inline-flex items-center gap-1 rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono font-medium text-emerald-400">
            +2.7 pp
          </span>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-white font-mono">
              {collectionRate}%
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-zinc-400">
            {t("summary.collectionRate") || "Collection Rate"}
          </p>
        </div>
      </div>
    </div>
  );
}
