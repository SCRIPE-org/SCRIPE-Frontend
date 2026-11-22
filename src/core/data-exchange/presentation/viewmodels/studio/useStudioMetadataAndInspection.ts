"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import type { IDataExchangeRepository } from "../../../domain/interfaces/IDataExchangeRepository";
import type {
  DataExchangeDescriptorResponseDto,
  DataExchangeDryRunResponseDto,
  DataExchangeExecuteImportResponseDto,
  DataExchangeImportMode,
  DataExchangeInspectResponseDto,
  DataExchangeSavedPresetDto,
  DataTransferJobDto,
} from "../../../domain/types";
import {
  buildInitialMappingsForSheet,
  getStudioErrorMessage,
  isAbortOrInterceptedError,
  validateUploadFileClientSide,
  type SheetMappingState,
  type StudioStep,
} from "./studio-viewmodel.helpers";

export interface UseStudioMetadataAndInspectionParams {
  open: boolean;
  entityKey: string;
  initialMultiSheet: boolean;
  multiSheetEntityKeys?: string[];
  initialPresetId?: string;
  repo: IDataExchangeRepository;
  t: (key: string, params?: Record<string, string | number>) => string;
  isMultiSheet: boolean;
  importMode: DataExchangeImportMode;
  descriptorByEntity: Record<string, DataExchangeDescriptorResponseDto>;
  presets: DataExchangeSavedPresetDto[];
  appliedInitialPresetRef: MutableRefObject<string | null>;
  stopPolling: () => void;
  setIsMultiSheet: Dispatch<SetStateAction<boolean>>;
  setIsLoadingMeta: Dispatch<SetStateAction<boolean>>;
  setIsInspecting: Dispatch<SetStateAction<boolean>>;
  setErrorBanner: Dispatch<SetStateAction<string | null>>;
  setInfoBanner: Dispatch<SetStateAction<string | null>>;
  setDescriptorByEntity: Dispatch<SetStateAction<Record<string, DataExchangeDescriptorResponseDto>>>;
  setPrimaryDescriptor: Dispatch<SetStateAction<DataExchangeDescriptorResponseDto | null>>;
  setPresets: Dispatch<SetStateAction<DataExchangeSavedPresetDto[]>>;
  setImportMode: Dispatch<SetStateAction<DataExchangeImportMode>>;
  setSelectedFile: Dispatch<SetStateAction<File | null>>;
  setInspectResult: Dispatch<SetStateAction<DataExchangeInspectResponseDto | null>>;
  setSheetStates: Dispatch<SetStateAction<SheetMappingState[]>>;
  setActiveSheetName: Dispatch<SetStateAction<string>>;
  setDryRunResult: Dispatch<SetStateAction<DataExchangeDryRunResponseDto | null>>;
  setExecuteResult: Dispatch<SetStateAction<DataExchangeExecuteImportResponseDto | null>>;
  setPolledJob: Dispatch<SetStateAction<DataTransferJobDto | null>>;
  setStep: Dispatch<SetStateAction<StudioStep>>;
}

/**
 * Sub-hook managing Studio entity descriptor hydration, preset preloading,
 * and uploaded workbook inspection/sheet initialization.
 */
export function useStudioMetadataAndInspection({
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
}: UseStudioMetadataAndInspectionParams) {
  const [metaRetryNonce, setMetaRetryNonce] = useState(0);
  const tRef = useRef(t);
  const multiSheetEntityKeysRef = useRef(multiSheetEntityKeys);
  useEffect(() => {
    tRef.current = t;
    multiSheetEntityKeysRef.current = multiSheetEntityKeys;
  }, [t, multiSheetEntityKeys]);
  const multiSheetEntityKeysKey = (multiSheetEntityKeys ?? []).filter(Boolean).join("|");

  const retryLoadMetadata = useCallback(() => {
    setMetaRetryNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    setIsMultiSheet(initialMultiSheet);
  }, [initialMultiSheet, open, setIsMultiSheet]);

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
        const extraKeys = Array.from(
          new Set(
            (multiSheetEntityKeysRef.current ?? []).filter(
              (k) => Boolean(k) && k.toLowerCase() !== entityKey.toLowerCase()
            )
          )
        );

        const [primary, secondaryDescriptors] = await Promise.all([
          repo.getEntityDescriptor(entityKey, controller.signal),
          Promise.all(
            extraKeys.map((key) =>
              repo.getEntityDescriptor(key, controller.signal).catch(() => null)
            )
          ),
        ]);

        if (cancelled) return;

        const map: Record<string, DataExchangeDescriptorResponseDto> = {};
        if (primary) {
          map[primary.descriptor.entityKey] = primary;
        }
        for (const item of secondaryDescriptors) {
          if (item) {
            map[item.descriptor.entityKey] = item;
          }
        }

        const discoveredKeys =
          primary?.relatedMultiSheetEntityKeys ??
          primary?.descriptor?.relatedMultiSheetEntityKeys ??
          [];
        const missingRelatedKeys = discoveredKeys.filter(
          (k) => Boolean(k) && !Object.keys(map).some((existing) => existing.toLowerCase() === k.toLowerCase())
        );
        if (missingRelatedKeys.length > 0) {
          const extraDescriptors = await Promise.all(
            missingRelatedKeys.map((key) =>
              repo.getEntityDescriptor(key, controller.signal).catch(() => null)
            )
          );
          if (cancelled) return;
          for (const item of extraDescriptors) {
            if (item) {
              map[item.descriptor.entityKey] = item;
            }
          }
        }

        const allEntityKeys = Array.from(
          new Set([entityKey, ...Object.keys(map), ...discoveredKeys].filter(Boolean))
        );

        let loadedPresets: DataExchangeSavedPresetDto[] = [];
        try {
          const presetBatches = await Promise.all(
            allEntityKeys.map((key) => repo.listPresets(key, controller.signal))
          );
          if (cancelled) return;
          const seenPresetIds = new Set<string>();
          for (const batch of presetBatches) {
            for (const preset of batch) {
              if (!seenPresetIds.has(preset.id)) {
                seenPresetIds.add(preset.id);
                loadedPresets.push(preset);
              }
            }
          }
        } catch (presetErr) {
          if (!cancelled && !isAbortOrInterceptedError(presetErr)) {
            setErrorBanner(
              getStudioErrorMessage(presetErr, tRef.current("dataExchange.errors.presetsLoadFailed"))
            );
          }
          loadedPresets = [];
        }

        if (cancelled) return;

        setDescriptorByEntity(map);
        setPrimaryDescriptor(primary);
        setPresets(loadedPresets);

        const initialPreset = initialPresetId
          ? loadedPresets.find((p) => p.id === initialPresetId)
          : null;

        if (initialPreset && !initialMultiSheet) {
          setImportMode(initialPreset.importMode);
        } else if (primary?.descriptor.supportedModes.length) {
          const modes = primary.descriptor.supportedModes;
          setImportMode(modes.includes("Upsert") ? "Upsert" : modes[0]);
        }
      } catch (err) {
        if (!cancelled && !isAbortOrInterceptedError(err)) {
          setPrimaryDescriptor(null);
          setErrorBanner(
            getStudioErrorMessage(err, tRef.current("dataExchange.errors.loadMetaFailed"))
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingMeta(false);
        }
      }
    }

    void loadInitialMetadata();

    return () => {
      cancelled = true;
      controller.abort();
      stopPolling();
    };
  }, [
    open,
    entityKey,
    multiSheetEntityKeysKey,
    initialPresetId,
    initialMultiSheet,
    metaRetryNonce,
    repo,
    stopPolling,
    setDescriptorByEntity,
    setErrorBanner,
    setImportMode,
    setIsLoadingMeta,
    setPresets,
    setPrimaryDescriptor,
  ]);

  const inspectUploadedFile = useCallback(
    async (file: File, multiSheetOverride?: boolean) => {
      const validationError = validateUploadFileClientSide(file, t);
      if (validationError) {
        setErrorBanner(validationError);
        return;
      }

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

        const findPresetForEntity = (targetKey: string) => {
          const entityPresets = presets.filter(
            (p) => p.entityKey.toLowerCase() === targetKey.toLowerCase()
          );
          return (
            (initialPresetId ? entityPresets.find((p) => p.id === initialPresetId) : null) ??
            entityPresets.find((p) => p.isDefault)
          );
        };

        const primaryPreset = findPresetForEntity(entityKey);

        const initialSheets: SheetMappingState[] = inspection.sheets
          .filter((s) => !s.isEmpty || inspection.sheets.length === 1)
          .map((sheet) => {
            const targetEntityKey = sheet.suggestedEntityKey || entityKey;
            const sheetDesc =
              descriptorByEntity[targetEntityKey]?.descriptor ??
              Object.values(descriptorByEntity).find(
                (d) => d.descriptor.entityKey.toLowerCase() === targetEntityKey.toLowerCase()
              )?.descriptor;
            const defaultSheetMode = sheetDesc?.supportedModes.includes(importMode)
              ? importMode
              : sheetDesc?.supportedModes[0] ?? "Upsert";
            const sheetPreset = multiFlag ? findPresetForEntity(targetEntityKey) : primaryPreset;

            return {
              sheetName: sheet.sheetName,
              entityKey: targetEntityKey,
              mode: sheetPreset ? sheetPreset.importMode : defaultSheetMode,
              mappings: buildInitialMappingsForSheet(sheet, sheetPreset),
            };
          });

        setSheetStates(initialSheets);
        setActiveSheetName(initialSheets[0]?.sheetName ?? "");
        if (!multiFlag && primaryPreset) {
          setImportMode(primaryPreset.importMode);
          appliedInitialPresetRef.current = primaryPreset.id;
        }
        setStep("mapping");
      } catch (err) {
        if (!isAbortOrInterceptedError(err)) {
          setErrorBanner(getStudioErrorMessage(err, t("dataExchange.errors.inspectFailed")));
        }
      } finally {
        setIsInspecting(false);
      }
    },
    [
      descriptorByEntity,
      entityKey,
      importMode,
      initialPresetId,
      isMultiSheet,
      presets,
      repo,
      t,
      appliedInitialPresetRef,
      setActiveSheetName,
      setDryRunResult,
      setErrorBanner,
      setExecuteResult,
      setImportMode,
      setInfoBanner,
      setInspectResult,
      setIsInspecting,
      setPolledJob,
      setSelectedFile,
      setSheetStates,
      setStep,
    ]
  );

  return { inspectUploadedFile, retryLoadMetadata };
}
