"use client";

import React from "react";
import { Download, FileSpreadsheet, Layers, Sparkles } from "lucide-react";
import type { CrudAction, CrudColumn } from "@core/crud";
import { Badge } from "@core/ui/badge";
import type { DataExchangeEntity } from "../../domain/entities/DataExchangeEntity";
import { resolveModuleDisplayName } from "../utils/module-display-name";

export interface EntitiesColumnsOptions {
  t: (key: string, params?: Record<string, string | number>) => string;
  isAr: boolean;
}

/**
 * Builds table column definitions for the Data Exchange Entities catalog table.
 */
export function createEntitiesColumns({
  t,
  isAr,
}: EntitiesColumnsOptions): CrudColumn<DataExchangeEntity>[] {
  return [
    {
      key: "entity",
      label: t("dataTransferEntities.columns.entity"),
      sortable: true,
      render: (_value: unknown, entity: DataExchangeEntity) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-nx-ink text-sm">
            {isAr && entity.displayNameAr ? entity.displayNameAr : entity.displayNameEn}
          </span>
          <span dir="ltr" className="font-mono text-xs text-nx-ink-3 w-fit">
            {entity.entityKey}
          </span>
        </div>
      ),
    },
    {
      key: "owningModule",
      label: t("dataTransferEntities.columns.owningModule"),
      sortable: true,
      render: (value: unknown) => (
        <Badge variant="outline" className="font-medium text-xs">
          {resolveModuleDisplayName(String(value ?? ""), t)}
        </Badge>
      ),
    },
    {
      key: "supportedModes",
      label: t("dataTransferEntities.columns.supportedModes"),
      render: (_value: unknown, entity: DataExchangeEntity) => (
        <div className="flex flex-wrap gap-1">
          {entity.supportedModes.map((mode) => (
            <Badge key={mode} variant="secondary" className="text-[10px] px-1.5 py-0.5">
              {t(`dataTransferEntities.modes.${mode}`, { defaultValue: mode })}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "quota",
      label: t("dataTransferEntities.columns.quota"),
      render: (_value: unknown, entity: DataExchangeEntity) => {
        if (typeof entity.remainingQuotaSlots !== "number") {
          return (
            <span className="text-xs text-nx-ink-3">
              {t("dataTransferEntities.quota.unlimited")}
            </span>
          );
        }
        const isExhausted = entity.remainingQuotaSlots <= 0;
        return (
          <Badge
            variant={isExhausted ? "danger" : "info"}
            className="text-[10px] font-mono tabular-nums px-1.5 py-0.5"
          >
            {isExhausted
              ? t("dataTransferEntities.quota.exhausted")
              : t("dataTransferEntities.quota.slotsRemaining", {
                  remaining: entity.remainingQuotaSlots,
                  limit: entity.quotaMaxLimit ?? "∞",
                })}
          </Badge>
        );
      },
    },
  ];
}

export interface EntitiesActionsOptions {
  tFn: (key: string) => string;
  downloadingTemplateEntity: string | null;
  onDownloadTemplate: (entity: DataExchangeEntity) => void;
  onLaunchStudio: (entityKey: string) => void;
  onLaunchMultiSheet: (entity: DataExchangeEntity) => void;
  onQuickExport: (entityKey: string) => void;
}

/**
 * Builds row-level and split-detail actions for a DataExchangeEntity.
 */
export function createEntitiesActions({
  tFn,
  downloadingTemplateEntity,
  onDownloadTemplate,
  onLaunchStudio,
  onLaunchMultiSheet,
  onQuickExport,
}: EntitiesActionsOptions): CrudAction<DataExchangeEntity>[] {
  return [
    {
      label: tFn("dataTransferEntities.actions.downloadTemplate"),
      icon: <Download className="h-4 w-4 text-nx-success" />,
      disabled: (entity) => downloadingTemplateEntity === entity.entityKey,
      onClick: (entity) => onDownloadTemplate(entity),
    },
    {
      label: tFn("dataTransferEntities.actions.launchStudio"),
      icon: <Sparkles className="h-4 w-4 text-nx-accent" />,
      show: (entity) => Boolean(entity.canImport && entity.isImportFeatureEnabled),
      onClick: (entity) => onLaunchStudio(entity.entityKey),
    },
    {
      label: tFn("dataTransferEntities.actions.multiSheetMigration"),
      icon: <Layers className="h-4 w-4 text-nx-accent" />,
      show: (entity) =>
        Boolean(
          entity.canImport &&
            entity.isImportFeatureEnabled &&
            entity.relatedMultiSheetEntityKeys &&
            entity.relatedMultiSheetEntityKeys.length > 1
        ),
      onClick: (entity) => onLaunchMultiSheet(entity),
    },
    {
      label: tFn("dataTransferEntities.actions.quickExport"),
      icon: <FileSpreadsheet className="h-4 w-4 text-nx-info" />,
      show: (entity) => Boolean(entity.canExport && entity.isExportFeatureEnabled),
      onClick: (entity) => onQuickExport(entity.entityKey),
    },
  ];
}
