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

/**
 * Currency is the SECOND object-valued type, and the reason
 * `OBJECT_VALUED_FIELD_TYPES` became `OBJECT_VALUED_EMPTINESS_CHECKS`: its
 * envelope is `{ amount, currencyCode }`, which has nothing in common with a
 * reference's `{ entityTypeKey, entityId }`, so a set-plus-one-hardcoded-shape
 * could not serve both.
 *
 * This arm had NEVER RUN for Currency before this change -- not because it was
 * wrong, but because `"currency"` reached neither the render switch nor the
 * `customTypes` required-validation set, so no Currency field was ever validated
 * here at all.
 */
const CURRENCY_FIELD: FieldConfig = {
  name: "price",
  label: "Price",
  type: "currency",
  required: true,
};

/** Duration is extension-drawn but NOT object-valued -- a plain minutes scalar. */
const DURATION_FIELD: FieldConfig = {
  name: "sessionLength",
  label: "Session Length",
  type: "duration",
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

// ── Currency: the second object-valued type ───────────────────────────────────
//
// WHERE THIS RULE COMES FROM, since "empty" is not obvious for a two-piece money
// value and was not invented here. `CurrencyValueTypeHandler` (backend
// CustomFields.Application/ValueTypes) answers two different questions:
//
//   - `IsEmpty` is true only when the amount AND the code are both missing --
//     "nothing to save".
//   - `Validate`, which runs for everything IsEmpty let through, requires BOTH.
//     Its own doc comment is explicit that this split is deliberate: treating a
//     half-blank as empty "would silently skip Validate and let a
//     genuinely-entered (but incomplete ...) amount or code through with no
//     error".
//
// So a required Currency is satisfied only by a value the server will actually
// store, which means both pieces present -- composed from the two, not picked
// from one. Same presence-not-shape scope as the reference rule above: the code's
// alpha-3 grammar is `pattern` on the control plus the server's own
// `currencyCodeInvalid`, never a "this field is required" verdict.
describe("GenericForm required-validation for a Currency field (never ran before this fix)", () => {
  it("blocks submit for a required currency with a blank amount and a real code", async () => {
    // THE named case. A user who typed only the code has entered something, so
    // the pre-existing scalar arm sees a non-null object and waves it through --
    // straight into `currencyAmountExpected`, a 422 the user cannot connect to
    // this field.
    const { onSubmit, submit } = renderWithValue(CURRENCY_FIELD, {
      amount: "",
      currencyCode: "USD",
    });

    fireEvent.click(submit);

    await waitFor(() => {
      expect(screen.getByText("validation.required")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("blocks submit for a required currency with a real amount and no code", async () => {
    // The mirror half. R2's own justification for storing the code at all is that
    // "a stored 100.00 is meaningless without knowing which currency it is in".
    const { onSubmit, submit } = renderWithValue(CURRENCY_FIELD, { amount: "150.75" });

    fireEvent.click(submit);

    await waitFor(() => {
      expect(screen.getByText("validation.required")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("blocks submit for a whitespace-only currency code, matching the backend's IsNullOrWhiteSpace gate", async () => {
    const { onSubmit, submit } = renderWithValue(CURRENCY_FIELD, {
      amount: "150.75",
      currencyCode: "   ",
    });

    fireEvent.click(submit);

    await waitFor(() => {
      expect(screen.getByText("validation.required")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("blocks submit for a required currency that is an empty object", async () => {
    const { onSubmit, submit } = renderWithValue(CURRENCY_FIELD, {});

    fireEvent.click(submit);

    await waitFor(() => {
      expect(screen.getByText("validation.required")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("fails closed for a scalar on a currency field — no bare number is a currency", async () => {
    // `CurrencyValueTypeHandler.Parse` refuses a non-object payload outright
    // ("Currency has no single-scalar wire shape"), so neither can this.
    const { onSubmit, submit } = renderWithValue(CURRENCY_FIELD, "150.75");

    fireEvent.click(submit);

    await waitFor(() => {
      expect(screen.getByText("validation.required")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("accepts a ZERO amount with a code — zero is a value, and truthiness is not the test", async () => {
    // The discriminating case for how "blank" is written. A `!money.amount` check
    // would read exactly right and reject a legitimate 0.00, which the handler
    // enforces no minimum against. RED against a truthiness implementation.
    const { onSubmit, submit } = renderWithValue(CURRENCY_FIELD, {
      amount: 0,
      currencyCode: "USD",
    });

    fireEvent.click(submit);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(screen.queryByText("validation.required")).not.toBeInTheDocument();
  });

  it("accepts a NEGATIVE amount with a code — a credit or refund is a real currency value", async () => {
    // `CurrencyValueTypeHandler.Validate` applies no minimum (unlike Duration's,
    // which rejects negatives), so this must not be refused here either.
    const { onSubmit, submit } = renderWithValue(CURRENCY_FIELD, {
      amount: "-25.50",
      currencyCode: "EUR",
    });

    fireEvent.click(submit);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(screen.queryByText("validation.required")).not.toBeInTheDocument();
  });

  it("submits a COMPLETE currency untouched, and does not rename or coerce either piece", async () => {
    const { onSubmit, submit } = renderWithValue(CURRENCY_FIELD, {
      amount: "150.75",
      currencyCode: "USD",
    });

    fireEvent.click(submit);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({ price: { amount: "150.75", currencyCode: "USD" } });
  });

  it("ignores a non-required currency field entirely, half-blank or not", async () => {
    const { onSubmit, submit } = renderWithValue(
      { ...CURRENCY_FIELD, required: false },
      { amount: "150.75" }
    );

    fireEvent.click(submit);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(screen.queryByText("validation.required")).not.toBeInTheDocument();
  });
});

// ── Duration: extension-drawn, but deliberately NOT object-valued ─────────────
//
// The pre-existing scalar arm is not merely harmless for Duration, it is the
// right rule: `DurationValueTypeHandler.IsEmpty` is `null || whitespace-only
// string`, and its `Validate` accepts zero outright ("a zero-minute
// buffer/duration is a legitimate value") while rejecting negatives. Blank,
// absent and zero are three distinguishable states server-side, and the arm
// already distinguishes them the same way. These tests exist so that stays true.
describe("GenericForm required-validation for a Duration field (scalar arm, unchanged)", () => {
  it("blocks submit for a required duration that is absent", async () => {
    const { onSubmit, submit } = renderWithValue(DURATION_FIELD, undefined);

    fireEvent.click(submit);

    await waitFor(() => {
      expect(screen.getByText("validation.required")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("blocks submit for a required duration cleared back to an empty string", async () => {
    // What the control emits when the operator selects the number and deletes it.
    const { onSubmit, submit } = renderWithValue(DURATION_FIELD, "");

    fireEvent.click(submit);

    await waitFor(() => {
      expect(screen.getByText("validation.required")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it.each([
    ["a numeric zero", 0],
    ["a string zero, which is what the control actually emits", "0"],
  ])("accepts %s — the backend accepts a zero-minute duration", async (_label, value) => {
    // THE discriminating case for Duration, and the reason no `!val` shortcut may
    // ever be introduced into the scalar arm: zero minutes is a legitimate stored
    // value ("no setup buffer"), so refusing it as "required" would make a real
    // value unenterable.
    const { onSubmit, submit } = renderWithValue(DURATION_FIELD, value);

    fireEvent.click(submit);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(screen.queryByText("validation.required")).not.toBeInTheDocument();
  });

  it("accepts a FRACTIONAL duration — ValueNumber is decimal, 1.5 means 90 seconds", async () => {
    const { onSubmit, submit } = renderWithValue(DURATION_FIELD, "1.5");

    fireEvent.click(submit);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({ sessionLength: "1.5" });
  });

  it("waves an object through on a duration field — it is not in the object-valued map", async () => {
    // The no-change case, pinned rather than inferred: Duration must NOT pick up
    // Currency's or the reference's envelope rule just because all three are
    // extension-drawn. The two sets are separate for exactly this reason.
    const { onSubmit, submit } = renderWithValue(DURATION_FIELD, { minutes: 90 });

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
    // The reason "datetime" has no entry in OBJECT_VALUED_EMPTINESS_CHECKS,
    // proven rather
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
