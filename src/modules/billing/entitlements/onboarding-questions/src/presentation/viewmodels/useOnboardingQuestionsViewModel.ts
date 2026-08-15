"use client";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import type { OnboardingQuestion } from "../../domain/entities/OnboardingQuestion";
import type {
  CreateOnboardingQuestionRequest,
  UpdateOnboardingQuestionRequest,
} from "../../domain/entities/OnboardingQuestionRequests";

/**
 * React hook/ViewModel orchestrating state and data flows for onboarding questions view model.
 * Handles active states updates, form fields validations, and browser navigation controllers.
 */
export function useOnboardingQuestionsViewModel() {
  const { onboardingQuestionRepository } = entitlementsContainer;

  // deferSuccessEffects: true -- this screen sets entityTypeKey (see
  // OnboardingQuestionsCatalogView), so GenericCrudView also saves
  // custom-field values after the question itself is created/updated.
  // Without this option, useCrudViewModel's onCreateSuccess/onUpdateSuccess
  // fired the toast and closed the modal the instant createItem's own
  // promise resolved -- before the custom-field save even started. create/
  // update here already return the real fetched entity (via getById), so
  // only this option was missing. Same pattern as
  // useAdminsViewModel/useUsersViewModel/useWorkItemViewModel (W0-1).
  const vm = useCrudViewModel<
    OnboardingQuestion,
    CreateOnboardingQuestionRequest,
    UpdateOnboardingQuestionRequest
  >(
    ["entitlements", "onboarding-questions"],
    {
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
    },
    { deferSuccessEffects: true }
  );

  return vm;
}
