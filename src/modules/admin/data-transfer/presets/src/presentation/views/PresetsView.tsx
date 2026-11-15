"use client";

import React from "react";
import type { CrudConfig } from "@core/crud";
import { GenericCrudView } from "@core/crud";
import { EmptyState } from "@core/ui/empty-state";
import { Building2, Layers, Sparkles } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { DataExchangeTenantRequiredCard } from "@core/data-exchange";
import type { DataExchangePreset } from "../../domain/entities/DataExchangePreset";
import { usePresetsViewModel } from "../viewmodels/usePresetsViewModel";
import { PresetsKpiHeader } from "../components/PresetsKpiHeader";
import { MappingPresetCard } from "../components/MappingPresetCard";
import { PresetsFilterToolbar } from "../components/PresetsFilterToolbar";
import { PresetsWorkspaceDialogs } from "../components/PresetsWorkspaceDialogs";
import {
  createPresetsActions,
  createPresetsColumns,
} from "../components/PresetsColumns";
import {
  PresetsSplitDetail,
  PresetsSplitListItem,
} from "../components/PresetsSplitDetail";

/**
 * Primary admin view for inspecting and managing saved column mapping presets.
 */
export function PresetsView(): React.ReactElement {
  const { t, language } = useI18n();
  const isAr = language === "ar";
  const vm = usePresetsViewModel();

  const columns = createPresetsColumns({ t, isAr, resolveEntityName: vm.resolveEntityName });

  const headerContent = vm.isTenantRequired ? (
    <DataExchangeTenantRequiredCard
      title={t("adminDataTransferPresets.tenantRequired.title")}
      description={t("adminDataTransferPresets.tenantRequired.description")}
      switchHint={t("adminDataTransferPresets.tenantRequired.switchHint")}
      goToTenantsLabel={t("adminDataTransferPresets.tenantRequired.goToTenants")}
      retryLabel={t("adminDataTransferPresets.tenantRequired.retry")}
      onRetry={() => void vm.refetch()}
    />
  ) : (
    <div className="mb-4 space-y-3">
      <PresetsKpiHeader kpis={vm.kpis} />
      <PresetsFilterToolbar
        entityFilter={vm.entityFilter}
        options={vm.entityFilterOptions}
        onEntityFilterChange={vm.setEntityFilter}
      />
    </div>
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
            icon: <Sparkles className="h-4 w-4" />,
            disabled: !vm.isCatalogLoading && vm.importableEntities.length === 0,
            tooltip:
              !vm.isCatalogLoading && vm.importableEntities.length === 0
                ? t("adminDataTransferPresets.studioPicker.noImportableActionTooltip")
                : undefined,
            onClick: async () => {
              vm.openCreateStudioPicker();
            },
          },
        ],
    customHeaderContent: headerContent,
    getItemDisplayName: (preset: DataExchangePreset) => preset.name,
    getActions: (_v, tFn) =>
      createPresetsActions({
        tFn,
        isSettingDefault: vm.isSettingDefault,
        isDeleting: vm.isDeleting,
        onUseInStudio: (preset) => vm.setActiveStudioPreset(preset),
        onSetDefault: (preset) => vm.setDefaultPreset(preset),
        onDeletePreset: vm.promptDeletePreset,
      }),
    renderCardGridItem: (preset: DataExchangePreset) => (
      <MappingPresetCard
        preset={preset}
        entitySummary={vm.getCatalogEntry(preset.entityKey)}
        onDeletePreset={vm.promptDeletePreset}
        onUseInStudio={(p) => vm.setActiveStudioPreset(p)}
        onSetDefault={(p) => vm.setDefaultPreset(p)}
        isDeleting={vm.isDeleting}
        isSettingDefault={vm.isSettingDefault}
      />
    ),
    renderSplitListItem: (preset: DataExchangePreset) => (
      <PresetsSplitListItem
        preset={preset}
        entityDisplayName={vm.resolveEntityName(preset.entityKey)}
      />
    ),
    renderSplitDetail: (preset: DataExchangePreset, actions: React.ReactNode) => (
      <PresetsSplitDetail
        preset={preset}
        entityDisplayName={vm.resolveEntityName(preset.entityKey)}
        actions={actions}
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

  const emptyStateNode = (
    <EmptyState
      bare
      icon={vm.isTenantRequired ? Building2 : Layers}
      title={t(
        vm.isTenantRequired
          ? "adminDataTransferPresets.tenantRequired.title"
          : "adminDataTransferPresets.empty.title"
      )}
      description={t(
        vm.isTenantRequired
          ? "adminDataTransferPresets.tenantRequired.switchHint"
          : "adminDataTransferPresets.empty.description"
      )}
    />
  );

  return (
    <>
      <GenericCrudView<DataExchangePreset>
        config={config}
        viewModel={crudViewModel}
        emptyState={emptyStateNode}
        pagination={{
          ...vm.pagination,
          onPageChange: vm.setPage,
          onPageSizeChange: vm.setPageSize,
        }}
        search={{ value: vm.search, onChange: vm.setSearch }}
      />
      <PresetsWorkspaceDialogs
        presetToDelete={vm.presetToDelete}
        resolveEntityName={vm.resolveEntityName}
        isDeleteDialogOpen={vm.isDeleteDialogOpen}
        closeDeleteDialog={vm.closeDeleteDialog}
        confirmDeletePreset={vm.confirmDeletePreset}
        isDeleting={vm.isDeleting}
        isCreatePickerOpen={vm.isCreatePickerOpen}
        setIsCreatePickerOpen={vm.setIsCreatePickerOpen}
        importableEntities={vm.importableEntities}
        isCatalogLoading={vm.isCatalogLoading}
        entityFilter={vm.entityFilter}
        launchCreateStudio={vm.launchCreateStudio}
        activeStudioPreset={vm.activeStudioPreset}
        setActiveStudioPreset={vm.setActiveStudioPreset}
        createStudioEntityKey={vm.createStudioEntityKey}
        setCreateStudioEntityKey={vm.setCreateStudioEntityKey}
        onRefresh={vm.refetch}
      />
    </>
  );
}
