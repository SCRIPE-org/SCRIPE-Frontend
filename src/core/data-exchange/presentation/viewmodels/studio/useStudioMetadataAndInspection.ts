"use client";

import { useCallback, useEffect, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
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
        const discoveredKeys =
          primary?.relatedMultiSheetEntityKeys ??
          primary?.descriptor?.relatedMultiSheetEntityKeys ??
          [];
        const missingRelatedKeys = discoveredKeys.filter((k) => Boolean(k) && !map[k]);
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
        if (!cancelled) {
          setErrorBanner(getStudioErrorMessage(err, t("dataExchange.errors.loadMetaFailed")));
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
  }, [
    open,
    entityKey,
    multiSheetEntityKeys,
    initialPresetId,
    initialMultiSheet,
    repo,
    stopPolling,
    t,
    setDescriptorByEntity,
    setErrorBanner,
    setImportMode,
    setIsLoadingMeta,
    setPresets,
    setPrimaryDescriptor,
  ]);

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

        const matchedPreset =
          (initialPresetId ? presets.find((p) => p.id === initialPresetId) : null) ??
          presets.find((p) => p.isDefault);

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
              mode: !multiFlag && matchedPreset ? matchedPreset.importMode : defaultSheetMode,
              mappings: buildInitialMappingsForSheet(
                sheet,
                !multiFlag ? matchedPreset : undefined
              ),
            };
          });

        setSheetStates(initialSheets);
        setActiveSheetName(initialSheets[0]?.sheetName ?? "");
        if (!multiFlag && matchedPreset) {
          setImportMode(matchedPreset.importMode);
          appliedInitialPresetRef.current = matchedPreset.id;
        }
        setStep("mapping");
      } catch (err) {
        setErrorBanner(getStudioErrorMessage(err, t("dataExchange.errors.inspectFailed")));
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

  return { inspectUploadedFile };
}
