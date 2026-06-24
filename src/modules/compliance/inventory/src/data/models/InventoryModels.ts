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
 * Interface structure detailing the properties and attributes of Create Data Inventory Request.
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
 * Type declaration definition describing the schema of update data inventory request.
 */
export type UpdateDataInventoryRequest = CreateDataInventoryRequest;
