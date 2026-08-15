/**
 * ICustomFieldRepository Interface
 *
 * Defines the contract for CustomField data access.
 * Works with domain entities, not DTOs.
 */
import type { CustomField, EntityTypeInfo } from "../entities/CustomField";

export interface CustomFieldListParams {
  page: number;
  pageSize: number;
  search?: string;
  entityTypeKey?: string;
}

export interface ICustomFieldRepository {
  getAll(
    params: CustomFieldListParams
  ): Promise<{
    items: CustomField[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>;
  getById(id: string): Promise<CustomField>;
  getEntityTypes(): Promise<EntityTypeInfo[]>;
  create(data: Record<string, unknown>): Promise<string>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
