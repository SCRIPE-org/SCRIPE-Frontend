"use client";

import { useCallback, useRef, useState } from "react";
import { getCoreContainer } from "@core/di";
import { useI18n } from "@core/providers/i18n-provider";
import type {
  DataExchangeDescriptorResponseDto,
  DataExchangeDryRunResponseDto,
  DataExchangeExecuteImportResponseDto,
  DataExchangeIdentityOnboardingMode,
  DataExchangeImportMode,
  DataExchangeInspectResponseDto,
  DataExchangeSavedPresetDto,
  DataTransferJobDto,
} from "../../domain/types";
import {
  computeStudioValidationSummary,
  type SheetMappingState,
  type StudioStep,
  type UseDataExchangeStudioOptions,
} from "./studio/studio-viewmodel.helpers";
import { useStudioMetadataAndInspection } from "./studio/useStudioMetadataAndInspection";
import { useStudioPresetsAndMapping } from "./studio/useStudioPresetsAndMapping";
import { useStudioExecutionActions } from "./studio/useStudioExecutionActions";

export type {
  StudioStep,
  SheetMappingState,
  UseDataExchangeStudioOptions,
} from "./studio/studio-viewmodel.helpers";

/**
 * ViewModel hook driving the 4-stage SCRIPE Data Exchange Studio overlay workflow
 * (Upload & Inspect -> Mapping Workbench -> Dry-Run & Quota Gate -> Commit & Recovery).
 */
export function useDataExchangeStudioViewModel(options: UseDataExchangeStudioOptions) {
  const {
    open,
    entityKey,
    initialMultiSheet = false,
    multiSheetEntityKeys,
    initialPresetId,
    onImportComplete,
  } = options;
  const { language, t } = useI18n();
  const isAr = language === "ar";
  const [repo] = useState(() => getCoreContainer().dataExchangeRepository);

  const appliedInitialPresetRef = useRef<string | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollAbortRef = useRef<AbortController | null>(null);
  const pollInFlightRef = useRef<boolean>(false);

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

  const [dryRunResult, setDryRunResult] = useState<DataExchangeDryRunResponseDto | null>(null);
  const [executeResult, setExecuteResult] =
    useState<DataExchangeExecuteImportResponseDto | null>(null);
  const [polledJob, setPolledJob] = useState<DataTransferJobDto | null>(null);

  const [isLoadingMeta, setIsLoadingMeta] = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [infoBanner, setInfoBanner] = useState<string | null>(null);
  const [credentialsDismissed, setCredentialsDismissed] = useState(false);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (pollAbortRef.current) {
      pollAbortRef.current.abort();
      pollAbortRef.current = null;
    }
    pollInFlightRef.current = false;
  }, []);

  const dismissCredentials = useCallback(() => {
    setCredentialsDismissed(true);
    setExecuteResult((prev) =>
      prev && prev.ephemeralCredentials
        ? { ...prev, ephemeralCredentials: null }
        : prev
    );
  }, []);

  const resetWorkflow = useCallback(() => {
    stopPolling();
    appliedInitialPresetRef.current = null;
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

  const { inspectUploadedFile, retryLoadMetadata } = useStudioMetadataAndInspection({
    open,
    entityKey,
    initialMultiSheet,
    multiSheetEntityKeys,
    initialPresetId,
    repo,
    t,
    isMultiSheet,
    importMode,
    descriptorByEntity,
    presets,
    appliedInitialPresetRef,
    stopPolling,
    setIsMultiSheet,
    setIsLoadingMeta,
    setIsInspecting,
    setErrorBanner,
    setInfoBanner,
    setDescriptorByEntity,
    setPrimaryDescriptor,
    setPresets,
    setImportMode,
    setSelectedFile,
    setInspectResult,
    setSheetStates,
    setActiveSheetName,
    setDryRunResult,
    setExecuteResult,
    setPolledJob,
    setStep,
  });

  const activeSheet =
    inspectResult?.sheets.find((s) => s.sheetName === activeSheetName) ??
    inspectResult?.sheets[0] ??
    null;

  const activeSheetState =
    sheetStates.find((s) => s.sheetName === activeSheetName) ?? sheetStates[0] ?? null;

  const activeDescriptorResponse =
    (activeSheetState ? descriptorByEntity[activeSheetState.entityKey] : null) ??
    primaryDescriptor;

  const resolvedMultiSheetEntityKeys =
    multiSheetEntityKeys && multiSheetEntityKeys.length > 0
      ? multiSheetEntityKeys
      : primaryDescriptor?.relatedMultiSheetEntityKeys ??
        primaryDescriptor?.descriptor?.relatedMultiSheetEntityKeys ??
        [];

  const mappingControls = useStudioPresetsAndMapping({
    repo,
    t,
    initialPresetId,
    appliedInitialPresetRef,
    activeSheet,
    activeSheetState,
    presets,
    setPresets,
    importMode,
    setImportMode,
    setSheetStates,
    setDryRunResult,
    setErrorBanner,
    setInfoBanner,
  });

  const executionControls = useStudioExecutionActions({
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
    pollAbortRef,
    pollInFlightRef,
    stopPolling,
    onImportComplete,
  });

  const validation = computeStudioValidationSummary({
    inspectResult,
    sheetStates,
    descriptorByEntity,
    primaryDescriptor,
    activeSheet,
    activeSheetState,
    activeDescriptorResponse,
    isMultiSheet,
  });

  return {
    isAr,
    step,
    setStep,
    isMultiSheet,
    setIsMultiSheet,
    primaryDescriptor,
    resolvedMultiSheetEntityKeys,
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
    importMode,
    setImportMode,
    onboardingMode,
    setOnboardingMode,
    allowCreateMissingLookups,
    setAllowCreateMissingLookups,
    sourceTimeZoneId,
    setSourceTimeZoneId,
    dryRunResult,
    executeResult,
    polledJob,
    isLoadingMeta,
    isInspecting,
    errorBanner,
    setErrorBanner,
    infoBanner,
    setInfoBanner,
    credentialsDismissed,
    setCredentialsDismissed,
    dismissCredentials,
    resetWorkflow,
    inspectUploadedFile,
    retryLoadMetadata,
    ...validation,
    ...mappingControls,
    ...executionControls,
  };
}
