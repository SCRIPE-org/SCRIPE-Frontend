"use client";

import React from "react";
import { Filter, RotateCcw } from "lucide-react";
import { Button } from "@core/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { useI18n } from "@core/providers/i18n-provider";

const FILTER_STATUSES = [
  "Queued",
  "Running",
  "Completed",
  "CompletedWithErrors",
  "Failed",
  "Cancelled",
] as const;

const FILTER_KINDS = ["Import", "Export", "MultiSheetMigration"] as const;

/** Props for JobsFilterToolbar component. */
export interface JobsFilterToolbarProps {
  statusFilter: string;
  kindFilter: string;
  onStatusFilterChange: (value: string) => void;
  onKindFilterChange: (value: string) => void;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
}

/**
 * Toolbar status and kind filters for the Transfer Jobs workspace,
 * powered exclusively by @core/ui/select and @core/ui/button.
 */
export function JobsFilterToolbar({
  statusFilter,
  kindFilter,
  onStatusFilterChange,
  onKindFilterChange,
  hasActiveFilters = false,
  onResetFilters,
}: JobsFilterToolbarProps): React.ReactElement {
  const { t } = useI18n();

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      data-testid="jobs-filter-toolbar"
    >
      <Filter className="h-4 w-4 shrink-0 text-nx-ink-3" aria-hidden="true" />

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger
          className="h-9 w-[190px]"
          aria-label={t("adminDataTransferJobs.columns.status")}
          data-testid="jobs-status-filter-trigger"
        >
          <SelectValue placeholder={t("adminDataTransferJobs.filters.allStatuses")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            {t("adminDataTransferJobs.filters.allStatuses")}
          </SelectItem>
          {FILTER_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {t(`adminDataTransferJobs.statuses.${status}`, { defaultValue: status })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={kindFilter} onValueChange={onKindFilterChange}>
        <SelectTrigger
          className="h-9 w-[190px]"
          aria-label={t("adminDataTransferJobs.columns.kind")}
          data-testid="jobs-kind-filter-trigger"
        >
          <SelectValue placeholder={t("adminDataTransferJobs.filters.allKinds")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            {t("adminDataTransferJobs.filters.allKinds")}
          </SelectItem>
          {FILTER_KINDS.map((kind) => (
            <SelectItem key={kind} value={kind}>
              {t(`adminDataTransferJobs.kinds.${kind}`, { defaultValue: kind })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && onResetFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onResetFilters}
          className="h-9 px-2.5 text-xs text-nx-ink-2 hover:text-nx-ink"
          data-testid="jobs-reset-filters-btn"
        >
          <RotateCcw className="h-3.5 w-3.5 me-1" aria-hidden="true" />
          {t("common.reset")}
        </Button>
      )}
    </div>
  );
}
