/**
 * CustomField ValidatorKind catalog -- Wave 2 Step 2.5 Task 8.
 *
 * Frontend-side companion to `valueTypeRegistry.ts`'s VALUE_TYPE_CATALOG
 * triad, for the closed, developer-curated set of Text value-type
 * validators the backend ships (`CustomFields.Domain.Enums.ValidatorKind`,
 * D2/D3/S-1 -- tenants compose an existing member on a field definition;
 * they never author a pattern themselves, there is no tenant-raw-regex path
 * anywhere in this module). This module only DEFINES the catalog. No
 * consumer is rewired yet -- that is Task 10 in this same plan.
 *
 * Unlike `CustomFieldValueTypeName` (re-exported here from the
 * already-shipped `CustomFieldValueModel.ts`), `ValidatorKindName` has no
 * existing frontend home yet: Task 9 (frontend read path -- CustomFieldModel.ts,
 * CustomFieldMapper.ts, CustomField.ts) has not landed at the time this file
 * is written, and this task's file ownership explicitly excludes those
 * files. This file is therefore the canonical definition of the type until
 * a later task re-exports it from the read-path model the way
 * `valueTypeRegistry.ts` re-exports `CustomFieldValueTypeName` -- not this
 * task's call to make.
 *
 * Member strings are the exact C# enum member names, character for
 * character -- `ServiceExtensions.cs:57` registers a bare
 * `JsonStringEnumConverter` with no naming policy, so the API emits and
 * accepts the member NAME as the wire string, never the numeric value and
 * never a re-cased variant. Verified directly against
 * `CustomFields.Domain/Enums/ValidatorKind.cs`, member by member:
 * Iban=0, EgyptianNationalId=1, SaudiNationalId=2, EmiratiNationalId=3,
 * Imei=4, SwiftBic=5, VehiclePlate=6, PostalCode=7, NumericRange=8,
 * LengthRange=9, OneOfList=10, WildcardContains=11, WildcardStartsWith=12.
 */

/**
 * Mirrors `CustomFields.Domain.Enums.ValidatorKind`'s wire names, in the
 * enum's own declared order (values 0..12 -- that file's doc comment: "must
 * NEVER be renumbered, reordered, or reused once shipped").
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

export interface ValidatorKindCatalogEntry {
  /**
   * i18n key for this kind's display label in the admin picker, under the
   * `customField.validatorKinds.*` namespace Task 10 adds alongside the
   * existing `customField.valueTypes.*` block (custom-field.en.ts:53-60).
   */
  labelKey: string;
  /**
   * Whether this kind requires a non-blank `CustomField.ValidatorParam` on
   * the field definition. Mirrors the backend's
   * `ValidatorKindOwnership.ParameterizedKinds` HashSet exactly
   * (`ValidatorKindOwnership.cs:45-53`) -- the split is 7 kinds without a
   * param, 6 with. This catalog and that HashSet must never disagree; both
   * are pinned by their own completeness test (this file's test pins this
   * one; `CustomFieldValidatorOwnershipDriftTests` pins that one).
   */
  hasParam: boolean;
  /**
   * i18n key for the hint/placeholder text Task 10 renders next to the
   * param input, describing the expected shape of `ValidatorParam` for
   * this kind -- e.g. "{min},{max}" for NumericRange/LengthRange, a
   * newline-delimited list for OneOfList, a supported 2-letter country
   * code for PostalCode. Present iff `hasParam` is true -- deliberately
   * `undefined` (never an empty string) for the 7 non-parameterized kinds,
   * so a stray render of this field for one of them fails loudly (an
   * `undefined` key handed to an i18n `t()` call) instead of silently
   * showing a blank hint.
   */
  paramHintKey?: string;
  /**
   * PostalCode only: the closed set of 2-letter country codes the backend
   * definition-time gate accepts
   * (`ValidatorPresets.SupportedPostalCodeCountries`, `ValidatorPresets.cs:562-563`
   * -- EG, SA, US, GB, DE, FR, CA, in that exact order). AE was
   * deliberately dropped post-implementation (see that constant's own "AE
   * CORRECTION" doc comment): the UAE has no national postal-code system,
   * so there was never a real pattern to validate against there, unlike
   * VehiclePlate's genuine cross-jurisdiction permissiveness (R11). Task 10
   * renders this list instead of hardcoding it a second time, so the
   * frontend's offered options and the backend's actual gate can never
   * drift apart. `undefined` for every other kind, including the other 5
   * parameterized ones -- none of them has a closed value set.
   */
  supportedParamValues?: readonly string[];
}

/**
 * Wave 2 Step 2.5 Task 8, mirroring VALUE_TYPE_CATALOG's own Task 2.4/D3
 * reasoning almost verbatim: this Record types as TOTAL over the 13 known
 * members, but nothing at the wire boundary actually guarantees a real
 * `data.validatorKind` IS one of them -- a field saved before this frontend
 * catalog existed, or a future 14th member the backend ships before this
 * catalog is updated, both arrive as a plain `string`. Indexing this Record
 * directly with a value TypeScript only *believes* is a `ValidatorKindName`
 * compiles clean and gives no warning, but throws at runtime (`Cannot read
 * properties of undefined`) the moment it's wrong.
 *
 * For anything touching real/wire data prefer
 * `getValidatorKindCatalogEntry(type)` below -- it takes a plain `string`,
 * so there is no union-typed value to mistakenly trust, and returns
 * `undefined` (not a crash) on a miss. Direct `VALIDATOR_KIND_CATALOG[type]`
 * indexing stays fine for call sites iterating the compile-time
 * `ALL_VALIDATOR_KINDS` array itself (e.g. building the admin picker's own
 * option list) -- `type` there is genuinely guaranteed to be a real member.
 */
export const VALIDATOR_KIND_CATALOG: Record<ValidatorKindName, ValidatorKindCatalogEntry> = {
  Iban: {
    labelKey: "customField.validatorKinds.iban",
    hasParam: false,
  },
  EgyptianNationalId: {
    labelKey: "customField.validatorKinds.egyptianNationalId",
    hasParam: false,
  },
  SaudiNationalId: {
    labelKey: "customField.validatorKinds.saudiNationalId",
    hasParam: false,
  },
  EmiratiNationalId: {
    labelKey: "customField.validatorKinds.emiratiNationalId",
    hasParam: false,
  },
  Imei: {
    labelKey: "customField.validatorKinds.imei",
    hasParam: false,
  },
  SwiftBic: {
    labelKey: "customField.validatorKinds.swiftBic",
    hasParam: false,
  },
  VehiclePlate: {
    labelKey: "customField.validatorKinds.vehiclePlate",
    hasParam: false,
  },
  PostalCode: {
    labelKey: "customField.validatorKinds.postalCode",
    hasParam: true,
    paramHintKey: "customField.validatorKindParamHints.postalCode",
    supportedParamValues: ["EG", "SA", "US", "GB", "DE", "FR", "CA"],
  },
  NumericRange: {
    labelKey: "customField.validatorKinds.numericRange",
    hasParam: true,
    paramHintKey: "customField.validatorKindParamHints.numericRange",
  },
  LengthRange: {
    labelKey: "customField.validatorKinds.lengthRange",
    hasParam: true,
    paramHintKey: "customField.validatorKindParamHints.lengthRange",
  },
  OneOfList: {
    labelKey: "customField.validatorKinds.oneOfList",
    hasParam: true,
    paramHintKey: "customField.validatorKindParamHints.oneOfList",
  },
  WildcardContains: {
    labelKey: "customField.validatorKinds.wildcardContains",
    hasParam: true,
    paramHintKey: "customField.validatorKindParamHints.wildcardContains",
  },
  WildcardStartsWith: {
    labelKey: "customField.validatorKinds.wildcardStartsWith",
    hasParam: true,
    paramHintKey: "customField.validatorKindParamHints.wildcardStartsWith",
  },
};

/**
 * Safe-lookup counterpart to `VALIDATOR_KIND_CATALOG[...]` for real/wire
 * data, mirroring `getValueTypeCatalogEntry` (`valueTypeRegistry.ts:149-151`)
 * exactly. Takes a plain `string` on purpose, not the narrow
 * `ValidatorKindName` union -- the entire point is defending against a
 * value that isn't guaranteed to be a real union member. Returns
 * `undefined` on a miss -- never throws, never widens to `any`.
 */
export function getValidatorKindCatalogEntry(type: string): ValidatorKindCatalogEntry | undefined {
  return VALIDATOR_KIND_CATALOG[type as ValidatorKindName];
}

/**
 * All 13 known members, in the enum's own declared order
 * (`ValidatorKind.cs:21-33`).
 */
export const ALL_VALIDATOR_KINDS: readonly ValidatorKindName[] = [
  "Iban",
  "EgyptianNationalId",
  "SaudiNationalId",
  "EmiratiNationalId",
  "Imei",
  "SwiftBic",
  "VehiclePlate",
  "PostalCode",
  "NumericRange",
  "LengthRange",
  "OneOfList",
  "WildcardContains",
  "WildcardStartsWith",
];
