/**
 * ICustomFieldService Interface
 *
 * Defines the contract for CustomField API operations.
 * Implemented by CustomFieldService in the data layer.
 */
import type { CustomFieldModel, EntityTypeItemJson } from "../../data/models/CustomFieldModel";

export interface CustomFieldListResult {
  items: CustomFieldModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ICustomFieldService {
  getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
    entityTypeKey?: string;
  }): Promise<CustomFieldListResult>;
  getById(id: string): Promise<CustomFieldModel>;
  getEntityTypes(): Promise<EntityTypeItemJson[]>;
  create(data: Record<string, unknown>): Promise<{ id: string }>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
