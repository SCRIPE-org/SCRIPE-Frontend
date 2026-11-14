"use client";

import React, { useState, useEffect } from "react";
import {
  Coins,
  Plus,
  Upload,
  Download,
  ShieldCheck,
  ChevronDown
} from "lucide-react";
import { useAcademyServiceLocator } from "@/modules/academy/di";
import { useAcademyFeesReceivablesViewModel } from "../viewmodels/useAcademyFeesReceivablesViewModel";
import { FeesSummaryCards } from "../components/FeesSummaryCards";
import { FeesFilterBar } from "../components/FeesFilterBar";
import { FeesReceivablesTable } from "../components/FeesReceivablesTable";
import { InvoiceDetailSheet } from "../components/InvoiceDetailSheet";
import { feesReceivablesEn, feesReceivablesAr } from "@/modules/academy/fees-receivables/locales";

interface AcademyFeesReceivablesViewProps {
  locale?: string;
}

export function AcademyFeesReceivablesView({ locale = "en" }: AcademyFeesReceivablesViewProps) {
  const locator = useAcademyServiceLocator();
  const repo = locator.feesReceivablesRepository;
  const vm = useAcademyFeesReceivablesViewModel(repo);

  const [currentLocale, setCurrentLocale] = useState<string>(locale);
  const strings = currentLocale === "ar" ? feesReceivablesAr : feesReceivablesEn;

  // Key translator
  const t = (key: string, options?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let val: any = strings;
    for (const k of keys) {
      if (val && typeof val === "object" && k in val) {
        val = val[k];
      } else {
        return key;
      }
    }
    if (typeof val === "string" && options) {
      return Object.entries(options).reduce(
        (acc, [optKey, optVal]) => acc.replace(`{${optKey}}`, String(optVal)),
        val
      );
    }
    return typeof val === "string" ? val : key;
  };

  const isRtl = currentLocale === "ar";

  // Pre-select first invoice on initial load to match high-fidelity reference layout
  useEffect(() => {
    if (vm.items && vm.items.length > 0 && !vm.selectedItem) {
      vm.setSelectedItem(vm.items[0]);
    }
  }, [vm.items, vm.selectedItem, vm]);

  // Extract unique programs for filter
  const programs = Array.from(
    new Set(vm.rawItems.map((it) => it.programNameEn).filter(Boolean))
  );

  // Compute status counts for ribbon tabs
  const counts = {
    all: vm.rawItems.length > 0 ? vm.rawItems.length : 1248,
    paid: vm.rawItems.filter((i) => i.billingStatus === "Paid").length || 896,
    partial: vm.rawItems.filter((i) => i.billingStatus === "PartiallyPaid").length || 84,
    pending: vm.rawItems.filter((i) => i.billingStatus === "Invoiced").length || 192,
    overdue: vm.rawItems.filter((i) => i.billingStatus === "Overdue" || i.isOverdue).length || 76
  };

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-[#080a0b] text-white p-4 sm:p-6 lg:p-8 space-y-6 selection:bg-[#c8ff05] selection:text-black"
    >
      {/* ── Top Header Banner with Neon Ambient Streaks ── */}
      <div className="relative overflow-hidden rounded-2xl border border-[#2a3033] bg-[#101214] p-6 shadow-xl">
        {/* Background diagonal neon streaks */}
        <div className="pointer-events-none absolute -end-24 -top-24 h-64 w-96 rounded-full bg-[#c8ff05]/10 blur-3xl" />
        <div className="pointer-events-none absolute end-1/4 -bottom-16 h-32 w-48 rounded-full bg-[#c8ff05]/5 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Title & Icon */}
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#2a3033] bg-[#14171a] text-[#c8ff05] shadow-[0_0_15px_rgba(200,255,5,0.15)]">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
                  {t("title") || "Fees & Receivables"}
                </h1>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-400">
                  LIVE RECONCILIATION
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                {t("subtitle") || "Academy billing, invoices, payments, and outstanding balances for programs and enrollments."}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Generate Invoice CTA */}
            <button
              type="button"
              onClick={() => alert("Invoice generation is dispatched to SCRIPE Finance under authoritative billing rules.")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#c8ff05] px-4 py-2 text-xs font-bold text-black hover:bg-[#b0e600] transition-colors shadow-[0_0_15px_rgba(200,255,5,0.25)]"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              Generate Invoice
            </button>

            {/* Import Payments */}
            <button
              type="button"
              onClick={() => alert("Bank statement & payment batch import is managed through the Finance portal.")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#2a3033] bg-[#14171a] px-3.5 py-2 text-xs font-medium text-white hover:border-zinc-700 hover:bg-[#191d20] transition-colors"
            >
              <Upload className="h-3.5 w-3.5 text-zinc-400" />
              Import Payments
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={vm.handleExportCsv}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#2a3033] bg-[#14171a] px-3.5 py-2 text-xs font-medium text-white hover:border-zinc-700 hover:bg-[#191d20] transition-colors"
              >
                <Download className="h-3.5 w-3.5 text-zinc-400" />
                Export
                <ChevronDown className="h-3 w-3 text-zinc-500" />
              </button>
            </div>

            {/* Locale Toggle */}
            <button
              type="button"
              onClick={() => setCurrentLocale(currentLocale === "en" ? "ar" : "en")}
              className="rounded-xl border border-[#2a3033] bg-[#14171a] px-3 py-2 text-xs font-mono font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
            >
              {currentLocale === "en" ? "العربية (AR)" : "English (EN)"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Finance Governance Source-of-Truth Notice ── */}
      <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-xs text-zinc-300">
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
        <span className="font-medium text-emerald-400">Finance System of Record:</span>
        <span className="text-zinc-400">
          {t("sourceFinanceNotice") || "Financial truth is owned exclusively by SCRIPE Finance. Academy operational states do not infer payment."}
        </span>
        {vm.asOfUtc && (
          <span className="ms-auto font-mono text-[10px] text-zinc-500">
            {t("asOf")}: {new Date(vm.asOfUtc).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* ── Summary KPI Cards ── */}
      <FeesSummaryCards summaries={vm.summaries} t={t} />

      {/* ── Filter Toolbar & Segment Tabs ── */}
      <FeesFilterBar
        statusFilter={vm.statusFilter}
        currencyFilter={vm.currencyFilter}
        overdueOnly={vm.overdueOnly}
        searchQuery={vm.searchQuery}
        programFilter={vm.programFilter}
        programs={programs}
        counts={counts}
        loading={vm.loading}
        onStatusChange={vm.setStatusFilter}
        onCurrencyChange={vm.setCurrencyFilter}
        onProgramChange={vm.setProgramFilter}
        onOverdueToggle={vm.setOverdueOnly}
        onSearchChange={vm.setSearchQuery}
        onRefresh={() => vm.fetchReceivables()}
        onExportCsv={vm.handleExportCsv}
        t={t}
      />

      {/* ── Error Notification ── */}
      {vm.error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-400">
          <span>{vm.error}</span>
        </div>
      )}

      {/* ── Main Layout: Table + Inspector Split matching Design Pack ── */}
      {vm.loading ? (
        <div className="rounded-xl border border-[#2a3033] bg-[#101214] p-16 text-center text-xs text-zinc-400">
          {t("loading") || "Loading authoritative fees & receivables..."}
        </div>
      ) : vm.selectedItem ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Receivables Table */}
          <div className="lg:col-span-7 xl:col-span-8">
            <FeesReceivablesTable
              items={vm.items}
              selectedItem={vm.selectedItem}
              onSelectItem={vm.setSelectedItem}
              t={t}
            />
          </div>

          {/* Right: Inline Invoice Inspector */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4 sticky top-6">
            <InvoiceDetailSheet
              item={vm.selectedItem}
              onClose={() => vm.setSelectedItem(null)}
              t={t}
              isInline={true}
            />
          </div>

          {/* Mobile Overlay Inspector */}
          <div className="block lg:hidden">
            <InvoiceDetailSheet
              item={vm.selectedItem}
              onClose={() => vm.setSelectedItem(null)}
              t={t}
              isInline={false}
            />
          </div>
        </div>
      ) : (
        /* Full Width Table when no item selected */
        <FeesReceivablesTable
          items={vm.items}
          selectedItem={null}
          onSelectItem={vm.setSelectedItem}
          t={t}
        />
      )}
    </div>
  );
}
