"use client";

import React from "react";
import type { CrudConfig } from "@core/crud";
import { GenericCrudView } from "@core/crud";
import { TooltipProvider } from "@core/ui/tooltip";
import { Sparkles } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import {
  DataExchangeStudioOverlay,
  DataExchangeTenantRequiredCard,
} from "@core/data-exchange";
import type { DataTransferJob } from "../../domain/entities/DataTransferJob";
import { useJobsViewModel } from "../viewmodels/useJobsViewModel";
import { JobsKpiHeader } from "../components/JobsKpiHeader";
import { CancelJobDialog } from "../components/CancelJobDialog";
import { JobExecutionCard } from "../components/JobExecutionCard";
import { StudioEntityPickerDialog } from "../components/StudioEntityPickerDialog";
import { JobsFilterToolbar } from "../components/JobsFilterToolbar";
import { createJobsActions, createJobsColumns } from "../components/JobsColumns";
import { JobsSplitDetail, JobsSplitListItem } from "../components/JobsSplitDetail";
import { JobsEmptyState, JobsErrorBanner } from "../components/JobsStateFeedback";

/**
 * Primary admin view for inspecting and controlling background data transfer executions.
 */
export function JobsExecutionView(): React.ReactElement {
  const { t, language } = useI18n();
  const isAr = language === "ar";
  const vm = useJobsViewModel();

  const columns = createJobsColumns({ t, isAr, resolveEntityName: vm.resolveEntityName });
  const errorMessage =
    !vm.isTenantRequired && vm.isError
      ? (vm.error as Error)?.message || t("adminDataTransferJobs.error.description")
      : null;

  const handleRetry = () => {
    void vm.refetch();
  };

  const headerContent = vm.isTenantRequired ? (
    <DataExchangeTenantRequiredCard
      title={t("adminDataTransferJobs.tenantRequired.title")}
      description={t("adminDataTransferJobs.tenantRequired.description")}
      switchHint={t("adminDataTransferJobs.tenantRequired.switchHint")}
      goToTenantsLabel={t("adminDataTransferJobs.tenantRequired.goToTenants")}
      retryLabel={t("adminDataTransferJobs.tenantRequired.retry")}
      onRetry={handleRetry}
    />
  ) : (
    <div className="mb-4 space-y-3">
      <JobsKpiHeader kpis={vm.kpis} />
      {errorMessage && <JobsErrorBanner message={errorMessage} onRetry={handleRetry} />}
      <JobsFilterToolbar
        statusFilter={vm.statusFilter}
        kindFilter={vm.kindFilter}
        onStatusFilterChange={vm.setStatusFilter}
        onKindFilterChange={vm.setKindFilter}
        hasActiveFilters={vm.hasActiveFilters}
        onResetFilters={vm.resetFilters}
      />
    </div>
  );

  const config: CrudConfig<DataTransferJob> = {
    titleKey: "adminDataTransferJobs.title",
    subtitleKey: "adminDataTransferJobs.subtitle",
    columns,
    viewModes: ["Table", "CardGrid", "SplitPane"],
    defaultView: "Table",
    stickyActions: true,
    hideAddButton: true,
    customHeaderContent: headerContent,
    customActions: vm.isTenantRequired
      ? []
      : [
          {
            label: t("adminDataTransferJobs.actions.launchStudio"),
            icon: <Sparkles className="h-4 w-4" />,
            disabled: !vm.isCatalogLoading && vm.importableEntities.length === 0,
            tooltip:
              !vm.isCatalogLoading && vm.importableEntities.length === 0
                ? t("adminDataTransferJobs.studioPicker.noImportableActionTooltip")
                : undefined,
            onClick: async () => {
              vm.openStudioPicker();
            },
          },
        ],
    getItemDisplayName: (job: DataTransferJob) => vm.resolveEntityName(job.entityKey),
    getActions: (_v, tFn) =>
      createJobsActions({
        tFn,
        isDownloading: vm.isDownloading,
        isCancelling: vm.isCancelling,
        onDownloadArtifact: vm.downloadArtifact,
        onCancelJob: vm.promptCancelJob,
      }),
    renderCardGridItem: (job: DataTransferJob) => (
      <JobExecutionCard
        job={job}
        entitySummary={vm.getCatalogEntry(job.entityKey)}
        onCancelJob={vm.promptCancelJob}
        isCancelling={vm.isCancelling}
        onDownloadArtifact={vm.downloadArtifact}
        isDownloading={vm.isDownloading}
      />
    ),
    renderSplitListItem: (job: DataTransferJob) => (
      <JobsSplitListItem job={job} entityDisplayName={vm.resolveEntityName(job.entityKey)} />
    ),
    renderSplitDetail: (job: DataTransferJob, actions: React.ReactNode) => (
      <JobsSplitDetail
        job={job}
        entityDisplayName={vm.resolveEntityName(job.entityKey)}
        actions={actions}
      />
    ),
  };

  const crudViewModel = {
    items: vm.jobs,
    loading: vm.isLoading,
    error: null,
    refreshItems: vm.refetch,
    refetch: vm.refetch,
    pagination: vm.pagination,
    changePage: vm.setPage,
    changePageSize: vm.setPageSize,
  };

  return (
    <TooltipProvider delayDuration={200}>
      <GenericCrudView<DataTransferJob>
        config={config}
        viewModel={crudViewModel}
        emptyState={
          <JobsEmptyState
            isTenantRequired={vm.isTenantRequired}
            errorMessage={errorMessage}
            hasActiveFilters={vm.hasActiveFilters}
            onRetry={handleRetry}
            onResetFilters={vm.resetFilters}
          />
        }
        pagination={{
          ...vm.pagination,
          pageSizeOptions: [10, 20, 25, 50, 100],
          onPageChange: vm.setPage,
          onPageSizeChange: vm.setPageSize,
        }}
        search={{
          value: vm.search,
          onChange: vm.setSearch,
          placeholder: t("adminDataTransferJobs.searchPlaceholder"),
        }}
      />
      <CancelJobDialog
        job={vm.jobToCancel}
        open={vm.isCancelDialogOpen}
        onClose={vm.closeCancelDialog}
        onConfirm={vm.confirmCancelJob}
        isCancelling={vm.isCancelling}
      />
      <StudioEntityPickerDialog
        open={vm.isStudioPickerOpen}
        onOpenChange={vm.setIsStudioPickerOpen}
        entities={vm.importableEntities}
        isLoading={vm.isCatalogLoading}
        onConfirm={vm.launchStudioForEntity}
      />
      {vm.activeStudioEntityKey && (
        <DataExchangeStudioOverlay
          entityKey={vm.activeStudioEntityKey}
          open={Boolean(vm.activeStudioEntityKey)}
          onOpenChange={(open) => {
            if (!open) vm.setActiveStudioEntityKey(null);
          }}
          onImportComplete={() => vm.refetch()}
        />
      )}
    </TooltipProvider>
  );
}
