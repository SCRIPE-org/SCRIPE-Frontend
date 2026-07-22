// UI-EXCEPTION: compact studio layout
"use client";

import { Button } from "@core/ui/button";
import type { DsrStatus, DsrRequestType } from "../../domain/entities/DataSubjectRequest";

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: DsrStatus; labelKey: string; color: string }[] = [
  {
    value: "Pending",
    labelKey: "compliance.pending",
    color: "bg-muted text-muted-foreground border-border hover:bg-muted/80",
  },
  {
    value: "InReview",
    labelKey: "compliance.inReview",
    color: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  },
  {
    value: "Approved",
    labelKey: "compliance.approved",
    color: "bg-success/10 text-success border-success/20 hover:bg-success/20",
  },
  {
    value: "Processing",
    labelKey: "compliance.processing",
    color: "bg-info/10 text-info border-info/20 hover:bg-info/20",
  },
  {
    value: "Completed",
    labelKey: "compliance.completed",
    color: "bg-success/10 text-success border-success/20 hover:bg-success/20",
  },
  {
    value: "Rejected",
    labelKey: "compliance.rejected",
    color: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
  },
  {
    value: "Cancelled",
    labelKey: "compliance.cancelled",
    color: "bg-muted text-muted-foreground border-border hover:bg-muted/80",
  },
  {
    value: "PartiallyCompleted",
    labelKey: "compliance.partiallyCompleted",
    color: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20",
  },
];

const TYPE_OPTIONS: { value: DsrRequestType; labelKey: string; color: string }[] = [
  {
    value: "Export",
    labelKey: "compliance.export",
    color: "bg-info/10 text-info border-info/20 hover:bg-info/20",
  },
  {
    value: "Erasure",
    labelKey: "compliance.erasure",
    color: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
  },
  {
    value: "Rectification",
    labelKey: "compliance.rectification",
    color: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  },
  {
    value: "Restriction",
    labelKey: "compliance.restriction",
    color: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20",
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

/**
 * Presentation UI component rendering the dsr filter bar.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
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
