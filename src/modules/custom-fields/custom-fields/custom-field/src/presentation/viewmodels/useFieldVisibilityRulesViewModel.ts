/**
 * Custom Field Visibility Rules ViewModel (Wave 5 row 5.3)
 *
 * Drives the FieldVisibilityRulesDialog administration surface.
 * Wires query and mutation operations for data-driven visibility rules that control
 * when a custom field is shown or hidden on forms based on sibling field values.
 */
"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { toast } from "@core/hooks/use-enhanced-toast";
import { getCustomFieldsContainer } from "../../../../di";
import { CUSTOM_FIELDS_PERMISSIONS } from "../../../../permission-constants";
import type { CustomField } from "../../domain/entities/CustomField";
import type { FieldVisibilityRuleAdmin } from "../../domain/entities/FieldInsight";
import type { FieldVisibilityOperator } from "../../../../custom-field-value/src/domain/fieldVisibility";

export interface FieldVisibilityRuleTarget {
  fieldId: string;
  fieldLabel: string;
  fieldKey: string;
  entityTypeKey: string;
  isRequired: boolean;
}

export function fieldVisibilityRulesQueryKey(fieldId: string) {
  return ["customField", "visibilityRules", fieldId] as const;
}

export function siblingFieldsQueryKey(entityTypeKey: string) {
  return ["customField", "siblingFields", entityTypeKey] as const;
}

/**
 * Builds canonical v1 visibility expression JSON.
 */
export function buildFieldVisibilityExpressionJson(condition: {
  operandFieldKey: string;
  operator: FieldVisibilityOperator;
  value?: unknown;
}): string {
  const isZeroArity = condition.operator === "isEmpty" || condition.operator === "isNotEmpty";

  const visibleWhen: Record<string, unknown> = {
    fieldKey: condition.operandFieldKey.trim(),
    operator: condition.operator,
  };

  if (!isZeroArity && condition.value !== undefined && condition.value !== null) {
    visibleWhen.value = condition.value;
  }

  return JSON.stringify(
    {
      version: 1,
      visibleWhen,
    },
    null,
    2
  );
}

/**
 * Parses expression JSON into component parts or returns null on parse failure.
 */
export function parseFieldVisibilityExpressionJson(expressionJson: string): {
  version: number;
  operandFieldKey: string;
  operator: string;
  value?: unknown;
} | null {
  try {
    const parsed = JSON.parse(expressionJson);
    if (!parsed || parsed.version !== 1 || !parsed.visibleWhen) return null;
    const { fieldKey, operator, value } = parsed.visibleWhen;
    if (!fieldKey || !operator) return null;
    return {
      version: parsed.version,
      operandFieldKey: fieldKey,
      operator,
      value,
    };
  } catch {
    return null;
  }
}

export function useFieldVisibilityRulesViewModel() {
  const { customFieldRepository } = getCustomFieldsContainer();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const [target, setTarget] = useState<FieldVisibilityRuleTarget | null>(null);

  const canView = usePermission(CUSTOM_FIELDS_PERMISSIONS.VISIBILITY_RULE_VIEW);
  const canCreate = usePermission(CUSTOM_FIELDS_PERMISSIONS.VISIBILITY_RULE_CREATE);
  const canUpdate = usePermission(CUSTOM_FIELDS_PERMISSIONS.VISIBILITY_RULE_UPDATE);
  const canDelete = usePermission(CUSTOM_FIELDS_PERMISSIONS.VISIBILITY_RULE_DELETE);

  const openRules = useCallback((field: CustomField) => {
    setTarget({
      fieldId: field.id,
      fieldLabel: field.labelEn || field.key,
      fieldKey: field.key,
      entityTypeKey: field.entityTypeKey,
      isRequired: field.isRequired,
    });
  }, []);

  const closeRules = useCallback(() => {
    setTarget(null);
  }, []);

  // Fetch visibility rules for the targeted field
  const rulesQuery = useQuery({
    queryKey: fieldVisibilityRulesQueryKey(target?.fieldId ?? ""),
    queryFn: () => customFieldRepository.getVisibilityRules(target!.fieldId),
    enabled: target !== null && canView,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });

  // Fetch sibling custom fields for the same entity type (to populate operand dropdown)
  const siblingFieldsQuery = useQuery({
    queryKey: siblingFieldsQueryKey(target?.entityTypeKey ?? ""),
    queryFn: async () => {
      const res = await customFieldRepository.getAll({
        page: 1,
        pageSize: 100,
        entityTypeKey: target!.entityTypeKey,
      });
      return res.items;
    },
    enabled: target !== null,
    staleTime: 1000 * 60 * 5,
  });

  const siblingFieldsData = siblingFieldsQuery.data;
  const siblingFields = useMemo(() => {
    const all = siblingFieldsData ?? [];
    if (!target) return [];
    // Exclude self (a field cannot reference its own key in a visibility rule)
    return all.filter((f) => f.key !== target.fieldKey && f.id !== target.fieldId);
  }, [siblingFieldsData, target]);

  const invalidateAfterChange = useCallback(() => {
    if (!target) return;
    queryClient.invalidateQueries({ queryKey: fieldVisibilityRulesQueryKey(target.fieldId) });
    queryClient.invalidateQueries({ queryKey: ["customField", "usage", target.fieldId] });
  }, [queryClient, target]);

  const createMutation = useMutation({
    mutationFn: (data: { expressionJson: string; priority?: number }) =>
      customFieldRepository.createVisibilityRule({
        customFieldId: target!.fieldId,
        expressionJson: data.expressionJson,
        priority: data.priority ?? 0,
      }),
    onSuccess: () => {
      invalidateAfterChange();
      toast.success(t("customField.visibilityRules.toast.created"));
    },
    onError: (err: Error) => {
      toast.error({
        title: t("customField.visibilityRules.toast.createFailed"),
        description: err.message || undefined,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { expressionJson: string; priority?: number } }) =>
      customFieldRepository.updateVisibilityRule(id, {
        expressionJson: data.expressionJson,
        priority: data.priority ?? 0,
      }),
    onSuccess: () => {
      invalidateAfterChange();
      toast.success(t("customField.visibilityRules.toast.updated"));
    },
    onError: (err: Error) => {
      toast.error({
        title: t("customField.visibilityRules.toast.updateFailed"),
        description: err.message || undefined,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customFieldRepository.deleteVisibilityRule(id),
    onSuccess: () => {
      invalidateAfterChange();
      toast.success(t("customField.visibilityRules.toast.deleted"));
    },
    onError: (err: Error) => {
      toast.error({
        title: t("customField.visibilityRules.toast.deleteFailed"),
        description: err.message || undefined,
      });
    },
  });

  const createRule = useCallback(
    async (expressionJson: string, priority?: number): Promise<boolean> => {
      if (!canCreate) {
        toast.error({ title: t("customField.visibilityRules.toast.permissionDenied") });
        return false;
      }
      try {
        await createMutation.mutateAsync({ expressionJson, priority });
        return true;
      } catch {
        return false;
      }
    },
    [canCreate, createMutation, t]
  );

  const updateRule = useCallback(
    async (id: string, expressionJson: string, priority?: number): Promise<boolean> => {
      if (!canUpdate) {
        toast.error({ title: t("customField.visibilityRules.toast.permissionDenied") });
        return false;
      }
      try {
        await updateMutation.mutateAsync({ id, data: { expressionJson, priority } });
        return true;
      } catch {
        return false;
      }
    },
    [canUpdate, updateMutation, t]
  );

  const deleteRule = useCallback(
    async (id: string): Promise<boolean> => {
      if (!canDelete) {
        toast.error({ title: t("customField.visibilityRules.toast.permissionDenied") });
        return false;
      }
      try {
        await deleteMutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
    [canDelete, deleteMutation, t]
  );

  return {
    target,
    openRules,
    closeRules,

    canView,
    canCreate,
    canUpdate,
    canDelete,

    rules: (rulesQuery.data ?? []) as FieldVisibilityRuleAdmin[],
    isRulesLoading: rulesQuery.isFetching,
    isRulesError: rulesQuery.isError,
    rulesErrorMessage: rulesQuery.error instanceof Error ? rulesQuery.error.message : null,
    refetchRules: rulesQuery.refetch,

    siblingFields,
    isSiblingFieldsLoading: siblingFieldsQuery.isLoading,

    createRule,
    updateRule,
    deleteRule,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
