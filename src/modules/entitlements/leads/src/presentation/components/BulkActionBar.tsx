// UI-EXCEPTION: compact studio layout
"use client";

import React from "react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";

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
      className={`fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-primary/20 bg-background/95 px-5 py-3 shadow-2xl shadow-primary/10 backdrop-blur-md transition-all duration-300 ${
        count > 0
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
      aria-live="polite"
    >
      {/* Selection count */}
      <span className="text-sm font-medium tabular-nums text-foreground">
        {t("leads.bulk.selectedCount", { count: String(count) })}
      </span>

      <div className="h-4 w-px bg-border" />

      {canClose && (
        <Button
          id="leads-bulk-close-btn"
          size="sm"
          disabled={isLoading}
          onClick={onClose}
          className="h-8 bg-amber-600 px-3 text-xs font-medium text-white hover:bg-amber-500"
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

      <div className="h-4 w-px bg-border" />

      {/* Clear */}
      <button
        id="leads-bulk-clear-btn"
        onClick={onClear}
        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        aria-label={t("leads.bulk.clearSelection")}
      >
        ✕
      </button>
    </div>
  );
}
