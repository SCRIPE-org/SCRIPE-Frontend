/**
 * Inventory Data Models — Raw DTOs matching backend API response exactly.
 * NEVER used in presentation layer.
 */

export interface InventoryItemModel {
  id: string;
  moduleName: string;
  entityName: string;
  fieldName: string;
  dataCategory: string;
  legalBasis: string;
  isAnonymizedOnErasure: boolean;
  isIncludedInExport: boolean;
  isActive: boolean;
  notes?: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for create data inventory request.
 */
export interface CreateDataInventoryRequest {
  moduleName: string;
  entityName: string;
  fieldName: string;
  dataCategory: string;
  isAnonymizedOnErasure: boolean;
  isIncludedInExport: boolean;
  legalBasis: string;
}

/**
 * Exported type defining parameters and fields for update data inventory request configurations.
 */
export type UpdateDataInventoryRequest = CreateDataInventoryRequest;
