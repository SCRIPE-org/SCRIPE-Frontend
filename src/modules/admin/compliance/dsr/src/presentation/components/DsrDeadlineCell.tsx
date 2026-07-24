"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { DataSubjectRequest } from "../../domain/entities/DataSubjectRequest";

// ── Deadline Cell with Overdue Indicator ──────────────────────────────────────

interface DsrDeadlineCellProps {
  dsr: DataSubjectRequest;
  remainingLabel: string;
  completedLabel: string;
  overdueLabel: string;
}

/**
 * Presentation UI component rendering the dsr deadline cell.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function DsrDeadlineCell({
  dsr,
  remainingLabel,
  completedLabel,
  overdueLabel,
}: DsrDeadlineCellProps) {
  return (
    <div className="flex items-center gap-1.5">
      {dsr.isOverdue && <AlertTriangle className="h-3.5 w-3.5 text-destructive" aria-hidden="true" />}
      {dsr.isCompleted && <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden="true" />}
      <span className="text-xs tabular-nums text-nx-ink-3">
        {dsr.daysRemaining > 0
          ? `${dsr.daysRemaining}d ${remainingLabel}`
          : dsr.isCompleted
            ? completedLabel
            : overdueLabel}
      </span>
    </div>
  );
}
