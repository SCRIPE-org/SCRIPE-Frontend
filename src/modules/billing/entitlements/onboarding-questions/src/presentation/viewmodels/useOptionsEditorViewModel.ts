"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { AnswerOptionRequest } from "../../domain/entities/OnboardingQuestionRequests";
import { useI18n } from "@core/providers/i18n-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";

/**
 * React hook/ViewModel orchestrating state and data flows for options editor view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useOptionsEditorViewModel(questionId: string | null) {
  const qc = useQueryClient();
  const repo = entitlementsContainer.onboardingQuestionRepository;
  const key = ["entitlements", "onboarding-options", questionId];
  const { t } = useI18n();
  const { toast } = useEnhancedToast();

  // Shared across update/delete/reorder — keyed by option id (reorder keys
  // on the id of the row that moved) so acting on one row never busies or
  // disables the others in the list.
  const [pendingOptionIds, setPendingOptionIds] = useState<Set<string>>(new Set());

  const optionsQuery = useQuery({
    queryKey: key,
    queryFn: () => repo.listOptions(questionId!),
    enabled: !!questionId,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: key });
    qc.invalidateQueries({ queryKey: ["entitlements", "onboarding-questions"] });
  };

  const showMutationError = () => {
    toast({
      title: t("entitlements.onboarding.questions.options.errorTitle"),
      description: t("entitlements.onboarding.questions.options.errorDescription"),
      variant: "destructive",
    });
  };

  const createMutation = useMutation({
    mutationFn: (req: AnswerOptionRequest) => repo.createOption(questionId!, req),
    onSuccess: invalidate,
    onError: showMutationError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ optionId, req }: { optionId: string; req: AnswerOptionRequest }) =>
      repo.updateOption(questionId!, optionId, req),
    onMutate: ({ optionId }) => {
      setPendingOptionIds((prev) => new Set(prev).add(optionId));
    },
    onSuccess: invalidate,
    onError: showMutationError,
    onSettled: (_data, _err, { optionId }) => {
      setPendingOptionIds((prev) => {
        const next = new Set(prev);
        next.delete(optionId);
        return next;
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (optionId: string) => repo.deleteOption(questionId!, optionId),
    onMutate: (optionId) => {
      setPendingOptionIds((prev) => new Set(prev).add(optionId));
    },
    onSuccess: invalidate,
    onError: showMutationError,
    onSettled: (_data, _err, optionId) => {
      setPendingOptionIds((prev) => {
        const next = new Set(prev);
        next.delete(optionId);
        return next;
      });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: ({ orderedIds }: { orderedIds: string[]; movedId: string }) =>
      repo.reorderOptions(questionId!, orderedIds),
    onMutate: ({ movedId }) => {
      setPendingOptionIds((prev) => new Set(prev).add(movedId));
    },
    onSuccess: invalidate,
    onError: showMutationError,
    onSettled: (_data, _err, { movedId }) => {
      setPendingOptionIds((prev) => {
        const next = new Set(prev);
        next.delete(movedId);
        return next;
      });
    },
  });

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    reorderMutation.isPending;

  return {
    options: optionsQuery.data ?? [],
    isLoading: optionsQuery.isLoading,
    isMutating,
    isOptionBusy: (optionId: string) => pendingOptionIds.has(optionId),

    createOption: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateOption: (optionId: string, req: AnswerOptionRequest) =>
      updateMutation.mutateAsync({ optionId, req }),
    isUpdating: updateMutation.isPending,

    deleteOption: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,

    reorderOptions: (orderedIds: string[], movedId: string) =>
      reorderMutation.mutateAsync({ orderedIds, movedId }),
    isReordering: reorderMutation.isPending,
  };
}
