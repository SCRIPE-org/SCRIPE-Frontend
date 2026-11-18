"use client";

import React from "react";
import { GenericCrudView, type CrudConfig } from "@core/crud/components/generic-crud-view";
import {
  DataExchangeExportDialog,
  DataExchangeStudioOverlay,
  DataExchangeTenantRequiredCard,
} from "@core/data-exchange";
import { useEntitiesViewModel } from "../viewmodels/useEntitiesViewModel";
import type { DataExchangeEntity } from "../../domain/entities/DataExchangeEntity";
import {
  DataTransferEmptyState,
  DataTransferErrorBanner,
} from "../components/DataTransferStateFeedback";
import { EntityCatalogCard } from "../components/EntityCatalogCard";
import { EntitiesFilterToolbar } from "../components/EntitiesFilterToolbar";
import { EntitiesKpiHeader } from "../components/EntitiesKpiHeader";
import {
  createEntitiesActions,
  createEntitiesColumns,
} from "../components/EntitiesColumns";
import {
  EntitiesSplitDetail,
  EntitiesSplitListItem,
} from "../components/EntitiesSplitDetail";

/**
 * First-class Admin view rendering the exchange-capable entities catalog.
 * Powered by GenericCrudView with Table, CardGrid, and SplitPane modes.
 */
export function EntitiesCatalogView(): React.ReactElement {
  const vm = useEntitiesViewModel();
  const { t, language } = vm;
  const isAr = language === "ar";

  const columns = createEntitiesColumns({ t, isAr });
  const errorMessage =
    !vm.isTenantRequired && vm.isError
      ? (vm.error as Error)?.message || t("dataTransferEntities.error.description")
      : null;

  const handleRetry = () => {
    void vm.refetch();
  };

  const launchSingleStudio = (entityKey: string) => {
    vm.setActiveMultiSheetKeys(null);
    vm.setActiveStudioEntity(entityKey);
  };

  const launchMultiSheetStudio = (entity: DataExchangeEntity) => {
    vm.setActiveMultiSheetKeys(entity.relatedMultiSheetEntityKeys);
    vm.setActiveStudioEntity(entity.entityKey);
  };

  const headerContent = vm.isTenantRequired ? (
    <DataExchangeTenantRequiredCard
      title={t("dataTransferEntities.tenantRequired.title")}
      description={t("dataTransferEntities.tenantRequired.description")}
      switchHint={t("dataTransferEntities.tenantRequired.switchHint")}
      goToTenantsLabel={t("dataTransferEntities.tenantRequired.goToTenants")}
      retryLabel={t("dataTransferEntities.tenantRequired.retry")}
      onRetry={handleRetry}
    />
  ) : (
    <div className="mb-4 space-y-3">
      <EntitiesKpiHeader kpis={vm.kpis} />
      {errorMessage && (
        <DataTransferErrorBanner
          title={t("dataTransferEntities.error.title")}
          message={errorMessage}
          onRetry={handleRetry}
          testIdPrefix="entities"
        />
      )}
      <EntitiesFilterToolbar
        selectedModule={vm.selectedModule}
        availableModules={vm.availableModules}
        onModuleChange={vm.setSelectedModule}
        hasActiveFilters={vm.hasActiveFilters}
        onResetFilters={vm.resetFilters}
      />
    </div>
  );

  const config: CrudConfig<DataExchangeEntity> = {
    titleKey: "dataTransferEntities.title",
    subtitleKey: "dataTransferEntities.subtitle",
    columns,
    viewModes: ["Table", "CardGrid", "SplitPane"],
    defaultView: "Table",
    stickyActions: true,
    hideAddButton: true,
    customHeaderContent: headerContent,
    getItemDisplayName: (entity: DataExchangeEntity) =>
      isAr && entity.displayNameAr ? entity.displayNameAr : entity.displayNameEn,
    getActions: (_v, tFn) =>
      createEntitiesActions({
        tFn,
        downloadingTemplateEntity: vm.downloadingTemplateEntity,
        onDownloadTemplate: vm.downloadTemplate,
        onLaunchStudio: launchSingleStudio,
        onLaunchMultiSheet: launchMultiSheetStudio,
        onQuickExport: vm.setActiveExportEntity,
      }),
    renderCardGridItem: (entity: DataExchangeEntity) => (
      <EntityCatalogCard
        entity={entity}
        onDownloadTemplate={vm.downloadTemplate}
        isDownloadingTemplate={vm.downloadingTemplateEntity === entity.entityKey}
        onLaunchStudio={launchSingleStudio}
        onMultiSheetMigration={launchMultiSheetStudio}
        onQuickExport={vm.setActiveExportEntity}
      />
    ),
    renderSplitListItem: (entity: DataExchangeEntity) => (
      <EntitiesSplitListItem entity={entity} />
    ),
    renderSplitDetail: (entity: DataExchangeEntity, actions: React.ReactNode) => (
      <EntitiesSplitDetail entity={entity} actions={actions} />
    ),
  };

  const crudViewModel = {
    items: vm.entities,
    loading: vm.isLoading,
    error: null,
    refreshItems: vm.refetch,
    refetch: vm.refetch,
    pagination: vm.pagination,
    changePage: vm.setPage,
    changePageSize: vm.setPageSize,
  };

  return (
    <>
      <GenericCrudView<DataExchangeEntity>
        config={config}
        viewModel={crudViewModel}
        emptyState={
          <DataTransferEmptyState
            isTenantRequired={vm.isTenantRequired}
            errorMessage={errorMessage}
            hasActiveFilters={vm.hasActiveFilters}
            tenantTitle={t("dataTransferEntities.tenantRequired.title")}
            tenantDescription={t("dataTransferEntities.tenantRequired.switchHint")}
            errorTitle={t("dataTransferEntities.error.title")}
            filteredTitle={t("dataTransferEntities.empty.title")}
            filteredDescription={t("dataTransferEntities.empty.description")}
            unfilteredTitle={t("dataTransferEntities.empty.unfilteredTitle")}
            unfilteredDescription={t("dataTransferEntities.empty.unfilteredDescription")}
            onRetry={handleRetry}
            onResetFilters={vm.resetFilters}
            testIdPrefix="entities"
          />
        }
        pagination={{
          ...vm.pagination,
          onPageChange: vm.setPage,
          onPageSizeChange: vm.setPageSize,
        }}
        search={{
          value: vm.search,
          onChange: vm.setSearch,
          placeholder: t("dataTransferEntities.searchPlaceholder"),
        }}
      />
      {vm.activeStudioEntity && (
        <DataExchangeStudioOverlay
          entityKey={vm.activeStudioEntity}
          open={Boolean(vm.activeStudioEntity)}
          initialMultiSheet={Boolean(
            vm.activeMultiSheetKeys && vm.activeMultiSheetKeys.length > 1
          )}
          multiSheetEntityKeys={vm.activeMultiSheetKeys ?? undefined}
          onOpenChange={(open) => {
            if (!open) {
              vm.setActiveStudioEntity(null);
              vm.setActiveMultiSheetKeys(null);
            }
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
