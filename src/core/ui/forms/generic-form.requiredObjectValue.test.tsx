// GenericForm required-validation vs OBJECT-valued fields -- Wave 4
//
// THE BUG, named so this file cannot be mistaken for a cosmetic test:
// required-validation treated every object as filled. The check was one inline
// expression --
//
//   val === undefined || val === null || val === "" ||
//     (Array.isArray(val) && val.length === 0)
//
// -- and every arm of it tests a scalar or an array. An entity-reference value
// is an object, so `{ entityTypeKey: "hrms.staff-member", entityId: "" }` --
// a field the user never actually picked anything in -- passed as filled. The
// form submitted, and the server answered with a 422 the user could not connect
// to the field that caused it.
//
// These tests would all pass vacuously against the old expression except the
// two named after the bug, which fail: the form submits instead of blocking.
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { GenericForm, type FieldConfig } from "./generic-form";

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

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
}

const REFERENCE_FIELD: FieldConfig = {
  name: "assignee",
  label: "Assignee",
  type: "entity-reference",
  required: true,
};

/** Renders one field and returns the submit spy plus the submit button. */
function renderWithValue(field: FieldConfig, value: unknown) {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  render(
    <GenericForm
      fields={[field]}
      initialValues={value === undefined ? {} : { [field.name]: value }}
      onSubmit={onSubmit}
      onCancel={() => {}}
    />
  );
  return { onSubmit, submit: screen.getByRole("button", { name: "common.save" }) };
}

describe("GenericForm required-validation treats objects as always-filled (Wave 4 fix)", () => {
  it("blocks submit for a required entity-reference whose entityId is blank -- the object that used to validate as filled", async () => {
    const { onSubmit, submit } = renderWithValue(REFERENCE_FIELD, {
      entityTypeKey: "hrms.staff-member",
      entityId: "",
    });

    fireEvent.click(submit);

    await waitFor(() => {
      expect(screen.getByText("validation.required")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("blocks submit for a required entity-reference that is an empty object", async () => {
    const { onSubmit, submit } = renderWithValue(REFERENCE_FIELD, {});

    fireEvent.click(submit);

    await waitFor(() => {
      expect(screen.getByText("validation.required")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("blocks submit when only the target type key is present -- a key names a table but no row", async () => {
    const { onSubmit, submit } = renderWithValue(REFERENCE_FIELD, {
      entityTypeKey: "hrms.staff-member",
    });

    fireEvent.click(submit);

    await waitFor(() => {
      expect(screen.getByText("validation.required")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("blocks submit when only the id is present -- an id with no type key cannot be dispatched to a module", async () => {
    const { onSubmit, submit } = renderWithValue(REFERENCE_FIELD, { entityId: "ENC-abc" });

    fireEvent.click(submit);

    await waitFor(() => {
      expect(screen.getByText("validation.required")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("blocks submit for a whitespace-only id, matching the backend's IsNullOrWhiteSpace gate", async () => {
    const { onSubmit, submit } = renderWithValue(REFERENCE_FIELD, {
      entityTypeKey: "hrms.staff-member",
      entityId: "   ",
    });

    fireEvent.click(submit);

    await waitFor(() => {
      expect(screen.getByText("validation.required")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("fails closed for a scalar on a reference field -- no string can ever be a reference", async () => {
    const { onSubmit, submit } = renderWithValue(REFERENCE_FIELD, "ENC-abc");

    fireEvent.click(submit);

    await waitFor(() => {
      expect(screen.getByText("validation.required")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits a COMPLETE reference untouched, and does not rename anything on the way out", async () => {
    // `{ entityTypeKey, entityId }` is what the form holds, what onSubmit sees,
    // and what the CustomFields save path puts on the wire -- one spelling the
    // whole way through, with no translation step anywhere to be the "one right
    // place" for a rename. So renaming here is not a duplicated concern, it is
    // simply wrong: a save without `entityId` is refused as the 422 written for
    // a half-filled reference.
    const { onSubmit, submit } = renderWithValue(REFERENCE_FIELD, {
      entityTypeKey: "hrms.staff-member",
      entityId: "ENC-abc",
    });

    fireEvent.click(submit);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      assignee: { entityTypeKey: "hrms.staff-member", entityId: "ENC-abc" },
    });
    expect(screen.queryByText("validation.required")).not.toBeInTheDocument();
  });

  it("still blocks a missing required entity-reference (undefined), the pre-existing scalar arm", async () => {
    const { onSubmit, submit } = renderWithValue(REFERENCE_FIELD, undefined);

    fireEvent.click(submit);

    // No `validation.required` message asserted here, on purpose. With no
    // render branch in this component, an entity-reference field is drawn by
    // the shared Input fallthrough, which carries a NATIVE `required`
    // attribute -- and an undefined value renders as `value=""`, so the
    // browser's own constraint validation refuses the submit before
    // handleSubmit (and therefore this component's own check) ever runs.
    // That is precisely why the object cases above are the ones that matter:
    // an object renders as the non-empty string "[object Object]", sails past
    // native validation, and is caught only by isRequiredFieldEmpty.
    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
  });

  it("ignores a non-required reference field entirely, blank or not", async () => {
    const { onSubmit, submit } = renderWithValue(
      { ...REFERENCE_FIELD, required: false },
      { entityTypeKey: "hrms.staff-member", entityId: "" }
    );

    fireEvent.click(submit);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(screen.queryByText("validation.required")).not.toBeInTheDocument();
  });
});

// The other half of the fix: the object arm must be reachable ONLY for types
// declared object-valued. Every field type that shipped before Wave 4 has to
// behave exactly as it did, which for an object value means "waved through" --
// so these are pinned as the deliberate no-change cases, not left to inference.
describe("GenericForm required-validation -- no behaviour change for pre-Wave-4 types", () => {
  it("leaves a required select's scalar validation untouched", async () => {
    const field: FieldConfig = {
      name: "priority",
      label: "Priority",
      type: "select",
      required: true,
      options: [{ value: "low", label: "Low" }],
    };

    const blocked = renderWithValue(field, "");
    fireEvent.click(blocked.submit);
    await waitFor(() => {
      expect(screen.getByText("validation.required")).toBeInTheDocument();
    });
    expect(blocked.onSubmit).not.toHaveBeenCalled();
  });

  it("leaves a required multi-select's empty-array validation untouched", async () => {
    const field: FieldConfig = {
      name: "tags",
      label: "Tags",
      type: "multi-select",
      required: true,
      options: [{ value: "a", label: "A" }],
    };

    const { onSubmit, submit } = renderWithValue(field, []);
    fireEvent.click(submit);
    await waitFor(() => {
      expect(screen.getByText("validation.required")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("never reaches the object arm for a required DATETIME field -- the value is a string by then", async () => {
    // The reason "datetime" is NOT in OBJECT_VALUED_FIELD_TYPES, proven rather
    // than asserted: this component routes every date-family value through
    // toDateInputValue on initialisation, and that helper returns "" for
    // anything it cannot read as a date (an object throws on .getTime() inside
    // its own try/catch). So a two-piece { value, timeZoneId } object has
    // already become "" before required-validation looks at it, and is blocked
    // by the untouched scalar arm -- identically before and after the fix.
    // Making "datetime" object-aware would change a shipped type's behaviour on
    // a guess about a shape that never arrives here.
    const field: FieldConfig = {
      name: "startsAt",
      label: "Starts at",
      type: "datetime",
      required: true,
    };

    // Blocked, not waved through -- and blocked by the pre-existing scalar arm
    // (or, first, by DatePicker's own native required input), never by the new
    // object arm. Which of the two refuses it is not the point and is not
    // asserted; that it is refused identically before and after the fix is.
    const { onSubmit, submit } = renderWithValue(field, { value: "", timeZoneId: "" });
    fireEvent.click(submit);

    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
  });

  it("still accepts an object on a required RICHTEXT field, exactly as before the fix", async () => {
    const field: FieldConfig = {
      name: "body",
      label: "Body",
      type: "richtext",
      required: true,
    };

    const { onSubmit, submit } = renderWithValue(field, { some: "object" });
    fireEvent.click(submit);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(screen.queryByText("validation.required")).not.toBeInTheDocument();
  });
});
