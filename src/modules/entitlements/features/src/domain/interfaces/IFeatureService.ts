/**
 * Feature Service Interface (API contract)
 */
import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";

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

export interface IFeatureService {
      getAll(params: PaginationParams): Promise<PagedResult<FeatureModel>>;
      getById(id: string): Promise<FeatureModel>;
      create(data: Record<string, unknown>): Promise<{ id: string }>;
      update(id: string, data: Record<string, unknown>): Promise<void>;
      delete(id: string): Promise<void>;
      getTenantResolvedFeatures(tenantId: string): Promise<any[]>;
      getEffective(tenantId?: string): Promise<TenantEffectiveFeatureModel[]>;
}
