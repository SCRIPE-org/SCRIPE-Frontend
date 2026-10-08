"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/providers/permission-provider";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { toast } from "@core/hooks/use-enhanced-toast";
import { CUSTOM_FIELDS_PERMISSIONS } from "../../../../permission-constants";
import { getCustomFieldsContainer } from "../../../../di";
import type { OptionSet } from "../../domain/entities/OptionSet";
import type { OptionSetVersion } from "../../domain/entities/OptionSetVersion";
import type { OptionSetItemInput } from "../../domain/interfaces/IOptionSetRepository";
import {
  collectOptionSetItemIssues,
  optionSetItemIssueMessageKey,
  toOptionSetItemInputs,
  type OptionSetItemIssue,
} from "../form/optionSetItemRules";
import {
  optionSetDetailQueryKey,
  optionSetVersionQueryKey,
  reportOptionSetRefusal,
  type OptionSetRefusal,
} from "./useOptionSetViewModel";
import {
  createEmptyOptionSetItemDraft,
  toOptionSetItemDraft,
  type OptionSetItemDraft,
  type OptionSetItemDraftChanges,
} from "../form/optionSetItemDraftTypes";
import { evaluateOptionSetVersionSaveRefusal } from "../form/optionSetVersionEditorRefusal";

export {
  OPTION_SET_ITEM_COLOR_MAX_LENGTH,
  OPTION_SET_ITEM_ICON_KEY_MAX_LENGTH,
  OPTION_SET_ITEM_KEY_MAX_LENGTH,
  OPTION_SET_ITEM_LABEL_MAX_LENGTH,
  collectOptionSetItemIssues,
  optionSetItemIssueMessageKey,
  toOptionSetItemInputs,
  type OptionSetItemIssue,
  type OptionSetItemIssueCode,
  type OptionSetItemRuleRow,
} from "../form/optionSetItemRules";

export {
  createEmptyOptionSetItemDraft,
  toOptionSetItemDraft,
  type OptionSetItemDraft,
  type OptionSetItemDraftChanges,
} from "../form/optionSetItemDraftTypes";

/**
 * Documentation for module export
 */
export interface UseOptionSetVersionEditorArgs {
  set: OptionSet | null;
  version: OptionSetVersion | null;
  onSaved?: (versionId: string) => void;
}

/**
 * Documentation for useOptionSetVersionEditor
 */
export function useOptionSetVersionEditor({
  set,
  version,
  onSaved,
}: UseOptionSetVersionEditorArgs) {
  const { optionSetRepository } = getCustomFieldsContainer();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const { isInTenantWorld } = useTenantContext();

  const canUpdate = hasPermission(CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_UPDATE);
  const isPlatformContext = isSuperAdmin && !isInTenantWorld;

  const [rows, setRows] = useState<OptionSetItemDraft[]>([]);
  const [baseline, setBaseline] = useState<OptionSetItemDraft[]>([]);
  const [hydratedVersionId, setHydratedVersionId] = useState<string | null>(null);

  const nextVersionId = version?.id ?? null;
  if (nextVersionId !== hydratedVersionId) {
    if (version?.hasLoadedItems) {
      const hydrated = [...version.items]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(toOptionSetItemDraft);
      setRows(hydrated);
      setBaseline(hydrated);
      setHydratedVersionId(version.id);
    } else if (hydratedVersionId !== null) {
      setHydratedVersionId(null);
      if (rows.length > 0) setRows([]);
      if (baseline.length > 0) setBaseline([]);
    }
  }

  const isReady = version !== null && version.hasLoadedItems && hydratedVersionId === version.id;
  const payload = useMemo(() => toOptionSetItemInputs(rows), [rows]);

  const isDirty = useMemo(
    () => JSON.stringify(payload) !== JSON.stringify(toOptionSetItemInputs(baseline)),
    [payload, baseline]
  );

  const issues = useMemo(() => collectOptionSetItemIssues(rows), [rows]);
  const isValid = issues.length === 0;

  const rowIssues = useMemo(() => {
    const byRow: Record<string, OptionSetItemIssue[]> = {};
    for (const issue of issues) {
      if (issue.rowId === null) continue;
      (byRow[issue.rowId] ??= []).push(issue);
    }
    return byRow;
  }, [issues]);

  const listIssues = useMemo(() => issues.filter((issue) => issue.rowId === null), [issues]);

  const describeIssue = useCallback(
    (issue: OptionSetItemIssue) => t(optionSetItemIssueMessageKey(issue.code), issue.params),
    [t]
  );

  const addItem = useCallback(() => {
    setRows((current) => [...current, createEmptyOptionSetItemDraft()]);
  }, []);

  const removeItem = useCallback((rowId: string) => {
    setRows((current) => current.filter((row) => row.rowId !== rowId));
  }, []);

  const updateItem = useCallback((rowId: string, changes: OptionSetItemDraftChanges) => {
    setRows((current) =>
      current.map((row) => (row.rowId === rowId ? { ...row, ...changes } : row))
    );
  }, []);

  const deactivateItem = useCallback((rowId: string) => {
    setRows((current) =>
      current.map((row) => (row.rowId === rowId ? { ...row, status: "Deactivated" } : row))
    );
  }, []);

  const reactivateItem = useCallback((rowId: string) => {
    setRows((current) =>
      current.map((row) => (row.rowId === rowId ? { ...row, status: "Active" } : row))
    );
  }, []);

  const indexOfRow = useCallback(
    (rowId: string) => rows.findIndex((row) => row.rowId === rowId),
    [rows]
  );

  const canMoveUp = useCallback((rowId: string) => indexOfRow(rowId) > 0, [indexOfRow]);

  const rowCount = rows.length;

  const canMoveDown = useCallback(
    (rowId: string) => {
      const index = indexOfRow(rowId);
      return index >= 0 && index < rowCount - 1;
    },
    [indexOfRow, rowCount]
  );

  const swap = useCallback((index: number, targetIndex: number) => {
    setRows((current) => {
      if (index < 0 || targetIndex < 0) return current;
      if (index >= current.length || targetIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }, []);

  const moveUp = useCallback(
    (rowId: string) => {
      const index = indexOfRow(rowId);
      if (index <= 0) return;
      swap(index, index - 1);
    },
    [indexOfRow, swap]
  );

  const moveDown = useCallback(
    (rowId: string) => {
      const index = indexOfRow(rowId);
      if (index < 0 || index >= rowCount - 1) return;
      swap(index, index + 1);
    },
    [indexOfRow, rowCount, swap]
  );

  const moveBefore = useCallback((draggedRowId: string, targetRowId: string) => {
    if (draggedRowId === targetRowId) return;
    setRows((current) => {
      const from = current.findIndex((row) => row.rowId === draggedRowId);
      const to = current.findIndex((row) => row.rowId === targetRowId);
      if (from < 0 || to < 0) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setRows(baseline);
  }, [baseline]);

  const saveMutation = useMutation({
    mutationFn: ({ versionId, items }: { versionId: string; items: OptionSetItemInput[] }) =>
      optionSetRepository.updateVersion(versionId, items),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: optionSetVersionQueryKey(variables.versionId) });
      if (set) {
        queryClient.invalidateQueries({ queryKey: optionSetDetailQueryKey(set.id) });
      }
      toast.success(t("optionSet.toast.versionSaved"));
    },
    onError: (err: Error) => {
      toast.error({
        title: t("optionSet.toast.versionSaveFailed"),
        description: err.message || undefined,
      });
    },
  });

  const saveRefusal = useMemo(
    (): OptionSetRefusal | null =>
      evaluateOptionSetVersionSaveRefusal({
        canUpdate,
        set,
        isPlatformContext,
        version,
        isReady,
        issues,
      }),
    [canUpdate, set, isPlatformContext, version, isReady, issues]
  );

  const canSave = saveRefusal === null && isDirty && !saveMutation.isPending;

  const save = useCallback(async (): Promise<boolean> => {
    if (saveRefusal) {
      reportOptionSetRefusal(saveRefusal, t);
      return false;
    }
    if (!version) return false;
    if (!isDirty) return true;

    try {
      await saveMutation.mutateAsync({ versionId: version.id, items: payload });
      setBaseline(rows);
      onSaved?.(version.id);
      return true;
    } catch {
      return false;
    }
  }, [saveRefusal, version, isDirty, saveMutation, payload, rows, onSaved, t]);

  return {
    rows,
    isReady,
    isDirty,
    payload,
    issues,
    rowIssues,
    listIssues,
    isValid,
    describeIssue,
    addItem,
    removeItem,
    updateItem,
    deactivateItem,
    reactivateItem,
    reset,
    canMoveUp,
    canMoveDown,
    moveUp,
    moveDown,
    moveBefore,
    save,
    canSave,
    saveRefusal,
    isSaving: saveMutation.isPending,
  };
}
