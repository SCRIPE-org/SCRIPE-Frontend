/**
 * Domain model representing a Create Recommendation Rule Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
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
 * Domain model representing a Update Recommendation Rule Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export type UpdateRecommendationRuleRequest = CreateRecommendationRuleRequest;
