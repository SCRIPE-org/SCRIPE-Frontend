"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getCoreContainer } from "@core/di";
import { useI18n } from "@core/providers/i18n-provider";
import type {
  DataExchangeColumnDescriptor,
  DataExchangeColumnMapping,
  DataExchangeDescriptorResponseDto,
  DataExchangeDryRunResponseDto,
  DataExchangeExecuteImportResponseDto,
  DataExchangeFileFormat,
  DataExchangeIdentityOnboardingMode,
  DataExchangeImportMode,
  DataExchangeInspectResponseDto,
  DataExchangeSavedPresetDto,
  DataExchangeSheetMappingInputDto,
  DataExchangeTransformRule,
  DataTransferJobDto,
  MappingCompatibilityIssue,
} from "../../domain/types";
import {
  findMissingRequiredFields,
  isExpressTemplateMatch,
  validateSheetMappings,
} from "../../domain/mapping-validation";

/** Active step inside SCRIPE Data Exchange Studio overlay. */
export type StudioStep = "upload" | "mapping" | "dryRun" | "results";

/** Editable mapping state scoped to a single worksheet inside an uploaded workbook. */
export interface SheetMappingState {
  sheetName: string;
  entityKey: string;
  mode: DataExchangeImportMode;
  mappings: DataExchangeColumnMapping[];
}

export interface UseDataExchangeStudioOptions {
  open: boolean;
  entityKey: string;
  initialMultiSheet?: boolean;
  multiSheetEntityKeys?: string[];
  onImportComplete?: () => void;
}

const TERMINAL_JOB_STATUSES = new Set([
  "Completed",
  "CompletedWithErrors",
  "Failed",
  "Cancelled",
]);

function createDefaultTransform(): DataExchangeTransformRule {
  return {
    trim: true,
    uppercase: false,
    lowercase: false,
    defaultValue: null,
    dateFormat: null,
    sourceTimeZoneId: null,
    canonicalizeNullTokens: true,
    collapseWhitespace: true,
    normalizeUnicodeCompatibility: true,
    stripArabicDiacritics: true,
    normalizeArabicLetters: false,
    caseMode: "None",
    stripCurrencyAndGrouping: true,
    convertAccountingNegatives: true,
    defaultCountryDialCode: null,
    normalizeEmailAddress: false,
    multiValueDelimiter: null,
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === "string" && msg.length > 0) return msg;
  }
  return fallback;
}

/**
 * ViewModel hook driving the 4-stage SCRIPE Data Exchange Studio overlay workflow
 * (Upload & Inspect -> Mapping Workbench -> Dry-Run & Quota Gate -> Commit & Recovery).
 */
export function useDataExchangeStudioViewModel(options: UseDataExchangeStudioOptions) {
  const { open, entityKey, initialMultiSheet = false, multiSheetEntityKeys, onImportComplete } =
    options;
  const { language, t } = useI18n();
  const isAr = language === "ar";
  const repo = getCoreContainer().dataExchangeRepository;

  const [step, setStep] = useState<StudioStep>("upload");
  const [isMultiSheet, setIsMultiSheet] = useState(initialMultiSheet);
  const [primaryDescriptor, setPrimaryDescriptor] =
    useState<DataExchangeDescriptorResponseDto | null>(null);
  const [descriptorByEntity, setDescriptorByEntity] = useState<
    Record<string, DataExchangeDescriptorResponseDto>
  >({});
  const [presets, setPresets] = useState<DataExchangeSavedPresetDto[]>([]);
  const [inspectResult, setInspectResult] = useState<DataExchangeInspectResponseDto | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [sheetStates, setSheetStates] = useState<SheetMappingState[]>([]);
  const [activeSheetName, setActiveSheetName] = useState<string>("");
  const [importMode, setImportMode] = useState<DataExchangeImportMode>("Upsert");
  const [onboardingMode, setOnboardingMode] =
    useState<DataExchangeIdentityOnboardingMode>("StagedPendingInvite");
  const [allowCreateMissingLookups, setAllowCreateMissingLookups] = useState(false);
  const [sourceTimeZoneId, setSourceTimeZoneId] = useState<string>("UTC");
  const [presetNameInput, setPresetNameInput] = useState<string>("");

  const [dryRunResult, setDryRunResult] = useState<DataExchangeDryRunResponseDto | null>(null);
  const [executeResult, setExecuteResult] =
    useState<DataExchangeExecuteImportResponseDto | null>(null);
  const [polledJob, setPolledJob] = useState<DataTransferJobDto | null>(null);

  const [isLoadingMeta, setIsLoadingMeta] = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);
  const [isDryRunning, setIsDryRunning] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSavingPreset, setIsSavingPreset] = useState(false);

  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [infoBanner, setInfoBanner] = useState<string | null>(null);
  const [credentialsDismissed, setCredentialsDismissed] = useState(false);

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const resetWorkflow = useCallback(() => {
    stopPolling();
    setStep("upload");
    setSelectedFile(null);
    setInspectResult(null);
    setSheetStates([]);
    setActiveSheetName("");
    setDryRunResult(null);
    setExecuteResult(null);
    setPolledJob(null);
    setErrorBanner(null);
    setInfoBanner(null);
    setCredentialsDismissed(false);
  }, [stopPolling]);

  useEffect(() => {
    setIsMultiSheet(initialMultiSheet);
  }, [initialMultiSheet, open]);

  useEffect(() => {
    if (!open || !entityKey) {
      stopPolling();
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    async function loadInitialMetadata() {
      setIsLoadingMeta(true);
      setErrorBanner(null);
      try {
        const keysToLoad = Array.from(
          new Set([entityKey, ...(multiSheetEntityKeys ?? [])].filter(Boolean))
        );

        const [descriptorList, loadedPresets] = await Promise.all([
          Promise.all(
            keysToLoad.map((key) =>
              repo.getEntityDescriptor(key, controller.signal).catch(() => null)
            )
          ),
          repo.listPresets(entityKey, controller.signal).catch(() => []),
        ]);

        if (cancelled) return;

        const map: Record<string, DataExchangeDescriptorResponseDto> = {};
        for (const item of descriptorList) {
          if (item) {
            map[item.descriptor.entityKey] = item;
          }
        }

        const primary = map[entityKey] ?? null;
        setDescriptorByEntity(map);
        setPrimaryDescriptor(primary);
        setPresets(loadedPresets);

        if (primary?.descriptor.supportedModes.length) {
          const modes = primary.descriptor.supportedModes;
          setImportMode(modes.includes("Upsert") ? "Upsert" : modes[0]);
        }
      } catch (err) {
        if (!cancelled) {
          setErrorBanner(
            getErrorMessage(err, t("dataExchange.errors.loadMetaFailed"))
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingMeta(false);
        }
      }
    }

    loadInitialMetadata();

    return () => {
      cancelled = true;
      controller.abort();
      stopPolling();
    };
  }, [open, entityKey, multiSheetEntityKeys, repo, stopPolling, t]);

  const buildInitialMappingsForSheet = useCallback(
    (
      sheet: DataExchangeInspectResponseDto["sheets"][number],
      preset?: DataExchangeSavedPresetDto
    ): DataExchangeColumnMapping[] => {
      const result: DataExchangeColumnMapping[] = [];
      for (const header of sheet.headers) {
        const suggestion = sheet.suggestedMappings.find(
          (s) => s.sourceColumnHeader.toLowerCase() === header.toLowerCase()
        );
        if (suggestion?.isDiagnosticColumn) {
          continue;
        }
        const presetMatch = preset?.mappings.find(
          (m) => m.sourceColumnHeader.toLowerCase() === header.toLowerCase()
        );
        const target = presetMatch?.targetFieldKey ?? suggestion?.targetFieldKey ?? "";
        result.push({
          sourceColumnHeader: header,
          targetFieldKey: target,
          transform: presetMatch?.transform ?? createDefaultTransform(),
          resolveByField: presetMatch?.resolveByField ?? null,
        });
      }
      return result;
    },
    []
  );

  const inspectUploadedFile = useCallback(
    async (file: File, multiSheetOverride?: boolean) => {
      const multiFlag = multiSheetOverride ?? isMultiSheet;
      setSelectedFile(file);
      setIsInspecting(true);
      setErrorBanner(null);
      setInfoBanner(null);
      setDryRunResult(null);
      setExecuteResult(null);
      setPolledJob(null);

      try {
        const inspection = await repo.inspectUpload(entityKey, file, multiFlag);
        setInspectResult(inspection);

        const defaultPreset = presets.find((p) => p.isDefault);
        const initialSheets: SheetMappingState[] = inspection.sheets
          .filter((s) => !s.isEmpty || inspection.sheets.length === 1)
          .map((sheet) => {
            const targetEntityKey = sheet.suggestedEntityKey || entityKey;
            const sheetDesc = descriptorByEntity[targetEntityKey]?.descriptor;
            const defaultSheetMode = sheetDesc?.supportedModes.includes(importMode)
              ? importMode
              : sheetDesc?.supportedModes[0] ?? "Upsert";

            return {
              sheetName: sheet.sheetName,
              entityKey: targetEntityKey,
              mode: !multiFlag && defaultPreset ? defaultPreset.importMode : defaultSheetMode,
              mappings: buildInitialMappingsForSheet(
                sheet,
                !multiFlag ? defaultPreset : undefined
              ),
            };
          });

        setSheetStates(initialSheets);
        setActiveSheetName(initialSheets[0]?.sheetName ?? "");
        if (!multiFlag && defaultPreset) {
          setImportMode(defaultPreset.importMode);
        }
        setStep("mapping");
      } catch (err) {
        setErrorBanner(getErrorMessage(err, t("dataExchange.errors.inspectFailed")));
      } finally {
        setIsInspecting(false);
      }
    },
    [
      buildInitialMappingsForSheet,
      descriptorByEntity,
      entityKey,
      importMode,
      isMultiSheet,
      presets,
      repo,
      t,
    ]
  );

  const activeSheet =
    inspectResult?.sheets.find((s) => s.sheetName === activeSheetName) ??
    inspectResult?.sheets[0] ??
    null;

  const activeSheetState =
    sheetStates.find((s) => s.sheetName === activeSheetName) ?? sheetStates[0] ?? null;

  const activeDescriptorResponse =
    (activeSheetState ? descriptorByEntity[activeSheetState.entityKey] : null) ??
    primaryDescriptor;

  const updateColumnMapping = useCallback(
    (sheetName: string, sourceColumnHeader: string, patch: Partial<DataExchangeColumnMapping>) => {
      setDryRunResult(null);
      setSheetStates((prev) =>
        prev.map((sheet) => {
          if (sheet.sheetName !== sheetName) return sheet;
          const existing = sheet.mappings.find(
            (m) => m.sourceColumnHeader === sourceColumnHeader
          );
          if (!existing) {
            return {
              ...sheet,
              mappings: [
                ...sheet.mappings,
                {
                  sourceColumnHeader,
                  targetFieldKey: patch.targetFieldKey ?? "",
                  transform: patch.transform ?? createDefaultTransform(),
                  resolveByField: patch.resolveByField ?? null,
                },
              ],
            };
          }
          return {
            ...sheet,
            mappings: sheet.mappings.map((m) =>
              m.sourceColumnHeader === sourceColumnHeader ? { ...m, ...patch } : m
            ),
          };
        })
      );
    },
    []
  );

  const updateSheetMeta = useCallback(
    (sheetName: string, patch: Partial<Pick<SheetMappingState, "entityKey" | "mode">>) => {
      setDryRunResult(null);
      setSheetStates((prev) =>
        prev.map((s) => (s.sheetName === sheetName ? { ...s, ...patch } : s))
      );
    },
    []
  );

  const reAutoMapActiveSheet = useCallback(() => {
    if (!activeSheet) return;
    setDryRunResult(null);
    setSheetStates((prev) =>
      prev.map((s) =>
        s.sheetName === activeSheet.sheetName
          ? { ...s, mappings: buildInitialMappingsForSheet(activeSheet) }
          : s
      )
    );
  }, [activeSheet, buildInitialMappingsForSheet]);

  const applyPreset = useCallback(
    (preset: DataExchangeSavedPresetDto) => {
      if (!activeSheet) return;
      setImportMode(preset.importMode);
      setDryRunResult(null);
      setSheetStates((prev) =>
        prev.map((s) =>
          s.sheetName === activeSheet.sheetName
            ? {
                ...s,
                mode: preset.importMode,
                mappings: buildInitialMappingsForSheet(activeSheet, preset),
              }
            : s
        )
      );
      setInfoBanner(t("dataExchange.mapping.presetApplied", { name: preset.name }));
    },
    [activeSheet, buildInitialMappingsForSheet, t]
  );

  const saveCurrentPreset = useCallback(async () => {
    if (!activeSheetState || !presetNameInput.trim()) return;
    setIsSavingPreset(true);
    setErrorBanner(null);
    try {
      const saved = await repo.savePreset({
        entityKey: activeSheetState.entityKey,
        name: presetNameInput.trim(),
        importMode,
        mappings: activeSheetState.mappings.filter((m) => Boolean(m.targetFieldKey)),
        isDefault: false,
      });
      setPresets((prev) => [saved, ...prev.filter((p) => p.id !== saved.id)]);
      setPresetNameInput("");
      setInfoBanner(t("dataExchange.mapping.presetSaved"));
    } catch (err) {
      setErrorBanner(getErrorMessage(err, t("dataExchange.errors.savePresetFailed")));
    } finally {
      setIsSavingPreset(false);
    }
  }, [activeSheetState, importMode, presetNameInput, repo, t]);

  const removePreset = useCallback(
    async (id: string) => {
      setErrorBanner(null);
      try {
        await repo.deletePreset(id);
        setPresets((prev) => prev.filter((p) => p.id !== id));
        setInfoBanner(t("dataExchange.mapping.presetDeleted"));
      } catch (err) {
        setErrorBanner(
          getErrorMessage(err, t("dataExchange.errors.deletePresetFailed"))
        );
      }
    },
    [repo, t]
  );

  // Compute all validation issues across active/all sheets (lightweight direct computation)
  const compatibilityIssuesBySheet: Record<string, MappingCompatibilityIssue[]> = {};
  const missingRequiredBySheet: Record<string, DataExchangeColumnDescriptor[]> = {};
  let totalCompatibilityIssues = 0;
  let totalMissingRequired = 0;

  if (inspectResult) {
    for (const sState of sheetStates) {
      const inspected = inspectResult.sheets.find((s) => s.sheetName === sState.sheetName);
      const descResp = descriptorByEntity[sState.entityKey] ?? primaryDescriptor;
      if (!inspected || !descResp) continue;
      const restricted = new Set(descResp.restrictedFieldKeys);
      const sheetIssues = validateSheetMappings(
        inspected,
        sState.mappings,
        descResp.descriptor,
        restricted
      );
      compatibilityIssuesBySheet[sState.sheetName] = sheetIssues;
      totalCompatibilityIssues += sheetIssues.length;

      const sheetMissing =
        sState.mode !== "Update"
          ? findMissingRequiredFields(sState.mappings, descResp.descriptor)
          : [];
      missingRequiredBySheet[sState.sheetName] = sheetMissing;
      totalMissingRequired += sheetMissing.length;
    }
  }

  const activeRestrictedSet = new Set(activeDescriptorResponse?.restrictedFieldKeys ?? []);
  const activeCompatibilityIssues = activeSheetState
    ? compatibilityIssuesBySheet[activeSheetState.sheetName] ?? []
    : [];
  const activeMissingRequired =
    activeSheetState && activeSheetState.mode !== "Update"
      ? findMissingRequiredFields(
          activeSheetState.mappings,
          activeDescriptorResponse?.descriptor ?? null
        )
      : [];

  const expressReady =
    !isMultiSheet &&
    Boolean(activeSheet && activeSheetState && primaryDescriptor) &&
    isExpressTemplateMatch(
      activeSheet!,
      activeSheetState!.mappings,
      primaryDescriptor!.descriptor,
      new Set(primaryDescriptor!.restrictedFieldKeys)
    );

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
      setErrorBanner(getErrorMessage(err, t("dataExchange.errors.dryRunFailed")));
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
    [onImportComplete, repo, stopPolling]
  );

  const commitImport = useCallback(
    async (options?: { runInBackground?: boolean }) => {
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
          runInBackground: options?.runInBackground ?? false,
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
        setErrorBanner(getErrorMessage(err, t("dataExchange.errors.executeFailed")));
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
          entityKeys: multi ? multiSheetEntityKeys : undefined,
        });
      } catch (err) {
        setErrorBanner(
          getErrorMessage(err, t("dataExchange.errors.templateDownloadFailed"))
        );
      } finally {
        setIsDownloading(false);
      }
    },
    [entityKey, isAr, isMultiSheet, multiSheetEntityKeys, repo, t]
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
        getErrorMessage(err, t("dataExchange.errors.rejectedDownloadFailed"))
      );
    } finally {
      setIsDownloading(false);
    }
  }, [entityKey, executeResult, polledJob, repo, t]);

  const [isCancelling, setIsCancelling] = useState(false);
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
      setErrorBanner(getErrorMessage(err, t("dataExchange.errors.executeFailed")));
    } finally {
      setIsCancelling(false);
    }
  }, [executeResult, polledJob, repo, stopPolling, t]);

  return {
    isAr,
    step,
    setStep,
    isMultiSheet,
    setIsMultiSheet,
    primaryDescriptor,
    descriptorByEntity,
    presets,
    inspectResult,
    selectedFile,
    sheetStates,
    activeSheetName,
    setActiveSheetName,
    activeSheet,
    activeSheetState,
    activeDescriptorResponse,
    activeRestrictedSet,
    importMode,
    setImportMode,
    onboardingMode,
    setOnboardingMode,
    allowCreateMissingLookups,
    setAllowCreateMissingLookups,
    sourceTimeZoneId,
    setSourceTimeZoneId,
    presetNameInput,
    setPresetNameInput,
    dryRunResult,
    executeResult,
    polledJob,
    isLoadingMeta,
    isInspecting,
    isDryRunning,
    isExecuting,
    isDownloading,
    isSavingPreset,
    errorBanner,
    setErrorBanner,
    infoBanner,
    setInfoBanner,
    credentialsDismissed,
    setCredentialsDismissed,
    compatibilityIssuesBySheet,
    missingRequiredBySheet,
    activeCompatibilityIssues,
    activeMissingRequired,
    totalCompatibilityIssues,
    totalMissingRequired,
    expressReady,
    resetWorkflow,
    inspectUploadedFile,
    updateColumnMapping,
    updateSheetMeta,
    reAutoMapActiveSheet,
    applyPreset,
    saveCurrentPreset,
    removePreset,
    runDryRun,
    commitImport,
    cancelJob,
    isCancelling,
    downloadTemplate,
    downloadRejectedWorkbook,
  };
}
