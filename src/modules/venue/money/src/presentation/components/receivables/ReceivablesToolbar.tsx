"use client";

import { Search } from "lucide-react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { cn } from "@core/common/utils";
import type { ReceivablesStatusFilter } from "../../viewmodels/useReceivablesViewModel";

interface ReceivablesToolbarProps {
  statusFilter: ReceivablesStatusFilter;
  onStatusFilterChange: (filter: ReceivablesStatusFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const FILTER_OPTIONS: ReadonlyArray<{ key: ReceivablesStatusFilter; labelKey: string }> = [
  { key: "all", labelKey: "money.receivables.filterAll" },
  { key: "outstanding", labelKey: "money.receivables.filterOutstanding" },
  { key: "partiallyPaid", labelKey: "money.receivables.filterPartiallyPaid" },
  { key: "paid", labelKey: "money.receivables.filterPaid" },
];

/**
 * Single unified toolbar for Receivables combining status filter pills and search input.
 * Rendered inside GenericCrudView's `toolbarContent` slot alongside the view-mode switcher.
 */
export function ReceivablesToolbar({
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  t,
}: ReceivablesToolbarProps) {
  return (
    <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative w-full sm:w-72">
        <Search
          className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-nx-ink-3"
          aria-hidden="true"
        />
        <Input
          type="text"
          placeholder={t("money.receivables.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label={t("money.receivables.searchPlaceholder")}
          className="h-8 border-nx-line bg-nx-surface ps-8 text-xs text-nx-ink"
        />
      </div>

      <fieldset
        className="m-0 flex flex-wrap items-center gap-1.5 border-0 p-0"
        aria-label={t("money.receivables.statusFilterAriaLabel")}
      >
        {FILTER_OPTIONS.map(({ key, labelKey }) => {
          const isSelected = statusFilter === key;
          return (
            <Button
              key={key}
              type="button"
              variant="outline"
              size="sm"
              aria-pressed={isSelected}
              onClick={() => onStatusFilterChange(key)}
              className={cn(
                "h-7 rounded-nx-md px-2.5 text-xs transition-colors",
                isSelected
                  ? "border-nx-accent/40 bg-nx-accent-wash text-nx-accent font-semibold"
                  : "border-nx-line bg-nx-surface text-nx-ink-2 hover:bg-nx-raised hover:text-nx-ink"
              )}
            >
              {t(labelKey)}
            </Button>
          );
        })}
      </fieldset>
    </div>
  );
}
