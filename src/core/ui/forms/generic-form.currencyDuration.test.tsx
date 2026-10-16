// GenericForm draws `currency` and `duration` fields through the CustomFields
// extension registry -- Wave 4 follow-up, the second half of the same defect
// `generic-form.entityReference.test.tsx` pins.
//
// THE BLOCKER THIS FILE PINS. Both types were declared on `FieldConfig["type"]`
// with no render arm, on the recorded assumption that "none of them mounts a
// <GenericForm> over these fields". That was true of the 8 hand-wired
// CustomFields sites and false of everything else: generic-crud-view.tsx
// concatenates `useCustomFieldsFormFields`'s fieldConfigs into the `fields` it
// hands <GenericForm>, and `visibleFields` filters only on isVisible/permissions.
// So on the ~30 CrudConfig sites that declare `entityTypeKey:`, a Currency or
// Duration custom field fell through to the switch's default
// `<Input type={field.type} value={formData[field.name] ?? ""}>`.
//
// For Currency that is the WORSE half of the defect: its value is a two-part
// `{ amount, currencyCode }` object, so the operator saw a text box containing
// `[object Object]`, and one keystroke replaced the stored object with a string
// the server refuses. Duration's value is a scalar, so it "looked" fine -- but a
// bare `<input type="duration">` is `type=text` in every browser: no numeric
// keypad, no spinner, no `min=0`, and no minutes unit anywhere on screen, which
// is the entire reason DurationCustomFieldControl exists (backend ruling R4).
//
// THE LOAD-BEARING ASSERTION, per type, is called out on each test. For Currency
// it is "never paints [object Object]" plus "the stored object survives a
// keystroke"; for Duration it is "renders the extension's control, not the text
// fallthrough".
//
// The extension is a FAKE here on purpose, exactly as in the entity-reference
// file: this file's subject is the ROUTING contract core owns -- that GenericForm
// hands the registered control the six props it promises and draws nothing
// itself. That the REAL controls are a working two-part money field and a working
// minutes field is pinned on the module side, by
// GenericFormCustomFieldControl.currencyDuration.test.tsx, which mounts this same
// GenericForm over the real implementations.
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
 * Stands in for whichever real control `renderCustomFieldControl` would dispatch
 * to. Renders its own `<label htmlFor>` because BOTH real controls do (that is
 * precisely why GenericForm must suppress its own -- see
 * `EXTENSION_DRAWN_FIELD_TYPES`), and wires the three host-owned a11y props the
 * way the real ones do, so this file's a11y assertions are about what GenericForm
 * PASSES rather than about what a stub happens to paint.
 *
 * The button reports a shape appropriate to the field's type, so the "onChange is
 * routed into form state" test can prove the object survives the round trip for
 * Currency and the scalar does for Duration.
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
      <label htmlFor={field.name}>{field.label}</label>
      <input
        id={field.name}
        type="number"
        aria-label={field.label ?? field.name}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        // Read-only rather than an onChange path: this stub exists to observe the
        // props GenericForm passes, and a writable input here would let a stray
        // keystroke in the data-loss tests below pass for the real fix.
        readOnly
        value={
          field.type === "currency"
            ? ((value as { amount?: string | number } | null | undefined)?.amount ?? "")
            : ((value as string | number | undefined) ?? "")
        }
      />
      <button
        type="button"
        onClick={() =>
          onChange(field.type === "currency" ? { amount: "42.5", currencyCode: "SAR" } : "45")
        }
      >
        report
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

/** The real, namespaced names the extension produces (encodeCustomFieldName). */
const CURRENCY_FIELD: FieldConfig = {
  name: "__cf__price",
  label: "Price",
  type: "currency",
};

const DURATION_FIELD: FieldConfig = {
  name: "__cf__session_length",
  label: "Session Length",
  type: "duration",
};

/** The wire shape CurrencyValueTypeHandler.Parse accepts and Project returns. */
const STORED_CURRENCY: unknown = { amount: 150.75, currencyCode: "USD" };
/** Bare minutes -- ValueNumber is decimal, so a fractional value is legitimate. */
const STORED_DURATION: unknown = 90;

beforeEach(() => {
  receivedProps = [];
  // The registry has no unregister; every test re-registers instead. The
  // FieldControl-absent path lives in its own file for exactly that reason.
  registerCustomFieldsExtension(makeApi());
});

describe("GenericForm currency field — routing to the extension control", () => {
  it("never paints the stored object into an input as [object Object]", () => {
    // THE assertion for this type, and the one the brief names. RED WITHOUT THE
    // FIX: the fallthrough renders `<Input type="currency" value={formData[name]
    // ?? ""}>`, whose value is literally the string "[object Object]".
    // queryByDisplayValue is the discriminating half -- an `<input value>`
    // contributes nothing to textContent, so a textContent check alone would pass
    // vacuously against the bug.
    const { container } = render(
      <GenericForm
        fields={[CURRENCY_FIELD]}
        initialValues={{ [CURRENCY_FIELD.name]: STORED_CURRENCY }}
        onSubmit={async () => {}}
        onCancel={() => {}}
      />
    );

    expect(screen.queryByDisplayValue("[object Object]")).not.toBeInTheDocument();
    expect(container.textContent).not.toContain("[object Object]");
    expect(container.querySelector('input[type="currency"]')).toBeNull();
  });

  it("hands the control the raw stored object, never a stringified or blanked value", () => {
    // RED WITHOUT THE FIX: nothing receives props at all.
    render(
      <GenericForm
        fields={[CURRENCY_FIELD]}
        initialValues={{ [CURRENCY_FIELD.name]: STORED_CURRENCY }}
        onSubmit={async () => {}}
        onCancel={() => {}}
      />
    );

    expect(receivedProps.at(-1)?.value).toEqual(STORED_CURRENCY);
  });

  it("leaves nothing typeable that could overwrite the stored object", async () => {
    // The DATA-LOSS shape, reproduced rather than described. RED WITHOUT THE FIX:
    // the fallthrough input holds "[object Object]", the change below replaces the
    // whole money value with the string "typed", and that is what onSubmit sees.
    // Written as a conditional keystroke rather than assert-then-type so the
    // FAILURE is the corrupted value -- the actual defect -- not merely "an
    // editable input exists".
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(
      <GenericForm
        fields={[CURRENCY_FIELD]}
        initialValues={{ [CURRENCY_FIELD.name]: STORED_CURRENCY }}
        onSubmit={onSubmit}
        onCancel={() => {}}
      />
    );

    const stray = container.querySelector<HTMLInputElement>(
      `input#${CSS.escape(CURRENCY_FIELD.name)}:not([readonly])`
    );
    if (stray) fireEvent.change(stray, { target: { value: "typed" } });

    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0][CURRENCY_FIELD.name]).toEqual(STORED_CURRENCY);
  });

  it("routes the control's onChange into form state and submits the object it emitted", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<GenericForm fields={[CURRENCY_FIELD]} onSubmit={onSubmit} onCancel={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "report" }));
    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0][CURRENCY_FIELD.name]).toEqual({
      amount: "42.5",
      currencyCode: "SAR",
    });
  });

  it("renders exactly one label for the field — the host suppresses its own", () => {
    // RED IN THE OPPOSITE DIRECTION: with the render arm added but the label
    // suppression missed, two <label for="__cf__price"> nodes render. Counted on
    // the `for` attribute rather than on visible text so a control that labels
    // itself differently cannot mask a duplicate.
    const { container } = render(
      <GenericForm fields={[CURRENCY_FIELD]} onSubmit={async () => {}} onCancel={() => {}} />
    );

    expect(container.querySelectorAll(`label[for="${CURRENCY_FIELD.name}"]`)).toHaveLength(1);
  });
});

describe("GenericForm duration field — routing to the extension control", () => {
  it("renders the extension's control, not the text fallthrough", () => {
    // THE assertion for this type. `<Input type="duration">` is an UNKNOWN input
    // type, which every browser (and jsdom) treats as type=text -- so the
    // discriminating check is the attribute, not the role: the fallthrough emits
    // `type="duration"` verbatim into the DOM.
    const { container } = render(
      <GenericForm fields={[DURATION_FIELD]} onSubmit={async () => {}} onCancel={() => {}} />
    );

    expect(container.querySelector('input[type="duration"]')).toBeNull();
    expect(receivedProps.at(-1)?.field.type).toBe("duration");
  });

  it("hands the control the raw stored minutes, not a coerced string", () => {
    render(
      <GenericForm
        fields={[DURATION_FIELD]}
        initialValues={{ [DURATION_FIELD.name]: STORED_DURATION }}
        onSubmit={async () => {}}
        onCancel={() => {}}
      />
    );

    expect(receivedProps.at(-1)?.value).toBe(90);
  });

  it("passes an ABSENT value through as undefined, never normalised to an empty string", () => {
    // The `?? ""` in the fallthrough is what made an absent value indistinguishable
    // from a deliberately-cleared one. The extension arm passes formData raw so the
    // control decides what "no value" means for its own type.
    render(<GenericForm fields={[DURATION_FIELD]} onSubmit={async () => {}} onCancel={() => {}} />);

    expect(receivedProps.at(-1)?.value).toBeUndefined();
  });

  it("routes the control's onChange into form state and submits the scalar it emitted", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<GenericForm fields={[DURATION_FIELD]} onSubmit={onSubmit} onCancel={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "report" }));
    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0][DURATION_FIELD.name]).toBe("45");
  });

  it("renders exactly one label for the field — the host suppresses its own", () => {
    // Duration is the type where a kept host label would have been ANNOUNCED, not
    // just seen twice: the real control names its input through a native
    // <Label htmlFor>, and the accessible-name computation concatenates every
    // matching <label>. See EXTENSION_DRAWN_FIELD_TYPES.
    const { container } = render(
      <GenericForm fields={[DURATION_FIELD]} onSubmit={async () => {}} onCancel={() => {}} />
    );

    expect(container.querySelectorAll(`label[for="${DURATION_FIELD.name}"]`)).toHaveLength(1);
  });

  it("names the field exactly once even for a screen reader, not 'LabelLabel'", () => {
    // The concrete failure the suppression prevents, asserted as a NAME rather
    // than as a node count -- a duplicate <label for> would make this read
    // "Session LengthSession Length".
    render(<GenericForm fields={[DURATION_FIELD]} onSubmit={async () => {}} onCancel={() => {}} />);

    expect(screen.getByRole("spinbutton", { name: "Session Length" })).toBeInTheDocument();
  });
});

describe("GenericForm currency/duration — host-owned a11y facts reach the control", () => {
  it.each([
    ["currency", CURRENCY_FIELD],
    ["duration", DURATION_FIELD],
  ])("passes the form's read-only state through as disabled (%s)", (_label, field) => {
    render(<GenericForm fields={[field]} onSubmit={async () => {}} onCancel={() => {}} readOnly />);

    expect(receivedProps.at(-1)?.disabled).toBe(true);
  });

  it.each([
    ["currency", CURRENCY_FIELD],
    ["duration", DURATION_FIELD],
  ])("passes field.disabled through as disabled (%s)", (_label, field) => {
    render(
      <GenericForm
        fields={[{ ...field, disabled: true }]}
        onSubmit={async () => {}}
        onCancel={() => {}}
      />
    );

    expect(receivedProps.at(-1)?.disabled).toBe(true);
  });

  it.each([
    ["currency", CURRENCY_FIELD],
    ["duration", DURATION_FIELD],
  ])(
    "passes invalid + the error node's id once the required pass rejects the field (%s)",
    async (_label, field) => {
      // What this pins is that the verdict is CARRIED to the control: without
      // `invalid` and `describedBy` the field would show a red error paragraph
      // that no screen reader ever associates with the control. It also proves
      // both types actually REACH the required pass, which needs them in the
      // `customTypes` set -- they are there by construction now, spread from
      // EXTENSION_DRAWN_FIELD_TYPES.
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(
        <GenericForm
          fields={[{ ...field, required: true }]}
          onSubmit={onSubmit}
          onCancel={() => {}}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: "common.save" }));

      await waitFor(() => expect(receivedProps.at(-1)?.invalid).toBe(true));
      expect(onSubmit).not.toHaveBeenCalled();
      expect(receivedProps.at(-1)?.describedBy).toBe(`${field.name}-error`);
      // The described node must actually exist -- a dangling aria-describedby is
      // worse than none, which is the rule the rest of this component follows.
      expect(document.getElementById(`${field.name}-error`)).toBeInTheDocument();
    }
  );

  it.each([
    ["currency", CURRENCY_FIELD],
    ["duration", DURATION_FIELD],
  ])(
    "passes the hint node's id when the field has a description and no error (%s)",
    (_l, field) => {
      render(
        <GenericForm
          fields={[{ ...field, description: "What the operator is entering." }]}
          onSubmit={async () => {}}
          onCancel={() => {}}
        />
      );

      expect(receivedProps.at(-1)?.describedBy).toBe(`${field.name}-hint`);
      expect(document.getElementById(`${field.name}-hint`)).toBeInTheDocument();
    }
  );

  it("hands the control the whole FieldConfig, so a type-specific carrier needs no new prop", () => {
    // The reason CustomFieldFormControlProps passes `field` whole rather than
    // unpacked scalars. Currency's control reads `placeholder` and `required`;
    // neither would have arrived through a scalar-by-scalar contract shaped around
    // entity-reference.
    render(
      <GenericForm
        fields={[{ ...CURRENCY_FIELD, placeholder: "0.00", required: true }]}
        onSubmit={async () => {}}
        onCancel={() => {}}
      />
    );

    expect(receivedProps.at(-1)?.field.placeholder).toBe("0.00");
    expect(receivedProps.at(-1)?.field.required).toBe(true);
  });
});
