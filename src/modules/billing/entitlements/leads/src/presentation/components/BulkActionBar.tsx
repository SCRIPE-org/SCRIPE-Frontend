// UI-EXCEPTION: compact studio layout
"use client";

import React from "react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";

interface BulkActionBarProps {
  count: number;
  onClose: () => void;
  onDelete: () => void;
  onClear: () => void;
  isLoading: boolean;
  canClose?: boolean;
  canDelete?: boolean;
}

/**
 * Presentation UI component rendering the bulk action bar.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function BulkActionBar({
  count,
  onClose,
  onDelete,
  onClear,
  isLoading,
  canClose = true,
  canDelete = true,
}: BulkActionBarProps) {
  const { t } = useI18n();

  return (
    <div
      className={cn(
        // Logical centering (mx-auto + w-fit against a full-bleed inset-x-0)
        // replaces a physical left-1/2 + -translate-x-1/2 pair; z-sticky is the
        // semantic ladder's slot for a floating bottom action bar.
        "fixed inset-x-0 bottom-6 z-sticky mx-auto flex w-fit items-center gap-3 rounded-nx-lg border border-[color:color-mix(in_srgb,var(--nx-accent)_20%,transparent)] bg-[color:color-mix(in_srgb,var(--nx-ground)_95%,transparent)] px-5 py-3 shadow-nx-modal transition-[opacity,transform] duration-nx-panel ease-nx-enter motion-reduce:!transform-none motion-reduce:transition-none",
        count > 0
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      )}
      aria-live="polite"
    >
      {/* Selection count */}
      <span className="text-sm font-medium tabular-nums text-nx-ink">
        {t("leads.bulk.selectedCount", { count: String(count) })}
      </span>

      <div className="h-4 w-px bg-nx-line" />

      {canClose && (
        <Button
          id="leads-bulk-close-btn"
          size="sm"
          disabled={isLoading}
          onClick={onClose}
          className="h-8 bg-warning px-3 text-xs font-medium text-warning-foreground hover:bg-warning/90"
        >
          {isLoading
            ? t("leads.bulk.closing")
            : t("leads.bulk.closeSelected", { count: String(count) })}
        </Button>
      )}

      {canDelete && (
        <Button
          id="leads-bulk-delete-btn"
          size="sm"
          variant="destructive"
          disabled={isLoading}
          onClick={onDelete}
          className="h-8 bg-destructive px-3 text-xs font-medium text-destructive-foreground hover:bg-destructive/90"
        >
          {t("leads.bulk.deleteSelected", { count: String(count) })}
        </Button>
      )}

      <div className="h-4 w-px bg-nx-line" />

      {/* Clear */}
      <button
        id="leads-bulk-clear-btn"
        onClick={onClear}
        className="text-xs text-nx-ink-3 transition-colors duration-nx-micro ease-nx-enter hover:text-nx-ink motion-reduce:transition-none"
        aria-label={t("leads.bulk.clearSelection")}
      >
        ✕
      </button>
    </div>
  );
}
