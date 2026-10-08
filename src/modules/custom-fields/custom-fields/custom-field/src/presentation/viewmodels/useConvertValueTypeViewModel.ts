/**
 * Value-Type Conversion ViewModel (Wave 6 row 6.2)
 *
 * Drives ConvertValueTypeDialog.
 * Manages classification preview, explicit lossy confirmation gating,
 * dry-run refusal inspection, execution, and rollback.
 */
"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { toast } from "@core/hooks/use-enhanced-toast";
import { getCustomFieldsContainer } from "../../../../di";
import { CUSTOM_FIELDS_PERMISSIONS } from "../../../../permission-constants";
import type { CustomField } from "../../domain/entities/CustomField";
import type {
  ChangeFieldTypeResult,
  RollbackFieldTypeChangeResult,
} from "../../domain/entities/FieldInsight";
import {
  classifyValueTypeConversion,
  isConversionLossy,
} from "../../domain/valueTypeConversion";

/**
 * Documentation for module export
 */
export interface ConvertValueTypeTarget {
  fieldId: string;
  fieldKey: string;
  fieldLabel: string;
  currentType: string;
}

/**
 * Documentation for [
 */
export const ALL_CUSTOM_FIELD_VALUE_TYPES = [
  "Text",
  "Number",
  "Date",
  "DateTime",
  "Checkbox",
  "Select",
  "MultiSelect",
  "LongText",
  "Email",
  "Url",
  "Phone",
  "Percent",
  "Rating",
  "Currency",
  "Time",
  "EntityReference",
  "Color",
  "RichText",
  "File",
] as const;

/**
 * Documentation for module export
 */
export function useConvertValueTypeViewModel() {
  const { customFieldRepository } = getCustomFieldsContainer();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const [target, setTarget] = useState<ConvertValueTypeTarget | null>(null);
  const [selectedTargetType, setSelectedTargetType] = useState<string>("");
  const [confirmDataLoss, setConfirmDataLoss] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<ChangeFieldTypeResult | null>(null);
  const [lastRollbackResult, setLastRollbackResult] =
    useState<RollbackFieldTypeChangeResult | null>(null);

  const canUpdate = usePermission(CUSTOM_FIELDS_PERMISSIONS.CUSTOM_FIELD_UPDATE);

  const openConvert = useCallback((field: CustomField) => {
    setTarget({
      fieldId: field.id,
      fieldKey: field.key,
      fieldLabel: field.labelEn || field.key,
      currentType: field.valueType || "Text",
    });
    setSelectedTargetType("");
    setConfirmDataLoss(false);
    setLastResult(null);
    setLastRollbackResult(null);
  }, []);

  const closeConvert = useCallback(() => {
    setTarget(null);
    setSelectedTargetType("");
    setConfirmDataLoss(false);
    setLastResult(null);
    setLastRollbackResult(null);
  }, []);

  const currentType = target?.currentType;
  const conversionKind =
    currentType && selectedTargetType
      ? classifyValueTypeConversion(currentType, selectedTargetType)
      : null;

  const isLossy =
    currentType && selectedTargetType
      ? isConversionLossy(currentType, selectedTargetType)
      : false;

  const canExecute = useMemo(() => {
    if (!canUpdate || !target || !selectedTargetType) return false;
    if (conversionKind === "NoChange" || conversionKind === "Impossible") return false;
    if (conversionKind === "Lossy" && !confirmDataLoss) return false;
    return true;
  }, [canUpdate, target, selectedTargetType, conversionKind, confirmDataLoss]);

  const invalidateCaches = useCallback(() => {
    if (!target) return;
    queryClient.invalidateQueries({ queryKey: ["customFields"] });
    queryClient.invalidateQueries({ queryKey: ["customField", target.fieldId] });
    queryClient.invalidateQueries({ queryKey: ["customField", "usage", target.fieldId] });
    queryClient.invalidateQueries({ queryKey: ["customField", "history", target.fieldId] });
  }, [queryClient, target]);

  const changeTypeMutation = useMutation({
    mutationFn: async () => {
      if (!target) throw new Error("No target field selected");
      return customFieldRepository.changeFieldType(target.fieldId, {
        targetType: selectedTargetType,
        confirmDataLoss,
      });
    },
    onSuccess: (res: ChangeFieldTypeResult) => {
      setLastResult(res);
      if (res.applied) {
        invalidateCaches();
        toast.success(
          t("customField.convertValueType.toast.applied", {
            converted: res.converted,
            examined: res.examined,
          })
        );
      } else {
        toast.warning(
          t("customField.convertValueType.toast.refused", {
            refusals: res.totalRefusals,
          })
        );
      }
    },
    onError: (err: Error) => {
      toast.error({
        title: t("customField.convertValueType.toast.failed"),
        description: err.message || undefined,
      });
    },
  });

  const rollbackMutation = useMutation({
    mutationFn: async (jobRunId: string) => {
      return customFieldRepository.rollbackFieldTypeChange(jobRunId);
    },
    onSuccess: (res: RollbackFieldTypeChangeResult) => {
      setLastRollbackResult(res);
      invalidateCaches();

      // A 200 means the rollback RAN, not that it restored everything. The command counts the
      // snapshots it could not act on and returns them rather than failing the call, so treating
      // any 200 as success is what would tell an operator their data is back while converted
      // values remain in place -- see RollbackFieldTypeChangeResult's own doc comment.
      const skipped = res.valuesGone + res.unreadable;
      if (skipped > 0) {
        toast.warning(
          t("customField.convertValueType.toast.rollbackPartial", {
            restored: res.restored,
            snapshotsFound: res.snapshotsFound,
            skipped,
          })
        );
        return;
      }

      toast.success(
        t("customField.convertValueType.toast.rollbackSuccess", {
          restored: res.restored,
        })
      );
    },
    onError: (err: Error) => {
      toast.error({
        title: t("customField.convertValueType.toast.rollbackFailed"),
        description: err.message || undefined,
      });
    },
  });

  const executeConvert = useCallback(async () => {
    if (!canExecute) return;
    await changeTypeMutation.mutateAsync();
  }, [canExecute, changeTypeMutation]);

  const executeRollback = useCallback(
    async (jobRunId: string) => {
      if (!canUpdate) return;
      await rollbackMutation.mutateAsync(jobRunId);
    },
    [canUpdate, rollbackMutation]
  );

  return {
    target,
    openConvert,
    closeConvert,
    selectedTargetType,
    setSelectedTargetType,
    confirmDataLoss,
    setConfirmDataLoss,
    conversionKind,
    isLossy,
    canExecute,
    canUpdate,
    executeConvert,
    isConverting: changeTypeMutation.isPending,
    lastResult,
    executeRollback,
    isRollingBack: rollbackMutation.isPending,
    lastRollbackResult,
    availableTargetTypes: ALL_CUSTOM_FIELD_VALUE_TYPES,
  };
}
