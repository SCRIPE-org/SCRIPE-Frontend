// UI-EXCEPTION: compact studio layout
"use client";

import { badgeVariants, type BadgeProps } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { cn } from "@core/common/utils";
import type { DsrStatus, DsrRequestType } from "../../domain/entities/DataSubjectRequest";

// ── Constants ─────────────────────────────────────────────────────────────────
// Each pill is built from the same badgeVariants ladder the read-only Badge
// uses (never a hand-mixed hex/opacity pair), so the status hue is legible at
// rest; the active option layers on the same inset accent ring the rest of
// the system marks a live selection with (button press, activatable stat
// cards) instead of an ad-hoc ring-offset/opacity pair.

const STATUS_OPTIONS: { value: DsrStatus; labelKey: string; variant: BadgeProps["variant"] }[] = [
  { value: "Pending", labelKey: "compliance.pending", variant: "warning" },
  { value: "InReview", labelKey: "compliance.inReview", variant: "info" },
  { value: "Approved", labelKey: "compliance.approved", variant: "success" },
  { value: "Processing", labelKey: "compliance.processing", variant: "info" },
  { value: "Completed", labelKey: "compliance.completed", variant: "success" },
  { value: "Rejected", labelKey: "compliance.rejected", variant: "error" },
  { value: "Cancelled", labelKey: "compliance.cancelled", variant: "secondary" },
  { value: "PartiallyCompleted", labelKey: "compliance.partiallyCompleted", variant: "success" },
];

const TYPE_OPTIONS: { value: DsrRequestType; labelKey: string; variant: BadgeProps["variant"] }[] =
  [
    { value: "Export", labelKey: "compliance.export", variant: "info" },
    { value: "Erasure", labelKey: "compliance.erasure", variant: "error" },
    { value: "Rectification", labelKey: "compliance.rectification", variant: "default" },
    { value: "Restriction", labelKey: "compliance.restriction", variant: "warning" },
  ];

const FILTER_PILL_MOTION =
  "transition-[color,background-color,border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none";

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
    <div className="flex flex-wrap items-center gap-3 rounded-nx-md border border-nx-line bg-nx-surface px-4 py-3">
      {/* Status pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="me-1 text-xs font-medium text-nx-ink-3">
          {t("compliance.filterByStatus")}:
        </span>
        {STATUS_OPTIONS.map((opt) => {
          const active = statusFilter === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              id={`dsr-filter-status-${opt.value.toLowerCase()}`}
              aria-pressed={active}
              onClick={() => onStatusChange(active ? "" : opt.value)}
              className={cn(
                badgeVariants({ variant: opt.variant }),
                FILTER_PILL_MOTION,
                active && "shadow-[inset_0_0_0_1px_var(--nx-accent)]"
              )}
            >
              {t(opt.labelKey)}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-nx-line" aria-hidden="true" />

      {/* Type pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="me-1 text-xs font-medium text-nx-ink-3">
          {t("compliance.filterByType")}:
        </span>
        {TYPE_OPTIONS.map((opt) => {
          const active = typeFilter === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              id={`dsr-filter-type-${opt.value.toLowerCase()}`}
              aria-pressed={active}
              onClick={() => onTypeChange(active ? "" : opt.value)}
              className={cn(
                badgeVariants({ variant: opt.variant }),
                FILTER_PILL_MOTION,
                active && "shadow-[inset_0_0_0_1px_var(--nx-accent)]"
              )}
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
          className="ms-auto h-7 px-2 text-xs text-nx-ink-3 hover:text-nx-ink"
          onClick={onClear}
        >
          {t("common.clearAll")}
        </Button>
      )}
    </div>
  );
}
