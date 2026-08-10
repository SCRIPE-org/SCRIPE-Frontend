import { describe, it, expect } from "vitest";
import { getCustomFieldsExtension, encodeCustomFieldName } from "@core/crud/customFieldsExtension";
import { mapValueToFieldConfig } from "./customFieldsCrudIntegration";
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
});

describe("customFieldsCrudIntegration registration", () => {
  it("self-registers on import so getCustomFieldsExtension() returns a working API", async () => {
    await import("./customFieldsCrudIntegration");
    expect(getCustomFieldsExtension()).not.toBeNull();
  });
});
