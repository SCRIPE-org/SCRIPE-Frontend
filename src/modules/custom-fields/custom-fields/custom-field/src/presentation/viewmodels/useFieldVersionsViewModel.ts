/**
 * Custom Field Definition Versions & Drafts ViewModel (Step 1.3)
 *
 * Drives the FieldVersionHistoryDrawer administration surface.
 * Wires query and mutation operations for definition version lifecycle:
 * - View version chain (Draft, Published, Deprecated, Archived)
 * - Mint new draft from published live version
 * - Publish active draft (with rule loss checks and automatic incumbent deprecation)
 * - Discard active draft
 */
"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { toast } from "@core/hooks/use-enhanced-toast";
import { getCustomFieldsContainer } from "../../../../di";
import { CUSTOM_FIELDS_PERMISSIONS } from "../../../../permission-constants";
import type { CustomField } from "../../domain/entities/CustomField";

export interface FieldVersionsTarget {
  fieldId: string;
  fieldLabel: string;
  fieldKey: string;
  entityTypeKey: string;
  isGlobal?: boolean;
}

export function fieldVersionsQueryKey(fieldId: string) {
  return ["customField", "versions", fieldId] as const;
}

export function useFieldVersionsViewModel() {
  const { customFieldRepository } = getCustomFieldsContainer();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const [target, setTarget] = useState<FieldVersionsTarget | null>(null);

  const canView = usePermission(CUSTOM_FIELDS_PERMISSIONS.CUSTOM_FIELD_VIEW);
  const canPublish = usePermission(CUSTOM_FIELDS_PERMISSIONS.CUSTOM_FIELD_PUBLISH);

  const versionsQuery = useQuery({
    queryKey: fieldVersionsQueryKey(target?.fieldId ?? ""),
    queryFn: () => customFieldRepository.getVersions(target!.fieldId),
    enabled: !!target?.fieldId && canView,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });

  const createDraftMutation = useMutation({
    mutationFn: (fieldId: string) => customFieldRepository.createFieldVersionDraft(fieldId),
    onSuccess: (result) => {
      toast.success(
        t("customField.versions.createDraftSuccess", {
          version: result.versionNumber,
          options: result.optionsCopied,
          rules: result.rulesCopied,
          defaultValue: `Draft v${result.versionNumber} created (${result.optionsCopied} options, ${result.rulesCopied} rules copied).`,
        })
      );
      if (target?.fieldId) {
        queryClient.invalidateQueries({
          queryKey: fieldVersionsQueryKey(target.fieldId),
        });
      }
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        t("customField.versions.createDraftError", {
          defaultValue: "Failed to create draft version.",
        });
      toast.error(message);
    },
  });

  const publishMutation = useMutation({
    mutationFn: (fieldId: string) => customFieldRepository.publishFieldVersion(fieldId),
    onSuccess: (result) => {
      toast.success(
        t("customField.versions.publishSuccess", {
          version: result.versionNumber,
          defaultValue: `Version v${result.versionNumber} is now live and published.`,
        })
      );
      if (target?.fieldId) {
        queryClient.invalidateQueries({
          queryKey: fieldVersionsQueryKey(target.fieldId),
        });
        queryClient.invalidateQueries({
          queryKey: ["customFields"],
        });
        queryClient.invalidateQueries({
          queryKey: ["customField", "visibilityRules", target.fieldId],
        });
      }
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        t("customField.versions.publishError", {
          defaultValue: "Failed to publish draft version.",
        });
      toast.error(message);
    },
  });

  const discardMutation = useMutation({
    mutationFn: (fieldId: string) => customFieldRepository.discardFieldVersionDraft(fieldId),
    onSuccess: (result) => {
      toast.success(
        t("customField.versions.discardSuccess", {
          version: result.versionNumber,
          defaultValue: `Draft v${result.versionNumber} has been discarded.`,
        })
      );
      if (target?.fieldId) {
        queryClient.invalidateQueries({
          queryKey: fieldVersionsQueryKey(target.fieldId),
        });
      }
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        t("customField.versions.discardError", {
          defaultValue: "Failed to discard draft version.",
        });
      toast.error(message);
    },
  });

  const openVersions = useCallback((field: CustomField | FieldVersionsTarget) => {
    const isCustomField = "id" in field;
    setTarget({
      fieldId: isCustomField ? field.id : field.fieldId,
      fieldLabel: isCustomField ? (field.labelEn || field.key) : field.fieldLabel,
      fieldKey: isCustomField ? field.key : field.fieldKey,
      entityTypeKey: field.entityTypeKey,
      isGlobal: isCustomField ? field.isGlobal : (field as FieldVersionsTarget).isGlobal,
    });
  }, []);

  const closeVersions = useCallback(() => {
    setTarget(null);
  }, []);

  const handleCreateDraft = useCallback(async () => {
    if (!target?.fieldId) return;
    await createDraftMutation.mutateAsync(target.fieldId);
  }, [target, createDraftMutation]);

  const handlePublish = useCallback(async () => {
    if (!target?.fieldId) return;
    await publishMutation.mutateAsync(target.fieldId);
  }, [target, publishMutation]);

  const handleDiscard = useCallback(async () => {
    if (!target?.fieldId) return;
    await discardMutation.mutateAsync(target.fieldId);
  }, [target, discardMutation]);

  return {
    target,
    isOpen: target !== null,
    canView,
    canPublish,
    versionsData: versionsQuery.data ?? null,
    isLoading: versionsQuery.isLoading,
    isRefetching: versionsQuery.isRefetching,
    isCreatingDraft: createDraftMutation.isPending,
    isPublishing: publishMutation.isPending,
    isDiscarding: discardMutation.isPending,
    isMutating:
      createDraftMutation.isPending || publishMutation.isPending || discardMutation.isPending,
    openVersions,
    closeVersions,
    handleCreateDraft,
    handlePublish,
    handleDiscard,
    refetch: versionsQuery.refetch,
  };
}
