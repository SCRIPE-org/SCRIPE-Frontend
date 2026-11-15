"use client";

import React from "react";
import { AlertTriangle, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Progress } from "@core/ui/progress";
import { useI18n } from "@core/providers/i18n-provider";
import type { DataTransferJob } from "../../domain/entities/DataTransferJob";
import { formatJobTimestamp, getJobProgressVariant } from "../utils/job-presentation";
import { JobStatusBadge } from "./JobStatusBadge";

export interface JobsSplitListItemProps {
  job: DataTransferJob;
  entityDisplayName: string;
}

/**
 * Compact SplitPane left-column item rendering entity name, status, and tabular progress.
 */
export function JobsSplitListItem({
  job,
  entityDisplayName,
}: JobsSplitListItemProps): React.ReactElement {
  const { t } = useI18n();
  const clampedPercent = Math.min(100, Math.max(0, job.progressPercent));

  return (
    <div className="space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-nx-ink">{entityDisplayName}</p>
          <p dir="ltr" className="truncate font-mono text-[11px] text-nx-ink-3 w-fit">
            {job.jobId.slice(0, 8)}...
          </p>
        </div>
        <JobStatusBadge
          status={job.status}
          label={t(`adminDataTransferJobs.statuses.${job.status}`, { defaultValue: job.status })}
        />
      </div>
      <div className="flex items-center justify-between gap-2 text-[11px] text-nx-ink-3">
        <span>{t(`adminDataTransferJobs.kinds.${job.kind}`, { defaultValue: job.kind })}</span>
        <span dir="ltr" className="font-mono tabular-nums text-nx-ink-2">
          {Math.round(clampedPercent)}% · {job.processedRows.toLocaleString()}/
          {job.totalRows.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export interface JobsSplitDetailProps {
  job: DataTransferJob;
  entityDisplayName: string;
  actions: React.ReactNode;
}

/**
 * SplitPane right-hand telemetry inspector for a selected DataTransferJob.
 */
export function JobsSplitDetail({
  job,
  entityDisplayName,
  actions,
}: JobsSplitDetailProps): React.ReactElement {
  const { t, language } = useI18n();
  const isAr = language === "ar";
  const clampedPercent = Math.min(100, Math.max(0, job.progressPercent));

  return (
    <div className="space-y-4" data-testid="jobs-split-detail">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-nx-line pb-3">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <JobStatusBadge
              status={job.status}
              label={t(`adminDataTransferJobs.statuses.${job.status}`, {
                defaultValue: job.status,
              })}
            />
            <Badge variant="outline" className="text-[10px] font-mono uppercase">
              {t(`adminDataTransferJobs.kinds.${job.kind}`, { defaultValue: job.kind })}
            </Badge>
          </div>
          <h3 className="text-base font-semibold text-nx-ink">{entityDisplayName}</h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-nx-ink-3">
            <code
              dir="ltr"
              className="rounded-sm border border-nx-line bg-nx-raised px-1.5 py-0.5 font-mono text-[11px] text-nx-ink-2 break-all"
            >
              {job.jobId}
            </code>
            <span dir="ltr" className="font-mono text-[11px]">
              {job.entityKey}
            </span>
          </div>
        </div>
        <div className="shrink-0">{actions}</div>
      </div>

      {job.errorSummary && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>{t("adminDataTransferJobs.detail.errorSummary")}</AlertTitle>
          <AlertDescription className="text-xs break-words">{job.errorSummary}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2 rounded-nx-control border border-nx-line bg-nx-raised/40 p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-nx-ink-2">
            {t("adminDataTransferJobs.columns.progress")}
          </span>
          <span dir="ltr" className="font-mono font-semibold text-nx-ink tabular-nums">
            {Math.round(clampedPercent)}% ({job.processedRows.toLocaleString()} /{" "}
            {job.totalRows ? job.totalRows.toLocaleString() : "—"})
          </span>
        </div>
        <Progress
          value={clampedPercent}
          variant={getJobProgressVariant(job.status)}
          className="h-2"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-nx-control border border-nx-line bg-nx-raised/40 p-3 text-xs">
          <p className="text-nx-ink-3">{t("adminDataTransferJobs.columns.metrics")}</p>
          <p dir="ltr" className="mt-1 font-mono text-sm font-semibold tabular-nums w-fit">
            <span className="text-nx-success">{job.committedRows.toLocaleString()}</span>
            <span className="text-nx-ink-3"> / </span>
            <span className={job.rejectedRows > 0 ? "text-nx-danger" : "text-nx-ink-3"}>
              {job.rejectedRows.toLocaleString()}
            </span>
          </p>
        </div>

        <div className="rounded-nx-control border border-nx-line bg-nx-raised/40 p-3 text-xs">
          <p className="text-nx-ink-3">{t("adminDataTransferJobs.detail.createdUpdatedRows")}</p>
          <p dir="ltr" className="mt-1 font-mono text-sm font-semibold text-nx-ink tabular-nums w-fit">
            {job.createdRows.toLocaleString()} / {job.updatedRows.toLocaleString()}
          </p>
        </div>

        <div className="rounded-nx-control border border-nx-line bg-nx-raised/40 p-3 text-xs">
          <p className="text-nx-ink-3">{t("adminDataTransferJobs.detail.validRows")}</p>
          <p dir="ltr" className="mt-1 font-mono text-sm font-semibold text-nx-ink tabular-nums w-fit">
            {job.validRows.toLocaleString()}
          </p>
        </div>

        <div className="rounded-nx-control border border-nx-line bg-nx-raised/40 p-3 text-xs">
          <p className="text-nx-ink-3">{t("adminDataTransferJobs.detail.fileName")}</p>
          <p dir="ltr" className="mt-1 font-mono text-xs font-medium text-nx-ink truncate">
            {job.originalFileName || t("common.none")}
          </p>
        </div>

        <div className="rounded-nx-control border border-nx-line bg-nx-raised/40 p-3 text-xs">
          <p className="text-nx-ink-3">{t("adminDataTransferJobs.detail.importMode")}</p>
          <p className="mt-1 font-mono text-xs font-medium text-nx-ink">
            {job.importMode} · {job.fileFormat.toUpperCase()}
          </p>
        </div>

        <div className="rounded-nx-control border border-nx-line bg-nx-raised/40 p-3 text-xs">
          <p className="text-nx-ink-3">{t("adminDataTransferJobs.detail.onboardingMode")}</p>
          <p className="mt-1 font-mono text-xs font-medium text-nx-ink">{job.onboardingMode}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-nx-line pt-3 text-xs sm:grid-cols-4">
        {[
          { label: t("adminDataTransferJobs.columns.createdAt"), val: job.createdAt },
          { label: t("adminDataTransferJobs.detail.startedAt"), val: job.startedAtUtc },
          { label: t("adminDataTransferJobs.detail.completedAt"), val: job.completedAtUtc },
          { label: t("adminDataTransferJobs.detail.expiresAt"), val: job.expiresAtUtc },
        ].map((item) => (
          <div key={item.label} className="space-y-1">
            <span className="flex items-center gap-1 text-[11px] text-nx-ink-3">
              <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
              {item.label}
            </span>
            <p className="font-mono text-[11px] text-nx-ink-2 tabular-nums">
              {formatJobTimestamp(item.val, isAr) ?? t("common.none")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
