/**
 * Recommendation Rules ViewModel
 *
 * Drives the admin CRUD table for recommendation rules.
 * Uses useCrudViewModel with the repository from entitlementsContainer.
 */
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { RecommendationRule } from "../../domain/entities/RecommendationRule";
import type {
  CreateRecommendationRuleRequest,
  UpdateRecommendationRuleRequest,
} from "../../domain/entities/RecommendationRuleRequests";

/**
 * React hook/ViewModel orchestrating state and data flows for recommendation rules view model.
 * Handles active states updates, form fields validations, and browser navigation controllers.
 */
export function useRecommendationRulesViewModel() {
  const { recommendationRuleRepository } = entitlementsContainer;

  // deferSuccessEffects: true -- this screen sets entityTypeKey (see
  // RecommendationRulesCatalogView), so GenericCrudView also saves
  // custom-field values after the rule itself is created/updated. Without
  // this option, useCrudViewModel's onCreateSuccess/onUpdateSuccess fired
  // the toast and closed the modal the instant createItem's own promise
  // resolved -- before the custom-field save even started. create/update
  // here already return the real fetched entity (via getById), so only
  // this option was missing. Same pattern as
  // useAdminsViewModel/useUsersViewModel/useWorkItemViewModel (W0-1).
  const vm = useCrudViewModel<
    RecommendationRule,
    CreateRecommendationRuleRequest,
    UpdateRecommendationRuleRequest
  >(
    ["entitlements", "recommendation-rules"],
    {
      getAll: async (params) => {
        const res = await recommendationRuleRepository.getAll({
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
        });
        return {
          items: res.items || [],
          pagination: {
            itemsCount: res.totalCount,
            pageSize: params.pageSize,
            page: params.page,
            pagesCount: res.totalPages,
          },
        };
      },
      create: async (data) => {
        const id = await recommendationRuleRepository.create(data);
        return recommendationRuleRepository.getById(id);
      },
      update: async (id, data) => {
        await recommendationRuleRepository.update(id, data);
        return recommendationRuleRepository.getById(id);
      },
      delete: async (id) => {
        await recommendationRuleRepository.delete(id);
      },
    },
    { deferSuccessEffects: true }
  );

  return vm;
}
