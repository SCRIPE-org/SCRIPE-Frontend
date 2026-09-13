"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/providers/permission-provider";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { CUSTOM_FIELDS_PERMISSIONS } from "../../../../permission-constants";
import { getCustomFieldsContainer } from "../../../../di";
import type { OptionSet } from "../../domain/entities/OptionSet";
import type { OptionSetVersion } from "../../domain/entities/OptionSetVersion";
import {
  OPTION_SET_QUERY_ROOT,
  optionSetsQueryKey,
  optionSetDetailQueryKey,
} from "../form/optionSetQueryKeys";
import type { OptionSetRefusal } from "../form/optionSetRefusalTypes";
import {
  checkCreateVersionRefusal,
  checkDeleteRefusal,
  checkPublishRefusal,
  checkUpdateRefusal,
} from "../form/optionSetPolicyRules";
import { useOptionSetMutations } from "./useOptionSetMutations";

export {
  OPTION_SET_QUERY_ROOT,
  optionSetsQueryKey,
  optionSetDetailQueryKey,
  optionSetVersionQueryKey,
} from "../form/optionSetQueryKeys";

export {
  reportOptionSetRefusal,
  type OptionSetRefusal,
  type OptionSetRefusalReason,
  type OptionSetTranslate,
} from "../form/optionSetRefusalTypes";

/**
 * Hook providing data fetching, authorization gates, and lifecycle actions for option sets and versions.
 */
export function useOptionSetViewModel(selectedSetId: string | null) {
  const { optionSetRepository } = getCustomFieldsContainer();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const { isInTenantWorld } = useTenantContext();

  const canView = isSuperAdmin || hasPermission(CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_VIEW);
  const canCreate = isSuperAdmin || hasPermission(CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_CREATE);
  const canUpdate = isSuperAdmin || hasPermission(CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_UPDATE);
  const canDelete = isSuperAdmin || hasPermission(CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_DELETE);
  const canPublish = isSuperAdmin || hasPermission(CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_PUBLISH);
  const canBind = isSuperAdmin || hasPermission(CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_BIND);

  const isPlatformContext = isSuperAdmin && !isInTenantWorld;

  const {
    data: sets = [],
    isLoading: isSetsLoading,
    isError: isSetsError,
    refetch: refetchSets,
  } = useQuery({
    queryKey: optionSetsQueryKey(),
    queryFn: () => optionSetRepository.getAll(),
    enabled: canView,
  });

  const {
    data: detail,
    isLoading: isDetailLoading,
    isError: isDetailError,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: optionSetDetailQueryKey(selectedSetId ?? ""),
    queryFn: () => optionSetRepository.getById(selectedSetId as string),
    enabled: canView && !!selectedSetId,
  });

  const versions: OptionSetVersion[] = detail?.versions ?? [];
  const selectedSet: OptionSet | null = detail?.set ?? null;

  const invalidateSets = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: optionSetsQueryKey() });
  }, [queryClient]);

  const invalidateDetail = useCallback(
    (optionSetId: string) => {
      queryClient.invalidateQueries({ queryKey: optionSetDetailQueryKey(optionSetId) });
    },
    [queryClient]
  );

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: OPTION_SET_QUERY_ROOT });
  }, [queryClient]);

  const refuseUpdate = useCallback(
    (set: OptionSet): OptionSetRefusal | null =>
      checkUpdateRefusal(set, canUpdate, isPlatformContext),
    [canUpdate, isPlatformContext]
  );

  const refuseDelete = useCallback(
    (set: OptionSet): OptionSetRefusal | null =>
      checkDeleteRefusal(set, canDelete, isPlatformContext),
    [canDelete, isPlatformContext]
  );

  const refuseCreateVersion = useCallback(
    (set: OptionSet): OptionSetRefusal | null =>
      checkCreateVersionRefusal(set, canCreate, isPlatformContext),
    [canCreate, isPlatformContext]
  );

  const refusePublish = useCallback(
    (set: OptionSet, version: OptionSetVersion): OptionSetRefusal | null =>
      checkPublishRefusal(set, version, canPublish, isPlatformContext),
    [canPublish, isPlatformContext]
  );

  const canUpdateSet = useCallback((set: OptionSet) => refuseUpdate(set) === null, [refuseUpdate]);
  const canDeleteSet = useCallback((set: OptionSet) => refuseDelete(set) === null, [refuseDelete]);
  const canCreateVersionFor = useCallback(
    (set: OptionSet) => refuseCreateVersion(set) === null,
    [refuseCreateVersion]
  );
  const canPublishVersion = useCallback(
    (set: OptionSet, version: OptionSetVersion) => refusePublish(set, version) === null,
    [refusePublish]
  );

  const describeRefusal = useCallback(
    (refusal: OptionSetRefusal) => t(refusal.messageKey, refusal.params),
    [t]
  );

  const {
    createSet,
    updateSet,
    deleteSet,
    createVersion,
    publishVersion,
    isSaving,
    isDeleting,
    isCreatingVersion,
    isPublishing,
  } = useOptionSetMutations({
    canCreate,
    refuseUpdate,
    refuseDelete,
    refuseCreateVersion,
    refusePublish,
    invalidateSets,
    invalidateDetail,
    invalidateAll,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const startCreate = useCallback(() => {
    setEditingId(null);
    setIsCreating(true);
  }, []);

  const startEdit = useCallback((id: string) => {
    setIsCreating(false);
    setEditingId(id);
  }, []);

  const closeEditor = useCallback(() => {
    setIsCreating(false);
    setEditingId(null);
  }, []);

  const editingSet = useMemo(
    () => (editingId ? (sets.find((set) => set.id === editingId) ?? null) : null),
    [editingId, sets]
  );

  return {
    sets,
    isSetsLoading,
    isSetsError,
    refetchSets,
    detail,
    selectedSet,
    versions,
    isDetailLoading,
    isDetailError,
    refetchDetail,
    isPlatformContext,
    isSuperAdmin,
    canView,
    canCreate,
    canUpdate,
    canDelete,
    canPublish,
    canBind,
    canUpdateSet,
    canDeleteSet,
    canCreateVersionFor,
    canPublishVersion,
    refuseUpdate,
    refuseDelete,
    refuseCreateVersion,
    refusePublish,
    describeRefusal,
    createSet,
    updateSet,
    deleteSet,
    createVersion,
    publishVersion,
    isSaving,
    isDeleting,
    isCreatingVersion,
    isPublishing,
    editingId,
    editingSet,
    isCreating,
    startCreate,
    startEdit,
    closeEditor,
  };
}
