/**
 * The field-group picker's real FieldConfig, rendered through the real
 * GenericForm (Wave 5 row 5.2).
 *
 * This is the config object `CustomFieldListView` puts on BOTH of its forms —
 * imported, not re-typed — so these assertions are about the control an admin
 * actually gets, not about a literal appearing somewhere in a source file.
 *
 * The accessible name is asserted with `getByRole("combobox", { name })`, never
 * `getByLabelText`. GenericSelect's trigger is a `role="combobox"` div and
 * `<Label htmlFor>` computes no name for it, so `getByLabelText` succeeds
 * against a completely nameless control.
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { GenericForm, type FieldConfig } from "@core/ui/forms/generic-form";
import {
  buildFieldGroupField,
  isFieldGroupPickerVisible,
  makeFieldGroupPickerVisibility,
  FIELD_GROUP_FIELD_NAME,
} from "./fieldGroupFieldConfig";

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

// Radix primitives inside GenericSelect observe their trigger; jsdom has no
// ResizeObserver.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

const t = (key: string) => key;

const GROUP_OPTIONS = [
  { value: "", label: "customField.fieldGroupNone" },
  { value: "enc-group-1", label: "Contact details" },
  { value: "enc-group-2", label: "Medical" },
];

function buildField(overrides: Partial<Parameters<typeof buildFieldGroupField>[0]> = {}) {
  return buildFieldGroupField({
    t,
    options: GROUP_OPTIONS,
    isLoading: false,
    isError: false,
    ...overrides,
  });
}

function renderField(
  field: FieldConfig,
  initialValues: Record<string, unknown> = {},
  onSubmit: (data: Record<string, unknown>) => Promise<void> = async () => {}
) {
  return render(
    <GenericForm
      fields={[field]}
      initialValues={initialValues}
      onSubmit={onSubmit as (data: Record<string, unknown>) => Promise<void>}
      onCancel={() => {}}
    />
  );
}

describe("field-group picker FieldConfig", () => {
  it("renders a combobox with a real accessible name", () => {
    renderField(buildField());

    const trigger = screen.getByRole("combobox", { name: "customField.fields.fieldGroup" });
    expect(trigger).toHaveAttribute("id", FIELD_GROUP_FIELD_NAME);
  });

  it("submits under the exact wire property name the backend request declares", () => {
    expect(buildField().name).toBe("fieldGroupId");
  });

  // NOT a guard on the sentinel itself. `buildFieldGroupField` receives
  // `options` from its caller and passes the array through untouched, so this
  // case proves passthrough-in-order and nothing more — deleting the sentinel
  // from `useFieldGroupOptions`, where it is actually constructed, would leave
  // it green. The real guard lives in
  // `field-group/src/presentation/viewmodels/useFieldGroupOptions.test.tsx`.
  it("passes the caller's option list through in order, sentinel included", () => {
    const field = buildField();

    expect(field.options).toEqual(GROUP_OPTIONS);
    expect(field.options?.[0]).toBe(GROUP_OPTIONS[0]);
  });

  it("passes the loading flag through, so a select waiting on its groups is not just an empty list", () => {
    expect(buildField({ isLoading: true }).loading).toBe(true);
    expect(buildField({ isLoading: false }).loading).toBe(false);
  });

  it("swaps the helper text for a load-failure explanation, rather than silently showing an empty picker", () => {
    expect(buildField({ isError: false }).description).toBe("customField.fieldGroupDescription");
    expect(buildField({ isError: true }).description).toBe("customField.fieldGroupLoadFailed");
  });
});

describe("isFieldGroupPickerVisible (create-form guard)", () => {
  it("hides the picker until an entity type is chosen — groups belong to exactly one", () => {
    expect(isFieldGroupPickerVisible({})).toBe(false);
    expect(isFieldGroupPickerVisible({ entityTypeKey: "" })).toBe(false);
  });

  it("shows the picker once an entity type is chosen", () => {
    expect(isFieldGroupPickerVisible({ entityTypeKey: "party.person" })).toBe(true);
  });

  // Two separate mounts rather than a rerender: GenericForm re-seeds its form
  // state from `initialValues` only on a genuine re-init, so a rerender with a
  // different object would prove nothing about the guard.
  it("really is what GenericForm hides the field with, when no entity type is set", () => {
    const field: FieldConfig = { ...buildField(), isVisible: isFieldGroupPickerVisible };
    const { unmount } = renderField(field, { entityTypeKey: "" });

    expect(
      screen.queryByRole("combobox", { name: "customField.fields.fieldGroup" })
    ).not.toBeInTheDocument();
    unmount();
  });

  it("really is what GenericForm shows the field with, once an entity type is set", () => {
    const field: FieldConfig = { ...buildField(), isVisible: isFieldGroupPickerVisible };
    renderField(field, { entityTypeKey: "party.person" });

    expect(
      screen.getByRole("combobox", { name: "customField.fields.fieldGroup" })
    ).toBeInTheDocument();
  });
});

/**
 * The permission half of the guard (row 5.2 fix round, review finding I-3).
 *
 * `GET /field-groups` is gated on `custom-field-groups.view` — a permission
 * introduced WITH this row, so every pre-existing role lacks it, including roles
 * holding the whole `custom-fields.*` set. Rendering the picker to such an admin
 * meant a 403 on every create/edit modal open and a picker that could only ever
 * offer "no group".
 *
 * Hiding a field is only safe if the stored value survives the save, and that is
 * the case this suite has to earn rather than assume: it is the exact shape of
 * the Wave 2.5 C-1 defect (a field silently detached on every unrelated edit).
 */
describe("makeFieldGroupPickerVisibility (permission gate)", () => {
  it("hides the picker from an admin who cannot read field groups, on both forms", () => {
    const editForm = makeFieldGroupPickerVisibility({ canView: false, requireEntityType: false });
    const createForm = makeFieldGroupPickerVisibility({ canView: false, requireEntityType: true });

    expect(editForm({ entityTypeKey: "party.person" })).toBe(false);
    expect(createForm({ entityTypeKey: "party.person" })).toBe(false);
  });

  it("still requires an entity type on the create form when the admin CAN read groups", () => {
    const createForm = makeFieldGroupPickerVisibility({ canView: true, requireEntityType: true });

    expect(createForm({})).toBe(false);
    expect(createForm({ entityTypeKey: "" })).toBe(false);
    expect(createForm({ entityTypeKey: "party.person" })).toBe(true);
  });

  it("needs no entity type on the edit form, where the key is immutable and known", () => {
    const editForm = makeFieldGroupPickerVisibility({ canView: true, requireEntityType: false });

    expect(editForm({})).toBe(true);
  });

  it("keeps the field out of the DOM entirely, through the real GenericForm", () => {
    const field: FieldConfig = {
      ...buildField(),
      isVisible: makeFieldGroupPickerVisibility({ canView: false, requireEntityType: false }),
    };
    renderField(field, { fieldGroupId: "enc-group-1" });

    expect(
      screen.queryByRole("combobox", { name: "customField.fields.fieldGroup" })
    ).not.toBeInTheDocument();
  });

  it("still submits the stored group when the picker is hidden — hiding the control must not detach the group", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const field: FieldConfig = {
      ...buildField(),
      isVisible: makeFieldGroupPickerVisibility({ canView: false, requireEntityType: false }),
    };
    const { container } = renderField(field, { fieldGroupId: "enc-group-1" }, onSubmit);

    // Submitting the form element directly rather than clicking a label-matched
    // button: the point of the case is the payload, and the form is the one
    // element guaranteed to be present when every field is hidden.
    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);

    // `isVisible` gates rendering and required-validation only. GenericForm
    // seeds formData from initialValues and submits a raw spread of it, so the
    // key survives. If it did not, an admin without the new permission would
    // silently ungroup every field they edited.
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ fieldGroupId: "enc-group-1" });
  });
});
