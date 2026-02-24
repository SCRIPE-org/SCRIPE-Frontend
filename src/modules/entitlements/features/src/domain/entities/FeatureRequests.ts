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
}

export interface UpdateFeatureRequest {
      name?: string;
      defaultValue?: string;
      description?: string;
}
