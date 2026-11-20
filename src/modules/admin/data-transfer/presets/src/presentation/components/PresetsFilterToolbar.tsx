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
import type { PresetEntityFilterOption } from "../hooks/usePresetsEntityCatalog";

/** Props for PresetsFilterToolbar component. */
export interface PresetsFilterToolbarProps {
  entityFilter: string;
  options: PresetEntityFilterOption[];
  onEntityFilterChange: (value: string) => void;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
}

/**
 * Toolbar entity filter powered exclusively by @core/ui/select and dynamic catalog/preset options.
 */
export function PresetsFilterToolbar({
  entityFilter,
  options,
  onEntityFilterChange,
  hasActiveFilters = false,
  onResetFilters,
}: PresetsFilterToolbarProps): React.ReactElement {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="presets-entity-filter-bar">
      <Filter className="h-4 w-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
      <Select value={entityFilter} onValueChange={onEntityFilterChange}>
        <SelectTrigger
          className="h-9 w-[240px]"
          aria-label={t("adminDataTransferPresets.filters.entityLabel")}
          data-testid="presets-entity-filter-trigger"
        >
          <SelectValue placeholder={t("adminDataTransferPresets.filters.placeholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            {t("adminDataTransferPresets.filters.allEntities")}
          </SelectItem>
          {options.map((option) => (
            <SelectItem key={option.entityKey} value={option.entityKey}>
              <span className="flex items-center gap-2">
                <span>{option.label}</span>
                <span dir="ltr" className="font-mono text-[11px] text-nx-ink-3">
                  ({option.entityKey})
                </span>
              </span>
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
          data-testid="presets-reset-filters-btn"
        >
          <RotateCcw className="h-3.5 w-3.5 me-1" aria-hidden="true" />
          {t("common.reset")}
        </Button>
      )}
    </div>
  );
}
