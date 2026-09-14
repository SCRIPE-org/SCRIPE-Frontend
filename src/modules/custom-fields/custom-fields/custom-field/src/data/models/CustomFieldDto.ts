/**
 * Custom Field Data Transfer Objects (DTOs) and Interface Definitions
 *
 * Defines API payload structures for custom field configurations, list items,
 * and entity type discovery responses.
 */

import type { CustomFieldValueTypeName } from "../../../../custom-field-value/src/data/models/CustomFieldValueModel";

/**
 * Supported validator kinds for field values.
 */
export type ValidatorKindName =
  | "Iban"
  | "EgyptianNationalId"
  | "SaudiNationalId"
  | "EmiratiNationalId"
  | "Imei"
  | "SwiftBic"
  | "VehiclePlate"
  | "PostalCode"
  | "NumericRange"
  | "LengthRange"
  | "OneOfList"
  | "WildcardContains"
  | "WildcardStartsWith";

/**
 * EntityType item JSON shape from the server discovery API.
 */
export interface EntityTypeItemJson {
  key: string;
  owningModule: string;
  displayNameEn: string;
  displayNameAr: string;
  /**
   * Indicates whether a frontend screen currently supports custom fields for this entity type.
   */
  hasFrontendScreen?: boolean;
  /**
   * The permission resource protecting this entity type's records (e.g. `party-people`).
   */
  permissionResource?: string;
}

/**
 * Complete custom field configuration JSON shape from the detail API.
 */
export interface CustomFieldJson {
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
  optionsAr?: string | null;
  sensitivity?: string | null;
  isExportable?: boolean | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  modifiedAt?: string | null;
  validatorKind?: string | null;
  validatorParam?: string | null;
  fieldGroupId?: string | null;
  referenceTargetEntityTypeKey?: string | null;
}

/**
 * Condensed custom field row JSON shape returned by list endpoints.
 */
export interface CustomFieldListItemJson {
  id: string;
  entityTypeKey: string;
  key: string;
  labelEn: string;
  labelAr?: string | null;
  valueType: CustomFieldValueTypeName;
  isRequired: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  /** Indicates whether the definition is platform-owned or tenant-specific. */
  isGlobal: boolean;
}

/**
 * Paginated custom field list response envelope from the API.
 */
export interface CustomFieldListResponseJson {
  items: CustomFieldListItemJson[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
