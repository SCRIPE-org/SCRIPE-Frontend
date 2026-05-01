/**
 * Feature Data Models — Raw DTO types matching backend API responses exactly.
 * These live in the data layer and are NEVER used in presentation.
 */

export interface FeatureModel {
  id: string;
  name: string;
  displayNameEn?: string;
  displayNameAr?: string;
  category?: string;
  sortOrder: number;
  isVisibleInUI: boolean;
  valueType: string;
  defaultValue: string;
  module: string;
  description?: string;
  isSystem: boolean;
  createdAt: string;
  modifiedAt?: string;
}

export interface TenantEffectiveFeatureModel {
  featureId: string;
  name: string;
  displayNameEn?: string;
  displayNameAr?: string;
  valueType: string;
  editionValue: string;
  overrideValue?: string | null;
  effectiveValue: string;
  category?: string;
  module?: string;
  hasOverride: boolean;
}
