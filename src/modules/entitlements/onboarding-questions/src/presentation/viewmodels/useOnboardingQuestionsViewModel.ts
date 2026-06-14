"use client";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import type { OnboardingQuestion } from "../../domain/entities/OnboardingQuestion";
import type {
  CreateOnboardingQuestionRequest,
  UpdateOnboardingQuestionRequest,
} from "../../domain/entities/OnboardingQuestionRequests";

export function useOnboardingQuestionsViewModel() {
  const { onboardingQuestionRepository } = entitlementsContainer;

  const vm = useCrudViewModel<
    OnboardingQuestion,
    CreateOnboardingQuestionRequest,
    UpdateOnboardingQuestionRequest
  >(["entitlements", "onboarding-questions"], {
    getAll: async (params) => {
      const res = await onboardingQuestionRepository.getAll({
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
      });
      return {
        items: res.items ?? [],
        pagination: {
          itemsCount: res.totalCount,
          pageSize: params.pageSize,
          page: params.page,
          pagesCount: res.totalPages,
        },
      };
    },
    create: async (data) => {
      const id = await onboardingQuestionRepository.create(data);
      return onboardingQuestionRepository.getById(id);
    },
    update: async (id, data) => {
      await onboardingQuestionRepository.update(id, data);
      return onboardingQuestionRepository.getById(id);
    },
    delete: async (id) => {
      await onboardingQuestionRepository.delete(id);
    },
  });

  return vm;
}
