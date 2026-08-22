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
  /**
   * The permission resource guarding this entity type's own data (e.g.
   * `party-people`) — the resource its values authorize against, and the key
   * field-level restrictions are recorded under.
   *
   * Present so a client can translate between the two vocabularies field-level
   * security straddles: restrictions are configured per permission RESOURCE, while
   * custom fields are defined per ENTITY TYPE. The mapping is **one-to-many** —
   * `media.medias` and `media.file` both report `medias` — so resolving a resource
   * means unioning across every entity type that reports it, never stopping at the
   * first match.
   *
   * Optional because the backend omitted it until Tier 1 slice 7, and both this
   * response and its client cache are held for an hour — so existing sessions keep
   * serving the resource-less shape for a while after that ships. Consumers must
   * degrade rather than assume it is there.
   */
  permissionResource?: string;
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
  optionsAr?: string | null;
  /** Wave 6 ruling R10. C# enum member name: "None" | "Internal" | "Confidential" | "Restricted". */
  sensitivity?: string | null;
  isExportable?: boolean | null;
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
  /**
   * Wave 5 row 5.2. Encrypted `FieldGroup` id this definition is assigned to,
   * or `null`/`undefined` when the field is ungrouped. DETAIL response only --
   * `CustomFieldListResponse` deliberately does NOT carry it (see
   * `CustomFieldListItemJson` below), exactly like the two validator columns,
   * because the list response is form-population-free.
   */
  fieldGroupId?: string | null;
  /**
   * Wave 4 follow-up. Registry key of the entity type a REFERENCE field's definition is pinned to,
   * or `null`/`undefined` for an unpinned field. Wire name is camelCase
   * `referenceTargetEntityTypeKey`, from `CustomFieldResponse.ReferenceTargetEntityTypeKey`
   * (verified against that record, not inferred from the entity).
   *
   * DETAIL response only, same as `fieldGroupId` and the two validator columns above --
   * `CustomFieldListResponse` has no such property, so do not add it to
   * `CustomFieldListItemJson` below.
   */
  referenceTargetEntityTypeKey?: string | null;
}

/**
 * CustomField list-row JSON shape from API.
 * The list response omits `options`, `modifiedAt`, both placeholders,
 * (per R3, Wave 2 Step 2.5) `validatorKind`/`validatorParam`, (Wave 5 row
 * 5.2) `fieldGroupId`, and (Wave 4 follow-up)
 * `referenceTargetEntityTypeKey` -- deliberately, not an oversight.
 * `CustomFieldListResponse` on the backend has no such fields, so do not add
 * them here.
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
    public readonly optionsAr?: string | null,
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
    public readonly validatorParam?: string | null,
    // Wave 5 row 5.2 -- appended at the tail (position 18) for the exact same
    // reason the two validator params were: every optional below `createdAt`
    // is positional and interchangeably typed `string | null | undefined`, so
    // inserting anywhere earlier would silently reassign existing call sites'
    // arguments to the wrong field without a type error. Do not reorder.
    public readonly fieldGroupId?: string | null,
    // Wave 6 ruling R10 -- appended at the tail (positions 19/20) for the same reason every optional
    // above was: they are positional and interchangeably typed, so inserting earlier would silently
    // reassign existing call sites' arguments to the wrong field with no type error. Do not reorder.
    public readonly sensitivity?: string | null,
    public readonly isExportable?: boolean | null,
    // Wave 4 follow-up -- appended at the tail (position 21) for the same reason every optional
    // above was: they are positional and interchangeably typed `string | null | undefined`, so
    // inserting anywhere earlier would silently reassign existing call sites' arguments to the
    // wrong field with no type error. Do not reorder.
    public readonly referenceTargetEntityTypeKey?: string | null
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
      json.optionsAr,
      json.modifiedAt,
      undefined,
      json.placeholderEn,
      json.placeholderAr,
      json.validatorKind,
      json.validatorParam,
      json.fieldGroupId,
      json.sensitivity,
      json.isExportable,
      json.referenceTargetEntityTypeKey
    );
  }

  /**
   * Create CustomFieldModel from API list-row JSON (no options / modifiedAt /
   * placeholders / validatorKind / validatorParam / fieldGroupId — the list
   * response is deliberately form-population-free, same convention as options;
   * R3, Wave 2 Step 2.5, extended by Wave 5 row 5.2. The three tail
   * constructor params are simply omitted here so they default to `undefined`
   * — that is correct, not a gap to "fix".
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
      // options, optionsAr, modifiedAt -- all deliberately absent from the LIST response (see this
      // method's own doc comment: a row built here must never populate the edit form).
      null,
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
      optionsAr: this.optionsAr,
      sortOrder: this.sortOrder,
      isActive: this.isActive,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
      validatorKind: this.validatorKind,
      validatorParam: this.validatorParam,
      fieldGroupId: this.fieldGroupId,
      sensitivity: this.sensitivity,
      isExportable: this.isExportable,
      referenceTargetEntityTypeKey: this.referenceTargetEntityTypeKey,
    };
  }
}
