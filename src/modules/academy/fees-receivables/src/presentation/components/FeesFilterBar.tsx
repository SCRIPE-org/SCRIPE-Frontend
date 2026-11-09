"use client";

import React from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";

interface FeesFilterBarProps {
  statusFilter: string;
  currencyFilter: string;
  overdueOnly: boolean;
  searchQuery: string;
  loading: boolean;
  onStatusChange: (status: string) => void;
  onCurrencyChange: (currency: string) => void;
  onOverdueToggle: (overdueOnly: boolean) => void;
  onSearchChange: (search: string) => void;
  onRefresh: () => void;
  onExportCsv: () => void;
  t: (key: string, options?: Record<string, string | number>) => string;
}

export function FeesFilterBar({
  statusFilter,
  currencyFilter,
  overdueOnly,
  searchQuery,
  loading,
  onStatusChange,
  onCurrencyChange,
  onOverdueToggle,
  onSearchChange,
  onRefresh,
  onExportCsv,
  t
}: FeesFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-nx-line bg-nx-surface p-3 lg:flex-row lg:items-center lg:justify-between">
      {/* Search Input */}
      <div className="w-full lg:w-72">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("filters.searchPlaceholder")}
          className="h-9 text-xs"
        />
      </div>

      {/* Selectors and Toggles */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="h-9 rounded-md border border-nx-line bg-nx-surface px-2.5 text-xs text-nx-ink focus:border-nx-accent focus:outline-none"
        >
          <option value="">{t("filters.allStatuses")}</option>
          <option value="Paid">{t("status.paid")}</option>
          <option value="Invoiced">{t("status.invoiced")}</option>
          <option value="Overdue">{t("status.overdue")}</option>
          <option value="PartiallyPaid">{t("status.partiallyPaid")}</option>
          <option value="Waived">{t("status.waived")}</option>
          <option value="Unbilled">{t("status.unbilled")}</option>
        </select>

        {/* Currency Filter */}
        <select
          value={currencyFilter}
          onChange={(e) => onCurrencyChange(e.target.value)}
          className="h-9 rounded-md border border-nx-line bg-nx-surface px-2.5 text-xs text-nx-ink focus:border-nx-accent focus:outline-none"
        >
          <option value="">{t("filters.allCurrencies")}</option>
          <option value="SAR">SAR</option>
          <option value="USD">USD</option>
          <option value="AED">AED</option>
        </select>

        {/* Overdue Only Button Toggle */}
        <Button
          type="button"
          size="sm"
          variant={overdueOnly ? "destructive" : "outline"}
          onClick={() => onOverdueToggle(!overdueOnly)}
          className="h-9 text-xs"
        >
          {t("filters.overdueOnly")}
        </Button>

        {/* Refresh */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onRefresh}
          disabled={loading}
          className="h-9 text-xs"
        >
          {t("refresh")}
        </Button>

        {/* Export CSV */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onExportCsv}
          className="h-9 text-xs"
        >
          {t("exportCsv")}
        </Button>
      </div>
    </div>
  );
}
