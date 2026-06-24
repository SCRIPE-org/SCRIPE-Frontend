/**
 * Override Data Models — Raw DTO types matching backend API responses exactly.
 * These live in the data layer and are NEVER used in presentation.
 */

export interface FeatureOverrideModel {
  id: string;
  tenantId: string;
  featureId: string;
  featureName: string;
  value: string;
  valueType: string;
  reason?: string;
  createdAt: string;
  modifiedAt?: string;
  costAmountUsd?: number;
  costReason?: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for resolved feature model.
 */
export interface ResolvedFeatureModel {
  featureId: string;
  key: string;
  nameEn: string;
  nameAr: string;
  valueType: string;
  effectiveValue: string;
  source: "Default" | "Edition" | "Override";
}
