/**
 * Data Inventory Item Domain Entity
 */

export interface InventoryItemData {
  id: string;
  moduleName: string;
  entityName: string;
  fieldName: string;
  dataCategory: string;
  legalBasis: string;
  isAnonymizedOnErasure: boolean;
  isIncludedInExport: boolean;
  isActive: boolean;
  isGlobal: boolean;
  notes?: string;
}

/**
 * Domain model representing a Inventory Item structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class InventoryItem {
  constructor(private readonly data: InventoryItemData) {}

  get id() {
    return this.data.id;
  }
  get moduleName() {
    return this.data.moduleName ?? "";
  }
  get entityName() {
    return this.data.entityName ?? "";
  }
  get fieldName() {
    return this.data.fieldName ?? "";
  }
  get dataCategory() {
    return this.data.dataCategory ?? "";
  }
  get legalBasis() {
    return this.data.legalBasis ?? "";
  }
  get isAnonymizedOnErasure() {
    return this.data.isAnonymizedOnErasure ?? false;
  }
  get isIncludedInExport() {
    return this.data.isIncludedInExport ?? false;
  }
  get isActive() {
    return this.data.isActive ?? false;
  }
  get isGlobal() {
    return this.data.isGlobal ?? false;
  }
  get notes() {
    return this.data.notes ?? null;
  }
  get displayName() {
    return `${this.data.entityName}.${this.data.fieldName}`;
  }

  copyWith(updates: Partial<InventoryItemData>): InventoryItem {
    return new InventoryItem({ ...this.data, ...updates });
  }
}

/**
 * Domain model representing a Create Data Inventory Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
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
 * Domain model representing a Update Data Inventory Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export type UpdateDataInventoryRequest = CreateDataInventoryRequest;
