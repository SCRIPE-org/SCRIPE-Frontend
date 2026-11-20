"use client";

import React from "react";
import { CheckCircle2, Sparkles, Trash2 } from "lucide-react";
import type { CrudAction, CrudColumn } from "@core/crud";
import { Badge } from "@core/ui/badge";
import type { DataExchangePreset } from "../../domain/entities/DataExchangePreset";

export interface PresetsColumnsOptions {
  t: (key: string, params?: Record<string, string | number>) => string;
  isAr: boolean;
  resolveEntityName: (entityKey: string) => string;
}

/**
 * Builds table column definitions for Saved Mapping Presets.
 */
export function createPresetsColumns({
  t,
  isAr,
  resolveEntityName,
}: PresetsColumnsOptions): CrudColumn<DataExchangePreset>[] {
  return [
    {
      key: "name",
      label: t("adminDataTransferPresets.columns.name"),
      sortable: true,
      render: (_value: unknown, preset: DataExchangePreset) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-nx-ink">{preset.name}</span>
          {preset.isDefault && (
            <Badge variant="success" className="text-[10px] px-1.5 py-0.5">
              {t("adminDataTransferPresets.status.isDefaultBadge")}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "entityKey",
      label: t("adminDataTransferPresets.columns.entityKey"),
      sortable: true,
      render: (_value: unknown, preset: DataExchangePreset) => {
        const displayName = resolveEntityName(preset.entityKey);
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-xs text-nx-ink">{displayName}</span>
            <span dir="ltr" className="font-mono text-[11px] text-nx-ink-3 w-fit">
              {preset.entityKey}
            </span>
          </div>
        );
      },
    },
    {
      key: "importMode",
      label: t("adminDataTransferPresets.columns.importMode"),
      sortable: true,
      render: (_value: unknown, preset: DataExchangePreset) => (
        <Badge variant="outline" className="text-xs font-medium">
          {t(`adminDataTransferPresets.modes.${preset.importMode}`, {
            defaultValue: preset.importMode,
          })}
        </Badge>
      ),
    },
    {
      key: "mappingsCount",
      label: t("adminDataTransferPresets.columns.mappingsCount"),
      render: (_value: unknown, preset: DataExchangePreset) => (
        <Badge dir="ltr" variant="secondary" className="font-mono text-xs tabular-nums">
          {preset.mappingCount}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: t("adminDataTransferPresets.columns.createdAt"),
      render: (value: unknown) => {
        if (!value) return null;
        const date = new Date(String(value));
        const dateLocale = isAr ? "ar-EG" : "en-US";
        return (
          <span className="text-xs text-nx-ink-3 whitespace-nowrap font-mono tabular-nums">
            {date.toLocaleDateString(dateLocale)}{" "}
            {date.toLocaleTimeString(dateLocale, { hour: "2-digit", minute: "2-digit" })}
          </span>
        );
      },
    },
  ];
}

export interface PresetsActionsOptions {
  tFn: (key: string) => string;
  isSettingDefault: boolean;
  isDeleting: boolean;
  onUseInStudio: (preset: DataExchangePreset) => void;
  onSetDefault: (preset: DataExchangePreset) => void;
  onDeletePreset: (preset: DataExchangePreset) => void;
}

/**
 * Builds row-level and split-detail actions for a saved mapping preset.
 */
export function createPresetsActions({
  tFn,
  isSettingDefault,
  isDeleting,
  onUseInStudio,
  onSetDefault,
  onDeletePreset,
}: PresetsActionsOptions): CrudAction<DataExchangePreset>[] {
  return [
    {
      label: tFn("adminDataTransferPresets.actions.useInStudio"),
      icon: <Sparkles className="h-4 w-4 text-nx-accent" />,
      onClick: (preset: DataExchangePreset) => onUseInStudio(preset),
    },
    {
      label: tFn("adminDataTransferPresets.actions.setDefault"),
      icon: <CheckCircle2 className="h-4 w-4 text-nx-ink-2" />,
      disabled: (preset: DataExchangePreset) => preset.isDefault || isSettingDefault,
      show: (preset: DataExchangePreset) => !preset.isDefault,
      onClick: (preset: DataExchangePreset) => onSetDefault(preset),
    },
    {
      label: tFn("adminDataTransferPresets.actions.delete"),
      icon: <Trash2 className="h-4 w-4 text-nx-danger" />,
      variant: "destructive" as const,
      disabled: () => isDeleting,
      onClick: (preset: DataExchangePreset) => onDeletePreset(preset),
    },
  ];
}
