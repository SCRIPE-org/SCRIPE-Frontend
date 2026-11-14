"use client";

import { useMemo } from "react";
import { GenericCrudView, type CrudConfig, type CrudColumn } from "@core/crud/components/generic-crud-view";
import { Badge } from "@core/ui/badge";
import { Card } from "@core/ui/card";
import {
  Download,
  Upload,
  FileSpreadsheet,
  Layers,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  DataExchangeStudioOverlay,
  DataExchangeExportDialog,
} from "@core/data-exchange";
import { useEntitiesViewModel } from "../viewmodels/useEntitiesViewModel";
import type { DataExchangeEntity } from "../../domain/entities/DataExchangeEntity";
import { EntityCatalogCard } from "../components/EntityCatalogCard";

/**
 * First-class Admin view rendering the exchange-capable entities catalog.
 * Powered by GenericCrudView with Table, CardGrid, and SplitPane modes.
 */
export function EntitiesCatalogView() {
  const vm = useEntitiesViewModel();
  const { t, language } = vm;
  const isAr = language === "ar";

  const columns = useMemo<CrudColumn<DataExchangeEntity>[]>(
    () => [
      {
        key: "entity",
        label: t("dataTransferEntities.columns.entity"),
        sortable: true,
        render: (_value: unknown, entity: DataExchangeEntity) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-nx-ink text-sm">
              {isAr ? entity.displayNameAr : entity.displayNameEn}
            </span>
            <span className="font-mono text-xs text-nx-ink-3">
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
            {String(value ?? "")}
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
              variant={isExhausted ? "destructive" : "info"}
              className="text-[10px] font-mono px-1.5 py-0.5"
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
    ],
    [t, isAr]
  );

  const kpiHeader = useMemo(
    () => (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card className="p-3.5">
          <div className="flex items-center gap-2 text-nx-ink-3 text-xs mb-1">
            <Layers className="h-3.5 w-3.5 text-nx-accent" />
            <span>{t("dataTransferEntities.kpi.totalEntities")}</span>
          </div>
          <span className="text-xl font-bold text-nx-ink font-mono">{vm.kpis.total}</span>
        </Card>
        <Card className="p-3.5">
          <div className="flex items-center gap-2 text-nx-ink-3 text-xs mb-1">
            <Upload className="h-3.5 w-3.5 text-nx-info" />
            <span>{t("dataTransferEntities.kpi.importable")}</span>
          </div>
          <span className="text-xl font-bold text-nx-ink font-mono">{vm.kpis.importable}</span>
        </Card>
        <Card className="p-3.5">
          <div className="flex items-center gap-2 text-nx-ink-3 text-xs mb-1">
            <Download className="h-3.5 w-3.5 text-nx-success" />
            <span>{t("dataTransferEntities.kpi.exportable")}</span>
          </div>
          <span className="text-xl font-bold text-nx-ink font-mono">{vm.kpis.exportable}</span>
        </Card>
        <Card className="p-3.5">
          <div className="flex items-center gap-2 text-nx-ink-3 text-xs mb-1">
            <ShieldCheck className="h-3.5 w-3.5 text-nx-warning" />
            <span>{t("dataTransferEntities.kpi.quotaConstrained")}</span>
          </div>
          <span className="text-xl font-bold text-nx-ink font-mono">{vm.kpis.quotaConstrained}</span>
        </Card>
      </div>
    ),
    [t, vm.kpis]
  );

  const config = useMemo<CrudConfig<DataExchangeEntity>>(
    () => ({
      titleKey: "dataTransferEntities.title",
      subtitleKey: "dataTransferEntities.subtitle",
      columns,
      viewModes: ["Table", "CardGrid", "SplitPane"],
      defaultView: "Table",
      stickyActions: true,
      hideAddButton: true,
      customHeaderContent: kpiHeader,
      getActions: (_v, tFn) => [
        {
          label: tFn("dataTransferEntities.actions.downloadTemplate") || "Download Smart Template",
          icon: <Download className="h-4 w-4 text-nx-success" />,
          disabled: (entity) => vm.downloadingTemplateEntity === entity.entityKey,
          onClick: (entity) => vm.downloadTemplate(entity),
        },
        {
          label: tFn("dataTransferEntities.actions.launchStudio") || "Launch Import Studio",
          icon: <Sparkles className="h-4 w-4 text-nx-accent" />,
          show: (entity) => Boolean(entity.canImport && entity.isImportFeatureEnabled),
          onClick: (entity) => vm.setActiveStudioEntity(entity.entityKey),
        },
        {
          label: tFn("dataTransferEntities.actions.quickExport") || "Export Data",
          icon: <FileSpreadsheet className="h-4 w-4 text-nx-info" />,
          show: (entity) => Boolean(entity.canExport && entity.isExportFeatureEnabled),
          onClick: (entity) => vm.setActiveExportEntity(entity.entityKey),
        },
      ],
      renderCardGridItem: (entity: DataExchangeEntity) => (
        <EntityCatalogCard
          entity={entity}
          onDownloadTemplate={vm.downloadTemplate}
          isDownloadingTemplate={vm.downloadingTemplateEntity === entity.entityKey}
          onLaunchStudio={vm.setActiveStudioEntity}
          onQuickExport={vm.setActiveExportEntity}
        />
      ),
    }),
    [columns, kpiHeader, vm]
  );

  const crudViewModel = useMemo(
    () => ({
      items: vm.entities,
      loading: vm.isLoading,
      error: vm.error ? (vm.error as Error).message : null,
      refreshItems: vm.refetch,
      refetch: vm.refetch,
    }),
    [vm.entities, vm.isLoading, vm.error, vm.refetch]
  );

  return (
    <>
      <GenericCrudView<DataExchangeEntity>
        config={config}
        viewModel={crudViewModel}
        search={{
          value: vm.search,
          onChange: vm.setSearch,
        }}
      />
      {vm.activeStudioEntity && (
        <DataExchangeStudioOverlay
          entityKey={vm.activeStudioEntity}
          open={Boolean(vm.activeStudioEntity)}
          onOpenChange={(open) => {
            if (!open) vm.setActiveStudioEntity(null);
          }}
          onImportComplete={() => vm.refetch()}
        />
      )}
      {vm.activeExportEntity && (
        <DataExchangeExportDialog
          entityKey={vm.activeExportEntity}
          open={Boolean(vm.activeExportEntity)}
          onOpenChange={(open) => {
            if (!open) vm.setActiveExportEntity(null);
          }}
        />
      )}
    </>
  );
}
