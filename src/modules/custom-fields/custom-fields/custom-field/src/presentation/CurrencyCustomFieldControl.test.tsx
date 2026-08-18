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
  // labelable native <input> elements (type=number -> role spinbutton,
  // type=text -> role textbox per aria-query's own element-role table) with
  // no decoy element the way GenericSelect/Slider have, so getByRole with a
  // real, interpolated name genuinely proves the aria-label reached the DOM
  // -- not assumed, not a getByLabelText association that could resolve to
  // something else.
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
    const codeInput = screen.getByRole("textbox", {
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
      screen.getByRole("textbox", {
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
      screen.getByRole("textbox", {
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
      screen.getByRole("textbox", {
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
      screen.getByRole("textbox", {
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
      screen.getByRole("textbox", {
        name: `customField.currency.codeLabel:${JSON.stringify({ field: "Price" })}`,
      })
    ).toBeDisabled();
  });
});
