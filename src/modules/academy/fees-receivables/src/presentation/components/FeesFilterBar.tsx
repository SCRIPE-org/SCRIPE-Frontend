"use client";

import React from "react";
import {
  Search,
  LayoutGrid,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PieChart,
  List,
  Columns,
  RefreshCw,
  Download
} from "lucide-react";

interface FilterCounts {
  all: number;
  paid: number;
  partial: number;
  pending: number;
  overdue: number;
}

interface FeesFilterBarProps {
  statusFilter: string;
  currencyFilter: string;
  overdueOnly: boolean;
  searchQuery: string;
  programFilter?: string;
  programs?: string[];
  counts?: FilterCounts;
  loading: boolean;
  onStatusChange: (status: string) => void;
  onCurrencyChange?: (currency: string) => void;
  onProgramChange?: (program: string) => void;
  onOverdueToggle?: (overdueOnly: boolean) => void;
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
  programFilter = "",
  programs = [],
  counts = { all: 1248, paid: 896, partial: 84, pending: 192, overdue: 76 },
  loading,
  onStatusChange,
  onCurrencyChange,
  onProgramChange,
  onOverdueToggle,
  onSearchChange,
  onRefresh,
  onExportCsv,
  t
}: FeesFilterBarProps) {
  const tabs = [
    {
      id: "",
      label: t("filters.all") || "All",
      count: counts.all,
      icon: LayoutGrid
    },
    {
      id: "Paid",
      label: t("status.paid") || "Paid",
      count: counts.paid,
      icon: CheckCircle2
    },
    {
      id: "PartiallyPaid",
      label: t("status.partiallyPaid") || "Partial",
      count: counts.partial,
      icon: PieChart
    },
    {
      id: "Invoiced",
      label: t("status.invoiced") || "Pending",
      count: counts.pending,
      icon: Clock
    },
    {
      id: "Overdue",
      label: t("status.overdue") || "Overdue",
      count: counts.overdue,
      icon: AlertTriangle
    }
  ];

  return (
    <div className="space-y-4">
      {/* ── Segment Tabs Ribbon matching Design Pack ── */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onStatusChange(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? "border border-[#c8ff05] bg-[#c8ff05]/10 text-white shadow-[0_0_12px_rgba(200,255,5,0.15)]"
                  : "border border-[#2a3033] bg-[#101214] text-zinc-400 hover:border-zinc-700 hover:text-white"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-[#c8ff05]" : "text-zinc-500"}`} />
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
                  isActive
                    ? "bg-[#c8ff05]/20 text-[#c8ff05]"
                    : "bg-[#191d20] text-zinc-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Search & Filter Controls Toolbar ── */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Input with Icon */}
        <div className="relative w-full lg:w-96">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("filters.searchPlaceholder") || "Search by invoice number, athlete, or program..."}
            className="h-10 w-full rounded-xl border border-[#2a3033] bg-[#101214] ps-9 pe-4 text-xs text-white placeholder-zinc-500 focus:border-[#c8ff05] focus:outline-none focus:ring-1 focus:ring-[#c8ff05]/30 transition-colors"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Program Filter */}
          <select
            value={programFilter}
            onChange={(e) => onProgramChange?.(e.target.value)}
            className="h-10 rounded-xl border border-[#2a3033] bg-[#101214] px-3 text-xs font-medium text-white focus:border-[#c8ff05] focus:outline-none transition-colors"
          >
            <option value="">{t("filters.allPrograms") || "All Programs"}</option>
            {programs.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="h-10 rounded-xl border border-[#2a3033] bg-[#101214] px-3 text-xs font-medium text-white focus:border-[#c8ff05] focus:outline-none transition-colors"
          >
            <option value="">{t("filters.allStatuses") || "All Statuses"}</option>
            <option value="Paid">{t("status.paid") || "Paid"}</option>
            <option value="Invoiced">{t("status.invoiced") || "Invoiced"}</option>
            <option value="Overdue">{t("status.overdue") || "Overdue"}</option>
            <option value="PartiallyPaid">{t("status.partiallyPaid") || "Partially Paid"}</option>
            <option value="Waived">{t("status.waived") || "Waived"}</option>
            <option value="Unbilled">{t("status.unbilled") || "Unbilled"}</option>
          </select>

          {/* Season Filter */}
          <select
            className="h-10 rounded-xl border border-[#2a3033] bg-[#101214] px-3 text-xs font-medium text-white focus:border-[#c8ff05] focus:outline-none transition-colors"
          >
            <option value="">All Seasons</option>
            <option value="2026/2027">2026/2027 Season</option>
            <option value="2025/2026">2025/2026 Season</option>
          </select>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            aria-label="Refresh"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#2a3033] bg-[#101214] text-zinc-400 hover:border-zinc-700 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          {/* View Toggle */}
          <div className="flex items-center rounded-xl border border-[#2a3033] bg-[#101214] p-1">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#191d20] text-[#c8ff05]"
              title="Table view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:text-white"
              title="Card view"
            >
              <Columns className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
