"use client";

import React, { useState } from "react";
import { useAcademyServiceLocator } from "../../../di";
import { useAcademyFeesReceivablesViewModel } from "../viewmodels/useAcademyFeesReceivablesViewModel";
import { FeesSummaryCards } from "../components/FeesSummaryCards";
import { FeesFilterBar } from "../components/FeesFilterBar";
import { FeesReceivablesTable } from "../components/FeesReceivablesTable";
import { InvoiceDetailSheet } from "../components/InvoiceDetailSheet";
import { feesReceivablesEn, feesReceivablesAr } from "../../../fees-receivables/locales";

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

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-nx-ground text-nx-ink p-4 sm:p-6 lg:p-8 space-y-6"
    >
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-nx-line pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-nx-ink">
            {t("title")}
          </h1>
          <p className="mt-1 text-xs text-nx-ink-3">
            {t("subtitle")}
          </p>
        </div>

        {/* Locale & Freshness badge */}
        <div className="flex items-center gap-3">
          {vm.asOfUtc && (
            <div className="text-end text-[11px] text-nx-ink-3">
              <span>{t("asOf")}: </span>
              <span className="font-mono text-nx-ink-2">
                {new Date(vm.asOfUtc).toLocaleTimeString()}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setCurrentLocale(currentLocale === "en" ? "ar" : "en")}
            className="rounded border border-nx-line bg-nx-surface px-2.5 py-1 text-xs font-medium text-nx-ink transition-colors hover:border-nx-line-hi"
          >
            {currentLocale === "en" ? "العربية (AR)" : "English (EN)"}
          </button>
        </div>
      </div>

      {/* Finance Governance Truth Alert */}
      <div className="rounded-md border border-nx-line bg-nx-surface/60 p-3 text-xs text-nx-ink-2">
        <p className="leading-relaxed font-sans">{t("sourceFinanceNotice")}</p>
      </div>

      {/* Summary KPI Cards */}
      <FeesSummaryCards summaries={vm.summaries} t={t} />

      {/* Filter Bar */}
      <FeesFilterBar
        statusFilter={vm.statusFilter}
        currencyFilter={vm.currencyFilter}
        overdueOnly={vm.overdueOnly}
        searchQuery={vm.searchQuery}
        loading={vm.loading}
        onStatusChange={vm.setStatusFilter}
        onCurrencyChange={vm.setCurrencyFilter}
        onOverdueToggle={vm.setOverdueOnly}
        onSearchChange={vm.setSearchQuery}
        onRefresh={() => vm.fetchReceivables()}
        onExportCsv={vm.handleExportCsv}
        t={t}
      />

      {/* Contractual Gap Disclosures (ADR-ACAD-A7-01: Installments) */}
      {vm.blockedCapabilities && vm.blockedCapabilities.length > 0 && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-nx-ink-2 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            <span className="font-semibold text-amber-500">{t("blocked.title")}</span>
          </div>
          <p className="text-[11px] text-nx-ink-3 leading-relaxed">
            {t("blocked.installments")}
          </p>
        </div>
      )}

      {/* Error state */}
      {vm.error && (
        <div className="rounded-md border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-500">
          <span>{vm.error}</span>
        </div>
      )}

      {/* Loading state indicator */}
      {vm.loading ? (
        <div className="rounded-lg border border-nx-line bg-nx-surface p-12 text-center text-xs text-nx-ink-3">
          {t("loading")}
        </div>
      ) : (
        /* Main Table and Mobile Cards */
        <FeesReceivablesTable
          items={vm.items}
          onSelectItem={vm.setSelectedItem}
          t={t}
        />
      )}

      {/* Reconciliation Detail Sheet */}
      <InvoiceDetailSheet
        item={vm.selectedItem}
        onClose={() => vm.setSelectedItem(null)}
        t={t}
      />
    </div>
  );
}
