"use client";

import React from "react";
import { Filter } from "lucide-react";
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
}

/**
 * Toolbar entity filter powered exclusively by @core/ui/select and dynamic catalog/preset options.
 */
export function PresetsFilterToolbar({
  entityFilter,
  options,
  onEntityFilterChange,
}: PresetsFilterToolbarProps): React.ReactElement {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-2" data-testid="presets-entity-filter-bar">
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
    </div>
  );
}
