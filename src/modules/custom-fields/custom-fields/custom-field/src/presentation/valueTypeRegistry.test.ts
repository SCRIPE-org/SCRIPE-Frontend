// VALUE_TYPE_CATALOG -- completeness exit-gate test (Wave 2 Step 2.2, Task 1)
//
// This is the data-shape foundation for the shared value-type registry: it
// only proves every known CustomFieldValueTypeName has a complete, correctly
// shaped catalog entry. No consumer is rewired against this catalog yet.
import { describe, it, expect } from "vitest";
import {
  VALUE_TYPE_CATALOG,
  ALL_VALUE_TYPES,
  getValueTypeCatalogEntry,
  RATING_MIN,
  RATING_MAX,
} from "./valueTypeRegistry";

describe("VALUE_TYPE_CATALOG", () => {
  it.each(ALL_VALUE_TYPES)("has a complete catalog entry for %s", (type) => {
    const entry = VALUE_TYPE_CATALOG[type];
    expect(entry).toBeDefined();
    expect(entry.fieldConfigType).toBeTruthy();
    expect(entry.badgeVariant).toBeTruthy();
    expect(typeof entry.hasPlaceholder).toBe("boolean");
    expect(typeof entry.hasOptions).toBe("boolean");
    expect(entry.labelKey).toMatch(/^customField\.valueTypes\./);
  });

  it("has exactly 19 entries, matching ALL_VALUE_TYPES", () => {
    expect(Object.keys(VALUE_TYPE_CATALOG).sort()).toEqual([...ALL_VALUE_TYPES].sort());
  });

  // Wave 3.1 Task 10: MultiSelect is the SECOND options-owning type (rulings
  // R5/R9) -- `SelectOptionsOwnership`'s backend twin was generalized from a
  // concrete-class check to this same `HasOptions` capability flag for
  // exactly this reason (Task 4). Only Select and MultiSelect may say yes.
  it("only Select and MultiSelect own options", () => {
    for (const type of ALL_VALUE_TYPES) {
      expect(VALUE_TYPE_CATALOG[type].hasOptions).toBe(type === "Select" || type === "MultiSelect");
    }
  });

  // Wave 3.2 Batch 3, backend ruling R2: Rating's ceiling is a code-owned
  // constant (RatingValueTypeHandler.MinRating/MaxRating), not a per-field
  // config knob -- pinned here since both the write control
  // (renderCustomFieldControl.tsx's "slider" branch) and the read formatter
  // (formatCustomFieldValue.tsx's "Rating" case, "N / 5") import these exact
  // values from this module.
  it("pins Rating's ceiling to 1-5, matching the backend's hardcoded RatingValueTypeHandler constants", () => {
    expect(RATING_MIN).toBe(1);
    expect(RATING_MAX).toBe(5);
  });

  // Pins the catalog's values byte-identical to the still-live hardcoded
  // sources this task ported them from (VALUE_TYPE_VARIANTS,
  // NO_PLACEHOLDER_VALUE_TYPES in CustomFieldListView.tsx;
  // VALUE_TYPE_TO_FIELD_TYPE in customFieldsCrudIntegration.tsx) -- a
  // regression here means the catalog has drifted from the behavior it is
  // meant to reproduce exactly.
  it("matches the existing hardcoded per-type values exactly", () => {
    expect(VALUE_TYPE_CATALOG).toEqual({
      Text: {
        fieldConfigType: "text",
        badgeVariant: "secondary",
        hasPlaceholder: true,
        hasOptions: false,
        labelKey: "customField.valueTypes.text",
      },
      Number: {
        fieldConfigType: "number",
        badgeVariant: "info",
        hasPlaceholder: true,
        hasOptions: false,
        labelKey: "customField.valueTypes.number",
      },
      Boolean: {
        fieldConfigType: "switch",
        badgeVariant: "success",
        hasPlaceholder: false,
        hasOptions: false,
        labelKey: "customField.valueTypes.boolean",
      },
      Date: {
        fieldConfigType: "date",
        badgeVariant: "warning",
        hasPlaceholder: false,
        hasOptions: false,
        labelKey: "customField.valueTypes.date",
      },
      Select: {
        fieldConfigType: "select",
        badgeVariant: "default",
        hasPlaceholder: true,
        hasOptions: true,
        labelKey: "customField.valueTypes.select",
      },
      LongText: {
        fieldConfigType: "textarea",
        badgeVariant: "secondary",
        hasPlaceholder: true,
        hasOptions: false,
        labelKey: "customField.valueTypes.longText",
      },
      DateTime: {
        fieldConfigType: "datetime",
        badgeVariant: "warning",
        hasPlaceholder: false,
        hasOptions: false,
        labelKey: "customField.valueTypes.dateTime",
      },
      MultiSelect: {
        fieldConfigType: "multi-select",
        badgeVariant: "default",
        hasPlaceholder: true,
        hasOptions: true,
        labelKey: "customField.valueTypes.multiSelect",
      },
      Email: {
        fieldConfigType: "email",
        badgeVariant: "secondary",
        hasPlaceholder: true,
        hasOptions: false,
        labelKey: "customField.valueTypes.email",
      },
      Url: {
        fieldConfigType: "url",
        badgeVariant: "secondary",
        hasPlaceholder: true,
        hasOptions: false,
        labelKey: "customField.valueTypes.url",
      },
      Phone: {
        fieldConfigType: "tel",
        badgeVariant: "secondary",
        hasPlaceholder: true,
        hasOptions: false,
        labelKey: "customField.valueTypes.phone",
      },
      Percent: {
        fieldConfigType: "number",
        badgeVariant: "info",
        hasPlaceholder: true,
        hasOptions: false,
        labelKey: "customField.valueTypes.percent",
      },
      Rating: {
        fieldConfigType: "slider",
        badgeVariant: "warning",
        hasPlaceholder: false,
        hasOptions: false,
        labelKey: "customField.valueTypes.rating",
      },
      Currency: {
        fieldConfigType: "currency",
        badgeVariant: "info",
        hasPlaceholder: true,
        hasOptions: false,
        labelKey: "customField.valueTypes.currency",
      },
      Duration: {
        fieldConfigType: "duration",
        badgeVariant: "info",
        hasPlaceholder: true,
        hasOptions: false,
        labelKey: "customField.valueTypes.duration",
      },
      Time: {
        fieldConfigType: "time",
        badgeVariant: "warning",
        hasPlaceholder: false,
        hasOptions: false,
        labelKey: "customField.valueTypes.time",
      },
      Color: {
        fieldConfigType: "color",
        badgeVariant: "secondary",
        hasPlaceholder: false,
        hasOptions: false,
        labelKey: "customField.valueTypes.color",
      },
      EntityReference: {
        fieldConfigType: "entity-reference",
        badgeVariant: "default",
        hasPlaceholder: true,
        hasOptions: false,
        labelKey: "customField.valueTypes.entityReference",
      },
      UserReference: {
        fieldConfigType: "entity-reference",
        badgeVariant: "default",
        hasPlaceholder: true,
        hasOptions: false,
        labelKey: "customField.valueTypes.userReference",
      },
    });
  });

  // Wave 4. The two reference types share ONE fieldConfigType on purpose --
  // they differ only in which target key their picker is fed, which is data,
  // not a control kind (see the catalog entries' own comments). Pinned so a
  // later "UserReference deserves its own key" change has to be a deliberate,
  // reviewed edit here rather than a silent divergence that quietly leaves
  // one of the two types with no renderCustomFieldControl branch at all.
  it("maps both reference types onto the same entity-reference control, and nothing else onto it", () => {
    for (const type of ALL_VALUE_TYPES) {
      expect(VALUE_TYPE_CATALOG[type].fieldConfigType === "entity-reference").toBe(
        type === "EntityReference" || type === "UserReference"
      );
    }
  });

  // Wave 4. `hasOptions: false` on both reference types is load-bearing, not
  // incidental: the definition-level target pin
  // (CustomField.ReferenceTargetEntityTypeKey) is a target CONSTRAINT, not an
  // option list, and flipping this to true would route the whole type through
  // SelectOptionsOwnership and every Select-shaped option path in the module.
  // Covered by the "only Select and MultiSelect own options" test above, and
  // restated here so the reason is recorded next to the reference types
  // themselves rather than only inside a test about Select.
  it("keeps both reference types out of the options-owning family", () => {
    expect(VALUE_TYPE_CATALOG.EntityReference.hasOptions).toBe(false);
    expect(VALUE_TYPE_CATALOG.UserReference.hasOptions).toBe(false);
  });
});

// getValueTypeCatalogEntry -- safe-lookup helper (Wave 2 Step 2.4, D3).
// VALUE_TYPE_CATALOG[type] types as total over CustomFieldValueTypeName, so a
// caller that casts unvalidated wire/form data into that union and indexes
// directly gets no compile-time warning it might be wrong, and a runtime
// crash when it is (I1's exact bug class). This helper exists so that
// defending against that is a return-type guarantee (`| undefined`), not
// something every call site has to remember to `?.`-guard by hand.
describe("getValueTypeCatalogEntry", () => {
  it.each(ALL_VALUE_TYPES)("returns the real catalog entry for a known type %s", (type) => {
    expect(getValueTypeCatalogEntry(type)).toBe(VALUE_TYPE_CATALOG[type]);
  });

  // The actual point of this helper: an unrecognized string -- exactly the
  // shape of a not-yet-known-to-the-frontend backend value type -- must
  // resolve to `undefined`, not throw and not silently type as `any`.
  it("returns undefined (not throws, not any) for an unrecognized string", () => {
    let result: ReturnType<typeof getValueTypeCatalogEntry>;
    expect(() => {
      result = getValueTypeCatalogEntry("SomeFutureType");
    }).not.toThrow();
    expect(result).toBeUndefined();
  });

  it("returns undefined for an empty string", () => {
    expect(getValueTypeCatalogEntry("")).toBeUndefined();
  });
});
