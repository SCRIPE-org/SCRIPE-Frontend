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
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { GenericForm, type FieldConfig } from "@core/ui/forms/generic-form";
import {
  buildFieldGroupField,
  isFieldGroupPickerVisible,
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

function renderField(field: FieldConfig, initialValues: Record<string, unknown> = {}) {
  return render(
    <GenericForm
      fields={[field]}
      initialValues={initialValues}
      onSubmit={async () => {}}
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

  it("leads with a 'no group' sentinel so an admin can clear an existing assignment", () => {
    const field = buildField();

    expect(field.options?.[0]).toEqual({ value: "", label: "customField.fieldGroupNone" });
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
