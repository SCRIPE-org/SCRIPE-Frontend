"use client";

import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "@core/hooks/use-enhanced-toast";
import { getCustomFieldsContainer } from "../../../../di";
import type { OptionSet } from "../../domain/entities/OptionSet";
import type { OptionSetVersion } from "../../domain/entities/OptionSetVersion";
import type {
  CreateOptionSetInput,
  UpdateOptionSetInput,
  OptionSetItemInput,
} from "../../domain/interfaces/IOptionSetRepository";
import {
  reportOptionSetRefusal,
  type OptionSetRefusal,
} from "../form/optionSetRefusalTypes";

export interface UseOptionSetMutationsProps {
  canCreate: boolean;
  refuseUpdate: (set: OptionSet) => OptionSetRefusal | null;
  refuseDelete: (set: OptionSet) => OptionSetRefusal | null;
  refuseCreateVersion: (set: OptionSet) => OptionSetRefusal | null;
  refusePublish: (set: OptionSet, version: OptionSetVersion) => OptionSetRefusal | null;
  invalidateSets: () => void;
  invalidateDetail: (id: string) => void;
  invalidateAll: () => void;
}

/**
 * Mutation operations and action handlers for option sets and option set versions.
 * Handles server persistence, cache invalidation, and user-facing notifications.
 */
export function useOptionSetMutations({
  canCreate,
  refuseUpdate,
  refuseDelete,
  refuseCreateVersion,
  refusePublish,
  invalidateSets,
  invalidateDetail,
  invalidateAll,
}: UseOptionSetMutationsProps) {
  const { optionSetRepository } = getCustomFieldsContainer();
  const { t } = useI18n();

  const createMutation = useMutation({
    mutationFn: (input: CreateOptionSetInput) => optionSetRepository.create(input),
    onSuccess: () => {
      invalidateSets();
      toast.success(t("optionSet.toast.created"));
    },
    onError: (err: Error) => {
      toast.error({
        title: t("optionSet.toast.createFailed"),
        description: err.message || undefined,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateOptionSetInput }) =>
      optionSetRepository.update(id, input),
    onSuccess: (_data, variables) => {
      invalidateSets();
      invalidateDetail(variables.id);
      toast.success(t("optionSet.toast.updated"));
    },
    onError: (err: Error) => {
      toast.error({
        title: t("optionSet.toast.updateFailed"),
        description: err.message || undefined,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => optionSetRepository.delete(id),
    onSuccess: () => {
      invalidateAll();
      toast.success(t("optionSet.toast.deleted"));
    },
    onError: (err: Error) => {
      toast.error({
        title: t("optionSet.toast.deleteFailed"),
        description: err.message || undefined,
      });
    },
  });

  const createVersionMutation = useMutation({
    mutationFn: ({ optionSetId, items }: { optionSetId: string; items: OptionSetItemInput[] }) =>
      optionSetRepository.createVersion(optionSetId, items),
    onSuccess: (_data, variables) => {
      invalidateDetail(variables.optionSetId);
      invalidateSets();
      toast.success(t("optionSet.toast.versionCreated"));
    },
    onError: (err: Error) => {
      toast.error({
        title: t("optionSet.toast.versionCreateFailed"),
        description: err.message || undefined,
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: ({ versionId }: { versionId: string; versionNumber: number }) =>
      optionSetRepository.publishVersion(versionId),
    onSuccess: (_data, variables) => {
      invalidateAll();
      toast.success(t("optionSet.toast.published", { number: variables.versionNumber }));
    },
    onError: (err: Error) => {
      toast.error({
        title: t("optionSet.toast.publishFailed"),
        description: err.message || undefined,
      });
    },
  });

  const createSet = useCallback(
    async (input: CreateOptionSetInput): Promise<string | null> => {
      if (!canCreate) {
        reportOptionSetRefusal(
          { reason: "permission", messageKey: "optionSet.permissions.create" },
          t
        );
        return null;
      }
      try {
        return await createMutation.mutateAsync(input);
      } catch {
        return null;
      }
    },
    [canCreate, createMutation, t]
  );

  const updateSet = useCallback(
    async (set: OptionSet, input: UpdateOptionSetInput): Promise<boolean> => {
      const refusal = refuseUpdate(set);
      if (refusal) {
        reportOptionSetRefusal(refusal, t);
        return false;
      }
      try {
        await updateMutation.mutateAsync({ id: set.id, input });
        return true;
      } catch {
        return false;
      }
    },
    [refuseUpdate, updateMutation, t]
  );

  const deleteSet = useCallback(
    async (set: OptionSet): Promise<boolean> => {
      const refusal = refuseDelete(set);
      if (refusal) {
        reportOptionSetRefusal(refusal, t);
        return false;
      }
      try {
        await deleteMutation.mutateAsync(set.id);
        return true;
      } catch {
        return false;
      }
    },
    [refuseDelete, deleteMutation, t]
  );

  const createVersion = useCallback(
    async (set: OptionSet, items: OptionSetItemInput[]): Promise<string | null> => {
      const refusal = refuseCreateVersion(set);
      if (refusal) {
        reportOptionSetRefusal(refusal, t);
        return null;
      }
      if (items.length === 0) {
        reportOptionSetRefusal(
          { reason: "emptyVersion", messageKey: "optionSet.items.validation.atLeastOne" },
          t
        );
        return null;
      }
      try {
        return await createVersionMutation.mutateAsync({ optionSetId: set.id, items });
      } catch {
        return null;
      }
    },
    [refuseCreateVersion, createVersionMutation, t]
  );

  const publishVersion = useCallback(
    async (set: OptionSet, version: OptionSetVersion): Promise<boolean> => {
      const refusal = refusePublish(set, version);
      if (refusal) {
        reportOptionSetRefusal(refusal, t);
        return false;
      }
      try {
        await publishMutation.mutateAsync({
          versionId: version.id,
          versionNumber: version.versionNumber,
        });
        return true;
      } catch {
        return false;
      }
    },
    [refusePublish, publishMutation, t]
  );

  return {
    createSet,
    updateSet,
    deleteSet,
    createVersion,
    publishVersion,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isCreatingVersion: createVersionMutation.isPending,
    isPublishing: publishMutation.isPending,
  };
}
