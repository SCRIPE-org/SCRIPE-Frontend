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

  // ── Wave 4 follow-up: admitted to <GenericForm> ──────────────────────────
  //
  // Everything below became load-bearing when this control started being drawn
  // by a real <form> (GenericForm's, which carries no noValidate) rather than
  // only by the 8 hand-wired sites, none of which submits natively.

  // These four drive validity through the `value` PROP rather than through a
  // keystroke, and that is required rather than stylistic: the input is
  // controlled, so with `onChange` a no-op spy React immediately resets the DOM
  // value and a `fireEvent.change` assertion would be measuring the empty string.
  // A prop is also the honest shape here — it is how a stored value arrives on an
  // edit form, which is the case that matters.

  it("accepts a fractional value — step='any', because a decimal minute is a real value", () => {
    // Ruling R4: ValueNumber is decimal(18,6) and "1.5 = 90 seconds"; the read
    // formatter deliberately round-trips 1.5 as "1.5 minutes" rather than
    // rounding. An <input type="number"> with no step steps by 1, and the step BASE
    // is `min` when present — which `min={0}` makes it — so the accepted values
    // were 0, 1, 2 ... and 1.5 was a stepMismatch. That is not cosmetic: a form
    // containing an invalid control never fires `submit`. So RED here is a stored
    // value that cannot be re-saved through any generic screen without first being
    // changed to something else.
    render(<DurationCustomFieldControl fc={SETUP_FIELD} value={1.5} onChange={vi.fn()} />);
    const input = screen.getByRole("spinbutton", { name: "Setup Buffer" }) as HTMLInputElement;

    expect(input).toHaveAttribute("step", "any");
    expect(input.validity.stepMismatch).toBe(false);
    expect(input.checkValidity()).toBe(true);
  });

  it("still rejects a negative value — step='any' relaxes the step, never the floor", () => {
    render(<DurationCustomFieldControl fc={SETUP_FIELD} value={-1} onChange={vi.fn()} />);
    const input = screen.getByRole("spinbutton", { name: "Setup Buffer" }) as HTMLInputElement;

    expect(input.validity.rangeUnderflow).toBe(true);
  });

  it("accepts zero — the handler calls a zero-minute duration legitimate", () => {
    render(<DurationCustomFieldControl fc={SETUP_FIELD} value={0} onChange={vi.fn()} />);
    const input = screen.getByRole("spinbutton", { name: "Setup Buffer" }) as HTMLInputElement;

    expect(input).toHaveValue(0);
    expect(input.checkValidity()).toBe(true);
  });

  it("announces the unit as the input's DESCRIPTION, without touching its name", () => {
    // The unit was always visible; visible was never the same as announced with
    // the field. RED without the id/aria-describedby wiring: a screen-reader user
    // landing on the input hears "Setup Buffer, spin button" and no unit at all —
    // for the one control whose whole reason to exist is making the unit explicit.
    //
    // The NAME assertion is the other half: folding the unit into the accessible
    // name would also "announce" it, and would break every
    // getByRole("spinbutton", { name }) gate for this type. Description, not name.
    render(<DurationCustomFieldControl fc={SETUP_FIELD} value={90} onChange={vi.fn()} />);

    const input = screen.getByRole("spinbutton", { name: "Setup Buffer" });
    expect(input.getAttribute("aria-describedby")).toBe("cf_setup-unit");
    expect(document.getElementById("cf_setup-unit")).toHaveTextContent(
      "customField.duration.unitLabel"
    );
    expect(input).toHaveAccessibleName("Setup Buffer");
    expect(input).toHaveAccessibleDescription("customField.duration.unitLabel");
  });

  it("composes a host-supplied describedBy ahead of its own unit id, never replacing it", () => {
    // `aria-describedby` takes an id LIST. RED in both directions: overwriting
    // drops the host form's own hint/error, and ignoring `describedBy` drops it too.
    render(
      <DurationCustomFieldControl
        fc={SETUP_FIELD}
        value={90}
        onChange={vi.fn()}
        describedBy="cf_setup-error"
      />
    );

    expect(
      screen
        .getByRole("spinbutton", { name: "Setup Buffer" })
        .getAttribute("aria-describedby")
        ?.split(" ")
    ).toEqual(["cf_setup-error", "cf_setup-unit"]);
  });

  it("marks the input aria-invalid only when the host says so", () => {
    const { rerender } = render(
      <DurationCustomFieldControl fc={SETUP_FIELD} value={90} onChange={vi.fn()} />
    );
    // Absent rather than "false": the rest of this codebase's controls emit
    // `aria-invalid={invalid || undefined}` so a valid field carries no state at all.
    expect(screen.getByRole("spinbutton", { name: "Setup Buffer" })).not.toHaveAttribute(
      "aria-invalid"
    );

    rerender(
      <DurationCustomFieldControl fc={SETUP_FIELD} value={90} onChange={vi.fn()} invalid />
    );
    expect(screen.getByRole("spinbutton", { name: "Setup Buffer" })).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });
});
