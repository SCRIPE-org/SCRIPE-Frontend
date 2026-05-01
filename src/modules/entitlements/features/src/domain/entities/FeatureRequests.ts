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
}

export interface UpdateFeatureRequest {
  name?: string;
  defaultValue?: string;
  description?: string;
  displayNameEn?: string;
  displayNameAr?: string;
  category?: string;
  sortOrder?: number;
  isVisibleInUI?: boolean;
}
