// GenericForm draws an `entity-reference` field through the CustomFields
// extension registry -- Wave 4 follow-up.
//
// THE BLOCKER THIS FILE PINS. `entity-reference` was declared on
// `FieldConfig["type"]` with no render arm, so a custom-field FieldConfig of that
// type -- which genuinely reaches this component, because generic-crud-view.tsx
// concatenates `useCustomFieldsFormFields`'s fieldConfigs into the `fields` it
// hands <GenericForm>, and `visibleFields` filters only on isVisible/permissions
// -- fell through to the switch's default `<Input type={field.type}
// value={formData[field.name] ?? ""}>`. The operator saw a text box containing
// `[object Object]`, and typing in it replaced the stored `{ entityTypeKey,
// entityId }` object with a string the server answers with a 422
// `unsupportedType`. 30 CrudConfig sites declare `entityTypeKey:`; 8 call the
// module's own dispatcher instead of GenericForm, which is why this survived.
//
// WHAT MAKES THESE TESTS FAIL WITHOUT THE FIX, assertion by assertion, is stated
// on each one. The load-bearing pair are "renders a combobox, not a text input"
// (getByRole("combobox") throws and queryByRole("textbox") finds the input
// without the render arm) and "does not overwrite the stored object" (the value
// arrives as the string "[object Object]" without it).
//
// The extension is a FAKE here on purpose. This file's subject is the ROUTING
// contract core owns -- that GenericForm hands the registered control the six
// props it promises and draws nothing itself. That the real control is a working
// picker is pinned on the module side, by
// GenericFormCustomFieldControl.entityReference.test.tsx, which mounts this same
// GenericForm over the real implementation.
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { GenericForm, type FieldConfig } from "./generic-form";
import {
  registerCustomFieldsExtension,
  type CustomFieldFormControlProps,
  type CustomFieldsExtensionApi,
} from "@core/crud/customFieldsExtension";

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

/** Every prop the fake control was handed, newest last -- the routing contract's observation point. */
let receivedProps: CustomFieldFormControlProps[] = [];

/**
 * Stands in for the CustomFields module's real control. Renders the same
 * `role="combobox"` surface the real one does (its trigger is a
 * `<div role="combobox">`, not a native element), and wires the three host-owned
 * a11y props exactly as the real one does, so this file's a11y assertions are
 * about what GenericForm PASSES rather than about what a stub happens to paint.
 */
function FakeFieldControl({
  field,
  value,
  onChange,
  disabled,
  invalid,
  describedBy,
}: CustomFieldFormControlProps) {
  receivedProps.push({ field, value, onChange, disabled, invalid, describedBy });
  return (
    <div>
      {/* The real control renders its own label; this asserts the host does not
          also render one (see the duplicate-label test below). */}
      <label htmlFor={field.name}>{field.label}</label>
      <div
        id={field.name}
        role="combobox"
        aria-expanded={false}
        // The real control's trigger controls a real listbox; the stub carries a
        // closed one so its ARIA is valid rather than merely close enough.
        aria-controls={`${field.name}-panel`}
        aria-label={field.label ?? field.name}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-disabled={disabled || undefined}
      >
        {value ? "Nadia Rashed" : ""}
      </div>
      <div id={`${field.name}-panel`} role="listbox" aria-label="options" hidden />
      <button
        type="button"
        onClick={() => onChange({ entityTypeKey: "hrms.staff-member", entityId: "ENC-9" })}
      >
        pick
      </button>
    </div>
  );
}

function makeApi(overrides: Partial<CustomFieldsExtensionApi> = {}): CustomFieldsExtensionApi {
  return {
    getFormFields: vi.fn().mockResolvedValue([]),
    saveValues: vi.fn().mockResolvedValue(undefined),
    getBulkColumnValues: vi.fn().mockResolvedValue({ columns: [], valuesByOwnerId: {} }),
    InlineAddTrigger: () => null,
    FieldControl: FakeFieldControl,
    ...overrides,
  };
}

const FIELD: FieldConfig = {
  // The real, namespaced name the extension produces (encodeCustomFieldName),
  // so the id/`htmlFor`/`aria-describedby` wiring is exercised on the shape
  // production actually uses.
  name: "__cf__assignee",
  label: "Assignee",
  type: "entity-reference",
  referenceTargetEntityTypeKey: "hrms.staff-member",
};

const STORED: unknown = { entityTypeKey: "hrms.staff-member", entityId: "ENC-1" };

beforeEach(() => {
  receivedProps = [];
  // The registry has no unregister; every test re-registers instead. The
  // FieldControl-absent path lives in its own file for exactly that reason.
  registerCustomFieldsExtension(makeApi());
});

describe("GenericForm entity-reference field — routing to the extension control", () => {
  it("renders the extension's combobox, never a text input", () => {
    // RED WITHOUT THE FIX, both halves: getByRole("combobox") throws (the
    // extension is never consulted) and queryByRole("textbox") finds the
    // fallthrough `<Input type="entity-reference">`.
    const { container } = render(
      <GenericForm fields={[FIELD]} onSubmit={async () => {}} onCancel={() => {}} />
    );

    expect(screen.getByRole("combobox", { name: "Assignee" })).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(container.querySelector('input[type="entity-reference"]')).toBeNull();
  });

  it("hands the control the raw stored object, not a stringified or blanked value", () => {
    // RED WITHOUT THE FIX: nothing receives props at all, and the DOM shows
    // `[object Object]` as an input value.
    render(
      <GenericForm
        fields={[FIELD]}
        initialValues={{ [FIELD.name]: STORED }}
        onSubmit={async () => {}}
        onCancel={() => {}}
      />
    );

    expect(receivedProps.at(-1)?.value).toEqual(STORED);
    expect(receivedProps.at(-1)?.field.referenceTargetEntityTypeKey).toBe("hrms.staff-member");
  });

  it("leaves nothing typeable that could overwrite the stored object", async () => {
    // The DATA-LOSS shape, reproduced rather than described. RED WITHOUT THE FIX:
    // the fallthrough renders an `<input>` holding "[object Object]", the typing
    // below replaces the whole reference with a string, and the submitted value is
    // "typed" instead of the object. With the fix there is no input to find, so
    // the keystroke has nowhere to land and the value survives untouched.
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(
      <GenericForm
        fields={[FIELD]}
        initialValues={{ [FIELD.name]: STORED }}
        onSubmit={onSubmit}
        onCancel={() => {}}
      />
    );

    const stray = container.querySelector<HTMLInputElement>(`input#${CSS.escape(FIELD.name)}`);
    if (stray) fireEvent.change(stray, { target: { value: "typed" } });

    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0][FIELD.name]).toEqual(STORED);
  });

  it("routes the control's onChange into form state and submits the object it emitted", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<GenericForm fields={[FIELD]} onSubmit={onSubmit} onCancel={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "pick" }));
    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0][FIELD.name]).toEqual({
      entityTypeKey: "hrms.staff-member",
      entityId: "ENC-9",
    });
  });

  it("renders exactly one label for the field — the host suppresses its own", () => {
    // RED WITHOUT THE FIX in the opposite direction: with the arm added but the
    // label-suppression missed, two identical <label for="__cf__assignee"> nodes
    // render. Counted on the `for` attribute rather than on visible text so a
    // control that labels itself differently cannot mask a duplicate.
    const { container } = render(
      <GenericForm fields={[FIELD]} onSubmit={async () => {}} onCancel={() => {}} />
    );

    expect(container.querySelectorAll(`label[for="${FIELD.name}"]`)).toHaveLength(1);
  });
});

describe("GenericForm entity-reference field — host-owned a11y facts reach the control", () => {
  it("passes the form's read-only state through as disabled", () => {
    render(<GenericForm fields={[FIELD]} onSubmit={async () => {}} onCancel={() => {}} readOnly />);

    expect(receivedProps.at(-1)?.disabled).toBe(true);
    expect(screen.getByRole("combobox", { name: "Assignee" })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });

  it("passes invalid + the error node's id after a required field fails validation", async () => {
    // The required pass for "entity-reference" is already in `customTypes`, and
    // `isRequiredFieldEmpty` already refuses a blank reference. What this pins is
    // that the resulting verdict is CARRIED to the control: without `invalid` and
    // `describedBy` the field would show a red error paragraph that no screen
    // reader ever associates with the control.
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <GenericForm
        fields={[{ ...FIELD, required: true }]}
        onSubmit={onSubmit}
        onCancel={() => {}}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => expect(receivedProps.at(-1)?.invalid).toBe(true));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(receivedProps.at(-1)?.describedBy).toBe(`${FIELD.name}-error`);

    const combobox = screen.getByRole("combobox", { name: "Assignee" });
    expect(combobox).toHaveAttribute("aria-invalid", "true");
    expect(combobox).toHaveAttribute("aria-describedby", `${FIELD.name}-error`);
    // The described node must actually exist -- a dangling aria-describedby is
    // worse than none, which is the rule the rest of this component follows.
    expect(document.getElementById(`${FIELD.name}-error`)).toBeInTheDocument();
  });

  it("passes the hint node's id when the field has a description and no error", () => {
    render(
      <GenericForm
        fields={[{ ...FIELD, description: "Who owns this record." }]}
        onSubmit={async () => {}}
        onCancel={() => {}}
      />
    );

    expect(receivedProps.at(-1)?.describedBy).toBe(`${FIELD.name}-hint`);
    expect(document.getElementById(`${FIELD.name}-hint`)).toBeInTheDocument();
  });
});
