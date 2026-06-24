/**
 * Feature Request DTOs
 */
import type { FeatureValueType } from "./Feature";

export interface CreateFeatureRequest {
  name: string;
  valueType: FeatureValueType;
  defaultValue: string;
  module: string;
  description?: string;
  displayNameEn?: string;
  displayNameAr?: string;
  category?: string;
  sortOrder?: number;
  isVisibleInUI?: boolean;
  isMarketingOnly?: boolean;
}

/**
 * Domain model representing a Update Feature Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface UpdateFeatureRequest {
  name?: string;
  defaultValue?: string;
  description?: string;
  displayNameEn?: string;
  displayNameAr?: string;
  category?: string;
  sortOrder?: number;
  isVisibleInUI?: boolean;
  isMarketingOnly?: boolean;
}
