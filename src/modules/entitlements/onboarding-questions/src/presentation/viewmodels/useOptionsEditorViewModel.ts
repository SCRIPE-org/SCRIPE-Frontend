"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { AnswerOptionRequest } from "../../domain/entities/OnboardingQuestionRequests";

export function useOptionsEditorViewModel(questionId: string | null) {
  const qc = useQueryClient();
  const repo = entitlementsContainer.onboardingQuestionRepository;
  const key = ["entitlements", "onboarding-options", questionId];

  const optionsQuery = useQuery({
    queryKey: key,
    queryFn: () => repo.listOptions(questionId!),
    enabled: !!questionId,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const createMutation = useMutation({
    mutationFn: (req: AnswerOptionRequest) => repo.createOption(questionId!, req),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ optionId, req }: { optionId: string; req: AnswerOptionRequest }) =>
      repo.updateOption(questionId!, optionId, req),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (optionId: string) => repo.deleteOption(questionId!, optionId),
    onSuccess: invalidate,
  });

  const reorderMutation = useMutation({
    mutationFn: (orderedIds: string[]) => repo.reorderOptions(questionId!, orderedIds),
    onSuccess: invalidate,
  });

  return {
    options: optionsQuery.data ?? [],
    isLoading: optionsQuery.isLoading,

    createOption: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateOption: (optionId: string, req: AnswerOptionRequest) =>
      updateMutation.mutateAsync({ optionId, req }),
    isUpdating: updateMutation.isPending,

    deleteOption: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,

    reorderOptions: reorderMutation.mutateAsync,
    isReordering: reorderMutation.isPending,
  };
}
