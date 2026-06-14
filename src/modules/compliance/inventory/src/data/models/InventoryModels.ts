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

export interface CreateDataInventoryRequest {
  moduleName: string;
  entityName: string;
  fieldName: string;
  dataCategory: string;
  isAnonymizedOnErasure: boolean;
  isIncludedInExport: boolean;
  legalBasis: string;
}

export type UpdateDataInventoryRequest = CreateDataInventoryRequest;
