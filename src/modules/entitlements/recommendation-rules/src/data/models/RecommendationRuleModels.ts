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

export interface RecommendationRuleDetailModel extends RecommendationRuleListModel {
  conditionJson: string;
  reasonEn: string;
  reasonAr: string;
  modifiedAt?: string;
}

export interface PagedRecommendationRulesModel {
  items: RecommendationRuleListModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
