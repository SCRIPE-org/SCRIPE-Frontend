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
  RICH_TEXT_MAX_CHARACTERS,
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

  // THE ONE ASSERTION TYPESCRIPT CANNOT MAKE FOR US. `VALUE_TYPE_CATALOG` is a
  // total Record over the union, so a missing catalog entry is a compile error --
  // but `ALL_VALUE_TYPES` is a plain array, so a type added to the union and the
  // catalog while this array is left alone compiles clean, and every gate in the
  // module that iterates ALL_VALUE_TYPES then passes by never seeing the new
  // type. This is the assertion that fails in that case, in both directions.
  // Wave 3.4 raises the count from 19 to 22 (File=19, Image=20, RichText=21).
  it("has exactly 22 entries, matching ALL_VALUE_TYPES in both directions", () => {
    expect(Object.keys(VALUE_TYPE_CATALOG).sort()).toEqual([...ALL_VALUE_TYPES].sort());
    expect(ALL_VALUE_TYPES).toHaveLength(22);
  });

  // The catalog's own header claims ALL_VALUE_TYPES is ordered by the backend
  // enum's declaration order, and several other files' comments lean on that
  // claim. The `.sort()`-based check above cannot see order at all, so this pins
  // it as the literal ordinal sequence read off CustomFieldValueType.cs.
  //
  // It is spelled out here rather than derived, but NOT because the enum
  // "cannot be imported" -- a prior version of this comment said exactly that,
  // and it was false: `valueTypeRegistry.backendContract.test.ts` in this same
  // directory parses the real C# enum and asserts this array against it,
  // member-for-member and ordinal-for-ordinal, in both directions, whenever a
  // `SCRIPE-Backend` checkout sits beside this repo. What is true is narrower:
  // that cross-repo test SKIPS in a frontend-only checkout (no C# to parse),
  // and the literal list below is what keeps this ordering claim under a real
  // assertion even then -- the same reason `RICH_TEXT_MAX_CHARACTERS` is
  // pinned to a bare literal two tests below rather than left to that same
  // cross-repo file alone.
  it("orders ALL_VALUE_TYPES by the backend enum's ordinals, Text=0 through RichText=21", () => {
    expect([...ALL_VALUE_TYPES]).toEqual([
      "Text", // 0
      "Number", // 1
      "Boolean", // 2
      "Date", // 3
      "Select", // 4
      "LongText", // 5
      "DateTime", // 6
      "MultiSelect", // 7
      "Email", // 8
      "Url", // 9
      "Phone", // 10
      "Percent", // 11
      "Rating", // 12
      "Currency", // 13
      "Duration", // 14
      "Time", // 15
      "Color", // 16
      "EntityReference", // 17
      "UserReference", // 18
      "File", // 19
      "Image", // 20
      "RichText", // 21
    ]);
  });

  // Wave 3.4 adversarial-review fix round, finding P1. Every consuming test
  // (customFieldValueValidation.richText.test.ts, RichTextCustomFieldControl's
  // own tests, and the rest of the five files that touch this constant) writes
  // its boundary assertions as `"x".repeat(RICH_TEXT_MAX_CHARACTERS)` /
  // `RICH_TEXT_MAX_CHARACTERS + 1` -- correct for testing a BOUNDARY, but every
  // one of them agrees with the constant for ANY value it holds, zero included,
  // so none of them can catch this constant itself drifting from the backend's
  // `RichTextValueTypeHandler.MaxRichTextLength` (a change to either side alone,
  // with no matching change on the other). `valueTypeRegistry.backendContract
  // .test.ts` catches that drift when a `SCRIPE-Backend` checkout is present,
  // but SKIPS without one -- this bare-literal pin is what keeps a real
  // assertion alive in a frontend-only checkout, the same role
  // `formatCustomFieldValue.test.tsx`'s own `toHaveLength(22)` plays for
  // ALL_VALUE_TYPES's count.
  it("pins RICH_TEXT_MAX_CHARACTERS to the literal 50,000, matching RichTextValueTypeHandler.MaxRichTextLength", () => {
    expect(RICH_TEXT_MAX_CHARACTERS).toBe(50_000);
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
      // Wave 3.4. These three are transcribed from the real backend
      // Descriptors (FileValueTypeHandler / ImageValueTypeHandler /
      // RichTextValueTypeHandler), not from the reference family they resemble
      // -- File and Image differ from EntityReference/UserReference in exactly
      // one field, `hasPlaceholder`, and that is the field an assumed copy
      // would have got wrong.
      File: {
        fieldConfigType: "media-file",
        badgeVariant: "default",
        hasPlaceholder: false,
        hasOptions: false,
        labelKey: "customField.valueTypes.file",
      },
      Image: {
        fieldConfigType: "media-image",
        badgeVariant: "default",
        hasPlaceholder: false,
        hasOptions: false,
        labelKey: "customField.valueTypes.image",
      },
      RichText: {
        fieldConfigType: "rich-text",
        badgeVariant: "secondary",
        hasPlaceholder: true,
        hasOptions: false,
        labelKey: "customField.valueTypes.richText",
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

  // Wave 3.4. THE TWO MEDIA TYPES DO NOT SHARE A fieldConfigType, and unlike
  // the reference pair above that is not a stylistic choice: both pin the same
  // target key (`media.file`), so a shared key would leave
  // renderCustomFieldControl unable to tell an Image field from a File field at
  // all, and the image-only restriction -- the only thing that distinguishes
  // them -- would be inexpressible in the branch. Pinned as INEQUALITY rather
  // than as two literals, so it states the property instead of restating the
  // whole-catalog toEqual above.
  it("gives File and Image two distinct fieldConfigTypes, since nothing else carries the image-only rule", () => {
    expect(VALUE_TYPE_CATALOG.File.fieldConfigType).not.toBe(
      VALUE_TYPE_CATALOG.Image.fieldConfigType
    );
  });

  // Wave 3.4. The three value-shape traps, stated as the thing that must NOT be
  // true rather than as the thing that is -- the whole-catalog toEqual already
  // says what each key IS and would go red for any change; what it does not say
  // is WHY these three particular strings were refused. Each of the three
  // pre-existing union members below renders a real control that produces a
  // value shape the backend refuses for that type: `"file"` a browser File
  // object, `"image"` a base64 string, `"richtext"` a bare string. A later edit
  // that "simplifies" any of these onto the pre-existing member ships a field
  // that 422s on every save, on every generic CRUD screen.
  it("refuses the three pre-existing union members whose controls produce the wrong value shape", () => {
    expect(VALUE_TYPE_CATALOG.File.fieldConfigType).not.toBe("file");
    expect(VALUE_TYPE_CATALOG.Image.fieldConfigType).not.toBe("image");
    expect(VALUE_TYPE_CATALOG.RichText.fieldConfigType).not.toBe("richtext");
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
