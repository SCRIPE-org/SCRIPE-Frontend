import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from "vitest";
import "@testing-library/jest-dom";
import { getCustomFieldsExtension, encodeCustomFieldName } from "@core/crud/customFieldsExtension";
import { mapValueToFieldConfig, customFieldsCrudIntegration } from "./customFieldsCrudIntegration";
import { customFieldsContainer } from "../../../di";
import { formatCustomFieldValue } from "../../../custom-field/src/presentation/formatCustomFieldValue";
import { GenericFormCustomFieldControl } from "../../../custom-field/src/presentation/GenericFormCustomFieldControl";
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
      // construct itself. `__NeverAValueType__` is a permanent sentinel,
      // not a stand-in for a real type: it can never collide with a real
      // CustomFieldValueType member, whereas `Email` (used here previously)
      // is scheduled to become one in Wave 3.2, which would have turned
      // this into a false-positive test of a mapped type.
      valueType: "__NeverAValueType__" as EntityCustomFieldValueData["valueType"],
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

  // The EDIT-side twin of the assertion above, and optional for the identical
  // reason -- so the identical silent-deletion risk applies. If
  // `FieldControl: GenericFormCustomFieldControl` were dropped from the
  // registration object, nothing would fail to compile and every generic CRUD
  // screen's reference fields would quietly become core's inert "could not be
  // loaded" state. This is the assertion that fails instead.
  it("wires FieldControl to the real GenericFormCustomFieldControl, not a stub or nothing", () => {
    expect(customFieldsCrudIntegration.FieldControl).toBe(GenericFormCustomFieldControl);
  });

  it("the REAL registered formatValueForDisplay renders live, locale-formatted output end-to-end", () => {
    const t = (key: string) => key;
    const formatValueForDisplay = customFieldsCrudIntegration.formatValueForDisplay;
    expect(formatValueForDisplay).toBeDefined();

    render(<>{formatValueForDisplay!("Number", 1234.5, "en", t)}</>);
    expect(screen.getByText((1234.5).toLocaleString("en-US"))).toBeInTheDocument();
  });
});

describe("mapValueToFieldConfig — visibility rules (Wave 5 row 5.3)", () => {
  const base: EntityCustomFieldValueData = {
    customFieldId: "id-reason",
    key: "reason",
    labelEn: "Termination Reason",
    labelAr: null,
    valueType: "Text",
    isRequired: false,
    options: null,
    sortOrder: 1,
    value: null,
  };

  const ruled: EntityCustomFieldValueData = {
    ...base,
    visibilityRules: [
      { operandFieldKey: "status", operator: "equals", value: "terminated", priority: 0 },
    ],
  };

  it("attaches no isVisible when the field has no rules", () => {
    // A field without rules must keep behaving exactly as it did before this wave — an undefined
    // isVisible, which generic-form treats as "always render".
    expect(mapValueToFieldConfig(base, "en").isVisible).toBeUndefined();
    expect(mapValueToFieldConfig({ ...base, visibilityRules: [] }, "en").isVisible).toBeUndefined();
  });

  it("evaluates against LIVE form state, so a create form reveals the field as the user types", () => {
    // THE CASE THE WHOLE CLIENT-SIDE EVALUATOR EXISTS FOR. On a create form the server has no values,
    // so it marks every conditional field hidden and cannot re-evaluate as the user fills the form.
    const config = mapValueToFieldConfig(ruled, "en");

    expect(config.isVisible).toBeDefined();
    expect(config.isVisible!({ [encodeCustomFieldName("status")]: "active" })).toBe(false);
    expect(config.isVisible!({ [encodeCustomFieldName("status")]: "terminated" })).toBe(true);
  });

  it("reads siblings by their NAMESPACED form name", () => {
    // Form state is namespaced (`__cf__status`) while a rule names its operand by the plain key
    // ("status"). Getting this wrong makes every rule read undefined and hide its field forever.
    const config = mapValueToFieldConfig(ruled, "en");

    // The un-namespaced key must NOT satisfy it.
    expect(config.isVisible!({ status: "terminated" })).toBe(false);
    expect(config.isVisible!({ [encodeCustomFieldName("status")]: "terminated" })).toBe(true);
  });

  it("falls back to the sibling's stored value when the form has not touched it", () => {
    // An EDIT form does not seed every field into form state before first interaction. Without the
    // fallback, an untouched operand reads as absent and hides a field that should be showing.
    const config = mapValueToFieldConfig(ruled, "en", (fieldKey) =>
      fieldKey === "status" ? "terminated" : null
    );

    expect(config.isVisible!({})).toBe(true);
  });

  it("prefers the live form value over the stored fallback", () => {
    // The user has just changed the operand; the stored value is now stale. Preferring the stored one
    // would make the form stop responding to the very edit that should reveal or hide the field.
    const config = mapValueToFieldConfig(ruled, "en", () => "terminated");

    expect(config.isVisible!({ [encodeCustomFieldName("status")]: "active" })).toBe(false);
  });
});

// mapValueToFieldConfig -- referenceTargetEntityTypeKey (Wave 4 follow-up).
//
// This function is the ONLY place a custom field's FieldConfig is built: useCustomFieldsFormFields
// (core/crud/customFieldsExtension.tsx) calls the registered extension's getFormFields, which maps
// through here, and the nine consumer sites only forward the finished configs to
// renderCustomFieldControl. So a definition pin that is dropped here is dropped everywhere, and the
// symptom is not an error -- it is an empty reference field rendering "no target entity type
// configured" forever, which reads as a misconfiguration nobody can find.
describe("mapValueToFieldConfig — referenceTargetEntityTypeKey (Wave 4 follow-up)", () => {
  const reference: EntityCustomFieldValueData = {
    customFieldId: "id-assignee",
    key: "assignee",
    labelEn: "Assignee",
    labelAr: null,
    valueType: "EntityReference",
    isRequired: false,
    options: null,
    sortOrder: 2,
    value: null,
  };

  it("carries the definition pin through, so an EMPTY reference field can still offer records", () => {
    const config = mapValueToFieldConfig(
      { ...reference, referenceTargetEntityTypeKey: "hrms.staff-member" },
      "en"
    );

    expect(config.type).toBe("entity-reference");
    expect(config.referenceTargetEntityTypeKey).toBe("hrms.staff-member");
  });

  it("leaves it undefined when the server sends no pin, which is a real state for an unpinned EntityReference", () => {
    // Any registered entity type is a legal EntityReference target, so an unpinned definition has no
    // single answer to report. The dispatcher falls back to the stored value's own key for these.
    expect(mapValueToFieldConfig(reference, "en").referenceTargetEntityTypeKey).toBeUndefined();
    expect(
      mapValueToFieldConfig({ ...reference, referenceTargetEntityTypeKey: null }, "en")
        .referenceTargetEntityTypeKey
    ).toBeUndefined();
  });

  it("carries UserReference's server-resolved identity.user pin, which needs no admin configuration", () => {
    // UserReference's allowlist has exactly one member, so the backend fills the pin from code
    // (UserReferenceValueTypeHandler.ImplicitTargetEntityTypeKey). It travels on the same property as
    // an EntityReference pin precisely so this mapper needs no value-type branch.
    const config = mapValueToFieldConfig(
      {
        ...reference,
        key: "owner",
        valueType: "UserReference",
        referenceTargetEntityTypeKey: "identity.user",
      },
      "en"
    );

    expect(config.type).toBe("entity-reference");
    expect(config.referenceTargetEntityTypeKey).toBe("identity.user");
  });

  it("adds no pin to a non-reference field, and does so WITHOUT a value-type branch of its own", () => {
    // The server already applied the rule (ResolveTargetEntityType returns null for every
    // non-targeted type), so a Text field simply has nothing here to forward. Re-deciding it in the
    // frontend would be a second copy of that rule, free to disagree with it after the next value
    // type lands.
    const text: EntityCustomFieldValueData = { ...reference, valueType: "Text", key: "nickname" };

    expect(mapValueToFieldConfig(text, "en").referenceTargetEntityTypeKey).toBeUndefined();
  });
});

// saveValues -- the reference wire property names (Wave 4).
//
// THE DEFECT THIS GUARDS. A reference value reads AND writes as
// `{ entityTypeKey, entityId }`. A previous revision of the file under test
// renamed `entityId` to `encryptedEntityId` on the way out, reading the name off
// the backend's `EntityReferenceInput(string? EntityTypeKey, string?
// EncryptedEntityId)` record -- but that record is built POSITIONALLY from
// hand-parsed JSON (`Parse` reads `entityTypeKey` and `entityId`), carries no
// `[JsonPropertyName]`, and is never deserialized at all, so its parameter names
// are not wire names. The rename therefore submitted a payload with `entityId`
// ABSENT, which `Validate` refuses as 422
// `customFields.values.referenceIncomplete` -- every fully-picked reference
// rejected with the message written for a half-filled one, on every save, and on
// a create only AFTER the owner row was already written.
//
// This function is the single choke point every custom-field save in the product
// passes through (generic-crud-view.tsx and all nine consumer-site save flows
// call `getCustomFieldsExtension()?.saveValues`), so it is where that rename did
// its damage and where these tests hold the line: values reach the repository
// exactly as the form holds them.
describe("customFieldsCrudIntegration.saveValues — reference wire property names", () => {
  let saveSpy: MockInstance;

  beforeEach(() => {
    saveSpy = vi
      .spyOn(customFieldsContainer.customFieldValueRepository, "saveValues")
      .mockResolvedValue(undefined as never);
  });

  afterEach(() => {
    saveSpy.mockRestore();
  });

  // Every expectation below is written as its own literal rather than reusing
  // the object that was passed in. Sharing the reference would make the deep
  // equality trivially true for an implementation that rewrote values IN PLACE,
  // which is a mutation this choke point must not make either.
  it("submits `entityId` under that exact name, and never `encryptedEntityId`", async () => {
    await customFieldsCrudIntegration.saveValues("hrms.admin", "OWNER-1", {
      assignee: { entityTypeKey: "hrms.staff-member", entityId: "ENC-abc" },
    });

    expect(saveSpy).toHaveBeenCalledWith("hrms.admin", "OWNER-1", {
      assignee: { entityTypeKey: "hrms.staff-member", entityId: "ENC-abc" },
    });
    // Asserted as an ABSENT property rather than left to the equality above,
    // because that is the precise failure mode: a payload that also carried
    // `encryptedEntityId` would still deep-equal nothing, but a payload that
    // carried it INSTEAD is what shipped, and `entityId` going missing is what
    // the backend turns into a 422 on a reference the user filled in correctly.
    const submitted = saveSpy.mock.calls[0][2] as Record<string, unknown>;
    expect(submitted.assignee).not.toHaveProperty("encryptedEntityId");
    expect(submitted.assignee).toHaveProperty("entityId", "ENC-abc");
  });

  it("submits `entityId` opaquely -- an encrypted id is never trimmed, normalised or re-encoded", async () => {
    // It is another module's primary key under encryption: not a GUID, not
    // base64 this code may tidy up, not something with a canonical form. What
    // came off the wire is exactly what goes back.
    await customFieldsCrudIntegration.saveValues("hrms.admin", "OWNER-1", {
      assignee: { entityTypeKey: "identity.user", entityId: "gAAAAABm_x3Q==/weird+chars " },
    });

    expect(saveSpy).toHaveBeenCalledWith("hrms.admin", "OWNER-1", {
      assignee: { entityTypeKey: "identity.user", entityId: "gAAAAABm_x3Q==/weird+chars " },
    });
  });

  it("submits a blank `entityId` intact, never coerced to null", async () => {
    // Null is the wire's "clear this field", so coercing a half-filled
    // reference to null here would turn a UI bug into a silent delete. Sent
    // intact, the backend answers with its own localized `referenceIncomplete`
    // 422 -- loud, attributable, and fixable.
    await customFieldsCrudIntegration.saveValues("hrms.admin", "OWNER-1", {
      assignee: { entityTypeKey: "hrms.staff-member", entityId: "" },
    });

    expect(saveSpy).toHaveBeenCalledWith("hrms.admin", "OWNER-1", {
      assignee: { entityTypeKey: "hrms.staff-member", entityId: "" },
    });
    const submitted = saveSpy.mock.calls[0][2] as Record<string, unknown>;
    expect(submitted.assignee).not.toBeNull();
  });

  it("submits null as null — clearing a reference must still clear it", async () => {
    await customFieldsCrudIntegration.saveValues("hrms.admin", "OWNER-1", { assignee: null });

    expect(saveSpy).toHaveBeenCalledWith("hrms.admin", "OWNER-1", { assignee: null });
  });

  it("submits `amount`/`currencyCode` and `value`/`timeZoneId` envelopes byte-identical", async () => {
    // Currency and DateTime are the other two object-shaped value types, i.e.
    // the two a per-type rewrite loop would reach next. They pass through
    // untouched because nothing here inspects value types at all.
    await customFieldsCrudIntegration.saveValues("hrms.admin", "OWNER-1", {
      nickname: "Mo",
      score: 42,
      active: true,
      tags: ["a", "b"],
      price: { amount: 10, currencyCode: "USD" },
      startsAt: { value: "2026-01-01T00:00:00Z", timeZoneId: "Africa/Cairo" },
      cleared: null,
    });

    expect(saveSpy).toHaveBeenCalledWith("hrms.admin", "OWNER-1", {
      nickname: "Mo",
      score: 42,
      active: true,
      tags: ["a", "b"],
      price: { amount: 10, currencyCode: "USD" },
      startsAt: { value: "2026-01-01T00:00:00Z", timeZoneId: "Africa/Cairo" },
      cleared: null,
    });
  });

  it("submits `entityId` for every reference in the payload, not only the first", async () => {
    // A record with two reference fields is the ordinary case, not an exotic
    // one, and a loop that mangles values is as likely to mangle all of them as
    // one -- so the count is pinned, not assumed from the single-field test.
    await customFieldsCrudIntegration.saveValues("hrms.admin", "OWNER-1", {
      assignee: { entityTypeKey: "identity.user", entityId: "ENC-1" },
      reviewer: { entityTypeKey: "identity.user", entityId: "ENC-2" },
      nickname: "Mo",
    });

    expect(saveSpy).toHaveBeenCalledWith("hrms.admin", "OWNER-1", {
      assignee: { entityTypeKey: "identity.user", entityId: "ENC-1" },
      reviewer: { entityTypeKey: "identity.user", entityId: "ENC-2" },
      nickname: "Mo",
    });
  });
});
