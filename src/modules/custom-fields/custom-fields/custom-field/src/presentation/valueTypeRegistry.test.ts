// VALUE_TYPE_CATALOG -- completeness exit-gate test (Wave 2 Step 2.2, Task 1)
//
// This is the data-shape foundation for the shared value-type registry: it
// only proves every known CustomFieldValueTypeName has a complete, correctly
// shaped catalog entry. No consumer is rewired against this catalog yet.
import { describe, it, expect } from "vitest";
import { VALUE_TYPE_CATALOG, ALL_VALUE_TYPES } from "./valueTypeRegistry";

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

  it("has exactly 5 entries, matching ALL_VALUE_TYPES", () => {
    expect(Object.keys(VALUE_TYPE_CATALOG).sort()).toEqual([...ALL_VALUE_TYPES].sort());
  });

  it("only Select owns options", () => {
    for (const type of ALL_VALUE_TYPES) {
      expect(VALUE_TYPE_CATALOG[type].hasOptions).toBe(type === "Select");
    }
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
    });
  });
});
