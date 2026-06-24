/**
 * RecommendationRule Entity
 *
 * Represents a declarative scoring rule used by the onboarding intelligence engine
 * to recommend an edition tier based on user answer patterns.
 */
import type { BaseEntity } from "@core/interfaces/common.interface";

export interface RecommendationRuleData extends BaseEntity {
  name: string;
  editionCategoryId?: string;
  conditionJson: string;
  recommendedTierLevel?: number;
  scoreBonus: number;
  reasonEn: string;
  reasonAr: string;
  priority: number;
  isSystem: boolean;
  isActive: boolean;
}

/**
 * Domain entity class representing a Recommendation Rule.
 */
export class RecommendationRule {
  constructor(public readonly data: RecommendationRuleData) {}

  get id(): string {
    return this.data.id;
  }
  get name(): string {
    return this.data.name;
  }
  get conditionJson(): string {
    return this.data.conditionJson;
  }
  get recommendedTierLevel(): number | undefined {
    return this.data.recommendedTierLevel;
  }
  get scoreBonus(): number {
    return this.data.scoreBonus;
  }
  get reasonEn(): string {
    return this.data.reasonEn;
  }
  get reasonAr(): string {
    return this.data.reasonAr;
  }
  get priority(): number {
    return this.data.priority;
  }
  get isSystem(): boolean {
    return this.data.isSystem;
  }
  get isActive(): boolean {
    return this.data.isActive;
  }
  get createdAt(): string {
    return this.data.createdAt;
  }

  getReason(lang: string): string {
    return lang === "ar" ? this.data.reasonAr : this.data.reasonEn;
  }

  getTierLabel(): string {
    switch (this.data.recommendedTierLevel) {
      case 0:
        return "Free";
      case 1:
        return "Pro";
      case 2:
        return "Ultra";
      case 3:
        return "Enterprise";
      default:
        return "—";
    }
  }

  copyWith(updates: Partial<RecommendationRuleData>): RecommendationRule {
    return new RecommendationRule({ ...this.data, ...updates });
  }
}
