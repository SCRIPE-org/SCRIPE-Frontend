"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import type { QueryKey } from "@core/common/query-keys";

interface MutationOptions<T> {
  /** Additional query keys to invalidate on any success */
  invalidateKeys?: QueryKey[];
  /**
   * Called after EITHER a successful create OR a successful update — kept for
   * backward compatibility with existing callers that don't care which one
   * fired. New code that reacts differently to create vs. update (e.g.
   * closing only the dialog that owns the mutation that actually resolved)
   * should use `onCreateSuccess` / `onUpdateSuccess` instead: a single shared
   * handler here previously let a create's success close an unrelated open
   * edit dialog (and vice versa) any time both callbacks pointed at the same
   * function, since this fires for both mutation types indiscriminately.
   */
  onSuccess?: (data: T) => void;
  /** Called after a successful CREATE only. */
  onCreateSuccess?: (data: T) => void;
  /** Called after a successful UPDATE only. */
  onUpdateSuccess?: (data: T) => void;
  /** Called on any mutation error */
  onError?: (error: Error) => void;
  /**
   * Custom i18n toast message keys (falls back to common.* defaults).
   * Pass a translated string from `t()` — NOT a raw key.
   */
  successMessages?: {
    create?: string;
    update?: string;
    delete?: string;
  };
  /**
   * Optimistic delete: immediately removes the item from the list cache
   * on `onMutate` and rolls back on error. Requires `baseKey` to be a
   * list query key containing `{ items: T[] }` shaped data.
   */
  optimisticDelete?: boolean;
  /**
   * Skip the automatic create/update success toast. For a caller doing
   * additional async work after the entity itself saves (custom-field
   * values, a follow-up request) and wanting one toast for the whole
   * operation instead of "saved" immediately followed by an error — use
   * the returned `showCreateSuccessToast`/`showUpdateSuccessToast` once
   * that work actually finishes. Does not affect `onCreateSuccess`/
   * `onUpdateSuccess`/`onSuccess`, `invalidate`, or error handling —
   * only the toast call itself. Defaults to false: every existing caller
   * keeps getting its toast at the same moment as today.
   */
  deferSuccessToast?: boolean;
}

export function useGenericMutations<T extends { id: string }, TCreate = unknown, TUpdate = unknown>(
  baseKey: QueryKey,
  services: {
    create?: (data: TCreate) => Promise<T>;
    update?: (id: string, data: TUpdate) => Promise<T>;
    delete?: (id: string) => Promise<void>;
  },
  options?: MutationOptions<T>
) {
  const queryClient = useQueryClient();
  const { operationSuccess, operationError } = useEnhancedToast();
  const { t } = useI18n();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: baseKey as readonly unknown[] });
    options?.invalidateKeys?.forEach((key) =>
      queryClient.invalidateQueries({ queryKey: key as readonly unknown[] })
    );
  };

  // ── Create ──────────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async (data: TCreate) => {
      if (!services.create) throw new Error("Create service not implemented");
      return services.create(data);
    },
    onSuccess: (data) => {
      invalidate();
      if (!options?.deferSuccessToast) {
        operationSuccess(options?.successMessages?.create ?? t("common.messages.created"));
      }
      options?.onCreateSuccess?.(data);
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      operationError("Create", undefined, error.message || t("common.messages.createFailed"));
      options?.onError?.(error);
    },
  });

  // ── Update ──────────────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TUpdate }) => {
      if (!services.update) throw new Error("Update service not implemented");
      return services.update(id, data);
    },
    onSuccess: (data) => {
      invalidate();
      if (!options?.deferSuccessToast) {
        operationSuccess(options?.successMessages?.update ?? t("common.messages.updated"));
      }
      options?.onUpdateSuccess?.(data);
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      operationError("Update", undefined, error.message || t("common.messages.updateFailed"));
      options?.onError?.(error);
    },
  });

  // ── Delete ──────────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    // mutationKey prevents double-deletion race conditions
    mutationKey: [...(baseKey as unknown[]), "delete"],
    mutationFn: async (id: string) => {
      if (!services.delete) throw new Error("Delete service not implemented");
      return services.delete(id);
    },
    onMutate: options?.optimisticDelete
      ? async (id: string) => {
          await queryClient.cancelQueries({ queryKey: baseKey as readonly unknown[] });
          const previous = queryClient.getQueryData(baseKey as readonly unknown[]);
          // Optimistically remove from list cache
          queryClient.setQueryData(baseKey as readonly unknown[], (old: unknown) => {
            if (!old || typeof old !== "object") return old;
            const data = old as { items?: T[]; data?: T[] };
            const items = data.items ?? data.data ?? [];
            const filtered = items.filter((item: T) => item.id !== id);
            if (data.items) return { ...data, items: filtered };
            if (data.data) return { ...data, data: filtered };
            // Handle plain array responses
            if (Array.isArray(old)) return (old as T[]).filter((item: T) => item.id !== id);
            return old;
          });
          return { previous };
        }
      : undefined,
    onError: options?.optimisticDelete
      ? (_, __, context?: { previous: unknown }) => {
          if (context?.previous !== undefined) {
            queryClient.setQueryData(baseKey as readonly unknown[], context.previous);
          }
          operationError(
            "Delete",
            undefined,
            (_ as Error)?.message || t("common.messages.deleteFailed")
          );
          options?.onError?.(_ as Error);
        }
      : (error: Error) => {
          operationError("Delete", undefined, error.message || t("common.messages.deleteFailed"));
          options?.onError?.(error);
        },
    onSuccess: () => {
      operationSuccess(options?.successMessages?.delete ?? t("common.messages.deleted"));
    },
    onSettled: () => {
      // Always re-sync after delete regardless of optimistic result
      invalidate();
    },
  });

  return {
    create: createMutation.mutateAsync,
    update: (id: string, data: TUpdate) => updateMutation.mutateAsync({ id, data }),
    remove: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    /** Fires the create success toast `deferSuccessToast` held back. No-op call otherwise unnecessary — only meaningful paired with `deferSuccessToast: true`. */
    showCreateSuccessToast: () =>
      operationSuccess(options?.successMessages?.create ?? t("common.messages.created")),
    /** Fires the update success toast `deferSuccessToast` held back. */
    showUpdateSuccessToast: () =>
      operationSuccess(options?.successMessages?.update ?? t("common.messages.updated")),
  };
}
