"use client";

import { useCallback, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "@core/hooks/use-enhanced-toast";
import { getCustomFieldsContainer } from "../../../../di";
import type { FieldGroup } from "../../domain/entities/FieldGroup";

export const REORDER_MAX_ITEMS = 100;

export interface UseFieldGroupReorderProps {
  groups: readonly FieldGroup[];
  canMutate: (group: FieldGroup) => boolean;
  onInvalidate: () => void;
}

/**
 * Hook managing field group sequence reordering, adjacent swapping, and drag-and-drop actions.
 * Ensures permissions and item limits are respected when calculating new sort orders.
 */
export function useFieldGroupReorder({
  groups,
  canMutate,
  onInvalidate,
}: UseFieldGroupReorderProps) {
  const { fieldGroupRepository } = getCustomFieldsContainer();
  const { t } = useI18n();

  const reorderMutation = useMutation({
    mutationFn: (items: { id: string; sortOrder: number }[]) =>
      fieldGroupRepository.reorder(items),
    onSuccess: () => {
      onInvalidate();
      toast.success(t("fieldGroup.toast.reordered"));
    },
    onError: (err: Error) => {
      toast.error({
        title: t("fieldGroup.toast.reorderFailed"),
        description: err.message || undefined,
      });
    },
  });

  const reorderableGroups = useMemo(() => groups.filter(canMutate), [groups, canMutate]);

  const submitReorder = useCallback(
    (items: { id: string; sortOrder: number }[]) => {
      if (items.length > REORDER_MAX_ITEMS) {
        toast.error({
          title: t("fieldGroup.toast.reorderFailed"),
          description: t("fieldGroup.toast.reorderTooMany", { max: REORDER_MAX_ITEMS }),
        });
        return;
      }
      reorderMutation.mutate(items);
    },
    [reorderMutation, t]
  );

  const submitSwap = useCallback(
    (index: number, targetIndex: number) => {
      if (index < 0 || targetIndex < 0) return;
      if (index >= reorderableGroups.length || targetIndex >= reorderableGroups.length) return;

      const next = [...reorderableGroups];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      submitReorder(next.map((group, i) => ({ id: group.id, sortOrder: i })));
    },
    [reorderableGroups, submitReorder]
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

  const moveBefore = useCallback(
    (draggedId: string, targetId: string) => {
      if (draggedId === targetId) return;
      const from = reorderableGroups.findIndex((group) => group.id === draggedId);
      const to = reorderableGroups.findIndex((group) => group.id === targetId);
      if (from < 0 || to < 0) return;

      const next = [...reorderableGroups];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      submitReorder(next.map((group, i) => ({ id: group.id, sortOrder: i })));
    },
    [reorderableGroups, submitReorder]
  );

  return {
    canMoveUp,
    canMoveDown,
    moveUp,
    moveDown,
    moveBefore,
    isReordering: reorderMutation.isPending,
  };
}
