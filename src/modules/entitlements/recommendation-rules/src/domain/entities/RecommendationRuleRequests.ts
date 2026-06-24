/**
 * Interface structure detailing the properties and attributes of Create Recommendation Rule Request.
 */
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

/**
 * Type declaration definition describing the schema of update recommendation rule request.
 */
export type UpdateRecommendationRuleRequest = CreateRecommendationRuleRequest;
