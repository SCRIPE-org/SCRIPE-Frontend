/**
 * ICustomFieldService Interface
 *
 * Defines the contract for CustomField API operations.
 * Implemented by CustomFieldService in the data layer.
 */
import type { CustomFieldModel, EntityTypeItemJson } from "../../data/models/CustomFieldModel";
import type { FieldHistoryPage, FieldUsage } from "../entities/FieldInsight";

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
  /**
   * @param force - Wave 6 row 6.3. Without it the server refuses with 409 when the definition still
   *   holds values. Pass true only after the user has confirmed against the real counts.
   */
  delete(id: string, force?: boolean): Promise<void>;
  getHistory(id: string, page: number, pageSize: number): Promise<FieldHistoryPage>;
  getUsage(id: string): Promise<FieldUsage>;
}
