"use client";

import React from "react";
import { GenericCrudView, type CrudConfig } from "@core/crud/components/generic-crud-view";
import { EmptyState } from "@core/ui/empty-state";
import { Building2, Layers } from "lucide-react";
import {
  DataExchangeExportDialog,
  DataExchangeStudioOverlay,
  DataExchangeTenantRequiredCard,
} from "@core/data-exchange";
import { useEntitiesViewModel } from "../viewmodels/useEntitiesViewModel";
import type { DataExchangeEntity } from "../../domain/entities/DataExchangeEntity";
import { EntityCatalogCard } from "../components/EntityCatalogCard";
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
      onRetry={() => void vm.refetch()}
    />
  ) : (
    <EntitiesKpiHeader kpis={vm.kpis} />
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
          ? "dataTransferEntities.tenantRequired.title"
          : "dataTransferEntities.empty.title"
      )}
      description={t(
        vm.isTenantRequired
          ? "dataTransferEntities.tenantRequired.switchHint"
          : "dataTransferEntities.empty.description"
      )}
    />
  );

  return (
    <>
      <GenericCrudView<DataExchangeEntity>
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
