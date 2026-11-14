"use client";

import React from "react";
import type { CrudColumn, CrudConfig, CrudAction } from "@core/crud";
import { GenericCrudView } from "@core/crud";
import { Badge } from "@core/ui/badge";
import { EmptyState } from "@core/ui/empty-state";
import { Progress } from "@core/ui/progress";
import {
  Activity,
  Building2,
  FileDown,
  FileWarning,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import {
  getEntityDisplayName,
  DataExchangeStudioOverlay,
  DataExchangeTenantRequiredCard,
} from "@core/data-exchange";
import type { DataTransferJob } from "../../domain/entities/DataTransferJob";
import { useJobsViewModel } from "../viewmodels/useJobsViewModel";
import { JobStatusBadge } from "../components/JobStatusBadge";
import { JobsKpiHeader } from "../components/JobsKpiHeader";
import { CancelJobDialog } from "../components/CancelJobDialog";
import { JobExecutionCard } from "../components/JobExecutionCard";

/**
 * Primary admin view for inspecting and controlling background data transfer executions.
 */
export function JobsExecutionView(): React.ReactElement {
  const { t, language } = useI18n();
  const isAr = language === "ar";
  const vm = useJobsViewModel();

  const columns: CrudColumn<DataTransferJob>[] = [
    {
      key: "jobId",
      label: t("adminDataTransferJobs.columns.jobId"),
      sortable: true,
      render: (_value: unknown, job: DataTransferJob) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-xs font-semibold text-nx-ink">
            {job.jobId.slice(0, 8)}...
          </span>
          {job.originalFileName && (
            <span className="text-[11px] text-nx-ink-3 truncate max-w-[110px]" title={job.originalFileName}>
              {job.originalFileName}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "entityKey",
      label: t("adminDataTransferJobs.columns.entityKey"),
      sortable: true,
      render: (_value: unknown, job: DataTransferJob) => {
        const displayName = getEntityDisplayName(job.entityKey, t, isAr);
        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="font-semibold text-xs text-nx-ink">{displayName}</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium uppercase">
                {t(`adminDataTransferJobs.kinds.${job.kind}`, { defaultValue: job.kind })}
              </Badge>
            </div>
            <span className="font-mono text-[11px] text-nx-ink-3">
              {job.entityKey}
            </span>
          </div>
        );
      },
    },
    {
      key: "status",
      label: t("adminDataTransferJobs.columns.status"),
      render: (_value: unknown, job: DataTransferJob) => (
        <JobStatusBadge
          status={job.status}
          label={t(`adminDataTransferJobs.statuses.${job.status}`, { defaultValue: job.status })}
        />
      ),
    },
    {
      key: "progress",
      label: t("adminDataTransferJobs.columns.progress"),
      render: (_value: unknown, job: DataTransferJob) => (
        <div className="flex flex-col gap-1 w-20">
          <div className="flex items-center justify-between text-xs font-mono text-nx-ink-2">
            <span>{Math.round(job.progressPercent)}%</span>
            <span className="text-[10px] text-nx-ink-3">
              {job.processedRows}/{job.totalRows}
            </span>
          </div>
          <Progress value={job.progressPercent} className="h-1.5" />
        </div>
      ),
    },
    {
      key: "metrics",
      label: t("adminDataTransferJobs.columns.metrics"),
      render: (_value: unknown, job: DataTransferJob) => (
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-nx-success">{job.committedRows.toLocaleString()}</span>
          <span className="text-nx-ink-3">/</span>
          <span className={job.rejectedRows > 0 ? "text-nx-destructive" : "text-nx-ink-3"}>
            {job.rejectedRows.toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: t("adminDataTransferJobs.columns.createdAt"),
      render: (value: unknown) => {
        if (!value) return null;
        const date = new Date(String(value));
        return (
          <div className="flex flex-col text-[11px] text-nx-ink-3 leading-tight whitespace-nowrap tabular-nums">
            <span>{date.toLocaleDateString(isAr ? "ar-EG" : "en-US")}</span>
            <span>
              {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        );
      },
    },
  ];

  const headerContent = vm.isTenantRequired ? (
    <DataExchangeTenantRequiredCard
      title={t("adminDataTransferJobs.tenantRequired.title")}
      description={t("adminDataTransferJobs.tenantRequired.description")}
      switchHint={t("adminDataTransferJobs.tenantRequired.switchHint")}
      goToTenantsLabel={t("adminDataTransferJobs.tenantRequired.goToTenants")}
      retryLabel={t("adminDataTransferJobs.tenantRequired.retry")}
      onRetry={() => {
        void vm.refetch();
      }}
    />
  ) : (
    <div className="mb-4">
      <JobsKpiHeader kpis={vm.kpis} />
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
            icon: <Sparkles className="h-4 w-4 text-nx-accent" />,
            onClick: async () => {
              vm.setIsStudioOpen(true);
            },
          },
        ],
    getActions: (_v, tFn): CrudAction<DataTransferJob>[] => [
      {
        label: tFn("adminDataTransferJobs.actions.downloadExport"),
        icon: <FileDown className="h-4 w-4 text-nx-success" />,
        show: (job: DataTransferJob) => Boolean(job.hasExportWorkbook),
        disabled: () => vm.isDownloading,
        onClick: (job: DataTransferJob) => vm.downloadArtifact(job, "export"),
      },
      {
        label: tFn("adminDataTransferJobs.actions.downloadRejected"),
        icon: <FileWarning className="h-4 w-4 text-nx-destructive" />,
        show: (job: DataTransferJob) => Boolean(job.hasRejectedWorkbook),
        disabled: () => vm.isDownloading,
        onClick: (job: DataTransferJob) => vm.downloadArtifact(job, "rejected"),
      },
      {
        label: tFn("adminDataTransferJobs.actions.cancel"),
        icon: <XCircle className="h-4 w-4 text-nx-destructive" />,
        variant: "destructive" as const,
        show: (job: DataTransferJob) => job.status === "Queued" || job.status === "Running",
        disabled: () => vm.isCancelling,
        onClick: (job: DataTransferJob) => vm.promptCancelJob(job),
      },
    ],
    renderCardGridItem: (job: DataTransferJob) => (
      <JobExecutionCard
        job={job}
        onCancelJob={vm.promptCancelJob}
        isCancelling={vm.isCancelling}
        onDownloadArtifact={vm.downloadArtifact}
        isDownloading={vm.isDownloading}
      />
    ),
  };

  const crudViewModel = {
    items: vm.jobs,
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
      title={t("adminDataTransferJobs.tenantRequired.title")}
      description={t("adminDataTransferJobs.tenantRequired.switchHint")}
    />
  ) : (
    <EmptyState
      bare
      icon={Activity}
      title={t("adminDataTransferJobs.empty.title")}
      description={t("adminDataTransferJobs.empty.description")}
    />
  );

  return (
    <>
      <GenericCrudView<DataTransferJob>
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
      <CancelJobDialog
        job={vm.jobToCancel}
        open={vm.isCancelDialogOpen}
        onClose={vm.closeCancelDialog}
        onConfirm={vm.confirmCancelJob}
        isCancelling={vm.isCancelling}
      />
      {vm.isStudioOpen && (
        <DataExchangeStudioOverlay
          entityKey="crm.lead"
          open={vm.isStudioOpen}
          onOpenChange={vm.setIsStudioOpen}
          onImportComplete={() => vm.refetch()}
        />
      )}
    </>
  );
}
