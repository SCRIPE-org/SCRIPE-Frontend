"use client";

import { useCallback, useEffect, useState, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import type { IDataExchangeRepository } from "../../../domain/interfaces/IDataExchangeRepository";
import type {
  DataExchangeColumnMapping,
  DataExchangeDryRunResponseDto,
  DataExchangeImportMode,
  DataExchangeInspectedSheetDto,
  DataExchangeSavedPresetDto,
} from "../../../domain/types";
import {
  buildInitialMappingsForSheet,
  createDefaultTransform,
  getStudioErrorMessage,
  type SheetMappingState,
} from "./studio-viewmodel.helpers";

interface UseStudioPresetsAndMappingParams {
  repo: IDataExchangeRepository;
  t: (key: string, params?: Record<string, string | number>) => string;
  initialPresetId?: string;
  appliedInitialPresetRef: MutableRefObject<string | null>;
  activeSheet: DataExchangeInspectedSheetDto | null;
  activeSheetState: SheetMappingState | null;
  presets: DataExchangeSavedPresetDto[];
  setPresets: Dispatch<SetStateAction<DataExchangeSavedPresetDto[]>>;
  importMode: DataExchangeImportMode;
  setImportMode: Dispatch<SetStateAction<DataExchangeImportMode>>;
  setSheetStates: Dispatch<SetStateAction<SheetMappingState[]>>;
  setDryRunResult: Dispatch<SetStateAction<DataExchangeDryRunResponseDto | null>>;
  setErrorBanner: Dispatch<SetStateAction<string | null>>;
  setInfoBanner: Dispatch<SetStateAction<string | null>>;
}

/**
 * Manages sheet/column mapping mutations and saved preset operations
 * for Data Exchange Studio.
 */
export function useStudioPresetsAndMapping({
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
}: UseStudioPresetsAndMappingParams) {
  const [presetNameInput, setPresetNameInput] = useState<string>("");
  const [isSavingPreset, setIsSavingPreset] = useState(false);

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
    [setDryRunResult, setSheetStates]
  );

  const updateSheetMeta = useCallback(
    (sheetName: string, patch: Partial<Pick<SheetMappingState, "entityKey" | "mode">>) => {
      setDryRunResult(null);
      setSheetStates((prev) =>
        prev.map((s) => (s.sheetName === sheetName ? { ...s, ...patch } : s))
      );
    },
    [setDryRunResult, setSheetStates]
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
  }, [activeSheet, setDryRunResult, setSheetStates]);

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
    [activeSheet, setDryRunResult, setImportMode, setInfoBanner, setSheetStates, t]
  );

  useEffect(() => {
    if (!initialPresetId || !activeSheet || presets.length === 0) return;
    if (appliedInitialPresetRef.current === initialPresetId) return;
    const match = presets.find((p) => p.id === initialPresetId);
    if (match) {
      appliedInitialPresetRef.current = initialPresetId;
      applyPreset(match);
    }
  }, [initialPresetId, presets, activeSheet, applyPreset, appliedInitialPresetRef]);

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
      setErrorBanner(getStudioErrorMessage(err, t("dataExchange.errors.savePresetFailed")));
    } finally {
      setIsSavingPreset(false);
    }
  }, [activeSheetState, importMode, presetNameInput, repo, setErrorBanner, setInfoBanner, setPresets, t]);

  const removePreset = useCallback(
    async (id: string) => {
      setErrorBanner(null);
      try {
        await repo.deletePreset(id);
        setPresets((prev) => prev.filter((p) => p.id !== id));
        setInfoBanner(t("dataExchange.mapping.presetDeleted"));
      } catch (err) {
        setErrorBanner(
          getStudioErrorMessage(err, t("dataExchange.errors.deletePresetFailed"))
        );
      }
    },
    [repo, setErrorBanner, setInfoBanner, setPresets, t]
  );

  return {
    presetNameInput,
    setPresetNameInput,
    isSavingPreset,
    updateColumnMapping,
    updateSheetMeta,
    reAutoMapActiveSheet,
    applyPreset,
    saveCurrentPreset,
    removePreset,
  };
}
