"use client";

import React, { memo } from "react";
import { Calendar, CheckCircle2, MoreHorizontal, Sliders, Sparkles, Trash2 } from "lucide-react";
import { Card } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { getEntityDisplayName } from "@core/data-exchange";
import type { DataExchangeEntitySummaryView } from "../../../../entities/src/domain/entities/DataExchangeEntity";
import type { DataExchangePreset } from "../../domain/entities/DataExchangePreset";

/**
 * Props for the MappingPresetCard component.
 */
export interface MappingPresetCardProps {
  /** The saved column mapping preset */
  preset: DataExchangePreset;
  /** Optional live catalog entry for resolving dynamic localized entity display names */
  entitySummary?: DataExchangeEntitySummaryView;
  /** Callback to delete the mapping preset */
  onDeletePreset: (preset: DataExchangePreset) => void;
  /** Callback to open preset in Import Studio */
  onUseInStudio?: (preset: DataExchangePreset) => void;
  /** Callback to designate preset as default */
  onSetDefault?: (preset: DataExchangePreset) => void;
  /** Whether preset deletion is in flight */
  isDeleting?: boolean;
  /** Whether setting default is in flight */
  isSettingDefault?: boolean;
  /** Optional custom class name */
  className?: string;
}

/**
 * Bespoke Nexus CardGrid card for Data Exchange Saved Mapping Presets.
 * Hairline borders, flat matte surfaces, structured mapping telemetry, and canonical ⋯ dropdown.
 */
export const MappingPresetCard = memo(function MappingPresetCard({
  preset,
  entitySummary,
  onDeletePreset,
  onUseInStudio,
  onSetDefault,
  isDeleting = false,
  isSettingDefault = false,
  className,
}: MappingPresetCardProps) {
  const { language, t } = useI18n();
  const isAr = language === "ar";
  const localizedEntityName = getEntityDisplayName(preset.entityKey, t, isAr, entitySummary);

  return (
    <Card
      className={cn(
        "group relative flex flex-col justify-between gap-4 rounded-nx-lg border border-nx-line bg-nx-surface p-5 hover:border-nx-line-hi transition-colors",
        className
      )}
    >
      {/* Header: Preset Name + Target Entity + Default Pill + ⋯ Dropdown */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 shrink-0 text-nx-accent" aria-hidden="true" />
            <h3 className="font-semibold text-nx-ink text-sm sm:text-base truncate" title={preset.name}>
              {preset.name}
            </h3>
            {preset.isDefault && (
              <Badge variant="default" className="text-[10px] font-medium py-0 px-1.5">
                {t("adminDataTransferPresets.status.isDefaultBadge") || "Default"}
              </Badge>
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-nx-ink-2 truncate" title={localizedEntityName}>
              {localizedEntityName}
            </span>
            <code
              dir="ltr"
              className="text-[11px] font-mono text-nx-ink-3 bg-nx-raised px-1.5 py-0.5 rounded-sm border border-nx-line w-fit"
            >
              {preset.entityKey}
            </code>
          </div>
        </div>

        {/* Canonical ⋯ Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-nx-ink-2 hover:text-nx-ink hover:bg-nx-raised"
              aria-label={t("adminDataTransferPresets.columns.actions")}
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isAr ? "start" : "end"} className="w-56">
            {onUseInStudio && (
              <DropdownMenuItem
                onClick={() => onUseInStudio(preset)}
                className="cursor-pointer gap-2"
              >
                <Sparkles className="h-4 w-4 text-nx-accent" aria-hidden="true" />
                <span>{t("adminDataTransferPresets.actions.useInStudio")}</span>
              </DropdownMenuItem>
            )}
            {onSetDefault && !preset.isDefault && (
              <DropdownMenuItem
                onClick={() => onSetDefault(preset)}
                disabled={isSettingDefault}
                className="cursor-pointer gap-2"
              >
                <CheckCircle2 className="h-4 w-4 text-nx-ink-2" aria-hidden="true" />
                <span>{t("adminDataTransferPresets.actions.setDefault")}</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onDeletePreset(preset)}
              disabled={isDeleting}
              className="cursor-pointer gap-2 text-nx-danger focus:text-nx-danger"
            >
              <Trash2 className="h-4 w-4 text-nx-danger" aria-hidden="true" />
              <span>{t("adminDataTransferPresets.actions.delete")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Structured Capability Strip: Import Mode & Mapped Columns */}
      <div className="space-y-2 rounded-nx-control bg-nx-raised p-3 border border-nx-line text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-nx-ink-3">
            {t("adminDataTransferPresets.columns.importMode")}
          </span>
          <Badge variant="outline" className="text-[10px] font-mono font-medium">
            {t(`adminDataTransferPresets.modes.${preset.importMode}`, { defaultValue: preset.importMode })}
          </Badge>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-nx-line">
          <span className="text-[11px] font-medium text-nx-ink-3">
            {t("adminDataTransferPresets.columns.mappingsCount")}
          </span>
          <span className="font-mono font-semibold text-nx-ink tabular-nums">
            {t("adminDataTransferPresets.columnsCount", { count: String(preset.mappingCount) })}
          </span>
        </div>
      </div>

      {/* Footer: Creation Date & Quick Actions */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-nx-line text-xs">
        <div className="flex items-center gap-1.5 text-[11px] text-nx-ink-3 font-mono tabular-nums">
          <Calendar className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span>
            {new Date(preset.createdAt).toLocaleString(isAr ? "ar-EG" : "en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onUseInStudio && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUseInStudio(preset)}
              className="h-7 px-2 text-xs border-nx-line hover:border-nx-accent hover:text-nx-accent"
            >
              <Sparkles className="h-3 w-3 me-1 text-nx-accent" aria-hidden="true" />
              {t("adminDataTransferPresets.actions.useInStudio")}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeletePreset(preset)}
            disabled={isDeleting}
            className="h-7 px-2 text-xs text-nx-danger hover:bg-destructive/10"
          >
            <Trash2 className="h-3 w-3 me-1" aria-hidden="true" />
            {t("adminDataTransferPresets.actions.delete")}
          </Button>
        </div>
      </div>
    </Card>
  );
});
