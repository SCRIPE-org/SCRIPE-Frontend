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

export function useRecommendationRulesViewModel() {
  const { recommendationRuleRepository } = entitlementsContainer;

  const vm = useCrudViewModel<
    RecommendationRule,
    CreateRecommendationRuleRequest,
    UpdateRecommendationRuleRequest
  >(["entitlements", "recommendation-rules"], {
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
  });

  return vm;
}
