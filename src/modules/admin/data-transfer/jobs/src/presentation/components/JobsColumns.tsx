"use client";

import React from "react";
import { FileDown, FileWarning, XCircle } from "lucide-react";
import type { CrudAction, CrudColumn } from "@core/crud";
import { Badge } from "@core/ui/badge";
import { Progress } from "@core/ui/progress";
import type {
  DataTransferArtifactKind,
  DataTransferJob,
} from "../../domain/entities/DataTransferJob";
import { formatJobTimestamp, getJobProgressVariant } from "../utils/job-presentation";
import { JobIdCopyChip } from "./JobIdCopyChip";
import { JobStatusBadge } from "./JobStatusBadge";

export interface JobsColumnsOptions {
  t: (key: string, params?: Record<string, string | number>) => string;
  isAr: boolean;
  resolveEntityName: (entityKey: string) => string;
}

/**
 * Builds table column definitions for the Data Transfer Jobs execution table.
 */
export function createJobsColumns({
  t,
  isAr,
  resolveEntityName,
}: JobsColumnsOptions): CrudColumn<DataTransferJob>[] {
  return [
    {
      key: "jobId",
      label: t("adminDataTransferJobs.columns.jobId"),
      sortable: true,
      render: (_value: unknown, job: DataTransferJob) => (
        <div className="flex flex-col gap-0.5">
          <JobIdCopyChip
            jobId={job.jobId}
            testId={`job-table-id-tooltip-${job.jobId}`}
            className="px-1 text-xs font-semibold text-nx-ink"
          />
          {job.originalFileName && (
            <span
              dir="ltr"
              className="text-[11px] text-nx-ink-3 truncate max-w-[140px]"
              title={job.originalFileName}
            >
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
        const displayName = resolveEntityName(job.entityKey);
        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="font-semibold text-xs text-nx-ink">{displayName}</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium uppercase">
                {t(`adminDataTransferJobs.kinds.${job.kind}`, { defaultValue: job.kind })}
              </Badge>
            </div>
            <span dir="ltr" className="font-mono text-[11px] text-nx-ink-3 w-fit">
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
      render: (_value: unknown, job: DataTransferJob) => {
        const clampedPercent = Math.min(100, Math.max(0, job.progressPercent));
        return (
          <div className="flex flex-col gap-1 w-24">
            <div
              dir="ltr"
              className="flex items-center justify-between text-xs font-mono tabular-nums text-nx-ink-2"
            >
              <span>{Math.round(clampedPercent)}%</span>
              <span className="text-[10px] text-nx-ink-3">
                {job.processedRows.toLocaleString()}/{job.totalRows.toLocaleString()}
              </span>
            </div>
            <Progress
              value={clampedPercent}
              variant={getJobProgressVariant(job.status)}
              className="h-1.5"
            />
          </div>
        );
      },
    },
    {
      key: "metrics",
      label: t("adminDataTransferJobs.columns.metrics"),
      render: (_value: unknown, job: DataTransferJob) => (
        <div
          dir="ltr"
          className="flex items-center gap-1.5 text-xs font-mono tabular-nums w-fit"
        >
          <span className="text-nx-success">{job.committedRows.toLocaleString()}</span>
          <span className="text-nx-ink-3">/</span>
          <span className={job.rejectedRows > 0 ? "text-nx-danger font-bold" : "text-nx-ink-3"}>
            {job.rejectedRows.toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: t("adminDataTransferJobs.columns.createdAt"),
      render: (value: unknown) => {
        const formatted = formatJobTimestamp(value ? String(value) : null, isAr);
        if (!formatted) return null;
        return (
          <span className="text-[11px] text-nx-ink-3 whitespace-nowrap font-mono tabular-nums">
            {formatted}
          </span>
        );
      },
    },
  ];
}

export interface JobsActionsOptions {
  tFn: (key: string) => string;
  isDownloading: boolean;
  isCancelling: boolean;
  onDownloadArtifact: (job: DataTransferJob, kind: DataTransferArtifactKind) => void;
  onCancelJob: (job: DataTransferJob) => void;
}

/**
 * Builds row-level and split-detail actions for a DataTransferJob.
 */
export function createJobsActions({
  tFn,
  isDownloading,
  isCancelling,
  onDownloadArtifact,
  onCancelJob,
}: JobsActionsOptions): CrudAction<DataTransferJob>[] {
  return [
    {
      label: tFn("adminDataTransferJobs.actions.downloadExport"),
      icon: <FileDown className="h-4 w-4 text-nx-success" />,
      show: (job: DataTransferJob) => Boolean(job.hasExportWorkbook),
      disabled: () => isDownloading,
      onClick: (job: DataTransferJob) => onDownloadArtifact(job, "export"),
    },
    {
      label: tFn("adminDataTransferJobs.actions.downloadRejected"),
      icon: <FileWarning className="h-4 w-4 text-nx-danger" />,
      show: (job: DataTransferJob) => Boolean(job.hasRejectedWorkbook),
      disabled: () => isDownloading,
      onClick: (job: DataTransferJob) => onDownloadArtifact(job, "rejected"),
    },
    {
      label: tFn("adminDataTransferJobs.actions.cancel"),
      icon: <XCircle className="h-4 w-4 text-nx-danger" />,
      variant: "destructive" as const,
      show: (job: DataTransferJob) => job.status === "Queued" || job.status === "Running",
      disabled: () => isCancelling,
      onClick: (job: DataTransferJob) => onCancelJob(job),
    },
  ];
}
