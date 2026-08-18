/**
 * CustomField Model (DTO)
 *
 * Represents the API data transfer object for CustomField.
 * Service uses this for API communication.
 * Mapper converts between CustomFieldModel <-> CustomField Entity.
 */

import type { CustomFieldValueTypeName } from "../../../../custom-field-value/src/data/models/CustomFieldValueModel";

/**
 * EntityType item JSON shape from API.
 */
export interface EntityTypeItemJson {
  key: string;
  owningModule: string;
  displayNameEn: string;
  displayNameAr: string;
  /**
   * False when no frontend screen renders this entity type's custom fields
   * yet — the values API works for it, but a definition created against it
   * won't appear on any form. Sourced from the backend entity-type registry
   * (`EntityTypeItem.HasFrontendScreen`), deliberately not a hardcoded list
   * here that would go stale the moment a screen ships.
   *
   * Optional so a response from an older backend (which omits the field)
   * doesn't silently mark every entity type as screenless — see the
   * `?? true` fallback where this is consumed.
   */
  hasFrontendScreen?: boolean;
}

/**
 * CustomField JSON shape from API (detail / GET-by-id).
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
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  modifiedAt?: string | null;
  /**
   * Wave 2 Step 2.5 Task 9. Wire name is the exact C# enum member name
   * (e.g. "SwiftBic", "PostalCode") -- see validatorKindRegistry.ts for the
   * closed set. Kept as a plain string here (not narrowed to
   * ValidatorKindName) because that union's canonical home is currently the
   * presentation-layer registry, not this data-layer DTO; narrowing here
   * would mean this file importing a presentation-layer type, which is the
   * wrong direction for this module's Data -> Presentation layering.
   * `undefined`/`null` means no validator attached.
   */
  validatorKind?: string | null;
  /**
   * Wave 2 Step 2.5 Task 9. Free-form parameter for the 6 parameterized
   * ValidatorKind members (e.g. "1,100" for NumericRange, "EG" for
   * PostalCode). `undefined`/`null` for the 7 non-parameterized kinds.
   */
  validatorParam?: string | null;
}

/**
 * CustomField list-row JSON shape from API.
 * The list response omits `options`, `modifiedAt`, both placeholders, and
 * (per R3, Wave 2 Step 2.5) `validatorKind`/`validatorParam` -- deliberately,
 * not an oversight. `CustomFieldListResponse` on the backend has no such
 * fields, so do not add them here.
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
  /** True for a platform-owned (TenantId == null) definition inherited by every tenant. */
  isGlobal: boolean;
}

/**
 * Paginated CustomField list response from API
 */
export interface CustomFieldListResponseJson {
  items: CustomFieldListItemJson[];
  totalCount: number;
  /**
   * Backend `PagedResult<T>.PageNumber` (Core.Application.Common.PagedResult),
   * serialized as `pageNumber` under the API's camelCase JSON naming policy.
   * NOT `page` — see CustomFieldService.test.ts for the pinned wire shape.
   */
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * CustomField Model class
 *
 * Wraps API JSON with fromJson/toJson methods.
 */
export class CustomFieldModel {
  constructor(
    public readonly id: string,
    public readonly entityTypeKey: string,
    public readonly key: string,
    public readonly labelEn: string,
    public readonly valueType: CustomFieldValueTypeName,
    public readonly isRequired: boolean,
    public readonly sortOrder: number,
    public readonly isActive: boolean,
    public readonly createdAt: string,
    public readonly labelAr?: string | null,
    public readonly options?: string | null,
    public readonly modifiedAt?: string | null,
    public readonly isGlobal?: boolean,
    public readonly placeholderEn?: string | null,
    public readonly placeholderAr?: string | null,
    // Wave 2 Step 2.5 Task 9 (TRAP 12) -- appended at the tail (positions
    // 16/17) deliberately. This constructor's optionals already sit in a
    // non-obvious order (labelAr, options, modifiedAt, isGlobal,
    // placeholderEn, placeholderAr); inserting a new param anywhere before
    // placeholderAr would silently reassign every positional call site's
    // trailing string|null|undefined arguments to the wrong field, and
    // TypeScript would not reliably catch it. Do not reorder.
    public readonly validatorKind?: string | null,
    public readonly validatorParam?: string | null
  ) {}

  /**
   * Create CustomFieldModel from API detail JSON
   */
  static fromJson(json: CustomFieldJson): CustomFieldModel {
    return new CustomFieldModel(
      json.id,
      json.entityTypeKey,
      json.key,
      json.labelEn,
      json.valueType,
      json.isRequired,
      json.sortOrder,
      json.isActive,
      json.createdAt,
      json.labelAr,
      json.options,
      json.modifiedAt,
      undefined,
      json.placeholderEn,
      json.placeholderAr,
      json.validatorKind,
      json.validatorParam
    );
  }

  /**
   * Create CustomFieldModel from API list-row JSON (no options / modifiedAt /
   * placeholders / validatorKind / validatorParam — the list response is
   * deliberately form-population-free, same convention as options; R3, Wave
   * 2 Step 2.5. The two new tail constructor params are simply omitted here
   * so they default to `undefined` — that is correct, not a gap to "fix".
   */
  static fromListJson(json: CustomFieldListItemJson): CustomFieldModel {
    return new CustomFieldModel(
      json.id,
      json.entityTypeKey,
      json.key,
      json.labelEn,
      json.valueType,
      json.isRequired,
      json.sortOrder,
      json.isActive,
      json.createdAt,
      json.labelAr,
      null,
      null,
      json.isGlobal
    );
  }

  /**
   * Convert CustomFieldModel to API JSON
   */
  toJson(): CustomFieldJson {
    return {
      id: this.id,
      entityTypeKey: this.entityTypeKey,
      key: this.key,
      labelEn: this.labelEn,
      labelAr: this.labelAr,
      placeholderEn: this.placeholderEn,
      placeholderAr: this.placeholderAr,
      valueType: this.valueType,
      isRequired: this.isRequired,
      options: this.options,
      sortOrder: this.sortOrder,
      isActive: this.isActive,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
      validatorKind: this.validatorKind,
      validatorParam: this.validatorParam,
    };
  }
}
