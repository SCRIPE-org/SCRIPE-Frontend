/**
 * Interface defining property specifications, keys types, and structural contract rules for recommendation rule list model.
 */
export interface RecommendationRuleListModel {
  id: string;
  name: string;
  editionCategoryId?: string;
  recommendedTierLevel?: number;
  scoreBonus: number;
  priority: number;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for recommendation rule detail model.
 */
export interface RecommendationRuleDetailModel extends RecommendationRuleListModel {
  conditionJson: string;
  reasonEn: string;
  reasonAr: string;
  modifiedAt?: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for paged recommendation rules model.
 */
export interface PagedRecommendationRulesModel {
  items: RecommendationRuleListModel[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
