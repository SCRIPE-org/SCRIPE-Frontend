/**
 * CustomField Model (DTO)
 *
 * Represents the API data transfer object for CustomField.
 * Service uses this for API communication.
 * Mapper converts between CustomFieldModel <-> CustomField Entity.
 */

/**
 * CustomFieldValueType wire names -- mirrors backend enum member names verbatim
 * (CustomFields.Domain.Enums.CustomFieldValueType). The API's global
 * JsonStringEnumConverter serializes enums as strings, so this is never a
 * number on the wire. Duplicated (not imported) from the sibling
 * custom-field-value submodule's identical type, matching this module's own
 * "duplicate rather than cross-submodule-import" convention (see
 * core/crud/customFieldsExtension.tsx's identical duplication and its doc
 * comment for the reasoning).
 */
export type CustomFieldValueTypeName = "Text" | "Number" | "Boolean" | "Date" | "Select";

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
}

/**
 * CustomField list-row JSON shape from API.
 * The list response omits `options` and `modifiedAt`.
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
    public readonly placeholderAr?: string | null
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
      json.placeholderAr
    );
  }

  /**
   * Create CustomFieldModel from API list-row JSON (no options / modifiedAt /
   * placeholders — the list response is deliberately form-population-free,
   * same convention as options).
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
    };
  }
}
