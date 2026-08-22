// CurrencyCustomFieldControl -- Wave 3.3 Batch C
//
// Mirrors DateTimeCustomFieldControl.test.tsx's own mocking convention: a
// params-aware `t` stub (`key:JSON.stringify(params)` when params are given,
// bare key otherwise) so this file can assert REAL interpolated accessible
// names, not just the bare key renderCustomFieldControl.test.tsx's blunter
// mock would produce.
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { CurrencyCustomFieldControl } from "./CurrencyCustomFieldControl";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import type { CustomFieldCurrencyValue } from "../../../custom-field-value/src/data/models/CustomFieldValueModel";

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({ switchStyle: "default", fontSize: "default", inputStyle: "default" }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
    language: "en",
    direction: "ltr",
  }),
}));

const PRICE_FIELD: FieldConfig = { name: "cf_price", type: "currency", label: "Price" };

describe("CurrencyCustomFieldControl", () => {
  it("wraps both sub-inputs in a labelled group named after the field", () => {
    render(<CurrencyCustomFieldControl fc={PRICE_FIELD} value={null} onChange={vi.fn()} />);
    expect(screen.getByRole("group", { name: "Price" })).toBeInTheDocument();
  });

  // Discriminating accessible-name check: both sub-inputs are real, directly
  // labelable native <input> elements with no decoy element the way
  // GenericSelect/Slider have, so getByRole with a real, interpolated name
  // genuinely proves the aria-label reached the DOM -- not assumed, not a
  // getByLabelText association that could resolve to something else.
  //
  // ROLES, and why the code input's changed: type=number maps to `spinbutton`,
  // and a bare type=text maps to `textbox` -- but per HTML-AAM (and aria-query's
  // own element-role table, which is what getByRole consults here) an
  // `<input type="text" list="...">` maps to `combobox` instead. The code input
  // gained a `list` when the SUPPORTED_CURRENCIES datalist was added, so
  // `combobox` is what it now genuinely computes and what a screen reader now
  // genuinely announces. These queries were retargeted to the real role rather
  // than loosened -- each still asserts the same interpolated accessible name,
  // and the datalist wiring itself is pinned by its own tests below.
  it("gives the amount input its own real, field-named accessible name", () => {
    render(
      <CurrencyCustomFieldControl fc={PRICE_FIELD} value={null} onChange={vi.fn()} />
    );
    const amountInput = screen.getByRole("spinbutton", {
      name: `customField.currency.amountLabel:${JSON.stringify({ field: "Price" })}`,
    });
    expect(amountInput).toHaveAttribute("type", "number");
  });

  it("gives the currency-code input its own, distinct real accessible name", () => {
    render(
      <CurrencyCustomFieldControl fc={PRICE_FIELD} value={null} onChange={vi.fn()} />
    );
    const codeInput = screen.getByRole("combobox", {
      name: `customField.currency.codeLabel:${JSON.stringify({ field: "Price" })}`,
    });
    expect(codeInput).toHaveAttribute("maxlength", "3");
  });

  it("falls back the group name to fc.name when fc.label is undefined", () => {
    render(
      <CurrencyCustomFieldControl fc={{ name: "cf_price_nolabel", type: "currency" }} value={null} onChange={vi.fn()} />
    );
    expect(screen.getByRole("group", { name: "cf_price_nolabel" })).toBeInTheDocument();
  });

  it("reflects an existing { amount, currencyCode } value into both inputs", () => {
    render(
      <CurrencyCustomFieldControl
        fc={PRICE_FIELD}
        value={{ amount: 150, currencyCode: "USD" } satisfies CustomFieldCurrencyValue}
        onChange={vi.fn()}
      />
    );
    expect(
      screen.getByRole("spinbutton", {
        name: `customField.currency.amountLabel:${JSON.stringify({ field: "Price" })}`,
      })
    ).toHaveValue(150);
    expect(
      screen.getByRole("combobox", {
        name: `customField.currency.codeLabel:${JSON.stringify({ field: "Price" })}`,
      })
    ).toHaveValue("USD");
  });

  it("emits { amount, currencyCode } with the new amount when the amount input changes", () => {
    const onChange = vi.fn();
    render(
      <CurrencyCustomFieldControl
        fc={PRICE_FIELD}
        value={{ amount: "50", currencyCode: "USD" }}
        onChange={onChange}
      />
    );
    fireEvent.change(
      screen.getByRole("spinbutton", {
        name: `customField.currency.amountLabel:${JSON.stringify({ field: "Price" })}`,
      }),
      { target: { value: "100" } }
    );
    expect(onChange).toHaveBeenCalledWith({ amount: "100", currencyCode: "USD" });
  });

  // THE half-blank prevention the batch brief asked for at the control
  // level, structurally: typing a code with no prior amount composes a
  // half-blank object (allowed to EXIST mid-entry -- see the control's own
  // header comment), not silently dropped or coerced to something else.
  it("emits a half-blank { amount, currencyCode } object as the user types just one piece", () => {
    const onChange = vi.fn();
    render(<CurrencyCustomFieldControl fc={PRICE_FIELD} value={null} onChange={onChange} />);
    fireEvent.change(
      screen.getByRole("combobox", {
        name: `customField.currency.codeLabel:${JSON.stringify({ field: "Price" })}`,
      }),
      { target: { value: "usd" } }
    );
    expect(onChange).toHaveBeenCalledWith({ amount: "", currencyCode: "USD" });
  });

  // Backend's IsValidCurrencyCode is deliberately non-normalizing (a
  // lowercase/padded submission is REJECTED, not coerced) -- this control
  // transforms the DISPLAYED value itself to the only shape the backend
  // accepts, so what the user sees and what gets submitted never diverge.
  it("uppercases and strips non-letters from the currency code as the user types", () => {
    const onChange = vi.fn();
    render(
      <CurrencyCustomFieldControl
        fc={PRICE_FIELD}
        value={{ amount: "5", currencyCode: "" }}
        onChange={onChange}
      />
    );
    fireEvent.change(
      screen.getByRole("combobox", {
        name: `customField.currency.codeLabel:${JSON.stringify({ field: "Price" })}`,
      }),
      { target: { value: "u5d!" } }
    );
    expect(onChange).toHaveBeenCalledWith({ amount: "5", currencyCode: "UD" });
  });

  it("clamps the currency code to 3 characters even if more are typed", () => {
    const onChange = vi.fn();
    render(
      <CurrencyCustomFieldControl
        fc={PRICE_FIELD}
        value={{ amount: "5", currencyCode: "" }}
        onChange={onChange}
      />
    );
    fireEvent.change(
      screen.getByRole("combobox", {
        name: `customField.currency.codeLabel:${JSON.stringify({ field: "Price" })}`,
      }),
      { target: { value: "usdollar" } }
    );
    expect(onChange).toHaveBeenCalledWith({ amount: "5", currencyCode: "USD" });
  });

  // Mirrors DateTime's own "clearing the instant clears the WHOLE value to
  // null, never a zone-only remnant" rule, for Currency's own pair.
  it("clears to null when the only populated piece is blanked out", () => {
    const onChange = vi.fn();
    render(
      <CurrencyCustomFieldControl
        fc={PRICE_FIELD}
        value={{ amount: "50", currencyCode: "" }}
        onChange={onChange}
      />
    );
    fireEvent.change(
      screen.getByRole("spinbutton", {
        name: `customField.currency.amountLabel:${JSON.stringify({ field: "Price" })}`,
      }),
      { target: { value: "" } }
    );
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("does not clear to null while the OTHER piece is still populated", () => {
    const onChange = vi.fn();
    render(
      <CurrencyCustomFieldControl
        fc={PRICE_FIELD}
        value={{ amount: "50", currencyCode: "USD" }}
        onChange={onChange}
      />
    );
    fireEvent.change(
      screen.getByRole("spinbutton", {
        name: `customField.currency.amountLabel:${JSON.stringify({ field: "Price" })}`,
      }),
      { target: { value: "" } }
    );
    expect(onChange).toHaveBeenCalledWith({ amount: "", currencyCode: "USD" });
  });

  it("renders the always-visible pairing hint", () => {
    render(<CurrencyCustomFieldControl fc={PRICE_FIELD} value={null} onChange={vi.fn()} />);
    expect(screen.getByText("customField.currency.pairHint")).toBeInTheDocument();
  });

  it("disables both inputs when isViewMode is true", () => {
    render(
      <CurrencyCustomFieldControl
        fc={PRICE_FIELD}
        value={{ amount: "50", currencyCode: "USD" }}
        onChange={vi.fn()}
        isViewMode
      />
    );
    expect(
      screen.getByRole("spinbutton", {
        name: `customField.currency.amountLabel:${JSON.stringify({ field: "Price" })}`,
      })
    ).toBeDisabled();
    expect(
      screen.getByRole("combobox", {
        name: `customField.currency.codeLabel:${JSON.stringify({ field: "Price" })}`,
      })
    ).toBeDisabled();
  });
});

// ── Wave 4 follow-up: admitted to <GenericForm> ────────────────────────────────
//
// Everything below became load-bearing when this control started being drawn by a
// real <form> (GenericForm's, which carries no noValidate) rather than only by the
// 8 hand-wired sites, none of which submits natively. In that setting a native
// validity failure does not merely style the field — it stops the form firing
// `submit` at all.
describe("CurrencyCustomFieldControl — native validity mirrors the backend handler", () => {
  const amountOf = () =>
    screen.getByRole("spinbutton", {
      name: `customField.currency.amountLabel:${JSON.stringify({ field: "Price" })}`,
    }) as HTMLInputElement;
  const codeOf = () =>
    screen.getByRole("combobox", {
      name: `customField.currency.codeLabel:${JSON.stringify({ field: "Price" })}`,
    }) as HTMLInputElement;

  // The validity cases below drive the inputs through the `value` PROP rather than
  // through keystrokes, and that is required rather than stylistic: both inputs
  // are controlled, so with `onChange` a no-op spy React immediately resets the
  // DOM value and a `fireEvent.change` assertion would be measuring the empty
  // string instead of the value under test. A prop is also the honest shape — it
  // is how a stored value arrives on an edit form.

  it("declares step='any' and accepts an amount with cents", () => {
    // ValueNumber is decimal(18,6) and the handler applies no rounding, so "any"
    // is the honest step. What removing it breaks is THIS attribute assertion, not
    // the validity ones below, and the comment says so rather than overclaiming:
    // the step base is `min` if present, else the `value` content attribute, and
    // this input has no `min` while React keeps a controlled input's `value`
    // attribute in sync — so 19.99 was never a stepMismatch here. It IS one in
    // DurationCustomFieldControl, whose `min={0}` pins the base at 0. The
    // declaration stays because it is correct and because the first `min` added to
    // a price field would otherwise break every amount with cents at once.
    render(
      <CurrencyCustomFieldControl
        fc={PRICE_FIELD}
        value={{ amount: "19.99", currencyCode: "USD" }}
        onChange={vi.fn()}
      />
    );
    const amount = amountOf();

    expect(amount).toHaveAttribute("step", "any");
    expect(amount.validity.stepMismatch).toBe(false);
    expect(amount.checkValidity()).toBe(true);
  });

  it("puts no floor on the amount — a credit or refund is a real currency value", () => {
    // Unlike Duration, CurrencyValueTypeHandler.Validate enforces no minimum. A
    // `min={0}` copied across from Duration would make negatives unenterable.
    render(
      <CurrencyCustomFieldControl
        fc={PRICE_FIELD}
        value={{ amount: "-25.5", currencyCode: "EUR" }}
        onChange={vi.fn()}
      />
    );
    const amount = amountOf();

    expect(amount).not.toHaveAttribute("min");
    expect(amount.validity.rangeUnderflow).toBe(false);
    expect(amount.checkValidity()).toBe(true);
  });

  it("refuses a code stopped at one or two letters — IsValidCurrencyCode's exact grammar", () => {
    // The keystroke filter already guarantees uppercase A-Z only, so the ONE shape
    // it cannot catch is a short code — which is exactly the state a user passes
    // through on the way to a complete one, and the state an interrupted entry is
    // left in. RED without the pattern: "US" is reported valid here and comes back
    // a `currencyCodeInvalid` 422 instead.
    const { rerender } = render(
      <CurrencyCustomFieldControl
        fc={PRICE_FIELD}
        value={{ amount: "10", currencyCode: "US" }}
        onChange={vi.fn()}
      />
    );
    expect(codeOf()).toHaveAttribute("pattern", "[A-Z]{3}");
    expect(codeOf().validity.patternMismatch).toBe(true);

    rerender(
      <CurrencyCustomFieldControl
        fc={PRICE_FIELD}
        value={{ amount: "10", currencyCode: "USD" }}
        onChange={vi.fn()}
      />
    );
    expect(codeOf().validity.patternMismatch).toBe(false);
  });

  it("accepts a shape-valid code no registry lists — the pattern is a grammar, not a list", () => {
    // R2's own ruling: no authoritative ISO 4217 list exists in this repo, so a
    // shape-valid-but-unassigned code is accepted server-side. The client must
    // agree.
    render(
      <CurrencyCustomFieldControl
        fc={PRICE_FIELD}
        value={{ amount: "10", currencyCode: "ZZZ" }}
        onChange={vi.fn()}
      />
    );
    expect(codeOf().validity.patternMismatch).toBe(false);
    expect(codeOf().checkValidity()).toBe(true);
  });

  it("requires neither piece while both are blank", () => {
    // An untouched optional field is not half-anything: IsEmpty short-circuits on
    // both-missing, so nothing is owed yet.
    render(<CurrencyCustomFieldControl fc={PRICE_FIELD} value={null} onChange={vi.fn()} />);
    expect(amountOf()).not.toBeRequired();
    expect(codeOf()).not.toBeRequired();
  });

  it("requires the code once an amount exists, and the amount once a code exists", () => {
    // The both-or-neither rule made native. RED without it: a half-blank Currency
    // submits and 422s — and on a generic CRUD screen nothing else catches it,
    // because assertSelectCustomFieldValuesValid is wired into the 8 hand-wired
    // viewmodels, not into generic-crud-view.
    const { rerender } = render(
      <CurrencyCustomFieldControl
        fc={PRICE_FIELD}
        value={{ amount: "10", currencyCode: "" }}
        onChange={vi.fn()}
      />
    );
    expect(codeOf()).toBeRequired();
    expect(amountOf()).not.toBeRequired();

    rerender(
      <CurrencyCustomFieldControl
        fc={PRICE_FIELD}
        value={{ amount: "", currencyCode: "USD" }}
        onChange={vi.fn()}
      />
    );
    expect(amountOf()).toBeRequired();
    expect(codeOf()).not.toBeRequired();
  });

  it("does not treat a ZERO amount as blank when deciding what the code owes", () => {
    // The discriminating case for how "populated" is written: a truthiness check
    // would read right and quietly stop requiring a code for a legitimate 0.00.
    render(
      <CurrencyCustomFieldControl
        fc={PRICE_FIELD}
        value={{ amount: 0, currencyCode: "" }}
        onChange={vi.fn()}
      />
    );
    expect(codeOf()).toBeRequired();
  });

  it("requires BOTH pieces from the start when the definition itself is required", () => {
    render(
      <CurrencyCustomFieldControl
        fc={{ ...PRICE_FIELD, required: true }}
        value={null}
        onChange={vi.fn()}
      />
    );
    expect(amountOf()).toBeRequired();
    expect(codeOf()).toBeRequired();
  });
});

describe("CurrencyCustomFieldControl — code suggestions and direction", () => {
  const codeOf = () =>
    screen.getByRole("combobox", {
      name: `customField.currency.codeLabel:${JSON.stringify({ field: "Price" })}`,
    }) as HTMLInputElement;

  it("offers the product's supported currencies through a datalist the input points at", () => {
    const { container } = render(
      <CurrencyCustomFieldControl fc={PRICE_FIELD} value={null} onChange={vi.fn()} />
    );

    const listId = codeOf().getAttribute("list");
    expect(listId).toBe("cf_price-currency-suggestions");
    const datalist = container.querySelector(`datalist#${CSS.escape(listId!)}`);
    // Spot-checked against SUPPORTED_CURRENCIES rather than asserting a full list,
    // so adding a currency there does not break this test for no reason.
    expect(datalist?.querySelector('option[value="USD"]')).not.toBeNull();
    expect(datalist?.querySelector('option[value="SAR"]')).not.toBeNull();
    // Every option carries a human name, because a datalist option has nowhere
    // else to put one.
    expect(datalist?.querySelector('option[value="SAR"]')?.getAttribute("label")).toBeTruthy();
  });

  it("suggests without constraining — the value stays free text", () => {
    // The whole reason this is a datalist rather than a <select> of the 15
    // supported codes: the handler accepts any shape-valid code, including ones no
    // in-repo list carries, and an options-only control would remove valid input.
    const onChange = vi.fn();
    render(<CurrencyCustomFieldControl fc={PRICE_FIELD} value={null} onChange={onChange} />);

    fireEvent.change(codeOf(), { target: { value: "zzz" } });
    expect(onChange).toHaveBeenCalledWith({ amount: "", currencyCode: "ZZZ" });
  });

  it("keeps the ISO code LTR — it is a machine token, like this codebase's other keys", () => {
    render(<CurrencyCustomFieldControl fc={PRICE_FIELD} value={null} onChange={vi.fn()} />);
    expect(codeOf()).toHaveAttribute("dir", "ltr");
    // Nothing to autofill in a three-letter code, and nothing to spell-check.
    expect(codeOf()).toHaveAttribute("autocomplete", "off");
    expect(codeOf()).toHaveAttribute("spellcheck", "false");
  });

  it("leaves the AMOUNT on the page's own direction — a quantity is not a machine token", () => {
    // Deliberate asymmetry, matching GenericForm's own `dir={direction}` number
    // branch. Pinned so a later "make it consistent" pass has to argue with a test.
    render(<CurrencyCustomFieldControl fc={PRICE_FIELD} value={null} onChange={vi.fn()} />);
    expect(
      screen.getByRole("spinbutton", {
        name: `customField.currency.amountLabel:${JSON.stringify({ field: "Price" })}`,
      })
    ).not.toHaveAttribute("dir");
  });
});

describe("CurrencyCustomFieldControl — host-owned a11y facts", () => {
  const bothInputs = () => [
    screen.getByRole("spinbutton", {
      name: `customField.currency.amountLabel:${JSON.stringify({ field: "Price" })}`,
    }),
    screen.getByRole("combobox", {
      name: `customField.currency.codeLabel:${JSON.stringify({ field: "Price" })}`,
    }),
  ];

  it("points both inputs at the pair hint, and gives that hint a real id", () => {
    // The hint was always rendered; it was never REFERENCED, so it was advice a
    // screen-reader user only met by browsing past the field.
    render(<CurrencyCustomFieldControl fc={PRICE_FIELD} value={null} onChange={vi.fn()} />);

    for (const input of bothInputs()) {
      expect(input.getAttribute("aria-describedby")).toBe("cf_price-pair-hint");
    }
    expect(document.getElementById("cf_price-pair-hint")).toHaveTextContent(
      "customField.currency.pairHint"
    );
  });

  it("composes a host-supplied describedBy ahead of the pair hint, never replacing it", () => {
    render(
      <CurrencyCustomFieldControl
        fc={PRICE_FIELD}
        value={null}
        onChange={vi.fn()}
        describedBy="cf_price-error"
      />
    );

    for (const input of bothInputs()) {
      expect(input.getAttribute("aria-describedby")?.split(" ")).toEqual([
        "cf_price-error",
        "cf_price-pair-hint",
      ]);
    }
  });

  it("marks BOTH inputs aria-invalid when the host says so, and neither when it does not", () => {
    // Both, not the wrapping group: Input's error edge is driven by
    // `aria-[invalid=true]:border-nx-danger`, so a verdict on the group would paint
    // nothing — and either piece can be the reason the field was rejected.
    const { rerender } = render(
      <CurrencyCustomFieldControl fc={PRICE_FIELD} value={null} onChange={vi.fn()} />
    );
    for (const input of bothInputs()) {
      expect(input).not.toHaveAttribute("aria-invalid");
    }

    rerender(
      <CurrencyCustomFieldControl fc={PRICE_FIELD} value={null} onChange={vi.fn()} invalid />
    );
    for (const input of bothInputs()) {
      expect(input).toHaveAttribute("aria-invalid", "true");
    }
  });
});
