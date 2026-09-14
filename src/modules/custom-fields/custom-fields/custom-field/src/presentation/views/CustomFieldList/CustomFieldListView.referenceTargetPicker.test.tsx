/**
 * Definition-level reference target picker — Wave 4 follow-up
 *
 * Runs the REAL exported builder and the REAL exported visibility predicate from
 * `CustomFieldListView.tsx`, not hand-duplicated copies of them. That is a deliberate departure from
 * this file's older siblings (`CustomFieldListView.validatorKindVisibility.test.ts` and friends),
 * which re-declare the predicate under test and then bolt on a source regex to notice drift. Those
 * files say why they had to: fully mounting this screen needs the whole GenericCrudView chain. But the
 * pieces asserted here are pure functions, so the honest thing is to call them — a hand-duplicated
 * predicate is a test of the duplicate, and that shape is exactly how the C-1 defect shipped green.
 *
 * WHAT THIS FILE IS GUARDING, in order of how expensive the mistake is:
 *
 *  1. USERREFERENCE MUST NOT GET A PICKER. Its target allowlist is exactly one key (`identity.user`)
 *     and its handler already resolves that target for an unpinned field. A dropdown offering one
 *     choice implies a decision the admin does not have.
 *  2. AN EMPTY AVAILABLE-TYPES LIST IS NOT AN ERROR, and is not a silently blank dropdown either. The
 *     server answers "you may not reference anything" with a 200 and `[]`; the picker has to say so
 *     in words, keep the unpin sentinel selectable, and stay enabled.
 *  3. A FAILED FETCH AND AN EMPTY LIST MUST READ DIFFERENTLY. One is fixed by asking for permissions,
 *     the other by retrying. One message for both sends admins to the wrong place.
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { GenericForm } from "@core/ui/forms/generic-form";
import {
  buildReferenceTargetField,
  formatRegistryTypeOptionLabel,
  isReferenceTargetPickerVisible,
  readWireString,
  REFERENCE_TARGET_FIELD_NAME,
  resolveRegistryTypeName,
  UNPINNED_REFERENCE_TARGET,
} from "./CustomFieldListView";
import { ALL_VALUE_TYPES } from "../../registries/valueTypeRegistry";
import type { EntityLookupType } from "../../../../../entity-lookup/src/data/models/EntityLookupModel";
import { en } from "../../../../locales/custom-field.en";
import { ar } from "../../../../locales/custom-field.ar";

// GenericForm reaches for the permission provider on mount; the picker itself has no permission gate
// (unlike the field-group one), so this only has to exist.
vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    permissions: [],
    hasPermission: () => true,
    hasAnyPermission: () => true,
    hasAllPermissions: () => true,
    canAccessPage: () => true,
    roleNames: [],
    isSuperAdmin: true,
  }),
  PermissionGate: ({ children }: { children: unknown }) => children,
}));

// Radix primitives inside GenericSelect observe their trigger; jsdom has no ResizeObserver.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

/**
 * Real registry shapes, transcribed from the backend's own `registry.Register(...)` calls:
 * `identity.user` is ("Identity", "User", "المستخدم"), and the module prefixes are what make the
 * owningModule sort read as a grouping.
 */
const TYPES: EntityLookupType[] = [
  { key: "identity.user", owningModule: "Identity", displayNameEn: "User", displayNameAr: "المستخدم" },
  {
    key: "hrms.staff-member",
    owningModule: "Hrms",
    displayNameEn: "Staff Member",
    displayNameAr: "عضو الفريق",
  },
  {
    key: "entitlements.lead",
    owningModule: "Entitlements",
    displayNameEn: "Lead",
    displayNameAr: "عميل محتمل",
  },
  {
    key: "entitlements.tenant-plan",
    owningModule: "Entitlements",
    displayNameEn: "Tenant Plan",
    displayNameAr: "خطة المستأجر",
  },
];

/** Resolves a key through the real dictionaries, so a test can never pass on a key that does not exist. */
function translate(language: "en" | "ar") {
  const dictionary = language === "ar" ? ar : en;
  return (key: string): string => {
    const value = key
      .split(".")
      .reduce<unknown>(
        (node, segment) => (node as Record<string, unknown> | undefined)?.[segment],
        dictionary
      );
    if (typeof value !== "string") throw new Error(`missing locale key: ${key} (${language})`);
    return value;
  };
}

function build(
  overrides: Partial<Parameters<typeof buildReferenceTargetField>[0]> = {},
  language: "en" | "ar" = "en"
) {
  return buildReferenceTargetField({
    t: translate(language),
    language,
    types: TYPES,
    isLoading: false,
    isError: false,
    isEmpty: false,
    isExistingDefinition: false,
    ...overrides,
  });
}

describe("reference target picker visibility", () => {
  it("shows for an EntityReference definition", () => {
    expect(isReferenceTargetPickerVisible({ valueType: "EntityReference" })).toBe(true);
  });

  it("does NOT show for UserReference — its single legal target is not a choice", () => {
    expect(isReferenceTargetPickerVisible({ valueType: "UserReference" })).toBe(false);
  });

  it("does not show for any other value type", () => {
    // Driven off the live catalog rather than a hand-copied list, so a future 20th value type is
    // covered without anyone remembering to extend this.
    const shown = ALL_VALUE_TYPES.filter((valueType) =>
      isReferenceTargetPickerVisible({ valueType })
    );
    expect(shown).toEqual(["EntityReference"]);
  });

  it("does not show before the admin has picked a value type at all", () => {
    // The create form's state on first render. Degrades closed with no `??` fallback needed, unlike
    // the catalog-lookup guards on this same form.
    expect(isReferenceTargetPickerVisible({})).toBe(false);
    expect(isReferenceTargetPickerVisible({ valueType: undefined })).toBe(false);
  });

  it("does not show for an unrecognized wire value type", () => {
    expect(isReferenceTargetPickerVisible({ valueType: "SomeFutureType" })).toBe(false);
  });

  it("is the guard the built field actually carries", () => {
    // Not a separate predicate that happens to agree: the FieldConfig must reference this exact
    // function, or the two could drift.
    expect(build().isVisible).toBe(isReferenceTargetPickerVisible);
  });
});

describe("reference target picker field config", () => {
  it("submits under the backend's own property name", () => {
    // GenericForm.submitData is a raw spread of form state, so the field NAME is the wire property.
    expect(REFERENCE_TARGET_FIELD_NAME).toBe("referenceTargetEntityTypeKey");
    expect(build().name).toBe("referenceTargetEntityTypeKey");
  });

  it("is a select, which is what gives the combobox its only accessible name", () => {
    expect(build().type).toBe("select");
    expect(build().label).toBe(en.customField.fields.referenceTargetEntityTypeKey);
  });

  it("labels the target type distinctly from the definition's own entity type", () => {
    // Both fields live on the same form. If they read the same, neither is answerable.
    expect(en.customField.fields.referenceTargetEntityTypeKey).not.toBe(
      en.customField.fields.entityTypeKey
    );
    expect(ar.customField.fields.referenceTargetEntityTypeKey).not.toBe(
      ar.customField.fields.entityTypeKey
    );
  });

  it("leads with an unpin sentinel whose value is the empty string", () => {
    const [first] = build().options!;
    expect(first.value).toBe(UNPINNED_REFERENCE_TARGET);
    expect(UNPINNED_REFERENCE_TARGET).toBe("");
    expect(first.label).toBe(en.customField.referenceTarget.unpinned);
  });

  it("offers one option per available type, labelled Name (key)", () => {
    const options = build().options!;
    expect(options).toHaveLength(TYPES.length + 1);
    expect(options.map((option) => option.value)).toEqual([
      "",
      "entitlements.lead",
      "entitlements.tenant-plan",
      "hrms.staff-member",
      "identity.user",
    ]);
    expect(options[4].label).toBe("User (identity.user)");
  });

  it("groups by owning module through sort order, since there is no optgroup primitive here", () => {
    // Entitlements, Entitlements, Hrms, Identity -- the two Entitlements entries adjacent, and
    // alphabetical within the module (Lead before Tenant Plan).
    const values = build()
      .options!.slice(1)
      .map((option) => option.value as string);
    expect(values.slice(0, 2)).toEqual(["entitlements.lead", "entitlements.tenant-plan"]);
  });

  it("does not mutate the shared cached array it sorts", () => {
    // `types` comes straight from a react-query cache; an in-place sort would reorder it for every
    // other consumer.
    const original = [...TYPES];
    build();
    expect(TYPES).toEqual(original);
  });

  it("uses the server's Arabic display names in Arabic, never a locale-file lookup", () => {
    // These names come from the backend entity-type registry, so they are not in our dictionaries and
    // must not be looked for there.
    const options = build({}, "ar").options!;
    expect(options[0].label).toBe(ar.customField.referenceTarget.unpinned);
    expect(options.map((option) => option.label)).toContain("المستخدم (identity.user)");
  });

  it("explains the pin on the create form and adds the re-point consequence on the edit form", () => {
    const createDescription = build({ isExistingDefinition: false }).description!;
    const editDescription = build({ isExistingDefinition: true }).description!;

    expect(createDescription).toBe(en.customField.referenceTarget.description);
    expect(editDescription).toContain(en.customField.referenceTarget.description);
    // The one sentence an admin re-pointing a live definition needs: old values keep working, the
    // next save of one is refused. Silence here is what leaves them to discover the refusal weeks
    // later from a record editor.
    expect(editDescription).toContain(en.customField.referenceTarget.repointWarning);
    expect(createDescription).not.toContain(en.customField.referenceTarget.repointWarning);
  });

  it("renders an EMPTY available-types list as an explanation, not an error and not a blank dropdown", () => {
    const field = build({ types: [], isEmpty: true });

    expect(field.description).toBe(en.customField.referenceTarget.noneAvailable);
    expect(field.description).not.toBe(en.customField.referenceTarget.loadFailed);
    // The sentinel survives: unpinning must stay possible even when nothing can be pinned, or an
    // accidentally-pinned field is uncorrectable by anyone who cannot see that type.
    expect(field.options).toEqual([
      { value: "", label: en.customField.referenceTarget.unpinned },
    ]);
    expect(field.disabled).toBeUndefined();
  });

  it("keeps a failed fetch and an empty list as two different sentences", () => {
    const failed = build({ types: [], isError: true }).description;
    const empty = build({ types: [], isEmpty: true }).description;

    expect(failed).toBe(en.customField.referenceTarget.loadFailed);
    expect(failed).not.toBe(empty);
    // Both exist in Arabic too, and differ there as well.
    expect(ar.customField.referenceTarget.loadFailed).not.toBe(
      ar.customField.referenceTarget.noneAvailable
    );
  });

  it("prefers the failure message when a stale empty result and an error coincide", () => {
    // react-query can report isError while an earlier empty answer is still in `data`. Describing
    // that as "you may not reference anything" would send an admin to ask for permissions they hold.
    expect(build({ types: [], isError: true, isEmpty: true }).description).toBe(
      en.customField.referenceTarget.loadFailed
    );
  });

  it("passes the in-flight state through to the select's own loading affordance", () => {
    expect(build({ isLoading: true }).loading).toBe(true);
    expect(build({ isLoading: false }).loading).toBe(false);
  });

  it("never marks the pin required — unpinned is a legal, permanent configuration", () => {
    expect(build().required).toBeUndefined();
  });
});

/**
 * The same real FieldConfig, through the real GenericForm.
 *
 * Everything above asserts the config OBJECT; this block asserts the control an admin actually gets,
 * and one thing an object assertion cannot reach: that hiding the picker does not drop the pin from
 * the payload. That is the whole safety argument for keeping the key in form state for every value
 * type, and it is the exact shape of the Wave 2.5 C-1 defect if it is wrong.
 *
 * The accessible name is asserted with `getByRole("combobox", { name })`, never `getByLabelText`:
 * GenericSelect's trigger is a `role="combobox"` div and `<Label htmlFor>` computes no name for it, so
 * `getByLabelText` succeeds against a completely nameless control.
 */
describe("reference target picker through the real GenericForm", () => {
  const PICKER_NAME = en.customField.fields.referenceTargetEntityTypeKey;

  function renderField(
    initialValues: Record<string, unknown>,
    onSubmit: (data: Record<string, unknown>) => Promise<void> = async () => {}
  ) {
    // Real `t` here, not the identity stub: the accessible name is the resolved English label, which
    // is also what makes the "distinct from Entity Type" assertion above meaningful at render time.
    return render(
      <GenericForm
        fields={[build()]}
        initialValues={initialValues}
        onSubmit={onSubmit}
        onCancel={() => {}}
      />
    );
  }

  it("renders a named combobox for an EntityReference definition", () => {
    renderField({ valueType: "EntityReference", referenceTargetEntityTypeKey: "" });

    expect(
      screen.getByRole("combobox", { name: PICKER_NAME })
    ).toHaveAttribute("id", REFERENCE_TARGET_FIELD_NAME);
  });

  it("draws nothing at all for a UserReference definition", () => {
    renderField({ valueType: "UserReference", referenceTargetEntityTypeKey: "identity.user" });

    expect(screen.queryByRole("combobox", { name: PICKER_NAME })).not.toBeInTheDocument();
  });

  it("draws nothing at all for a Text definition", () => {
    renderField({ valueType: "Text", referenceTargetEntityTypeKey: "" });

    expect(screen.queryByRole("combobox", { name: PICKER_NAME })).not.toBeInTheDocument();
  });

  it("STILL SUBMITS the stored pin while hidden — hiding the control must not unpin the field", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    // A UserReference definition pinned through the API: the picker is deliberately not shown for it,
    // and the update command full-replaces the column. If the hidden field dropped the key, editing
    // this definition's label would unpin it.
    const { container } = renderField(
      { valueType: "UserReference", referenceTargetEntityTypeKey: "identity.user" },
      onSubmit
    );

    // Submitting the form element directly: the point of the case is the payload, and the form is the
    // one element guaranteed present when every field is hidden.
    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      referenceTargetEntityTypeKey: "identity.user",
    });
  });

  it("submits the unpinned sentinel while hidden for a non-reference definition", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = renderField(
      { valueType: "Text", referenceTargetEntityTypeKey: UNPINNED_REFERENCE_TARGET },
      onSubmit
    );

    fireEvent.submit(container.querySelector("form") as HTMLFormElement);

    // Accepted by the server rather than refused -- the blank check runs before the "may this value
    // type carry a pin at all" check. See UNPINNED_REFERENCE_TARGET's own doc comment.
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toHaveProperty("referenceTargetEntityTypeKey", "");
  });
});

/**
 * INCOMPLETE WIRE DATA
 *
 * `EntityLookupType` declares `key`, `owningModule`, `displayNameEn` and `displayNameAr` as
 * non-optional `string`s, and nothing enforces that at runtime: the submodule has no mapper and no
 * runtime guard, and `EntityLookupModel.ts`'s own header records the consequence in as many words --
 * "the runtime hands back `undefined` and a picker row renders blank". The names come from each
 * module's own `registry.Register(...)` call, so ONE module shipping a type without an Arabic name is
 * the whole trigger.
 *
 * A blank row was the optimistic reading. `localeCompare` on an absent name is a `TypeError`, and the
 * sort that called it runs inside this view's render-phase `useMemo`, so a single half-registered type
 * took the entire definitions screen down in Arabic instead of costing the list one row.
 *
 * The fixtures below use `undefined as unknown as string` deliberately: the cast IS the defect. The
 * compiler cannot see the gap, which is why it has to be a test.
 */
describe("reference target picker with incomplete wire data", () => {
  /** One type registered EN-only, beside the well-formed four. Two or more types is what makes the comparator run. */
  const MISSING_AR: EntityLookupType[] = [
    ...TYPES,
    {
      key: "hrms.department",
      owningModule: "Hrms",
      displayNameEn: "Department",
      displayNameAr: undefined as unknown as string,
    },
  ];

  /** The mirror case: a type with an Arabic name only, which breaks the English picker instead. */
  const MISSING_EN: EntityLookupType[] = [
    ...TYPES,
    {
      key: "hrms.department",
      owningModule: "Hrms",
      displayNameEn: undefined as unknown as string,
      displayNameAr: "الإدارة",
    },
  ];

  it("does not throw in Arabic when a type arrived without an Arabic name", () => {
    // The crash. Unfixed, this is `TypeError: Cannot read properties of undefined (reading
    // 'localeCompare')`, raised from inside the sort comparator.
    expect(() => build({ types: MISSING_AR }, "ar")).not.toThrow();
  });

  it("does not throw in English when a type arrived without an English name", () => {
    expect(() => build({ types: MISSING_EN }, "en")).not.toThrow();
  });

  it("does not throw when owningModule is missing", () => {
    // Same exposure, same line: all three operands of that comparator are unchecked wire strings.
    const broken: EntityLookupType[] = [
      ...TYPES,
      {
        key: "hrms.department",
        owningModule: undefined as unknown as string,
        displayNameEn: "Department",
        displayNameAr: "الإدارة",
      },
    ];
    expect(() => build({ types: broken })).not.toThrow();
  });

  it("does not throw when the response body was not an array at all", () => {
    // `useEntityLookupAvailableTypes` defaults only an ABSENT body to `[]`; a malformed 200 that is an
    // object reaches the spread, which is a TypeError for a non-iterable.
    const notAnArray = {} as unknown as EntityLookupType[];

    expect(() => build({ types: notAnArray })).not.toThrow();
    // The sentinel survives, so unpinning still works even on a nonsense response.
    expect(build({ types: notAnArray }).options).toEqual([
      { value: "", label: en.customField.referenceTarget.unpinned },
    ]);
  });

  it("still renders the picker for the admin instead of taking the screen down", () => {
    // The point of the defect is not the exception, it is what the exception costs: this builder runs
    // inside a render-phase `useMemo`, so throwing here unmounts the definitions list, the header
    // links and both export buttons -- not one dropdown row.
    render(
      <GenericForm
        fields={[build({ types: MISSING_AR }, "ar")]}
        initialValues={{ valueType: "EntityReference", referenceTargetEntityTypeKey: "" }}
        onSubmit={async () => {}}
        onCancel={() => {}}
      />
    );

    expect(
      screen.getByRole("combobox", { name: ar.customField.fields.referenceTargetEntityTypeKey })
    ).toBeInTheDocument();
  });

  it("labels the nameless row with its key, which is what the backend's own providers fall back to", () => {
    // Not blank: a row with no text cannot be typed for in a searchable picker, cannot be named in a
    // bug report, and cannot be told apart from a second nameless row. `EntityLookupItem.displayName`
    // is documented one layer down as "Never blank -- a provider that cannot build one falls back to
    // the id"; the key is this list's equivalent, and it is already shown beside every other name.
    const labels = build({ types: MISSING_AR }, "ar").options!.map((option) => option.label);

    expect(labels).toContain("Department (hrms.department)");
    expect(labels).not.toContain("");
    expect(labels.some((label) => label.includes("undefined"))).toBe(false);
  });

  it("prefers the other language's name over the key before falling back to the key", () => {
    // A type registered EN-only is far better shown under its English name than under its key -- the
    // same rule `mapValueToFieldConfig` applies to a custom field's own bilingual label pair.
    const arabic = build({ types: MISSING_AR }, "ar").options!.map((option) => option.label);
    expect(arabic).toContain("Department (hrms.department)");

    const english = build({ types: MISSING_EN }, "en").options!.map((option) => option.label);
    expect(english).toContain("الإدارة (hrms.department)");
  });

  it("treats a whitespace-only name as no name at all", () => {
    // `"   "` is as unreadable in a dropdown as an absent name, and unlike an absent one it would sort
    // ahead of every real name in its module.
    const blank: EntityLookupType[] = [
      { key: "hrms.department", owningModule: "Hrms", displayNameEn: "   ", displayNameAr: "   " },
    ];
    expect(build({ types: blank }).options![1].label).toBe("hrms.department");
  });

  it("drops a row with no usable key rather than offering one that would UNPIN the field", () => {
    // `value` IS the key. Without one the option submits `undefined`, and the only string available to
    // substitute -- `""` -- is the unpin sentinel, so a keyless row given that value would silently
    // clear the pin when clicked. Absent is strictly better than that.
    const keyless: EntityLookupType[] = [
      ...TYPES,
      {
        key: undefined as unknown as string,
        owningModule: "Hrms",
        displayNameEn: "Department",
        displayNameAr: "الإدارة",
      },
    ];
    const options = build({ types: keyless }).options!;

    expect(options).toHaveLength(TYPES.length + 1);
    expect(options.map((option) => option.value)).not.toContain(undefined);
    // Exactly one option carries the sentinel value, and it is the sentinel.
    expect(options.filter((option) => option.value === UNPINNED_REFERENCE_TARGET)).toHaveLength(1);
  });

  it("sorts a nameless row by the key it actually shows, inside its own module", () => {
    // The middle sort key is the text the row DISPLAYS. Filing a key-labelled row under `""` would put
    // it ahead of every named row in its module for a reason nothing on screen explains.
    const values = build({ types: MISSING_AR }, "ar")
      .options!.slice(1)
      .map((option) => option.value as string);

    // Hrms holds two entries. In Arabic the department row shows "Department" -- its English name, the
    // text actually rendered -- and ICU's `ar-EG` collation files Latin script AFTER Arabic, so it
    // follows "عضو الفريق". Sorting it under `""` instead would have put it FIRST in the
    // module, ahead of every named row, which is the outcome this pins against.
    expect(values.filter((value) => value.startsWith("hrms."))).toEqual([
      "hrms.staff-member",
      "hrms.department",
    ]);
  });

  it("leaves the order of a WELL-FORMED list exactly as it was", () => {
    // The guard must not silently reshuffle the list it is protecting. Full order, both languages,
    // labels included -- if a defensive fallback ever leaks into well-formed data, this is what
    // notices.
    expect(build().options).toEqual([
      { value: "", label: en.customField.referenceTarget.unpinned },
      { value: "entitlements.lead", label: "Lead (entitlements.lead)" },
      { value: "entitlements.tenant-plan", label: "Tenant Plan (entitlements.tenant-plan)" },
      { value: "hrms.staff-member", label: "Staff Member (hrms.staff-member)" },
      { value: "identity.user", label: "User (identity.user)" },
    ]);

    // Arabic is NOT the English order with Arabic labels: `خطة المستأجر` collates before `عميل محتمل` under
    // `ar-EG-u-nu-latn` while `Tenant Plan` follows `Lead` under `en-US`. That is the whole reason the
    // name comparison passes a resolved locale and the two identifier comparisons do not, and it is
    // pinned here so the guard cannot quietly collapse into a locale-blind compare.
    expect(build({}, "ar").options).toEqual([
      { value: "", label: ar.customField.referenceTarget.unpinned },
      { value: "entitlements.tenant-plan", label: "خطة المستأجر (entitlements.tenant-plan)" },
      { value: "entitlements.lead", label: "عميل محتمل (entitlements.lead)" },
      { value: "hrms.staff-member", label: "عضو الفريق (hrms.staff-member)" },
      { value: "identity.user", label: "المستخدم (identity.user)" },
    ]);
  });

  it("still does not mutate the shared cached array now that it also filters it", () => {
    const original = [...TYPES];
    build({ types: TYPES });
    expect(TYPES).toEqual(original);
  });
});

/**
 * THE WIRE-STRING GUARDS THEMSELVES
 *
 * Exercised directly as well as through the builder, because the view's OTHER registry-fed list -- the
 * definition's own entity-type picker, and the API-only warning under it -- cannot be reached without
 * mounting the whole GenericCrudView chain. These three functions are what that list now shares with
 * the target-type picker, so testing them here is what gives that fix real coverage rather than a
 * source regex alone.
 */
describe("registry-name wire guards", () => {
  const WELL_FORMED = {
    key: "hrms.staff-member",
    owningModule: "Hrms",
    displayNameEn: "Staff Member",
    displayNameAr: "عضو الفريق",
  };

  it("accepts a real string and rejects everything that is not one", () => {
    expect(readWireString("Staff Member")).toBe("Staff Member");
    expect(readWireString(undefined)).toBeUndefined();
    expect(readWireString(null)).toBeUndefined();
    // A number or an object is what a renamed/retyped server property actually hands back, and it
    // has no `localeCompare` either.
    expect(readWireString(7)).toBeUndefined();
    expect(readWireString({})).toBeUndefined();
    expect(readWireString("")).toBeUndefined();
    expect(readWireString("   ")).toBeUndefined();
    // Not trimmed on the way out: the guard decides usability, it does not rewrite server data.
    expect(readWireString(" Staff Member ")).toBe(" Staff Member ");
  });

  it("picks the active language's name, and the other one only as a fallback", () => {
    expect(resolveRegistryTypeName(WELL_FORMED, "en")).toBe("Staff Member");
    expect(resolveRegistryTypeName(WELL_FORMED, "ar")).toBe("عضو الفريق");
    expect(resolveRegistryTypeName({ ...WELL_FORMED, displayNameAr: "" }, "ar")).toBe("Staff Member");
    expect(resolveRegistryTypeName({ ...WELL_FORMED, displayNameEn: "" }, "en")).toBe("عضو الفريق");
  });

  it("reports no name at all rather than inventing one", () => {
    expect(
      resolveRegistryTypeName({ ...WELL_FORMED, displayNameEn: "", displayNameAr: "" }, "en")
    ).toBeUndefined();
    // A missing record, not just a missing property: the list is spread from a response body.
    expect(
      resolveRegistryTypeName(undefined as unknown as typeof WELL_FORMED, "en")
    ).toBeUndefined();
  });

  it("labels `Name (key)` normally and the bare key when no name arrived", () => {
    expect(formatRegistryTypeOptionLabel(WELL_FORMED, "en")).toBe("Staff Member (hrms.staff-member)");
    expect(
      formatRegistryTypeOptionLabel({ ...WELL_FORMED, displayNameEn: "", displayNameAr: "" }, "en")
    ).toBe("hrms.staff-member");
    // Not `hrms.staff-member (hrms.staff-member)`, which reads as a rendering bug -- the one thing
    // this row is not.
    expect(
      formatRegistryTypeOptionLabel({ ...WELL_FORMED, displayNameEn: "", displayNameAr: "" }, "en")
    ).not.toContain("(");
  });

  it("never renders the word undefined, and never renders nothing while it has anything to say", () => {
    const nameless = { ...WELL_FORMED, displayNameEn: "", displayNameAr: "" };
    const keyless = { ...WELL_FORMED, key: undefined as unknown as string };

    expect(formatRegistryTypeOptionLabel(nameless, "ar")).toBe("hrms.staff-member");
    expect(formatRegistryTypeOptionLabel(keyless, "en")).toBe("Staff Member");
    // Both gone is the only empty answer, and both call sites drop such a row before labelling it.
    expect(
      formatRegistryTypeOptionLabel(
        { ...nameless, key: undefined as unknown as string },
        "en"
      )
    ).toBe("");
  });
});

describe("CustomFieldListView wiring (real source)", () => {
  // The behaviour above is all real-function. What a pure-function test cannot see is whether the
  // view still puts the built field into both field arrays and seeds the key — so that, and only
  // that, is checked against the source.
  const here = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(resolve(here, "CustomFieldListView.tsx"), "utf-8");

  const createFieldsIdx = source.indexOf("createFields: [");
  const editFieldsIdx = source.indexOf("editFields: [");
  const createInitialIdx = source.indexOf("createInitialValues:");

  it("puts the create copy in createFields and the edit copy in editFields", () => {
    expect(createFieldsIdx).toBeGreaterThan(-1);
    expect(editFieldsIdx).toBeGreaterThan(createFieldsIdx);

    const createFieldsSource = source.slice(createFieldsIdx, editFieldsIdx);
    const editFieldsSource = source.slice(editFieldsIdx, createInitialIdx);

    expect(createFieldsSource).toContain("referenceTargetFields.create");
    expect(createFieldsSource).not.toContain("referenceTargetFields.edit");
    // The edit form MUST carry it: the update command full-replaces the column, so omitting the
    // field would unpin the definition on every unrelated save.
    expect(editFieldsSource).toContain("referenceTargetFields.edit");
  });

  it("seeds the key in createInitialValues, without which it could never reach the payload", () => {
    const createInitialSource = source.slice(createInitialIdx, source.indexOf("editInitialValues:"));
    expect(createInitialSource).toContain(
      "[REFERENCE_TARGET_FIELD_NAME]: UNPINNED_REFERENCE_TARGET"
    );
  });

  it("reads the option list through the hook rather than calling the repository from the view", () => {
    expect(source).toMatch(/useEntityLookupAvailableTypes\(\)/);
    expect(source).not.toMatch(/getAvailableTypes\(/);
  });

  it("routes the definition's OWN entity-type list through the same guards", () => {
    // That list is fed by the same backend registry through the same unchecked wire contract, and it
    // cannot be reached from a test without mounting the whole GenericCrudView chain -- so this is
    // the one thing here that has to be checked against the source.
    expect(source).toContain("formatRegistryTypeOptionLabel(item, language)");
    expect(source).toContain("resolveRegistryTypeName(item, language)");
  });

  it("leaves every inlined display-name ternary inside the guard itself", () => {
    // Three call sites used to pick a bilingual name inline, which is how `undefined (hrms.staff-member)`
    // reached the dropdown and how `localeCompare` reached an absent name. What remains is the two
    // halves of `resolveRegistryTypeName` -- active language and fallback language -- and both read
    // off its own guarded parameter, never a caller's row variable.
    const inlined = source.match(/language === "ar" \? [^\n]*displayName/g) ?? [];
    expect(inlined).toHaveLength(2);
    expect(inlined.every((line) => line.includes("type?.displayName"))).toBe(true);
  });
});
