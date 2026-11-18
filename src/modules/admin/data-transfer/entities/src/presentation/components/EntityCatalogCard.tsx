"use client";

import React, { memo } from "react";
import { Download, FileSpreadsheet, Layers, MoreHorizontal, Sparkles, Upload } from "lucide-react";
import { Card } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import type { DataExchangeEntity } from "../../domain/entities/DataExchangeEntity";
import { resolveModuleDisplayName } from "../utils/module-display-name";

/**
 * Props for the EntityCatalogCard component.
 */
export interface EntityCatalogCardProps {
  /** The data exchange entity descriptor */
  entity: DataExchangeEntity;
  /** Callback to trigger smart template download */
  onDownloadTemplate: (entity: DataExchangeEntity) => void;
  /** Whether template download is currently in flight */
  isDownloadingTemplate: boolean;
  /** Callback to launch the interactive Import Studio */
  onLaunchStudio: (entityKey: string) => void;
  /** Callback to launch multi-sheet migration studio */
  onMultiSheetMigration?: (entity: DataExchangeEntity) => void;
  /** Callback to launch quick export dialog */
  onQuickExport: (entityKey: string) => void;
  /** Optional custom class name */
  className?: string;
}

/**
 * Bespoke Nexus CardGrid card for Data Exchange Entities.
 * Adheres strictly to Nexus flat matte aesthetics, hairline borders, and zero resting shadows.
 */
export const EntityCatalogCard = memo(function EntityCatalogCard({
  entity,
  onDownloadTemplate,
  isDownloadingTemplate,
  onLaunchStudio,
  onMultiSheetMigration,
  onQuickExport,
  className,
}: EntityCatalogCardProps) {
  const { language, t } = useI18n();
  const isAr = language === "ar";
  const displayName = isAr && entity.displayNameAr ? entity.displayNameAr : entity.displayNameEn;
  const isExhausted =
    typeof entity.remainingQuotaSlots === "number" && entity.remainingQuotaSlots <= 0;

  return (
    <Card
      className={cn(
        "group relative flex flex-col justify-between gap-4 rounded-nx-lg border border-nx-line bg-nx-surface p-5 hover:border-nx-line-hi transition-colors",
        className
      )}
    >
      {/* Card Header: Entity Name + Monospace Key + ⋯ Dropdown */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 shrink-0 text-nx-accent" aria-hidden="true" />
            <h3 className="font-semibold text-nx-ink text-sm sm:text-base truncate" title={displayName}>
              {displayName}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <code
              dir="ltr"
              className="text-[11px] font-mono font-medium text-nx-ink-2 bg-nx-raised px-1.5 py-0.5 rounded-sm border border-nx-line"
            >
              {entity.entityKey}
            </code>
            <Badge variant="outline" className="text-[10px] font-medium uppercase tracking-wider py-0 px-1.5">
              {resolveModuleDisplayName(entity.owningModule, t)}
            </Badge>
          </div>
        </div>

        {/* Canonical ⋯ Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-nx-ink-2 hover:text-nx-ink hover:bg-nx-raised"
              aria-label={t("dataTransferEntities.columns.actions")}
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isAr ? "start" : "end"} className="w-52">
            <DropdownMenuItem
              onClick={() => onDownloadTemplate(entity)}
              disabled={isDownloadingTemplate}
              className="cursor-pointer gap-2"
            >
              <Download className="h-4 w-4 text-nx-success" aria-hidden="true" />
              <span>
                {isDownloadingTemplate
                  ? t("dataTransferEntities.actions.downloadingTemplate")
                  : t("dataTransferEntities.actions.downloadTemplate")}
              </span>
            </DropdownMenuItem>

            {entity.canImport && entity.isImportFeatureEnabled && (
              <DropdownMenuItem
                onClick={() => onLaunchStudio(entity.entityKey)}
                className="cursor-pointer gap-2"
              >
                <Sparkles className="h-4 w-4 text-nx-accent" aria-hidden="true" />
                <span>{t("dataTransferEntities.actions.launchStudio")}</span>
              </DropdownMenuItem>
            )}

            {entity.canImport &&
              entity.isImportFeatureEnabled &&
              entity.relatedMultiSheetEntityKeys &&
              entity.relatedMultiSheetEntityKeys.length > 1 && (
                <DropdownMenuItem
                  onClick={() => onMultiSheetMigration?.(entity)}
                  className="cursor-pointer gap-2"
                >
                  <Layers className="h-4 w-4 text-nx-accent" aria-hidden="true" />
                  <span>{t("dataTransferEntities.actions.multiSheetMigration")}</span>
                </DropdownMenuItem>
              )}

            {entity.canExport && entity.isExportFeatureEnabled && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onQuickExport(entity.entityKey)}
                  className="cursor-pointer gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4 text-nx-info" aria-hidden="true" />
                  <span>{t("dataTransferEntities.actions.quickExport")}</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Structured Capability & Quota Strip */}
      <div className="space-y-2.5 rounded-nx-control bg-nx-raised p-3 border border-nx-line text-xs">
        {/* Supported Import Modes */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-nx-ink-3">
            {t("dataTransferEntities.columns.supportedModes")}
          </span>
          <div className="flex flex-wrap items-center gap-1">
            {entity.supportedModes.map((mode) => (
              <span
                key={mode}
                className="inline-block rounded-sm bg-nx-surface px-1.5 py-0.5 text-[10px] font-mono font-medium text-nx-ink border border-nx-line"
              >
                {t(`dataTransferEntities.modes.${mode}`, { defaultValue: mode })}
              </span>
            ))}
          </div>
        </div>

        {/* Quota Status */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-nx-line">
          <span className="text-[11px] font-medium text-nx-ink-3">
            {t("dataTransferEntities.columns.quota")}
          </span>
          <Badge
            variant={isExhausted ? "danger" : "secondary"}
            className="text-[10px] font-mono px-1.5 py-0.5 tabular-nums"
          >
            {isExhausted
              ? t("dataTransferEntities.quota.exhausted")
              : entity.remainingQuotaSlots === null || entity.remainingQuotaSlots === undefined
                ? t("dataTransferEntities.quota.unlimited")
                : t("dataTransferEntities.quota.slotsRemaining", {
                    remaining: entity.remainingQuotaSlots,
                    limit: entity.quotaMaxLimit ?? "∞",
                  })}
          </Badge>
        </div>
      </div>

      {/* Quick Access Card Footer */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-nx-line text-xs">
        <span className="text-[11px] text-nx-ink-3">
          {entity.canImport && entity.canExport
            ? t("dataTransferEntities.capabilities.importAndExport")
            : entity.canImport
              ? t("dataTransferEntities.capabilities.importOnly")
              : t("dataTransferEntities.capabilities.exportOnly")}
        </span>
        {entity.canImport && entity.isImportFeatureEnabled && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLaunchStudio(entity.entityKey)}
            className="h-7 px-2 text-xs text-nx-accent hover:text-nx-accent hover:bg-nx-accent-wash"
          >
            <Upload className="h-3 w-3 me-1" aria-hidden="true" />
            {t("dataTransferEntities.actions.launchStudio")}
          </Button>
        )}
      </div>
    </Card>
  );
});
