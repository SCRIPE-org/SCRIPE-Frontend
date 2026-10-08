/**
 * FieldGroup ViewModel
 *
 * State management for the Field Groups admin screen: entity type discovery,
 * entity-type scoped group lists, and CRUD operations (create, update, delete, reorder).
 */
"use client";

import { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/providers/permission-provider";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { toast } from "@core/hooks/use-enhanced-toast";
import { getCustomFieldsContainer } from "../../../../di";
import type { FieldGroup } from "../../domain/entities/FieldGroup";
import type {
  CreateFieldGroupInput,
  UpdateFieldGroupInput,
} from "../../domain/interfaces/IFieldGroupRepository";
import { useFieldGroupReorder, REORDER_MAX_ITEMS } from "./useFieldGroupReorder";

export { REORDER_MAX_ITEMS };

/**
 * Query key for one entity type's groups. Shared between field group views and pickers.
 */
export function fieldGroupsQueryKey(entityTypeKey: string) {
  return ["customFields", "fieldGroups", entityTypeKey] as const;
}

/**
 * Hook providing data fetching, mutations, and editor state for field groups of a given entity type.
 */
export function useFieldGroupViewModel(entityTypeKey: string) {
  const { fieldGroupRepository, customFieldRepository } = getCustomFieldsContainer();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { isSuperAdmin } = usePermissions();
  const { isInTenantWorld } = useTenantContext();

  /**
   * Super Admins operating outside a tenant scope act in platform context.
   * Entities created in this context are platform-owned.
   */
  const isPlatformContext = isSuperAdmin && !isInTenantWorld;

  /**
   * Determines whether the current user has permission to mutate a given group.
   * Tenant administrators can mutate tenant-owned groups, while platform groups require platform context.
   */
  const canMutate = useCallback(
    (group: FieldGroup) => isPlatformContext || !group.isGlobal,
    [isPlatformContext]
  );

  const {
    data: entityTypes = [],
    isLoading: isEntityTypesLoading,
    isError: isEntityTypesError,
    refetch: refetchEntityTypes,
  } = useQuery({
    queryKey: ["customFields", "entityTypes"],
    queryFn: () => customFieldRepository.getEntityTypes(),
    staleTime: 1000 * 60 * 60,
  });

  const {
    data: groups = [],
    isLoading: isGroupsLoading,
    isError: isGroupsError,
    refetch: refetchGroups,
  } = useQuery({
    queryKey: fieldGroupsQueryKey(entityTypeKey),
    queryFn: () => fieldGroupRepository.getByEntityType(entityTypeKey),
    enabled: entityTypeKey.length > 0,
  });

  const invalidateGroups = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: fieldGroupsQueryKey(entityTypeKey) });
  }, [queryClient, entityTypeKey]);

  const createMutation = useMutation({
    mutationFn: (input: CreateFieldGroupInput) => fieldGroupRepository.create(input),
    onSuccess: () => {
      invalidateGroups();
      toast.success(t("fieldGroup.toast.created"));
    },
    onError: (err: Error) => {
      toast.error({
        title: t("fieldGroup.toast.createFailed"),
        description: err.message || undefined,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFieldGroupInput }) =>
      fieldGroupRepository.update(id, input),
    onSuccess: () => {
      invalidateGroups();
      toast.success(t("fieldGroup.toast.updated"));
    },
    onError: (err: Error) => {
      toast.error({
        title: t("fieldGroup.toast.updateFailed"),
        description: err.message || undefined,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fieldGroupRepository.delete(id),
    onSuccess: () => {
      invalidateGroups();
      queryClient.invalidateQueries({ queryKey: ["customField"] });
      toast.success(t("fieldGroup.toast.deleted"));
    },
    onError: (err: Error) => {
      toast.error({
        title: t("fieldGroup.toast.deleteFailed"),
        description: err.message || undefined,
      });
    },
  });

  const { canMoveUp, canMoveDown, moveUp, moveDown, moveBefore, isReordering } =
    useFieldGroupReorder({
      groups,
      canMutate,
      onInvalidate: invalidateGroups,
    });

  // Inline editor state for creating and editing field groups
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

  return {
    entityTypes,
    isEntityTypesLoading,
    isEntityTypesError,
    refetchEntityTypes,

    groups,
    isGroupsLoading,
    isGroupsError,
    refetchGroups,

    isPlatformContext,
    isSuperAdmin,
    canMutate,
    canMoveUp,
    canMoveDown,
    moveUp,
    moveDown,
    moveBefore,
    isReordering,

    createGroup: createMutation.mutateAsync,
    updateGroup: updateMutation.mutateAsync,
    deleteGroup: deleteMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    editingId,
    isCreating,
    startCreate,
    startEdit,
    closeEditor,
  };
}
