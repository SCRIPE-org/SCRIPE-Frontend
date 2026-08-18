// DurationCustomFieldControl -- Wave 3.3 Batch C
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { DurationCustomFieldControl } from "./DurationCustomFieldControl";
import type { FieldConfig } from "@core/ui/forms/generic-form";

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

const SETUP_FIELD: FieldConfig = { name: "cf_setup", type: "duration", label: "Setup Buffer" };

describe("DurationCustomFieldControl", () => {
  // Discriminating accessible-name check: a single real, directly labelable
  // <input type="number"> (role spinbutton per aria-query) with a plain
  // native <label for> association -- no decoy, so getByRole with a real
  // name genuinely proves the field's own name computed, not just that
  // something rendered.
  it("gives the number input a real accessible name via getByRole (verified, not assumed)", () => {
    render(<DurationCustomFieldControl fc={SETUP_FIELD} value="" onChange={vi.fn()} />);
    const input = screen.getByRole("spinbutton", { name: "Setup Buffer" });
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveAttribute("min", "0");
  });

  it("falls back the accessible name to fc.name when fc.label is undefined", () => {
    render(
      <DurationCustomFieldControl fc={{ name: "cf_setup_nolabel", type: "duration" }} value="" onChange={vi.fn()} />
    );
    expect(screen.getByRole("spinbutton", { name: "cf_setup_nolabel" })).toBeInTheDocument();
  });

  // R4/PD-2: storage is bare minutes with the unit deliberately left
  // implicit -- this is the discriminating proof the edit control makes it
  // EXPLICIT, visibly, next to the field (not folded silently into the
  // accessible name only).
  it("renders the localized unit label as visible text beside the input", () => {
    render(<DurationCustomFieldControl fc={SETUP_FIELD} value={90} onChange={vi.fn()} />);
    expect(screen.getByText("customField.duration.unitLabel")).toBeInTheDocument();
  });

  it("reports the raw typed value via onChange", () => {
    const onChange = vi.fn();
    render(<DurationCustomFieldControl fc={SETUP_FIELD} value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole("spinbutton", { name: "Setup Buffer" }), {
      target: { value: "45" },
    });
    expect(onChange).toHaveBeenCalledWith("45");
  });

  it("reflects an existing numeric value into the input", () => {
    render(<DurationCustomFieldControl fc={SETUP_FIELD} value={90} onChange={vi.fn()} />);
    expect(screen.getByRole("spinbutton", { name: "Setup Buffer" })).toHaveValue(90);
  });

  it("disables the input when isViewMode is true", () => {
    render(<DurationCustomFieldControl fc={SETUP_FIELD} value={90} onChange={vi.fn()} isViewMode />);
    expect(screen.getByRole("spinbutton", { name: "Setup Buffer" })).toBeDisabled();
  });
});
