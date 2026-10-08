/* eslint-disable @typescript-eslint/no-explicit-any */
// DateTimeCustomFieldControl -- Wave 3.1 Task 12
//
// Mirrors renderCustomFieldControl.test.tsx's own mocking/polyfill
// conventions (settings/i18n mocks, ResizeObserver/scrollIntoView jsdom
// polyfills GenericSelect needs even when a test never opens the zone
// picker's panel).
import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { DateTimeCustomFieldControl } from "./DateTimeCustomFieldControl";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import type { CustomFieldDateTimeValue } from "../../../../../custom-field-value/src/data/models/CustomFieldValueModel";

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

// TimezonePicker.tsx caches Intl.supportedValuesOf("timeZone")'s real
// ~400-entry result at MODULE scope, computed once and reused for every
// render in this file's process. The "Change affordance" test below opens
// that picker for real (this file does not mock TimezonePicker), which asks
// cmdk to mount ~400 CommandItem rows in jsdom -- expensive enough that a
// full `vitest run` under worker-pool CPU contention can push it past its
// 15s timeout (see TimezonePicker.test.tsx, which stubs this for the same
// reason). Stubbing to a small real, multi-region set keeps the same
// Intl.supportedValuesOf code path under test while cutting the DOM cost.
vi.spyOn(Intl, "supportedValuesOf").mockReturnValue([
  "UTC",
  "Africa/Cairo",
  "America/New_York",
  "Asia/Tokyo",
  "Europe/London",
  "Australia/Sydney",
]);

const MEETING_FIELD: FieldConfig = { name: "cf_meeting", type: "datetime", label: "Meeting" };

/**
 * A real, stateful harness -- DateTimeCustomFieldControl is controlled
 * (parent owns `value`), so proving the half-filled-state guard across a
 * clear/re-enter cycle requires actually re-rendering with the updated
 * value, the way a real form's onChange handler would.
 */
function StatefulHarness({
  fc = MEETING_FIELD,
  initial = null,
  onChangeSpy,
}: {
  fc?: FieldConfig;
  initial?: CustomFieldDateTimeValue | null;
  onChangeSpy?: (v: CustomFieldDateTimeValue | null) => void;
}) {
  const [value, setValue] = React.useState<CustomFieldDateTimeValue | null>(initial);
  return (
    <DateTimeCustomFieldControl
      fc={fc}
      value={value}
      onChange={(v) => {
        setValue(v);
        onChangeSpy?.(v);
      }}
    />
  );
}

describe("DateTimeCustomFieldControl", () => {
  // ── Composition: role="group" with a real accessible name (§5.3) ────────
  it("wraps the whole control in a labelled group naming the field", () => {
    render(<StatefulHarness />);
    expect(screen.getByRole("group", { name: "Meeting" })).toBeInTheDocument();
  });

  it("falls back the group's name to fc.name when fc.label is undefined", () => {
    render(<StatefulHarness fc={{ ...MEETING_FIELD, label: undefined }} />);
    expect(screen.getByRole("group", { name: "cf_meeting" })).toBeInTheDocument();
  });

  it("gives the instant picker its own real accessible name, not the generic 'select date' fallback", () => {
    render(<StatefulHarness />);
    // DatePicker's trigger computes its OWN aria-label from `placeholder`;
    // without one it falls back to the generic `common.selectDate` --
    // exactly the defect the pre-plan analysis's §5.4 names for the plain
    // Date branch. This control passes the field's own name instead.
    expect(screen.getByRole("combobox", { name: /^Meeting/ })).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "common.selectDate" })).not.toBeInTheDocument();
  });

  it("reports the instant paired with the browser's zone when first entered", () => {
    const onChangeSpy = vi.fn();
    render(<StatefulHarness onChangeSpy={onChangeSpy} />);
    fireEvent.change(
      screen.getByRole("combobox", { name: /^Meeting/ }).parentElement!.querySelector("input")!,
      {
        target: { value: "2026-08-18T10:30" },
      }
    );
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    const emitted = onChangeSpy.mock.calls[0][0] as CustomFieldDateTimeValue;
    expect(emitted.value).toBe("2026-08-18T10:30");
    expect(typeof emitted.timeZoneId).toBe("string");
    expect(emitted.timeZoneId.length).toBeGreaterThan(0);
  });

  // ── The zone is a disclosure, not a question (§5.3) ─────────────────────
  it("shows nothing about a zone before any instant has been entered", () => {
    render(<StatefulHarness />);
    expect(screen.queryByText(/zoneDisclosure/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "customField.dateTime.changeTimezone" })
    ).not.toBeInTheDocument();
  });

  it("always renders the resolved zone once an instant exists", () => {
    render(<StatefulHarness initial={{ value: "2026-08-18T10:30", timeZoneId: "Africa/Cairo" }} />);
    expect(
      screen.getByText(
        `customField.dateTime.zoneDisclosure:${JSON.stringify({ zone: "Africa/Cairo" })}`
      )
    ).toBeInTheDocument();
  });

  it("opens a searchable timezone picker via the Change affordance, and swaps the zone in place", () => {
    const onChangeSpy = vi.fn();
    render(
      <StatefulHarness
        initial={{ value: "2026-08-18T10:30", timeZoneId: "Africa/Cairo" }}
        onChangeSpy={onChangeSpy}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "customField.dateTime.changeTimezone" }));

    const zonePicker = screen.getByRole("combobox", {
      name: `customField.dateTime.timezonePickerLabel:${JSON.stringify({ field: "Meeting" })}`,
    });
    fireEvent.click(zonePicker);
    fireEvent.click(screen.getByRole("option", { name: "America/New_York" }));

    expect(onChangeSpy).toHaveBeenCalledWith({
      value: "2026-08-18T10:30",
      timeZoneId: "America/New_York",
    });
    // Swapping the zone must NEVER touch the instant. `toHaveValue` targets a
    // real form element, not the visible `role="combobox"` div -- grab the
    // hidden native input the same way the other tests in this file do.
    const instantInput = screen
      .getByRole("combobox", { name: /^Meeting/ })
      .parentElement!.querySelector("input")!;
    expect(instantInput).toHaveValue("2026-08-18T10:30");
  });

  it("returns to the compact disclosure view after Cancel, without changing the zone", () => {
    render(<StatefulHarness initial={{ value: "2026-08-18T10:30", timeZoneId: "Africa/Cairo" }} />);
    fireEvent.click(screen.getByRole("button", { name: "customField.dateTime.changeTimezone" }));
    expect(
      screen.getByRole("combobox", {
        name: `customField.dateTime.timezonePickerLabel:${JSON.stringify({ field: "Meeting" })}`,
      })
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "customField.dateTime.cancelTimezoneChange" })
    );
    expect(
      screen.getByText(
        `customField.dateTime.zoneDisclosure:${JSON.stringify({ zone: "Africa/Cairo" })}`
      )
    ).toBeInTheDocument();
  });

  // ── The half-filled-state guard, the DateTime-specific "one real bug" ───
  describe("the half-filled-state guard (ruling R7: zone is required once any instant is submitted)", () => {
    it("clears the WHOLE value to null when the instant is cleared, never a zone-only remnant", () => {
      const onChangeSpy = vi.fn();
      render(
        <StatefulHarness
          initial={{ value: "2026-08-18T10:30", timeZoneId: "Africa/Cairo" }}
          onChangeSpy={onChangeSpy}
        />
      );
      const instantInput = screen
        .getByRole("combobox", { name: /^Meeting/ })
        .parentElement!.querySelector("input")!;
      fireEvent.change(instantInput, { target: { value: "" } });
      expect(onChangeSpy).toHaveBeenCalledWith(null);
      // And the zone disclosure disappears along with it -- there is no
      // lingering zone-only UI state once the value is fully cleared.
      expect(screen.queryByText(/zoneDisclosure/)).not.toBeInTheDocument();
    });

    it("preserves the existing zone when only the instant changes", () => {
      const onChangeSpy = vi.fn();
      render(
        <StatefulHarness
          initial={{ value: "2026-08-18T10:30", timeZoneId: "Africa/Cairo" }}
          onChangeSpy={onChangeSpy}
        />
      );
      const instantInput = screen
        .getByRole("combobox", { name: /^Meeting/ })
        .parentElement!.querySelector("input")!;
      fireEvent.change(instantInput, { target: { value: "2026-08-19T09:00" } });
      expect(onChangeSpy).toHaveBeenCalledWith({
        value: "2026-08-19T09:00",
        timeZoneId: "Africa/Cairo",
      });
    });

    it("renders no 'clear' affordance on the timezone picker itself while an instant exists", () => {
      render(
        <StatefulHarness initial={{ value: "2026-08-18T10:30", timeZoneId: "Africa/Cairo" }} />
      );
      fireEvent.click(screen.getByRole("button", { name: "customField.dateTime.changeTimezone" }));
      const zonePicker = screen.getByRole("combobox", {
        name: `customField.dateTime.timezonePickerLabel:${JSON.stringify({ field: "Meeting" })}`,
      });
      // TimezonePicker sets allowClear={false} for exactly this reason (see
      // that file's own header comment) -- there must be no "x" button that
      // could blank the zone while the instant is still present. The clear
      // button, when GenericSelect renders one at all, lives INSIDE the
      // role="combobox" element itself (select-trigger.tsx), not beside it.
      expect(within(zonePicker).queryByRole("button")).not.toBeInTheDocument();
    });
  });

  it("disables the instant picker when isViewMode is true", () => {
    render(
      <DateTimeCustomFieldControl
        fc={MEETING_FIELD}
        value={{ value: "2026-08-18T10:30", timeZoneId: "Africa/Cairo" }}
        onChange={vi.fn()}
        isViewMode
      />
    );
    expect(screen.getByRole("combobox", { name: /^Meeting/ })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    // No "Change" affordance while read-only.
    expect(
      screen.queryByRole("button", { name: "customField.dateTime.changeTimezone" })
    ).not.toBeInTheDocument();
  });
});
