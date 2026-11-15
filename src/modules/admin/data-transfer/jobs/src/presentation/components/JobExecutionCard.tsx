"use client";

import React, { memo } from "react";
import {
  Clock,
  Download,
  FileDown,
  FileWarning,
  MoreHorizontal,
  XCircle,
} from "lucide-react";
import { Card } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Progress } from "@core/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@core/ui/tooltip";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { getEntityDisplayName, type EntityNameSource } from "@core/data-exchange/presentation/utils/entity-display-names";
import type { DataTransferJob } from "../../domain/entities/DataTransferJob";
import { getJobProgressVariant } from "../utils/job-presentation";
import { JobStatusBadge } from "./JobStatusBadge";

/**
 * Props for the JobExecutionCard component.
 */
export interface JobExecutionCardProps {
  /** The data transfer background job */
  job: DataTransferJob;
  /** Optional live catalog entry for resolving dynamic localized entity display names */
  entitySummary?: EntityNameSource;
  /** Callback to initiate cooperative cancellation */
  onCancelJob: (job: DataTransferJob) => void;
  /** Whether job cancellation is currently pending */
  isCancelling?: boolean;
  /** Callback to download job artifacts */
  onDownloadArtifact: (job: DataTransferJob, kind: "export" | "rejected") => void;
  /** Whether artifact download is in flight */
  isDownloading?: boolean;
  /** Optional custom class name */
  className?: string;
}

/**
 * Bespoke Nexus CardGrid card for Data Transfer Jobs & Executions.
 * Zero resting shadows, hairline borders, structured metrics strip, and canonical ⋯ dropdown.
 */
export const JobExecutionCard = memo(function JobExecutionCard({
  job,
  entitySummary,
  onCancelJob,
  isCancelling = false,
  onDownloadArtifact,
  isDownloading = false,
  className,
}: JobExecutionCardProps) {
  const { language, t } = useI18n();
  const isAr = language === "ar";
  const isCancellable = job.status === "Queued" || job.status === "Running";
  const localizedEntityName = getEntityDisplayName(job.entityKey, t, isAr, entitySummary);

  return (
    <Card
      className={cn(
        "group relative flex flex-col justify-between gap-4 rounded-nx-lg border border-nx-line bg-nx-surface p-5 hover:border-nx-line-hi transition-colors",
        className
      )}
    >
      {/* Header: Localized Title + Status Badge + Monospace Job ID + ⋯ Dropdown */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <JobStatusBadge
              status={job.status}
              label={t(`adminDataTransferJobs.statuses.${job.status}`, { defaultValue: job.status })}
            />
            <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5 uppercase">
              {t(`adminDataTransferJobs.kinds.${job.kind}`, { defaultValue: job.kind })}
            </Badge>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-nx-ink truncate" title={localizedEntityName}>
              {localizedEntityName}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      dir="ltr"
                      aria-label={job.jobId}
                      data-testid="job-card-id-tooltip-trigger"
                      className="h-auto max-w-full cursor-help rounded-sm border border-nx-line bg-nx-raised/60 px-1.5 py-0.5 font-mono text-[11px] font-medium text-nx-ink-2"
                    >
                      <code className="truncate">{job.jobId.slice(0, 8)}...</code>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent dir="ltr" className="font-mono text-xs">
                    {job.jobId}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-nx-ink-3 text-xs">/</span>
              <code dir="ltr" className="text-[11px] font-mono text-nx-ink-3 truncate">
                {job.entityKey}
              </code>
            </div>
          </div>
          {job.originalFileName && (
            <p
              dir="ltr"
              className="text-[11px] font-mono text-nx-ink-3 truncate"
              title={job.originalFileName}
            >
              {job.originalFileName}
            </p>
          )}
        </div>

        {/* Canonical ⋯ Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-nx-ink-2 hover:text-nx-ink hover:bg-nx-raised"
              aria-label={t("adminDataTransferJobs.columns.actions")}
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isAr ? "start" : "end"} className="w-52">
            {job.hasExportWorkbook && (
              <DropdownMenuItem
                onClick={() => onDownloadArtifact(job, "export")}
                disabled={isDownloading}
                className="cursor-pointer gap-2"
              >
                <FileDown className="h-4 w-4 text-nx-success" aria-hidden="true" />
                <span>{t("adminDataTransferJobs.actions.downloadExport")}</span>
              </DropdownMenuItem>
            )}

            {job.hasRejectedWorkbook && (
              <DropdownMenuItem
                onClick={() => onDownloadArtifact(job, "rejected")}
                disabled={isDownloading}
                className="cursor-pointer gap-2"
              >
                <FileWarning className="h-4 w-4 text-nx-danger" aria-hidden="true" />
                <span>{t("adminDataTransferJobs.actions.downloadRejected")}</span>
              </DropdownMenuItem>
            )}

            {isCancellable && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onCancelJob(job)}
                  disabled={isCancelling}
                  className="cursor-pointer gap-2 text-nx-danger focus:text-nx-danger"
                >
                  <XCircle className="h-4 w-4 text-nx-danger" aria-hidden="true" />
                  <span>{t("adminDataTransferJobs.actions.cancel")}</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Structured Telemetry Strip: Progress & Row Metrics */}
      <div className="space-y-2.5 rounded-nx-control bg-nx-raised/40 p-3 border border-nx-line/60 text-xs">
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-nx-ink-2">
            <span>{t("adminDataTransferJobs.columns.progress")}</span>
            <span className="font-semibold text-nx-ink">
              {Math.round(job.progressPercent)}%
            </span>
          </div>
          <Progress
            value={Math.min(100, Math.max(0, job.progressPercent))}
            variant={getJobProgressVariant(job.status)}
            className="h-1.5"
          />
        </div>

        {/* Row Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-nx-line/40 text-[11px]">
          <div>
            <span className="text-nx-ink-3">{t("adminDataTransferJobs.columns.rowsSummary")}:</span>
            <p dir="ltr" className="font-mono font-medium text-nx-ink w-fit tabular-nums">
              {job.processedRows.toLocaleString()} / {job.totalRows ? job.totalRows.toLocaleString() : "—"}
            </p>
          </div>
          <div>
            <span className="text-nx-ink-3">{t("adminDataTransferJobs.columns.metrics")}:</span>
            <p dir="ltr" className="font-mono font-medium text-nx-ink w-fit tabular-nums">
              <span className="text-nx-success">{job.committedRows.toLocaleString()}</span>
              {" / "}
              <span className={job.rejectedRows > 0 ? "text-nx-danger font-bold" : "text-nx-ink-3"}>
                {job.rejectedRows.toLocaleString()}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer: Submission Date & Quick Action */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-nx-line text-xs">
        <div className="flex items-center gap-1.5 text-[11px] text-nx-ink-3 font-mono tabular-nums">
          <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span>
            {new Date(job.createdAt).toLocaleString(isAr ? "ar-EG" : "en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {isCancellable ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCancelJob(job)}
            disabled={isCancelling}
            className="h-7 px-2 text-xs text-nx-danger hover:bg-nx-danger/10"
          >
            <XCircle className="h-3 w-3 me-1" aria-hidden="true" />
            {t("adminDataTransferJobs.actions.cancel")}
          </Button>
        ) : job.hasExportWorkbook ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDownloadArtifact(job, "export")}
            disabled={isDownloading}
            className="h-7 px-2 text-xs text-nx-success hover:bg-nx-success/10"
          >
            <Download className="h-3 w-3 me-1" aria-hidden="true" />
            {t("adminDataTransferJobs.actions.downloadExport")}
          </Button>
        ) : null}
      </div>
    </Card>
  );
});
