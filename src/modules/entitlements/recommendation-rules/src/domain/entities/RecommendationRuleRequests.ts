export interface CreateRecommendationRuleRequest {
  name: string;
  editionCategoryId?: string;
  conditionJson: string;
  recommendedTierLevel?: number;
  scoreBonus: number;
  reasonEn: string;
  reasonAr: string;
  priority: number;
}

export type UpdateRecommendationRuleRequest = CreateRecommendationRuleRequest;
