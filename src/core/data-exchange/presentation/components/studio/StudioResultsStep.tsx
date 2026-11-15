"use client";

import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Loader2,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { Progress } from "@core/ui/progress";
import { useI18n } from "@core/providers/i18n-provider";
import { StudioEphemeralCredentialsCard } from "./StudioEphemeralCredentialsCard";
import type {
  DataExchangeExecuteImportResponseDto,
  DataTransferJobDto,
} from "../../../domain/types";

export interface StudioResultsStepProps {
  executeResult: DataExchangeExecuteImportResponseDto;
  polledJob: DataTransferJobDto | null;
  credentialsDismissed: boolean;
  isDownloading: boolean;
  isCancelling: boolean;
  onMinimizeToBackground: () => void;
  onCancelJob: () => void;
  onResetWorkflow: () => void;
  onDownloadRejected: () => void;
  onCopyCredentials: () => void;
  onDismissCredentials: () => void;
}

/**
 * Step 4: Execution results, asynchronous background job monitoring,
 * rejected rows self-healing recovery, and ephemeral password vault.
 */
export function StudioResultsStep({
  executeResult,
  polledJob,
  credentialsDismissed,
  isDownloading,
  isCancelling,
  onMinimizeToBackground,
  onCancelJob,
  onResetWorkflow,
  onDownloadRejected,
  onCopyCredentials,
  onDismissCredentials,
}: StudioResultsStepProps) {
  const { t } = useI18n();

  const liveJobStatus = polledJob?.status ?? executeResult.status;
  const isAsyncRunning = liveJobStatus === "Queued" || liveJobStatus === "Running";

  const finalTotalRows = polledJob?.totalRows ?? executeResult.totalRows ?? 0;
  const finalCommitted = polledJob?.committedRows ?? executeResult.committedRows ?? 0;
  const finalCreated = polledJob?.createdRows ?? executeResult.createdRows ?? 0;
  const finalUpdated = polledJob?.updatedRows ?? executeResult.updatedRows ?? 0;
  const finalRejected = polledJob?.rejectedRows ?? executeResult.rejectedRows ?? 0;
  const finalHasRejected = polledJob?.hasRejectedWorkbook ?? executeResult.hasRejectedWorkbook ?? false;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {isAsyncRunning ? (
        <Alert variant="info" className="space-y-3 border-nx-line bg-nx-raised">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-nx-accent" />
            <AlertTitle className="mb-0 text-sm font-semibold text-nx-ink">
              {t("dataExchange.results.processingTitle")}
            </AlertTitle>
          </div>
          <AlertDescription className="space-y-3 text-nx-ink-2">
            <p className="text-xs">{t("dataExchange.results.processingDesc")}</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-nx-ink-2 tabular-nums">
                <span>
                  {t("dataExchange.studio.processedProgress", {
                    processed: polledJob?.processedRows ?? 0,
                    total: finalTotalRows,
                    percent: polledJob?.progressPercent ?? 0,
                  })}
                </span>
                <span className="font-mono tabular-nums">{polledJob?.progressPercent ?? 0}%</span>
              </div>
              <Progress value={polledJob?.progressPercent ?? 0} className="h-1.5" />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onMinimizeToBackground}
                className="h-7 text-xs border-nx-line"
              >
                {t("dataExchange.studio.minimizeToBackground")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                loading={isCancelling}
                onClick={onCancelJob}
                className="h-7 text-xs"
              >
                {t("dataExchange.studio.cancelJob")}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : liveJobStatus === "Failed" || liveJobStatus === "Cancelled" ? (
        <Alert variant="destructive" className="border-nx-danger/35 bg-nx-danger/10 text-nx-danger">
          <XCircle className="h-4 w-4 text-nx-danger shrink-0" />
          <AlertTitle className="text-sm font-semibold">{t("dataExchange.results.failedTitle")}</AlertTitle>
          <AlertDescription className="text-xs text-nx-ink-2 mt-1">
            {polledJob?.errorSummary ?? executeResult.errorSummary}
          </AlertDescription>
        </Alert>
      ) : finalRejected > 0 ? (
        <Alert variant="warning" className="border-nx-warning-strong/35 bg-nx-warning/10 text-nx-warning-strong">
          <AlertTriangle className="h-4 w-4 text-nx-warning-strong shrink-0" />
          <AlertTitle className="text-sm font-semibold text-nx-ink">
            {t("dataExchange.results.completedWithErrorsTitle")}
          </AlertTitle>
          <AlertDescription className="text-xs text-nx-ink mt-1">
            {t("dataExchange.results.rejectedHelpDesc")}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="success" className="border-success/30 bg-success/10">
          <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
          <AlertTitle className="text-sm font-semibold text-nx-ink">
            {t("dataExchange.results.completedTitle")}
          </AlertTitle>
          <AlertDescription className="text-xs text-nx-ink mt-1">
            {t("dataExchange.results.committedRows")}:{" "}
            <span dir="ltr" className="font-mono font-semibold tabular-nums">
              {finalCommitted} / {finalTotalRows}
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Results Telemetry Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-nx-line bg-nx-surface p-4 text-nx-ink">
          <p className="text-xs text-nx-ink-2">{t("dataExchange.results.committedRows")}</p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-success">
            {finalCommitted}
          </p>
        </Card>
        <Card className="border-nx-line bg-nx-surface p-4 text-nx-ink">
          <p className="text-xs text-nx-ink-2">{t("dataExchange.results.createdRows")}</p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-nx-accent">
            {finalCreated}
          </p>
        </Card>
        <Card className="border-nx-line bg-nx-surface p-4 text-nx-ink">
          <p className="text-xs text-nx-ink-2">{t("dataExchange.results.updatedRows")}</p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-info">
            {finalUpdated}
          </p>
        </Card>
        <Card className="border-nx-line bg-nx-surface p-4 text-nx-ink">
          <p className="text-xs text-nx-ink-2">{t("dataExchange.results.rejectedRows")}</p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-nx-danger">
            {finalRejected}
          </p>
        </Card>
      </div>

      {/* Rejected Rows Workbook Download */}
      {finalHasRejected && !isAsyncRunning && (
        <Card className="flex flex-wrap items-center justify-between gap-4 border-nx-warning-strong/35 bg-nx-warning/10 p-5">
          <div>
            <h4 className="text-sm font-semibold text-nx-ink">
              {t("dataExchange.results.rejectedHelpTitle")}
            </h4>
            <p className="mt-1 text-xs text-nx-ink-2">
              {t("dataExchange.results.rejectedHelpDesc")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResetWorkflow}
              className="border-nx-line text-xs"
            >
              <RotateCcw className="me-1.5 h-3.5 w-3.5" />
              <span>{t("dataExchange.actions.changeFile")}</span>
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              loading={isDownloading}
              onClick={onDownloadRejected}
              className="bg-nx-accent-fill text-nx-on-fill hover:opacity-90 text-xs font-medium"
            >
              <Download className="me-1.5 h-3.5 w-3.5" />
              <span>{t("dataExchange.actions.downloadRejected")}</span>
            </Button>
          </div>
        </Card>
      )}

      {/* One-Time Ephemeral Credentials Vault */}
      {!credentialsDismissed &&
        executeResult.ephemeralCredentials &&
        executeResult.ephemeralCredentials.length > 0 && (
          <StudioEphemeralCredentialsCard
            credentials={executeResult.ephemeralCredentials}
            onCopyCredentials={onCopyCredentials}
            onDismissCredentials={onDismissCredentials}
          />
        )}
    </div>
  );
}
