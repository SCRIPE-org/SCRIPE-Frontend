import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import { getCustomFieldsExtension, encodeCustomFieldName } from "@core/crud/customFieldsExtension";
import { mapValueToFieldConfig, customFieldsCrudIntegration } from "./customFieldsCrudIntegration";
import { formatCustomFieldValue } from "../../../custom-field/src/presentation/formatCustomFieldValue";
import type { EntityCustomFieldValueData } from "../data/models/CustomFieldValueModel";

describe("mapValueToFieldConfig", () => {
  it("maps a Text field to a namespaced text FieldConfig carrying its current value", () => {
    const data: EntityCustomFieldValueData = {
      customFieldId: "id-1",
      key: "nationality",
      labelEn: "Nationality",
      labelAr: "الجنسية",
      valueType: "Text",
      isRequired: false,
      options: null,
      sortOrder: 0,
      value: "Egyptian",
    };

    const config = mapValueToFieldConfig(data, "en");

    expect(config.name).toBe(encodeCustomFieldName("nationality"));
    expect(config.type).toBe("text");
    expect(config.label).toBe("Nationality");
    expect(config.required).toBe(false);
    expect(config.section).toBe("Custom Fields");
    expect(config.defaultValue).toBe("Egyptian");
  });

  it("maps a Select field's options array to FieldOption[]", () => {
    const data: EntityCustomFieldValueData = {
      customFieldId: "id-2",
      key: "shirtSize",
      labelEn: "Shirt Size",
      labelAr: null,
      valueType: "Select",
      isRequired: true,
      options: ["S", "M", "L"],
      sortOrder: 1,
      value: "M",
    };

    const config = mapValueToFieldConfig(data, "en");

    expect(config.type).toBe("select");
    expect(config.options).toEqual([
      { value: "S", label: "S" },
      { value: "M", label: "M" },
      { value: "L", label: "L" },
    ]);
    expect(config.required).toBe(true);
  });

  it("maps Boolean to switch and Date to date", () => {
    const bool: EntityCustomFieldValueData = {
      customFieldId: "id-3", key: "isVip", labelEn: "VIP", labelAr: null,
      valueType: "Boolean", isRequired: false, options: null, sortOrder: 0, value: true,
    };
    const date: EntityCustomFieldValueData = {
      customFieldId: "id-4", key: "joinedOn", labelEn: "Joined On", labelAr: null,
      valueType: "Date", isRequired: false, options: null, sortOrder: 0, value: "2026-01-01T00:00:00Z",
    };

    expect(mapValueToFieldConfig(bool, "en").type).toBe("switch");
    expect(mapValueToFieldConfig(date, "en").type).toBe("date");
  });

  // Final whole-branch review, I1: `data.valueType` is wire data with no
  // runtime validation anywhere upstream (CustomFieldValueService.ts returns
  // raw JSON untouched -- the wire contract is enforced only by a doc
  // comment, never a discriminated union or guard). A backend-first deploy
  // of a new value type (e.g. Wave 3's `Email`) before the frontend
  // redeploys is the normal, expected trigger for this. Before the I1 fix,
  // the un-guarded `VALUE_TYPE_CATALOG[data.valueType].fieldConfigType`
  // lookup threw `TypeError: Cannot read properties of undefined (reading
  // 'fieldConfigType')` here -- and since this runs inside getFormFields's
  // `.map()`, ONE unknown type anywhere in a tenant's definitions took down
  // the custom-fields section on all 8 consumer sites at once, instead of
  // rendering that one field as a plain text input the way the pre-catalog
  // `VALUE_TYPE_TO_FIELD_TYPE[data.valueType]` Record index (which returns
  // `undefined`, not a throw, for an unknown key) used to.
  it("does not throw for an unrecognized wire valueType and degrades to a text FieldConfig (I1 regression)", () => {
    const unknownType: EntityCustomFieldValueData = {
      customFieldId: "id-5",
      key: "contactEmail",
      labelEn: "Contact Email",
      labelAr: null,
      // Cast past the CustomFieldValueTypeName union on purpose: this
      // reproduces a backend that has already shipped a 6th value type the
      // frontend catalog doesn't know about yet -- exactly the "wire data,
      // no runtime guard" gap named above, not a type this app would ever
      // construct itself.
      valueType: "Email" as EntityCustomFieldValueData["valueType"],
      isRequired: false,
      options: null,
      sortOrder: 0,
      value: "mo@example.com",
    };

    let config: ReturnType<typeof mapValueToFieldConfig> | undefined;
    expect(() => {
      config = mapValueToFieldConfig(unknownType, "en");
    }).not.toThrow();

    expect(config?.type).toBe("text");
    expect(config?.defaultValue).toBe("mo@example.com");
  });
});

describe("customFieldsCrudIntegration registration", () => {
  it("self-registers on import so getCustomFieldsExtension() returns a working API", async () => {
    await import("./customFieldsCrudIntegration");
    expect(getCustomFieldsExtension()).not.toBeNull();
  });

  // Wave 2 Step 2.2 Task 5 review follow-up: formatValueForDisplay is optional
  // on CustomFieldsExtensionApi (so the ~10 unrelated test doubles across this
  // codebase that hand-build a CustomFieldsExtensionApi literal keep compiling
  // without it), which means a future edit could silently drop this line from
  // the real registration below and NOTHING would fail to compile. The only
  // render-path test that exercises buildCustomFieldColumn's actual output
  // (generic-crud-view.customfields.test.tsx) uses a hand-built fake extension
  // and a Text-typed column, whose formatted output (String(raw)) is
  // byte-identical to the absent-field fallback -- so it cannot tell "wired
  // correctly" apart from "silently broken". These two assertions are the
  // ones that actually would fail if `formatValueForDisplay: formatCustomFieldValue`
  // were ever deleted from customFieldsCrudIntegration's registration object.
  it("wires formatValueForDisplay to the real formatCustomFieldValue function, not a stub or nothing", () => {
    expect(customFieldsCrudIntegration.formatValueForDisplay).toBe(formatCustomFieldValue);
  });

  it("the REAL registered formatValueForDisplay renders live, locale-formatted output end-to-end", () => {
    const t = (key: string) => key;
    const formatValueForDisplay = customFieldsCrudIntegration.formatValueForDisplay;
    expect(formatValueForDisplay).toBeDefined();

    render(<>{formatValueForDisplay!("Number", 1234.5, "en", t)}</>);
    expect(screen.getByText((1234.5).toLocaleString("en-US"))).toBeInTheDocument();
  });
});
