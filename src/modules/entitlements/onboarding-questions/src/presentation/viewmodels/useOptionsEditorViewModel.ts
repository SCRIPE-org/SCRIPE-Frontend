"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { AnswerOptionRequest } from "../../domain/entities/OnboardingQuestionRequests";
import { useI18n } from "@core/providers/i18n-provider";
import { useToast } from "@core/ui/use-toast";

/**
 * React hook/ViewModel managing logic, state, and repository queries for options editor view model.
 */
export function useOptionsEditorViewModel(questionId: string | null) {
  const qc = useQueryClient();
  const repo = entitlementsContainer.onboardingQuestionRepository;
  const key = ["entitlements", "onboarding-options", questionId];
  const { t } = useI18n();
  const { toast } = useToast();

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
    onSuccess: invalidate,
    onError: showMutationError,
  });

  const deleteMutation = useMutation({
    mutationFn: (optionId: string) => repo.deleteOption(questionId!, optionId),
    onSuccess: invalidate,
    onError: showMutationError,
  });

  const reorderMutation = useMutation({
    mutationFn: (orderedIds: string[]) => repo.reorderOptions(questionId!, orderedIds),
    onSuccess: invalidate,
    onError: showMutationError,
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
