/**
 * CustomField Entity
 *
 * Domain entity representing a CustomField definition in the system.
 */

/**
 * EntityType domain interface
 */
export interface EntityTypeInfo {
  key: string;
  owningModule: string;
  displayNameEn: string;
  displayNameAr: string;
  /** See EntityTypeItemJson's identical field for the full contract. */
  hasFrontendScreen?: boolean;
}

/**
 * CustomField data from API
 */
export interface CustomFieldData {
  id: string;
  entityTypeKey: string;
  key: string;
  labelEn: string;
  labelAr?: string | null;
  placeholderEn?: string | null;
  placeholderAr?: string | null;
  valueType: number;
  isRequired: boolean;
  options?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  modifiedAt?: string | null;
  /** True for a platform-owned (TenantId == null) definition inherited by every tenant. Absent on detail fetches (list-only). */
  isGlobal?: boolean;
}

/**
 * CustomField entity class
 */
export class CustomField {
  constructor(public readonly data: CustomFieldData) {}

  get id(): string {
    return this.data.id;
  }

  get entityTypeKey(): string {
    return this.data.entityTypeKey;
  }

  get key(): string {
    return this.data.key;
  }

  get labelEn(): string {
    return this.data.labelEn;
  }

  get labelAr(): string | null | undefined {
    return this.data.labelAr;
  }

  get placeholderEn(): string | null | undefined {
    return this.data.placeholderEn;
  }

  get placeholderAr(): string | null | undefined {
    return this.data.placeholderAr;
  }

  get valueType(): number {
    return this.data.valueType;
  }

  get isRequired(): boolean {
    return this.data.isRequired;
  }

  get options(): string | null | undefined {
    return this.data.options;
  }

  get sortOrder(): number {
    return this.data.sortOrder;
  }

  get isActive(): boolean {
    return this.data.isActive;
  }

  get createdAt(): string {
    return this.data.createdAt;
  }

  get modifiedAt(): string | null | undefined {
    return this.data.modifiedAt;
  }

  get isGlobal(): boolean {
    return this.data.isGlobal ?? false;
  }
}
