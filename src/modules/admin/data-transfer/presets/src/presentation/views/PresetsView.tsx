"use client";

import React from "react";
import type { CrudColumn, CrudConfig, CrudAction } from "@core/crud";
import { GenericCrudView } from "@core/crud";
import { Badge } from "@core/ui/badge";
import { EmptyState } from "@core/ui/empty-state";
import { Building2, CheckCircle2, Layers, Sparkles, Trash2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import {
  getEntityDisplayName,
  DataExchangeStudioOverlay,
  DataExchangeTenantRequiredCard,
} from "@core/data-exchange";
import type { DataExchangePreset } from "../../domain/entities/DataExchangePreset";
import { usePresetsViewModel } from "../viewmodels/usePresetsViewModel";
import { PresetsKpiHeader } from "../components/PresetsKpiHeader";
import { DeletePresetDialog } from "../components/DeletePresetDialog";
import { MappingPresetCard } from "../components/MappingPresetCard";

/**
 * Primary admin view for inspecting and managing saved column mapping presets.
 */
export function PresetsView(): React.ReactElement {
  const { t, language } = useI18n();
  const isAr = language === "ar";
  const vm = usePresetsViewModel();

  const columns: CrudColumn<DataExchangePreset>[] = [
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
        const displayName = getEntityDisplayName(preset.entityKey, t, isAr);
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-xs text-nx-ink">{displayName}</span>
            <span className="font-mono text-[11px] text-nx-ink-3">{preset.entityKey}</span>
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
        <Badge variant="secondary" className="font-mono text-xs">
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
        return (
          <span className="text-xs text-nx-ink-3 whitespace-nowrap">
            {date.toLocaleDateString(isAr ? "ar-EG" : "en-US")}{" "}
            {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        );
      },
    },
  ];

  const headerContent = vm.isTenantRequired ? (
    <DataExchangeTenantRequiredCard
      title={t("adminDataTransferPresets.tenantRequired.title")}
      description={t("adminDataTransferPresets.tenantRequired.description")}
      switchHint={t("adminDataTransferPresets.tenantRequired.switchHint")}
      goToTenantsLabel={t("adminDataTransferPresets.tenantRequired.goToTenants")}
      retryLabel={t("adminDataTransferPresets.tenantRequired.retry")}
      onRetry={() => {
        void vm.refetch();
      }}
    />
  ) : (
    <PresetsKpiHeader kpis={vm.kpis} />
  );

  const config: CrudConfig<DataExchangePreset> = {
    titleKey: "adminDataTransferPresets.title",
    subtitleKey: "adminDataTransferPresets.subtitle",
    columns,
    viewModes: ["Table", "CardGrid", "SplitPane"],
    defaultView: "Table",
    stickyActions: true,
    hideAddButton: true,
    customActions: vm.isTenantRequired
      ? []
      : [
          {
            label: t("adminDataTransferPresets.actions.createInStudio"),
            icon: <Sparkles className="h-4 w-4 text-nx-accent" />,
            onClick: async () => {
              vm.setIsCreateStudioOpen(true);
            },
          },
        ],
    customHeaderContent: headerContent,
    getActions: (_v, tFn): CrudAction<DataExchangePreset>[] => [
      {
        label: tFn("adminDataTransferPresets.actions.useInStudio"),
        icon: <Sparkles className="h-4 w-4 text-nx-accent" />,
        onClick: (preset: DataExchangePreset) => vm.setActiveStudioPreset(preset),
      },
      {
        label: tFn("adminDataTransferPresets.actions.setDefault"),
        icon: <CheckCircle2 className="h-4 w-4 text-nx-ink-2" />,
        disabled: (preset: DataExchangePreset) => preset.isDefault || vm.isSettingDefault,
        show: (preset: DataExchangePreset) => !preset.isDefault,
        onClick: (preset: DataExchangePreset) => vm.setDefaultPreset(preset),
      },
      {
        label: tFn("adminDataTransferPresets.actions.delete"),
        icon: <Trash2 className="h-4 w-4 text-nx-destructive" />,
        variant: "destructive" as const,
        disabled: () => vm.isDeleting,
        onClick: (preset: DataExchangePreset) => vm.promptDeletePreset(preset),
      },
    ],
    renderCardGridItem: (preset: DataExchangePreset) => (
      <MappingPresetCard
        preset={preset}
        onDeletePreset={vm.promptDeletePreset}
        onUseInStudio={(p) => vm.setActiveStudioPreset(p)}
        onSetDefault={(p) => vm.setDefaultPreset(p)}
        isDeleting={vm.isDeleting}
        isSettingDefault={vm.isSettingDefault}
      />
    ),
  };

  const crudViewModel = {
    items: vm.presets,
    loading: vm.isLoading,
    error: vm.isTenantRequired
      ? null
      : vm.error
        ? (vm.error as Error)?.message || String(vm.error)
        : null,
    refreshItems: vm.refetch,
    refetch: vm.refetch,
    pagination: vm.pagination,
    changePage: vm.setPage,
    changePageSize: vm.setPageSize,
  };

  const emptyStateNode = vm.isTenantRequired ? (
    <EmptyState
      bare
      icon={Building2}
      title={t("adminDataTransferPresets.tenantRequired.title")}
      description={t("adminDataTransferPresets.tenantRequired.switchHint")}
    />
  ) : (
    <EmptyState
      bare
      icon={Layers}
      title={t("adminDataTransferPresets.empty.title")}
      description={t("adminDataTransferPresets.empty.description")}
    />
  );

  return (
    <>
      <GenericCrudView<DataExchangePreset>
        config={config}
        viewModel={crudViewModel}
        emptyState={emptyStateNode}
        pagination={{
          page: vm.page,
          pageSize: vm.pageSize,
          itemsCount: vm.totalCount,
          pagesCount: vm.pagesCount,
          onPageChange: vm.setPage,
          onPageSizeChange: vm.setPageSize,
        }}
        search={{
          value: vm.search,
          onChange: vm.setSearch,
        }}
      />
      <DeletePresetDialog
        preset={vm.presetToDelete}
        open={vm.isDeleteDialogOpen}
        onClose={vm.closeDeleteDialog}
        onConfirm={vm.confirmDeletePreset}
        isDeleting={vm.isDeleting}
      />
      {vm.activeStudioPreset && (
        <DataExchangeStudioOverlay
          entityKey={vm.activeStudioPreset.entityKey}
          initialPresetId={vm.activeStudioPreset.id}
          open={Boolean(vm.activeStudioPreset)}
          onOpenChange={(open) => {
            if (!open) vm.setActiveStudioPreset(null);
          }}
          onImportComplete={() => vm.refetch()}
        />
      )}
      {vm.isCreateStudioOpen && (
        <DataExchangeStudioOverlay
          entityKey="crm.lead"
          open={vm.isCreateStudioOpen}
          onOpenChange={vm.setIsCreateStudioOpen}
          onImportComplete={() => vm.refetch()}
        />
      )}
    </>
  );
}
