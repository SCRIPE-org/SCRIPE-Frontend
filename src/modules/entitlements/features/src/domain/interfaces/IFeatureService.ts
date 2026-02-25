/**
 * Feature Service Interface (API contract)
 */
import type { PagedResult, PaginationParams } from "@modules/system/core/domain/types";

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

export interface IFeatureService {
      getAll(params: PaginationParams): Promise<PagedResult<FeatureModel>>;
      getById(id: string): Promise<FeatureModel>;
      create(data: Record<string, unknown>): Promise<{ id: string }>;
      update(id: string, data: Record<string, unknown>): Promise<void>;
      delete(id: string): Promise<void>;
      getTenantResolvedFeatures(tenantId: string): Promise<any[]>;
}
