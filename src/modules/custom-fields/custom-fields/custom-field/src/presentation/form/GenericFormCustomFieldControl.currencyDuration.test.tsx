// The REAL Currency and Duration controls, drawn by a plain <GenericForm> through
// the CustomFields extension registry -- Wave 4 follow-up, end to end.
//
// WHY THIS FILE EXISTS ALONGSIDE the two core-side ones. Those pin the routing
// contract `core` owns, against a fake control: that GenericForm consults the
// registry, passes the six promised props, suppresses its own label, and renders
// an inert explanation when nothing is registered. Neither can prove the thing the
// operator actually cares about -- that the field they get on a generic CRUD
// screen is the SAME working control the 8 hand-wired sites get -- because a fake
// would pass either way. `core` may not import from `src/modules/*`, so the only
// place that assertion can live is here, on the module side, where both halves are
// importable.
//
// RED WITHOUT THE FIX, in one line: neither control exists in the DOM at all,
// because GenericForm had no arm for "currency"/"duration" and drew
// `<Input type="currency">` / `<Input type="duration">` instead -- which for
// Currency painted the stored object as "[object Object]".
//
// Nothing is mocked except the permission provider: both controls are pure
// presentation over `@core/ui` primitives, with no DI-container or network reach
// (unlike the reference picker's entity-lookup hooks), so everything between
// GenericForm and the two real <input> elements is real here. That is the point --
// a prop-capture mock of either control would still pass if the registration were
// wired to the wrong component.
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { GenericForm, type FieldConfig } from "@core/ui/forms/generic-form";
import {
  registerCustomFieldsExtension,
  type CustomFieldsExtensionApi,
} from "@core/crud/customFieldsExtension";
import { GenericFormCustomFieldControl } from "./GenericFormCustomFieldControl";

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

/**
 * Registers the REAL bridge, exactly as customFieldsCrudIntegration.tsx does.
 * `getFormFields` is stubbed because this file hands <GenericForm> its fields
 * directly rather than going through a CRUD screen's fetch.
 */
function registerRealBridge(): void {
  const api: CustomFieldsExtensionApi = {
    getFormFields: vi.fn().mockResolvedValue([]),
    saveValues: vi.fn().mockResolvedValue(undefined),
    getBulkColumnValues: vi.fn().mockResolvedValue({ columns: [], valuesByOwnerId: {} }),
    InlineAddTrigger: () => null,
    FieldControl: GenericFormCustomFieldControl,
  };
  registerCustomFieldsExtension(api);
}

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

/**
 * Outside an I18nProvider `t()` returns the bare key, so the controls' accessible
 * names are the raw keys here. Asserting those proves the KEY is right, where
 * asserting English prose would pass for any key that happened to resolve -- the
 * same convention the neighbouring suites use.
 */
const AMOUNT_NAME = "customField.currency.amountLabel";
const CODE_NAME = "customField.currency.codeLabel";
const UNIT_TEXT = "customField.duration.unitLabel";

beforeEach(() => {
  registerRealBridge();
});

describe("GenericForm + the REAL CurrencyCustomFieldControl", () => {
  it("draws the two-part money control, not a text box holding [object Object]", () => {
    // THE end-to-end assertion. RED WITHOUT THE FIX on every line: no group, no
    // spinbutton, and an input whose display value is the string "[object Object]".
    render(
      <GenericForm
        fields={[CURRENCY_FIELD]}
        initialValues={{ [CURRENCY_FIELD.name]: { amount: 150.75, currencyCode: "USD" } }}
        onSubmit={async () => {}}
        onCancel={() => {}}
      />
    );

    expect(screen.getByRole("group", { name: "Price" })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: AMOUNT_NAME })).toHaveValue(150.75);
    // `combobox` rather than `textbox`: an <input type="text" list="..."> maps to
    // combobox per HTML-AAM, and the code input carries a `list` for the
    // SUPPORTED_CURRENCIES datalist.
    expect(screen.getByRole("combobox", { name: CODE_NAME })).toHaveValue("USD");
    expect(screen.queryByDisplayValue("[object Object]")).not.toBeInTheDocument();
  });

  it("renders exactly one label for the field, and the group carries the field's name", () => {
    const { container } = render(
      <GenericForm fields={[CURRENCY_FIELD]} onSubmit={async () => {}} onCancel={() => {}} />
    );

    expect(container.querySelectorAll(`label[for="${CURRENCY_FIELD.name}"]`)).toHaveLength(1);
    expect(screen.getAllByText("Price")).toHaveLength(1);
  });

  it("submits the two-part object the control composed, through the form's own onSubmit", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<GenericForm fields={[CURRENCY_FIELD]} onSubmit={onSubmit} onCancel={() => {}} />);

    fireEvent.change(screen.getByRole("spinbutton", { name: AMOUNT_NAME }), {
      target: { value: "19.99" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: CODE_NAME }), {
      target: { value: "sar" },
    });
    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0][CURRENCY_FIELD.name]).toEqual({
      amount: "19.99",
      currencyCode: "SAR",
    });
  });

  it("SAVES an amount with cents all the way through the form", async () => {
    // Cents are the normal case for money (decimal(18,6), no rounding anywhere in
    // the handler), so this is the end-to-end regression guard for the whole path.
    //
    // HONEST SCOPE, measured rather than assumed. Removing `step="any"` does NOT
    // make this test fail, and the comment must not claim it does: an
    // <input type="number"> with no step steps by 1, but the step BASE is `min` if
    // present, else the `value` content attribute — and this input has no `min`
    // while React keeps a controlled input's `value` attribute in sync, so the
    // base tracks the current amount and 19.99 never mismatches. The declaration
    // is still right, and it stops the first `min` anyone adds to a price field
    // from silently making every amount with cents unsubmittable. The type where
    // the same omission WAS a live defect is Duration, whose `min={0}` pins its
    // base at 0 — see "SAVES a fractional duration" below, which does go red.
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<GenericForm fields={[CURRENCY_FIELD]} onSubmit={onSubmit} onCancel={() => {}} />);

    const amount = screen.getByRole("spinbutton", { name: AMOUNT_NAME }) as HTMLInputElement;
    fireEvent.change(amount, { target: { value: "19.99" } });
    fireEvent.change(screen.getByRole("combobox", { name: CODE_NAME }), {
      target: { value: "USD" },
    });
    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0][CURRENCY_FIELD.name]).toEqual({
      amount: "19.99",
      currencyCode: "USD",
    });
    expect(amount.validity.stepMismatch).toBe(false);
  });

  it("BLOCKS a one- or two-letter code before the round trip, mirroring IsValidCurrencyCode", async () => {
    // The keystroke filter already guarantees uppercase letters only, so the one
    // shape it cannot catch is a code stopped short. `pattern="[A-Z]{3}"` is that
    // handler's exact grammar, and a patternMismatch stops the submit outright.
    // RED without the pattern: onSubmit fires and the save round-trips into a
    // `currencyCodeInvalid` 422 the operator cannot connect to this field.
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<GenericForm fields={[CURRENCY_FIELD]} onSubmit={onSubmit} onCancel={() => {}} />);

    const code = screen.getByRole("combobox", { name: CODE_NAME }) as HTMLInputElement;
    fireEvent.change(screen.getByRole("spinbutton", { name: AMOUNT_NAME }), {
      target: { value: "10" },
    });
    fireEvent.change(code, { target: { value: "us" } });
    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => expect(code.validity.patternMismatch).toBe(true));
    expect(onSubmit).not.toHaveBeenCalled();

    // Completing the code releases it -- the guard is the grammar, not the field.
    fireEvent.change(code, { target: { value: "usd" } });
    fireEvent.click(screen.getByRole("button", { name: "common.save" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  it("BLOCKS a half-blank submit even when the field is optional", async () => {
    // The gap this closes, stated as the operator's experience: an amount typed
    // with no currency is not "nothing to save" (IsEmpty needs BOTH pieces
    // missing), so the server reaches Validate and 422s. And the module's own
    // pre-save guard cannot help here -- assertSelectCustomFieldValuesValid is
    // wired into the 8 hand-wired viewmodels, NOT into generic-crud-view. RED
    // without the pair-completion `required`: onSubmit fires with
    // `{ amount: "10", currencyCode: "" }`.
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<GenericForm fields={[CURRENCY_FIELD]} onSubmit={onSubmit} onCancel={() => {}} />);

    fireEvent.change(screen.getByRole("spinbutton", { name: AMOUNT_NAME }), {
      target: { value: "10" },
    });
    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => expect(screen.getByRole("combobox", { name: CODE_NAME })).toBeInvalid());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("BLOCKS a required currency whose amount is blank", async () => {
    // What the brief asks for, and the honest note about WHICH guard refuses it.
    // With the real control registered the amount input carries a native
    // `required`, so the browser refuses the submit before handleSubmit — and
    // therefore before GenericForm's own `isRequiredFieldEmpty` — ever runs. That
    // is the same ordering generic-form.entityReference.test.tsx's own
    // "still blocks a missing required entity-reference" case documents. The
    // form-level arm is the guard for the paths where no native control exists at
    // all (no module registered, or a module whose control has no native
    // attributes); it is exercised there, in
    // generic-form.requiredObjectValue.test.tsx.
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <GenericForm
        fields={[{ ...CURRENCY_FIELD, required: true }]}
        initialValues={{ [CURRENCY_FIELD.name]: { amount: "", currencyCode: "USD" } }}
        onSubmit={onSubmit}
        onCancel={() => {}}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() =>
      expect(screen.getByRole("spinbutton", { name: AMOUNT_NAME })).toBeInvalid()
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("makes each piece required exactly while the other is populated — the both-or-neither rule", () => {
    // `IsEmpty` short-circuits only when both are missing; anything else reaches
    // `Validate`, which demands both. Expressed natively here because the module's
    // own pre-save guard (assertSelectCustomFieldValuesValid) is wired into the 8
    // hand-wired viewmodels and NOT into generic-crud-view, so on a generic screen
    // this is the only thing standing between a half-blank and a 422.
    render(<GenericForm fields={[CURRENCY_FIELD]} onSubmit={async () => {}} onCancel={() => {}} />);

    const amount = screen.getByRole("spinbutton", { name: AMOUNT_NAME }) as HTMLInputElement;
    const code = screen.getByRole("combobox", { name: CODE_NAME }) as HTMLInputElement;

    // Nothing entered: an untouched optional field is not half-anything.
    expect(amount.required).toBe(false);
    expect(code.required).toBe(false);

    fireEvent.change(amount, { target: { value: "19.99" } });
    expect(screen.getByRole("combobox", { name: CODE_NAME })).toBeRequired();
    expect(screen.getByRole("spinbutton", { name: AMOUNT_NAME })).not.toBeRequired();
  });

  it("offers the supported currencies as suggestions without constraining the value", () => {
    const { container } = render(
      <GenericForm fields={[CURRENCY_FIELD]} onSubmit={async () => {}} onCancel={() => {}} />
    );

    const code = screen.getByRole("combobox", { name: CODE_NAME });
    const listId = code.getAttribute("list");
    expect(listId).toBeTruthy();
    const datalist = container.querySelector(`datalist#${CSS.escape(listId!)}`);
    expect(datalist?.querySelector('option[value="SAR"]')).not.toBeNull();
    expect(datalist?.querySelector('option[value="USD"]')).not.toBeNull();
  });

  it("still accepts a code that is NOT in the suggestion list", () => {
    // The whole reason this is a datalist and not a <select>: the handler accepts
    // any three uppercase letters, including codes no in-repo list carries.
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<GenericForm fields={[CURRENCY_FIELD]} onSubmit={onSubmit} onCancel={() => {}} />);

    const code = screen.getByRole("combobox", { name: CODE_NAME }) as HTMLInputElement;
    fireEvent.change(code, { target: { value: "zzz" } });

    expect(code).toHaveValue("ZZZ");
    expect(code.validity.patternMismatch).toBe(false);
  });

  it("keeps the ISO code LTR and the amount on the page's own direction", () => {
    // A code is a machine token (same treatment as this codebase's other stable
    // keys); an amount is a quantity, and GenericForm's own number branch renders
    // those on `dir={direction}`.
    render(<GenericForm fields={[CURRENCY_FIELD]} onSubmit={async () => {}} onCancel={() => {}} />);

    expect(screen.getByRole("combobox", { name: CODE_NAME })).toHaveAttribute("dir", "ltr");
    expect(screen.getByRole("spinbutton", { name: AMOUNT_NAME })).not.toHaveAttribute("dir", "ltr");
  });

  it("composes the host's hint id ahead of its own pair hint, on BOTH inputs", () => {
    // The describedBy contract on the real path. RED without the composition in
    // either direction: overwriting drops the host's hint, and ignoring
    // `describedBy` drops it too -- either way the operator's own field help stops
    // being announced. Asserted as an ordered id LIST because that is what
    // aria-describedby is, and order is what a screen reader reads.
    render(
      <GenericForm
        fields={[{ ...CURRENCY_FIELD, description: "Ex-VAT, per session." }]}
        onSubmit={async () => {}}
        onCancel={() => {}}
      />
    );

    const hostHintId = `${CURRENCY_FIELD.name}-hint`;
    const pairHintId = `${CURRENCY_FIELD.name}-pair-hint`;
    for (const input of [
      screen.getByRole("spinbutton", { name: AMOUNT_NAME }),
      screen.getByRole("combobox", { name: CODE_NAME }),
    ]) {
      expect(input.getAttribute("aria-describedby")?.split(" ")).toEqual([hostHintId, pairHintId]);
    }
    // Neither id may dangle -- a dangling aria-describedby is worse than none.
    expect(document.getElementById(hostHintId)).toBeInTheDocument();
    expect(document.getElementById(pairHintId)).toBeInTheDocument();
  });

  it("still points at its own pair hint when the host supplies no hint at all", () => {
    // The `.filter(Boolean)` half: an absent host id must not leave an empty
    // token, a leading space, or a reference to nothing in the list.
    render(<GenericForm fields={[CURRENCY_FIELD]} onSubmit={async () => {}} onCancel={() => {}} />);

    expect(
      screen.getByRole("spinbutton", { name: AMOUNT_NAME }).getAttribute("aria-describedby")
    ).toBe(`${CURRENCY_FIELD.name}-pair-hint`);
  });

  it("marks BOTH inputs aria-invalid when the host's verdict says so", () => {
    // `invalid` has to reach both pieces, because `Input`'s error edge is driven by
    // `aria-[invalid=true]:border-nx-danger` -- a verdict parked on the wrapping
    // group would paint nothing at all, and either piece can be the reason.
    //
    // Driven through the bridge directly rather than through a rejected submit:
    // with the real control registered, the amount input's native `required`
    // means the browser refuses the submit before handleSubmit sets `errors` (see
    // the "BLOCKS a required currency whose amount is blank" case above for why
    // that ordering is correct). The host-verdict path is exercised end to end on
    // the no-native-control paths -- core's own
    // generic-form.currencyDuration.test.tsx and .noExtension.test.tsx.
    render(
      <GenericFormCustomFieldControl
        field={CURRENCY_FIELD}
        value={{ amount: "10", currencyCode: "USD" }}
        onChange={vi.fn()}
        invalid
        describedBy="host-error-node"
      />
    );

    for (const input of [
      screen.getByRole("spinbutton", { name: AMOUNT_NAME }),
      screen.getByRole("combobox", { name: CODE_NAME }),
    ]) {
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input.getAttribute("aria-describedby")?.split(" ")[0]).toBe("host-error-node");
    }
  });

  it("goes inert in a read-only form, both pieces at once", () => {
    render(
      <GenericForm
        fields={[CURRENCY_FIELD]}
        initialValues={{ [CURRENCY_FIELD.name]: { amount: 10, currencyCode: "USD" } }}
        onSubmit={async () => {}}
        onCancel={() => {}}
        readOnly
      />
    );

    expect(screen.getByRole("spinbutton", { name: AMOUNT_NAME })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: CODE_NAME })).toBeDisabled();
  });
});

describe("GenericForm + the REAL DurationCustomFieldControl", () => {
  it("draws the minutes control with its unit visible, not a bare text box", () => {
    // RED WITHOUT THE FIX: `<Input type="duration">` is an unknown input type, so
    // every browser and jsdom render it as type=text -- no spinbutton role, no
    // min=0, and no unit anywhere on screen.
    const { container } = render(
      <GenericForm
        fields={[DURATION_FIELD]}
        initialValues={{ [DURATION_FIELD.name]: 90 }}
        onSubmit={async () => {}}
        onCancel={() => {}}
      />
    );

    const input = screen.getByRole("spinbutton", { name: "Session Length" });
    expect(input).toHaveValue(90);
    expect(input).toHaveAttribute("min", "0");
    expect(screen.getByText(UNIT_TEXT)).toBeInTheDocument();
    expect(container.querySelector('input[type="duration"]')).toBeNull();
  });

  it("names the field exactly once — one label, and no 'LabelLabel' accessible name", () => {
    // Duration is the type where a kept host label would have been ANNOUNCED
    // twice, because its accessible name comes from a native <Label htmlFor> and
    // the accname computation concatenates every matching label.
    const { container } = render(
      <GenericForm fields={[DURATION_FIELD]} onSubmit={async () => {}} onCancel={() => {}} />
    );

    expect(container.querySelectorAll(`label[for="${DURATION_FIELD.name}"]`)).toHaveLength(1);
    expect(screen.getByRole("spinbutton", { name: "Session Length" })).toBeInTheDocument();
  });

  it("announces the minutes unit as the input's description, not only as adjacent text", () => {
    // Being visible in DOM order was never the same as being announced with the
    // field. RED without the id/aria-describedby wiring: the unit is on screen but
    // a screen-reader user landing on the input hears no unit at all -- for the one
    // control whose reason to exist is making that unit explicit.
    render(<GenericForm fields={[DURATION_FIELD]} onSubmit={async () => {}} onCancel={() => {}} />);

    const input = screen.getByRole("spinbutton", { name: "Session Length" });
    const unitId = `${DURATION_FIELD.name}-unit`;
    expect(input.getAttribute("aria-describedby")?.split(" ")).toContain(unitId);
    expect(document.getElementById(unitId)).toHaveTextContent(UNIT_TEXT);
    // And the NAME is untouched -- the unit is a description, never folded into it.
    expect(input).toHaveAccessibleName("Session Length");
  });

  it("SAVES a fractional duration — without step='any' the browser refuses the whole form", async () => {
    // 1.5 minutes = 90 seconds is a documented, supported value (ruling R4), and
    // formatCustomFieldValue renders it back as "1.5 minutes" rather than rounding
    // -- so a value the table displays could not be re-entered or re-saved through
    // this form. RED without step="any" is onSubmit never firing: an implicit
    // step=1 makes 1.5 a stepMismatch, and a form containing an invalid control
    // does not fire `submit` at all.
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<GenericForm fields={[DURATION_FIELD]} onSubmit={onSubmit} onCancel={() => {}} />);

    const input = screen.getByRole("spinbutton", { name: "Session Length" }) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "1.5" } });
    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0][DURATION_FIELD.name]).toBe("1.5");
    expect(input.validity.stepMismatch).toBe(false);
  });

  it("still BLOCKS a negative duration, matching the handler's own non-negative rule", async () => {
    // `step="any"` relaxes the step check only. `min={0}` is untouched, and
    // DurationValueTypeHandler.Validate rejects anything below zero.
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<GenericForm fields={[DURATION_FIELD]} onSubmit={onSubmit} onCancel={() => {}} />);

    const input = screen.getByRole("spinbutton", { name: "Session Length" }) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "-5" } });
    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => expect(input.validity.rangeUnderflow).toBe(true));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("SAVES a zero duration — the handler accepts it, so the form must not refuse it", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<GenericForm fields={[DURATION_FIELD]} onSubmit={onSubmit} onCancel={() => {}} />);

    fireEvent.change(screen.getByRole("spinbutton", { name: "Session Length" }), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0][DURATION_FIELD.name]).toBe("0");
  });

  it("submits the typed minutes through the form's own onSubmit", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<GenericForm fields={[DURATION_FIELD]} onSubmit={onSubmit} onCancel={() => {}} />);

    fireEvent.change(screen.getByRole("spinbutton", { name: "Session Length" }), {
      target: { value: "45" },
    });
    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0][DURATION_FIELD.name]).toBe("45");
  });

  it("composes the host's hint id ahead of its own unit description", () => {
    // Order matters and is asserted: the operator's own field help first, then the
    // unit. RED in both directions -- overwriting drops the host's hint, ignoring
    // `describedBy` drops it too.
    render(
      <GenericForm
        fields={[{ ...DURATION_FIELD, description: "Excluding warm-up." }]}
        onSubmit={async () => {}}
        onCancel={() => {}}
      />
    );

    const hostHintId = `${DURATION_FIELD.name}-hint`;
    const unitId = `${DURATION_FIELD.name}-unit`;
    expect(
      screen
        .getByRole("spinbutton", { name: "Session Length" })
        .getAttribute("aria-describedby")
        ?.split(" ")
    ).toEqual([hostHintId, unitId]);
    expect(document.getElementById(hostHintId)).toBeInTheDocument();
    expect(document.getElementById(unitId)).toBeInTheDocument();
  });

  it("BLOCKS a required duration left blank", async () => {
    // As with Currency: with the real control registered the native `required`
    // refuses the submit before handleSubmit runs, so the guard that fires here is
    // the browser's. GenericForm's own scalar arm covers the paths with no native
    // control -- see generic-form.requiredObjectValue.test.tsx.
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <GenericForm
        fields={[{ ...DURATION_FIELD, required: true }]}
        onSubmit={onSubmit}
        onCancel={() => {}}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() =>
      expect(screen.getByRole("spinbutton", { name: "Session Length" })).toBeInvalid()
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("marks the input aria-invalid when the host's verdict says so", () => {
    // Driven through the bridge directly, for the same reason as Currency's own
    // aria-invalid case: a rejected submit cannot reach handleSubmit while the
    // control carries a native `required`.
    render(
      <GenericFormCustomFieldControl
        field={DURATION_FIELD}
        value={90}
        onChange={vi.fn()}
        invalid
        describedBy="host-error-node"
      />
    );

    const input = screen.getByRole("spinbutton", { name: "Session Length" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby")?.split(" ")).toEqual([
      "host-error-node",
      `${DURATION_FIELD.name}-unit`,
    ]);
  });

  it("goes inert in a read-only form", () => {
    render(
      <GenericForm
        fields={[DURATION_FIELD]}
        initialValues={{ [DURATION_FIELD.name]: 90 }}
        onSubmit={async () => {}}
        onCancel={() => {}}
        readOnly
      />
    );

    expect(screen.getByRole("spinbutton", { name: "Session Length" })).toBeDisabled();
  });
});

describe("GenericForm + both real controls, and the reference control, in one form", () => {
  it("draws each extension-drawn type with its own control and exactly one label each", () => {
    // The realistic shape of a generic CRUD screen: several custom fields of
    // different types concatenated into one <GenericForm>. Proves the single
    // dispatch table really does hand each type a different control, rather than
    // the first arm winning.
    const { container } = render(
      <GenericForm
        fields={[CURRENCY_FIELD, DURATION_FIELD]}
        onSubmit={async () => {}}
        onCancel={() => {}}
      />
    );

    expect(screen.getByRole("group", { name: "Price" })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: AMOUNT_NAME })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "Session Length" })).toBeInTheDocument();
    expect(container.querySelectorAll(`label[for="${CURRENCY_FIELD.name}"]`)).toHaveLength(1);
    expect(container.querySelectorAll(`label[for="${DURATION_FIELD.name}"]`)).toHaveLength(1);
  });
});
