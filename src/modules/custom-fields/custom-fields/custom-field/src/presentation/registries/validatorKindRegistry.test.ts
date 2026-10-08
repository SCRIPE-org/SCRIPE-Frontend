// VALIDATOR_KIND_CATALOG -- completeness exit-gate test (Wave 2 Step 2.5,
// Task 8). Mirrors valueTypeRegistry.test.ts's shape and intent: proves
// every one of the 13 known ValidatorKindName members has a complete,
// correctly shaped catalog entry, and that the 7/6
// non-parameterized/parameterized split matches the backend's
// ValidatorKindOwnership.ParameterizedKinds exactly -- these two lists must
// never disagree (ValidatorKindOwnership.cs:36-53).
//
// Every count below (13, 7, 6) is a literal, independent of
// ALL_VALIDATOR_KINDS's own length, deliberately -- so that a member added
// to one list but not the other (the catalog, the union, or this test's own
// PARAMETERIZED_KINDS mirror) fails a hardcoded assertion instead of two
// derived lists silently staying "in sync" with each other while both drift
// away from the real 13.
import { describe, it, expect } from "vitest";
import {
  VALIDATOR_KIND_CATALOG,
  ALL_VALIDATOR_KINDS,
  getValidatorKindCatalogEntry,
  type ValidatorKindName,
} from "./validatorKindRegistry";

// The 6 parameterized members, transcribed independently from
// ValidatorKindOwnership.cs:45-53 (not derived from VALIDATOR_KIND_CATALOG
// itself) so this test has its own opinion on the split to check the
// catalog against.
const PARAMETERIZED_KINDS: readonly ValidatorKindName[] = [
  "PostalCode",
  "NumericRange",
  "LengthRange",
  "OneOfList",
  "WildcardContains",
  "WildcardStartsWith",
];

describe("VALIDATOR_KIND_CATALOG", () => {
  it.each(ALL_VALIDATOR_KINDS)("has a complete catalog entry for %s", (kind) => {
    const entry = VALIDATOR_KIND_CATALOG[kind];
    expect(entry).toBeDefined();
    expect(entry.labelKey).toMatch(/^customField\.validatorKinds\./);
    expect(typeof entry.hasParam).toBe("boolean");
  });

  // Hardcoded to the real member count on purpose (see file header) -- not
  // just "matches ALL_VALIDATOR_KINDS's own length".
  it("has exactly 13 known members", () => {
    expect(ALL_VALIDATOR_KINDS).toHaveLength(13);
    expect(Object.keys(VALIDATOR_KIND_CATALOG)).toHaveLength(13);
  });

  it("has exactly 13 entries, matching ALL_VALIDATOR_KINDS", () => {
    expect(Object.keys(VALIDATOR_KIND_CATALOG).sort()).toEqual([...ALL_VALIDATOR_KINDS].sort());
  });

  it("matches ValidatorKindOwnership's 7/6 non-parameterized/parameterized split exactly", () => {
    expect(PARAMETERIZED_KINDS).toHaveLength(6);
    expect(ALL_VALIDATOR_KINDS.filter((kind) => !PARAMETERIZED_KINDS.includes(kind))).toHaveLength(
      7
    );

    for (const kind of ALL_VALIDATOR_KINDS) {
      expect(VALIDATOR_KIND_CATALOG[kind].hasParam).toBe(PARAMETERIZED_KINDS.includes(kind));
    }
  });

  it("gives every parameterized kind a paramHintKey, and every non-parameterized kind none", () => {
    for (const kind of ALL_VALIDATOR_KINDS) {
      const entry = VALIDATOR_KIND_CATALOG[kind];
      if (entry.hasParam) {
        expect(entry.paramHintKey).toMatch(/^customField\.validatorKindParamHints\./);
      } else {
        expect(entry.paramHintKey).toBeUndefined();
      }
    }
  });

  // R9 (corrected post-implementation): PostalCode's supported countries
  // are exactly these 7, in this order -- byte-identical to
  // ValidatorPresets.SupportedPostalCodeCountries (ValidatorPresets.cs:562-563).
  // AE is deliberately absent (the UAE has no national postal-code system,
  // per that constant's own "AE CORRECTION" note); a regression here
  // (adding AE back, dropping a real country, or reordering) means the
  // frontend's offered option list has silently diverged from what the
  // backend gate will actually accept.
  it("PostalCode's supportedParamValues matches ValidatorPresets.SupportedPostalCodeCountries exactly", () => {
    expect(VALIDATOR_KIND_CATALOG.PostalCode.supportedParamValues).toEqual([
      "EG",
      "SA",
      "US",
      "GB",
      "DE",
      "FR",
      "CA",
    ]);
  });

  it("only PostalCode carries supportedParamValues", () => {
    for (const kind of ALL_VALIDATOR_KINDS) {
      if (kind === "PostalCode") continue;
      expect(VALIDATOR_KIND_CATALOG[kind].supportedParamValues).toBeUndefined();
    }
  });
});

// getValidatorKindCatalogEntry -- safe-lookup helper, mirroring
// getValueTypeCatalogEntry's own reasoning (valueTypeRegistry.ts:136-148):
// VALIDATOR_KIND_CATALOG[kind] types as total over ValidatorKindName, so a
// caller that casts unvalidated wire/form data into that union and indexes
// directly gets no compile-time warning it might be wrong, and a runtime
// crash when it is. This helper exists so defending against that is a
// return-type guarantee (`| undefined`), not something every call site has
// to remember to `?.`-guard by hand.
describe("getValidatorKindCatalogEntry", () => {
  it.each(ALL_VALIDATOR_KINDS)("returns the real catalog entry for a known kind %s", (kind) => {
    expect(getValidatorKindCatalogEntry(kind)).toBe(VALIDATOR_KIND_CATALOG[kind]);
  });

  // The actual point of this helper: an unrecognized string -- exactly the
  // shape of a not-yet-known-to-the-frontend backend ValidatorKind member --
  // must resolve to `undefined`, not throw and not silently type as `any`.
  it("returns undefined (not throws, not any) for an unrecognized string", () => {
    let result: ReturnType<typeof getValidatorKindCatalogEntry>;
    expect(() => {
      result = getValidatorKindCatalogEntry("SomeFutureValidatorKind");
    }).not.toThrow();
    expect(result).toBeUndefined();
  });

  it("returns undefined for an empty string", () => {
    expect(getValidatorKindCatalogEntry("")).toBeUndefined();
  });
});
