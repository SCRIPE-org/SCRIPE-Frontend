"use client";

import React, { useMemo } from "react";
import type { CrudColumn, CrudConfig } from "@core/crud";
import { GenericCrudView } from "@core/crud";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Progress } from "@core/ui/progress";
import { Ban, Download, FileDown } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { DataTransferJob } from "../../domain/entities/DataTransferJob";
import { useJobsViewModel } from "../viewmodels/useJobsViewModel";
import { JobStatusBadge } from "../components/JobStatusBadge";
import { JobsKpiHeader } from "../components/JobsKpiHeader";
import { CancelJobDialog } from "../components/CancelJobDialog";

/**
 * Primary admin view for inspecting and controlling background data transfer executions.
 */
export function JobsExecutionView(): React.ReactElement {
  const { t } = useI18n();
  const vm = useJobsViewModel();

  const columns = useMemo<CrudColumn<DataTransferJob>[]>(
    () => [
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
              <span className="text-[11px] text-nx-ink-3 truncate max-w-[110px]">
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
        render: (_value: unknown, job: DataTransferJob) => (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="font-semibold text-xs text-nx-ink">{job.entityKey}</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium">
              {t(`adminDataTransferJobs.kinds.${job.kind}`, { defaultValue: job.kind })}
            </Badge>
          </div>
        ),
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
              <span>{date.toLocaleDateString()}</span>
              <span>
                {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        },
      },
      {
        key: "actions",
        label: t("adminDataTransferJobs.columns.actions"),
        render: (_value: unknown, job: DataTransferJob) => (
          <div className="flex flex-wrap items-center gap-1">
            {job.isActive && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => vm.promptCancelJob(job)}
                className="h-7 px-2 text-xs"
              >
                <Ban className="h-3 w-3 ltr:mr-1 rtl:ml-1" />
                {t("adminDataTransferJobs.actions.cancel")}
              </Button>
            )}
            {job.hasRejectedWorkbook && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => vm.downloadArtifact(job, "rejected")}
                disabled={vm.isDownloading}
                className="h-7 px-2 text-xs"
              >
                <Download className="h-3 w-3 ltr:mr-1 rtl:ml-1 text-nx-destructive" />
                {t("adminDataTransferJobs.actions.downloadRejected")}
              </Button>
            )}
            {job.hasExportWorkbook && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => vm.downloadArtifact(job, "export")}
                disabled={vm.isDownloading}
                className="h-7 px-2 text-xs"
              >
                <FileDown className="h-3 w-3 ltr:mr-1 rtl:ml-1 text-nx-success" />
                {t("adminDataTransferJobs.actions.downloadExport")}
              </Button>
            )}
          </div>
        ),
      },
    ],
    [t, vm]
  );

  const kpiHeader = useMemo(
    () => <JobsKpiHeader kpis={vm.kpis} />,
    [vm.kpis]
  );

  const config = useMemo<CrudConfig<DataTransferJob>>(
    () => ({
      titleKey: "adminDataTransferJobs.title",
      subtitleKey: "adminDataTransferJobs.subtitle",
      columns,
      viewModes: ["Table", "CardGrid", "SplitPane"],
      defaultView: "Table",
      stickyActions: true,
      hideAddButton: true,
      customHeaderContent: kpiHeader,
    }),
    [columns, kpiHeader]
  );

  const crudViewModel = useMemo(
    () => ({
      items: vm.jobs,
      loading: vm.isLoading,
      error: vm.isError ? t("adminDataTransferJobs.title") : null,
      refreshItems: vm.refetch,
      refetch: vm.refetch,
    }),
    [vm.jobs, vm.isLoading, vm.isError, vm.refetch, t]
  );

  return (
    <>
      <GenericCrudView<DataTransferJob>
        config={config}
        viewModel={crudViewModel}
        search={{
          value: vm.search,
          onChange: vm.setSearch,
        }}
      />

      <CancelJobDialog
        open={vm.isCancelDialogOpen}
        job={vm.jobToCancel}
        isCancelling={vm.isCancelling}
        onClose={vm.closeCancelDialog}
        onConfirm={vm.confirmCancelJob}
      />
    </>
  );
}
