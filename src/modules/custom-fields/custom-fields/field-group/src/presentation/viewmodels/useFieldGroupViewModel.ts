/**
 * FieldGroup ViewModel -- Wave 5 row 5.2
 *
 * State for the Field Groups admin screen: the entity-type discovery query,
 * the per-entity-type group list, and the four write paths (create, update,
 * delete, reorder).
 *
 * NOT built on `useCrudViewModel`. That hook is paginated-table shaped
 * (page/pageSize/search/sort, one modal per operation) and the field-group
 * read is a single unpaginated array scoped to one entity type, whose whole
 * point is a hand-ordered list. Row 5.4's Value Types catalog made the same
 * call for the same reason -- see `ValueTypeCatalogView`'s header comment.
 */
"use client";

import { useCallback, useMemo, useState } from "react";
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

/**
 * Query key for one entity type's groups. Exported so the picker hook
 * (`useFieldGroupOptions`) and this screen share ONE cache entry instead of
 * each fetching the same list under a key of its own.
 */
export function fieldGroupsQueryKey(entityTypeKey: string) {
  return ["customFields", "fieldGroups", entityTypeKey] as const;
}

export function useFieldGroupViewModel(entityTypeKey: string) {
  const { fieldGroupRepository, customFieldRepository } = getCustomFieldsContainer();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { isSuperAdmin } = usePermissions();
  const { isInTenantWorld } = useTenantContext();

  /**
   * Same definition `CustomFieldListView` uses: a Super Admin who has not
   * drilled into a tenant is a genuine platform principal. Everything created
   * from there is platform-owned, and only from there can an existing
   * platform-owned row be mutated.
   */
  const isPlatformContext = isSuperAdmin && !isInTenantWorld;

  /**
   * A tenant-scoped caller can SEE a global group (the tenant filter admits
   * TenantId == null rows) but every write path re-checks ownership and
   * rejects it with a bare "not found". Offering Edit/Delete/Move on a row the
   * backend will unconditionally refuse is a confusing failure, not a softer
   * one -- same reasoning, and same predicate shape, as CustomFieldListView's
   * `show: (item) => isPlatformContext || !item.isGlobal`.
   */
  const canMutate = useCallback(
    (group: FieldGroup) => isPlatformContext || !group.isGlobal,
    [isPlatformContext]
  );

  // Shares CustomFieldListView's cache entry (identical key + repository
  // method), so opening this screen after that one costs no extra request.
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
    // The endpoint has no "all entity types" mode -- without a key there is
    // nothing to ask for, so the query stays idle rather than firing a request
    // that would 400 or return every tenant's groups.
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
      // The definitions list is stale too: deleting a group ungroups every
      // field in it, so any cached custom-field detail carrying that
      // fieldGroupId now names a group that no longer exists.
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

  const reorderMutation = useMutation({
    mutationFn: (items: { id: string; sortOrder: number }[]) =>
      fieldGroupRepository.reorder(items),
    onSuccess: () => {
      invalidateGroups();
      toast.success(t("fieldGroup.toast.reordered"));
    },
    onError: (err: Error) => {
      toast.error({
        title: t("fieldGroup.toast.reorderFailed"),
        description: err.message || undefined,
      });
    },
  });

  /**
   * The subset a move may touch, in the server's own display order.
   *
   * Reorder is all-or-nothing server-side: one id the caller cannot mutate
   * fails the ENTIRE request and persists nothing. So a tenant-scoped admin's
   * payload must contain only their own groups. The visible consequence is
   * narrow and deliberate: they reorder their own groups relative to each
   * other, and where a platform-owned group lands among them is not theirs to
   * decide. In platform context every row is mutable and the payload is a
   * clean 0..n-1 normalization of the whole list.
   */
  const reorderableGroups = useMemo(() => groups.filter(canMutate), [groups, canMutate]);

  /**
   * Swap two adjacent entries of `reorderableGroups` and submit the whole
   * subset renumbered from its new order. Renumbering (rather than swapping
   * just the two SortOrder values) is what makes this correct when several
   * groups still share the create-time default of 0 -- swapping two equal
   * values is a no-op, and the list would silently refuse to move.
   */
  const submitSwap = useCallback(
    (index: number, targetIndex: number) => {
      if (index < 0 || targetIndex < 0) return;
      if (index >= reorderableGroups.length || targetIndex >= reorderableGroups.length) return;

      const next = [...reorderableGroups];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      reorderMutation.mutate(next.map((group, i) => ({ id: group.id, sortOrder: i })));
    },
    [reorderableGroups, reorderMutation]
  );

  const moveUp = useCallback(
    (id: string) => {
      const index = reorderableGroups.findIndex((group) => group.id === id);
      if (index <= 0) return;
      submitSwap(index, index - 1);
    },
    [reorderableGroups, submitSwap]
  );

  const moveDown = useCallback(
    (id: string) => {
      const index = reorderableGroups.findIndex((group) => group.id === id);
      if (index < 0 || index >= reorderableGroups.length - 1) return;
      submitSwap(index, index + 1);
    },
    [reorderableGroups, submitSwap]
  );

  /**
   * Whether a given group can move in a direction -- the single source of
   * truth for both the button's `disabled` state and the handler's own guard,
   * so a disabled control and a no-op handler can never disagree.
   */
  const canMoveUp = useCallback(
    (id: string) => reorderableGroups.findIndex((group) => group.id === id) > 0,
    [reorderableGroups]
  );

  const canMoveDown = useCallback(
    (id: string) => {
      const index = reorderableGroups.findIndex((group) => group.id === id);
      return index >= 0 && index < reorderableGroups.length - 1;
    },
    [reorderableGroups]
  );

  /**
   * Native-drag drop handler, kept in lockstep with moveUp/moveDown: it
   * resolves both ends to positions inside `reorderableGroups` and reuses the
   * same renumbering payload. Drag is the SECOND way to do this, never the
   * only one -- see FieldGroupRow for the button pair that satisfies WCAG 2.2
   * SC 2.5.7.
   */
  const moveBefore = useCallback(
    (draggedId: string, targetId: string) => {
      if (draggedId === targetId) return;
      const from = reorderableGroups.findIndex((group) => group.id === draggedId);
      const to = reorderableGroups.findIndex((group) => group.id === targetId);
      if (from < 0 || to < 0) return;

      const next = [...reorderableGroups];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      reorderMutation.mutate(next.map((group, i) => ({ id: group.id, sortOrder: i })));
    },
    [reorderableGroups, reorderMutation]
  );

  // ── Inline editor state (no modal — see FieldGroupListView) ──────────
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
    // Only a Super Admin may even ASK for a global group; the backend
    // re-checks and 403s anyone else who sends isGlobal=true.
    isSuperAdmin,
    canMutate,
    canMoveUp,
    canMoveDown,
    moveUp,
    moveDown,
    moveBefore,
    isReordering: reorderMutation.isPending,

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
