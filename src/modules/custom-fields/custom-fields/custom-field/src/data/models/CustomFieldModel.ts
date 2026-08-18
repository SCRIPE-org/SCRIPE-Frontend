/**
 * CustomField Model (DTO)
 *
 * Represents the API data transfer object for CustomField.
 * Service uses this for API communication.
 * Mapper converts between CustomFieldModel <-> CustomField Entity.
 */

import type { CustomFieldValueTypeName } from "../../../../custom-field-value/src/data/models/CustomFieldValueModel";

/**
 * Mirrors `CustomFields.Domain.Enums.ValidatorKind`'s wire names, in the
 * enum's own declared order. Wave 2 Step 2.5 Task 10: this is now the
 * canonical declaration site, re-exported by `../../presentation/
 * validatorKindRegistry.ts` -- Task 8 originally declared it there (this
 * file's `validatorKind` field didn't exist yet at Task 8 time, and Task 9
 * couldn't touch the registry file per its own ownership scope), mirroring
 * the same data-layer-defines/presentation-re-exports shape already
 * established for `CustomFieldValueTypeName` (declared in
 * `CustomFieldValueModel.ts`, re-exported by `valueTypeRegistry.ts`).
 *
 * NOTE: `CustomFieldJson.validatorKind` and `CustomField.data.validatorKind`
 * below deliberately still type as plain `string | null` rather than this
 * union -- narrowing those would cascade into `CustomFieldMapper.ts`'s
 * constructor-argument typing and `domain/entities/CustomField.ts`'s
 * `CustomFieldData.validatorKind`, both outside this task's file ownership.
 * Moving the union's declaration here (so there's exactly one canonical copy
 * instead of two) was in scope; retyping every field that carries the value
 * is a follow-up.
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
   * Wave 2 Step 2.5 Task 9/10. Wire name is the exact C# enum member name
   * (e.g. "SwiftBic", "PostalCode") -- see the `ValidatorKindName` union
   * above (this file, as of Task 10) for the closed set. Still typed as a
   * plain string here rather than that union -- see the union's own doc
   * comment above for why the field-level narrowing is a deliberate
   * follow-up, not an oversight. `undefined`/`null` means no validator
   * attached.
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
   *
   * "Form-population-free" is load-bearing, not descriptive (Step 2.5 fix
   * round, finding C-1): a row produced here must NEVER be handed to
   * `buildCustomFieldEditInitialValues`, because every field missing above
   * becomes `""` there and is then written back as blank. For a long time it
   * was — `useCrudViewModel.openEditModal` stored the list row verbatim and
   * the edit form read it — which silently detached validators, blanked both
   * placeholders, and made Select definitions unsaveable. The edit path now
   * goes through `getById` first; see `useCustomFieldViewModel.openEditModal`.
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
