// TimezonePicker -- Wave 3.1 Task 12
//
// Mirrors renderCustomFieldControl.test.tsx's own GenericSelect jsdom
// polyfill conventions (ResizeObserver/scrollIntoView), since this picker is
// a thin wrapper around the same GenericSelect/Popover/cmdk stack.
import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { TimezonePicker } from "./TimezonePicker";

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({ switchStyle: "default", fontSize: "default", inputStyle: "default" }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "en",
    direction: "ltr",
  }),
}));

if (typeof (globalThis as any).ResizeObserver === "undefined") {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
}

describe("TimezonePicker", () => {
  it("computes a real accessible name via aria-label", () => {
    render(
      <TimezonePicker id="tz" value="UTC" onChange={vi.fn()} aria-label="Timezone for Meeting" />
    );
    expect(screen.getByRole("combobox", { name: "Timezone for Meeting" })).toBeInTheDocument();
  });

  it(
    "lists real IANA zone ids, drawn from the runtime's own Intl.supportedValuesOf",
    () => {
      render(<TimezonePicker id="tz" value="UTC" onChange={vi.fn()} aria-label="Timezone" />);
      const trigger = screen.getByRole("combobox", { name: "Timezone" });
      fireEvent.click(trigger);
      // A handful of real ids, from different regions, must all be present --
      // proving this is the runtime's full supported set, not a short
      // hand-rolled sample.
      expect(screen.getByRole("option", { name: "Africa/Cairo" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "America/New_York" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Asia/Tokyo" })).toBeInTheDocument();
    },
    30_000
  );

  it("reports the picked zone id via onChange", () => {
    const onChange = vi.fn();
    render(<TimezonePicker id="tz" value="UTC" onChange={onChange} aria-label="Timezone" />);
    fireEvent.click(screen.getByRole("combobox", { name: "Timezone" }));
    fireEvent.click(screen.getByRole("option", { name: "Africa/Cairo" }));
    expect(onChange).toHaveBeenCalledWith("Africa/Cairo");
  });

  // ── The half-filled-state guard: no way to clear the zone to "" ─────────
  it("renders no clear ('x') affordance -- a zone can only be replaced, never blanked", () => {
    render(<TimezonePicker id="tz" value="Africa/Cairo" onChange={vi.fn()} aria-label="Timezone" />);
    const trigger = screen.getByRole("combobox", { name: "Timezone" });
    // GenericSelect defaults `allowClear` to true, which would otherwise
    // render an "x" button once a value is selected -- TimezonePicker must
    // override that, or a user could blank the zone while a DateTime
    // value's instant is still present, composing exactly the half-filled
    // `{ value, timeZoneId: "" }` state the backend rejects with a 422.
    expect(within(trigger).queryByRole("button")).not.toBeInTheDocument();
  });

  it("keeps an already-selected, runtime-unenumerated zone visible in its own option list", () => {
    // A defensive case: if the current value somehow isn't independently
    // enumerated by the runtime's own supported-zones list, it must still
    // show up as an option (never silently vanish from the list the moment
    // the picker opens).
    render(
      <TimezonePicker
        id="tz"
        value="Not/ARealZoneButAlreadyStored"
        onChange={vi.fn()}
        aria-label="Timezone"
      />
    );
    fireEvent.click(screen.getByRole("combobox", { name: "Timezone" }));
    // NOT queried by accessible name: this option is also the CURRENTLY
    // SELECTED one (`value` above), and a selected row's accessible name
    // concatenates the sr-only "selected" text directly against the label
    // with no separator (`select-option-row.tsx`'s own documented, pre-
    // existing quirk -- MultiSelectCustomFieldControl.test.tsx hits the same
    // thing and queries the same way). cmdk's own `data-value`
    // (`${label} ${value}`) identifies the row unambiguously instead.
    const option = screen
      .getAllByRole("option")
      .find(
        (el) =>
          el.getAttribute("data-value") ===
          "Not/ARealZoneButAlreadyStored Not/ARealZoneButAlreadyStored"
      );
    expect(option).toBeInTheDocument();
  });

  it("disables the picker when disabled is true", () => {
    render(
      <TimezonePicker id="tz" value="UTC" onChange={vi.fn()} aria-label="Timezone" disabled />
    );
    expect(screen.getByRole("combobox", { name: "Timezone" })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });
});
