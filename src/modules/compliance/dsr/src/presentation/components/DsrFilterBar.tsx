// UI-EXCEPTION: compact studio layout
"use client";

import { Button } from "@core/ui/button";
import type { DsrStatus, DsrRequestType } from "../../domain/entities/DataSubjectRequest";

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: DsrStatus; labelKey: string; color: string }[] = [
  {
    value: "Pending",
    labelKey: "compliance.pending",
    color:
      "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 hover:bg-slate-500/20",
  },
  {
    value: "InReview",
    labelKey: "compliance.inReview",
    color:
      "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 hover:bg-violet-500/20",
  },
  {
    value: "Approved",
    labelKey: "compliance.approved",
    color:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20",
  },
  {
    value: "Processing",
    labelKey: "compliance.processing",
    color:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20",
  },
  {
    value: "Completed",
    labelKey: "compliance.completed",
    color:
      "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 hover:bg-green-500/20",
  },
  {
    value: "Rejected",
    labelKey: "compliance.rejected",
    color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/20",
  },
  {
    value: "Cancelled",
    labelKey: "compliance.cancelled",
    color:
      "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border-zinc-500/20 hover:bg-zinc-500/20",
  },
  {
    value: "PartiallyCompleted",
    labelKey: "compliance.partiallyCompleted",
    color:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20",
  },
];

const TYPE_OPTIONS: { value: DsrRequestType; labelKey: string; color: string }[] = [
  {
    value: "Export",
    labelKey: "compliance.export",
    color:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20",
  },
  {
    value: "Erasure",
    labelKey: "compliance.erasure",
    color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/20",
  },
  {
    value: "Rectification",
    labelKey: "compliance.rectification",
    color:
      "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 hover:bg-violet-500/20",
  },
  {
    value: "Restriction",
    labelKey: "compliance.restriction",
    color:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20",
  },
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface DsrFilterBarProps {
  statusFilter: DsrStatus | "";
  typeFilter: DsrRequestType | "";
  onStatusChange: (v: DsrStatus | "") => void;
  onTypeChange: (v: DsrRequestType | "") => void;
  onClear: () => void;
  t: (key: string) => string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DsrFilterBar({
  statusFilter,
  typeFilter,
  onStatusChange,
  onTypeChange,
  onClear,
  t,
}: DsrFilterBarProps) {
  const hasActiveFilter = statusFilter !== "" || typeFilter !== "";

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-muted/40 px-4 py-3">
      {/* Status pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="me-1 text-xs font-medium text-muted-foreground">
          {t("compliance.filterByStatus")}:
        </span>
        {STATUS_OPTIONS.map((opt) => {
          const active = statusFilter === opt.value;
          return (
            <button
              key={opt.value}
              id={`dsr-filter-status-${opt.value.toLowerCase()}`}
              onClick={() => onStatusChange(active ? "" : opt.value)}
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all ${opt.color} ${
                active ? "ring-2 ring-current ring-offset-1" : "opacity-70 hover:opacity-100"
              }`}
            >
              {t(opt.labelKey)}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-border" />

      {/* Type pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="me-1 text-xs font-medium text-muted-foreground">
          {t("compliance.filterByType")}:
        </span>
        {TYPE_OPTIONS.map((opt) => {
          const active = typeFilter === opt.value;
          return (
            <button
              key={opt.value}
              id={`dsr-filter-type-${opt.value.toLowerCase()}`}
              onClick={() => onTypeChange(active ? "" : opt.value)}
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all ${opt.color} ${
                active ? "ring-2 ring-current ring-offset-1" : "opacity-70 hover:opacity-100"
              }`}
            >
              {t(opt.labelKey)}
            </button>
          );
        })}
      </div>

      {/* Clear button — only visible when a filter is active */}
      {hasActiveFilter && (
        <Button
          id="dsr-filter-clear"
          variant="ghost"
          size="sm"
          className="ms-auto h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={onClear}
        >
          {t("common.clearAll")}
        </Button>
      )}
    </div>
  );
}
