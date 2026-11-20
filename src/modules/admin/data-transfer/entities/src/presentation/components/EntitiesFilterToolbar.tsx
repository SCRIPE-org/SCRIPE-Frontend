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
import { resolveModuleDisplayName } from "../utils/module-display-name";

/** Props for EntitiesFilterToolbar component. */
export interface EntitiesFilterToolbarProps {
  selectedModule: string;
  availableModules: string[];
  onModuleChange: (value: string) => void;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
}

/**
 * Toolbar module filter for the Data Exchange Entities catalog,
 * built exclusively with @core/ui/select and @core/ui/button.
 */
export function EntitiesFilterToolbar({
  selectedModule,
  availableModules,
  onModuleChange,
  hasActiveFilters = false,
  onResetFilters,
}: EntitiesFilterToolbarProps): React.ReactElement {
  const { t } = useI18n();

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      data-testid="entities-filter-toolbar"
    >
      <Filter className="h-4 w-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
      <Select value={selectedModule} onValueChange={onModuleChange}>
        <SelectTrigger
          className="h-9 w-[210px]"
          aria-label={t("dataTransferEntities.filters.moduleLabel")}
          data-testid="entities-module-filter-trigger"
        >
          <SelectValue placeholder={t("dataTransferEntities.filterModule")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            {t("dataTransferEntities.filterModule")}
          </SelectItem>
          {availableModules.map((mod) => (
            <SelectItem key={mod} value={mod}>
              {resolveModuleDisplayName(mod, t)}
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
          data-testid="entities-reset-filters-btn"
        >
          <RotateCcw className="h-3.5 w-3.5 me-1" aria-hidden="true" />
          {t("common.reset")}
        </Button>
      )}
    </div>
  );
}
