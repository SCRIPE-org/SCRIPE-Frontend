/**
 * Interface structure detailing the properties and attributes of Recommendation Rule List Model.
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
 * Interface structure detailing the properties and attributes of Recommendation Rule Detail Model.
 */
export interface RecommendationRuleDetailModel extends RecommendationRuleListModel {
  conditionJson: string;
  reasonEn: string;
  reasonAr: string;
  modifiedAt?: string;
}

/**
 * Interface structure detailing the properties and attributes of Paged Recommendation Rules Model.
 */
export interface PagedRecommendationRulesModel {
  items: RecommendationRuleListModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
