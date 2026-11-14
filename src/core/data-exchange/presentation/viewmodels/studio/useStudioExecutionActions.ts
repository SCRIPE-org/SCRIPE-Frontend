"use client";

import { useCallback, useState, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import type { IDataExchangeRepository } from "../../../domain/interfaces/IDataExchangeRepository";
import type {
  DataExchangeDryRunResponseDto,
  DataExchangeExecuteImportResponseDto,
  DataExchangeFileFormat,
  DataExchangeIdentityOnboardingMode,
  DataExchangeImportMode,
  DataExchangeInspectResponseDto,
  DataExchangeSheetMappingInputDto,
  DataTransferJobDto,
} from "../../../domain/types";
import {
  getStudioErrorMessage,
  TERMINAL_JOB_STATUSES,
  type SheetMappingState,
  type StudioStep,
} from "./studio-viewmodel.helpers";

interface UseStudioExecutionActionsParams {
  repo: IDataExchangeRepository;
  t: (key: string, params?: Record<string, string | number>) => string;
  isAr: boolean;
  entityKey: string;
  isMultiSheet: boolean;
  resolvedMultiSheetEntityKeys: string[];
  inspectResult: DataExchangeInspectResponseDto | null;
  sheetStates: SheetMappingState[];
  importMode: DataExchangeImportMode;
  onboardingMode: DataExchangeIdentityOnboardingMode;
  allowCreateMissingLookups: boolean;
  sourceTimeZoneId: string;
  dryRunResult: DataExchangeDryRunResponseDto | null;
  setDryRunResult: Dispatch<SetStateAction<DataExchangeDryRunResponseDto | null>>;
  executeResult: DataExchangeExecuteImportResponseDto | null;
  setExecuteResult: Dispatch<SetStateAction<DataExchangeExecuteImportResponseDto | null>>;
  polledJob: DataTransferJobDto | null;
  setPolledJob: Dispatch<SetStateAction<DataTransferJobDto | null>>;
  setStep: Dispatch<SetStateAction<StudioStep>>;
  setErrorBanner: Dispatch<SetStateAction<string | null>>;
  setInfoBanner: Dispatch<SetStateAction<string | null>>;
  setCredentialsDismissed: Dispatch<SetStateAction<boolean>>;
  pollTimerRef: MutableRefObject<ReturnType<typeof setInterval> | null>;
  stopPolling: () => void;
  onImportComplete?: () => void;
}

/**
 * Handles dry-run pre-flight checks, import commit execution, job status polling,
 * cancellation, and smart/rejected workbook downloads for Data Exchange Studio.
 */
export function useStudioExecutionActions({
  repo,
  t,
  isAr,
  entityKey,
  isMultiSheet,
  resolvedMultiSheetEntityKeys,
  inspectResult,
  sheetStates,
  importMode,
  onboardingMode,
  allowCreateMissingLookups,
  sourceTimeZoneId,
  dryRunResult,
  setDryRunResult,
  executeResult,
  setExecuteResult,
  polledJob,
  setPolledJob,
  setStep,
  setErrorBanner,
  setInfoBanner,
  setCredentialsDismissed,
  pollTimerRef,
  stopPolling,
  onImportComplete,
}: UseStudioExecutionActionsParams) {
  const [isDryRunning, setIsDryRunning] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const buildPayloadMappings = useCallback(() => {
    const primaryMappings = (sheetStates[0]?.mappings ?? []).filter((m) =>
      Boolean(m.targetFieldKey)
    );
    const sheetMappings: DataExchangeSheetMappingInputDto[] = sheetStates.map((s) => ({
      sheetName: s.sheetName,
      entityKey: s.entityKey,
      mode: isMultiSheet ? s.mode : importMode,
      mappings: s.mappings.filter((m) => Boolean(m.targetFieldKey)),
    }));
    return { primaryMappings, sheetMappings };
  }, [importMode, isMultiSheet, sheetStates]);

  const runDryRun = useCallback(async () => {
    if (!inspectResult) return;
    setIsDryRunning(true);
    setErrorBanner(null);
    setInfoBanner(null);
    try {
      const { primaryMappings, sheetMappings } = buildPayloadMappings();
      const result = await repo.dryRun({
        uploadId: inspectResult.uploadId,
        format: inspectResult.format,
        entityKey: inspectResult.entityKey,
        isMultiSheet: inspectResult.isMultiSheet,
        mode: importMode,
        onboardingMode,
        allowCreateMissingLookups,
        timeZoneId: sourceTimeZoneId || "UTC",
        mappings: inspectResult.isMultiSheet ? null : primaryMappings,
        sheetMappings: inspectResult.isMultiSheet ? sheetMappings : null,
      });
      setDryRunResult(result);
      setStep("dryRun");
    } catch (err) {
      setErrorBanner(getStudioErrorMessage(err, t("dataExchange.errors.dryRunFailed")));
    } finally {
      setIsDryRunning(false);
    }
  }, [
    allowCreateMissingLookups,
    buildPayloadMappings,
    importMode,
    inspectResult,
    onboardingMode,
    repo,
    setDryRunResult,
    setErrorBanner,
    setInfoBanner,
    setStep,
    sourceTimeZoneId,
    t,
  ]);

  const startJobPolling = useCallback(
    (jobId: string) => {
      stopPolling();
      pollTimerRef.current = setInterval(async () => {
        try {
          const latest = await repo.getJob(jobId);
          setPolledJob(latest);
          if (TERMINAL_JOB_STATUSES.has(latest.status)) {
            stopPolling();
            onImportComplete?.();
          }
        } catch {
          stopPolling();
        }
      }, 1500);
    },
    [onImportComplete, pollTimerRef, repo, setPolledJob, stopPolling]
  );

  const commitImport = useCallback(
    async (execOptions?: { runInBackground?: boolean }) => {
      if (!inspectResult || !dryRunResult?.canExecute || !dryRunResult.quotaPassed) return;
      setIsExecuting(true);
      setErrorBanner(null);
      setInfoBanner(null);
      setCredentialsDismissed(false);
      try {
        const { primaryMappings, sheetMappings } = buildPayloadMappings();
        const result = await repo.executeImport({
          uploadId: inspectResult.uploadId,
          format: inspectResult.format,
          originalFileName: inspectResult.fileName,
          entityKey: inspectResult.entityKey,
          isMultiSheet: inspectResult.isMultiSheet,
          mode: importMode,
          onboardingMode,
          allowCreateMissingLookups,
          timeZoneId: sourceTimeZoneId || "UTC",
          mappings: inspectResult.isMultiSheet ? null : primaryMappings,
          sheetMappings: inspectResult.isMultiSheet ? sheetMappings : null,
          runInBackground: execOptions?.runInBackground ?? false,
        });
        setExecuteResult(result);
        setStep("results");

        if (result.executedSynchronously || TERMINAL_JOB_STATUSES.has(result.status)) {
          onImportComplete?.();
        } else {
          startJobPolling(result.jobId);
        }
        return result;
      } catch (err) {
        setErrorBanner(getStudioErrorMessage(err, t("dataExchange.errors.executeFailed")));
      } finally {
        setIsExecuting(false);
      }
    },
    [
      allowCreateMissingLookups,
      buildPayloadMappings,
      dryRunResult,
      importMode,
      inspectResult,
      onboardingMode,
      onImportComplete,
      repo,
      setCredentialsDismissed,
      setErrorBanner,
      setExecuteResult,
      setInfoBanner,
      setStep,
      sourceTimeZoneId,
      startJobPolling,
      t,
    ]
  );

  const downloadTemplate = useCallback(
    async (format: DataExchangeFileFormat = "xlsx", multi = isMultiSheet) => {
      setIsDownloading(true);
      setErrorBanner(null);
      try {
        await repo.downloadTemplateFile({
          entityKey,
          format,
          locale: isAr ? "ar" : "en",
          multiSheet: multi,
          entityKeys:
            multi && resolvedMultiSheetEntityKeys.length > 0
              ? resolvedMultiSheetEntityKeys
              : undefined,
        });
      } catch (err) {
        setErrorBanner(
          getStudioErrorMessage(err, t("dataExchange.errors.templateDownloadFailed"))
        );
      } finally {
        setIsDownloading(false);
      }
    },
    [entityKey, isAr, isMultiSheet, repo, resolvedMultiSheetEntityKeys, setErrorBanner, t]
  );

  const downloadRejectedWorkbook = useCallback(async () => {
    const jobId = polledJob?.id ?? executeResult?.jobId;
    if (!jobId) return;
    setIsDownloading(true);
    setErrorBanner(null);
    try {
      await repo.downloadArtifactFile(
        jobId,
        "rejected",
        `${entityKey.replace(/[^a-zA-Z0-9._-]+/g, "_")}-rejected-${jobId.slice(0, 8)}.xlsx`
      );
    } catch (err) {
      setErrorBanner(
        getStudioErrorMessage(err, t("dataExchange.errors.rejectedDownloadFailed"))
      );
    } finally {
      setIsDownloading(false);
    }
  }, [entityKey, executeResult, polledJob, repo, setErrorBanner, t]);

  const cancelJob = useCallback(async () => {
    const jobId = polledJob?.id ?? executeResult?.jobId;
    if (!jobId) return;
    setIsCancelling(true);
    try {
      const updated = await repo.cancelJob(jobId);
      setPolledJob(updated);
      stopPolling();
      setInfoBanner(t("dataExchange.studio.jobCancelledStatus"));
    } catch (err) {
      setErrorBanner(getStudioErrorMessage(err, t("dataExchange.errors.executeFailed")));
    } finally {
      setIsCancelling(false);
    }
  }, [executeResult, polledJob, repo, setErrorBanner, setInfoBanner, setPolledJob, stopPolling, t]);

  return {
    isDryRunning,
    isExecuting,
    isDownloading,
    isCancelling,
    runDryRun,
    commitImport,
    cancelJob,
    downloadTemplate,
    downloadRejectedWorkbook,
  };
}
