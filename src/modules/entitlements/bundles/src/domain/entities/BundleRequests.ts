/**
 * Bundle Request DTOs
 */
import type { BundlePermissionRuleDto, BundleFeatureRuleDto } from "./Bundle";

export interface CreateBundleRequest {
      name: string;
      displayNameEn?: string;
      displayNameAr?: string;
      description?: string;
      permissionRules?: { permissionCode: string; mode: string }[];
      featureRules?: { featureName: string; value: string }[];
}

export interface UpdateBundleRequest {
      displayNameEn?: string;
      displayNameAr?: string;
      description?: string;
      permissionRules?: { permissionCode: string; mode: string }[];
      featureRules?: { featureName: string; value: string }[];
}
