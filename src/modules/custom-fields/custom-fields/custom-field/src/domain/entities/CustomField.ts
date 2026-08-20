/**
 * CustomField Entity
 *
 * Domain entity representing a CustomField definition in the system.
 */

import type { CustomFieldValueTypeName } from "../../../../custom-field-value/src/data/models/CustomFieldValueModel";

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
  /** See EntityTypeItemJson's identical field for the full contract. */
  permissionResource?: string;
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
  valueType: CustomFieldValueTypeName;
  isRequired: boolean;
  options?: string | null;
  /** Arabic option labels, newline-separated and positionally aligned with `options`. */
  optionsAr?: string | null;
  /**
   * Data classification (Wave 6 ruling R10). Wire values are the C# enum member names:
   * `"None" | "Internal" | "Confidential" | "Restricted"`.
   *
   * A curation and disclosure-control label, NOT the access-control mechanism — field-level
   * security is what decides who may read a value.
   */
  sensitivity?: string | null;
  /**
   * Whether this field appears in exports (capability C08). Defaults to `true` server-side.
   *
   * Not a security boundary: turning it off is curation, not authorization.
   */
  isExportable?: boolean | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  modifiedAt?: string | null;
  /** True for a platform-owned (TenantId == null) definition inherited by every tenant. Absent on detail fetches (list-only). */
  isGlobal?: boolean;
  /**
   * Wave 2 Step 2.5 Task 9. Wire name is the C# ValidatorKind member name
   * (see validatorKindRegistry.ts). Absent on list rows (R3) -- only
   * populated from a detail fetch.
   */
  validatorKind?: string | null;
  /** Wave 2 Step 2.5 Task 9. Absent on list rows (R3), same as validatorKind. */
  validatorParam?: string | null;
  /**
   * Wave 5 row 5.2. Encrypted id of the FieldGroup this definition belongs to,
   * or null/undefined when ungrouped. Absent on list rows, same as the two
   * validator columns — `CustomFieldListResponse` does not carry it.
   */
  fieldGroupId?: string | null;
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

  get valueType(): CustomFieldValueTypeName {
    return this.data.valueType;
  }

  get isRequired(): boolean {
    return this.data.isRequired;
  }

  get options(): string | null | undefined {
    return this.data.options;
  }

  get optionsAr(): string | null | undefined {
    return this.data.optionsAr;
  }

  get sensitivity(): string | null | undefined {
    return this.data.sensitivity;
  }

  get isExportable(): boolean | null | undefined {
    return this.data.isExportable;
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

  get validatorKind(): string | null | undefined {
    return this.data.validatorKind;
  }

  get validatorParam(): string | null | undefined {
    return this.data.validatorParam;
  }

  get fieldGroupId(): string | null | undefined {
    return this.data.fieldGroupId;
  }
}
