// formatCustomFieldValue -- Number/Boolean/Date/Text/Select coverage and
// completeness exit-gate (Wave 2 Step 2.2, Task 5), mirroring Task 1's own
// valueTypeRegistry.test.ts completeness-test style.
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import { formatCustomFieldValue } from "./formatCustomFieldValue";
import { ALL_VALUE_TYPES } from "./valueTypeRegistry";

// Matches renderCustomFieldControl.test.tsx's own `t` stub convention: the
// key itself stands in for the translated string.
const t = (key: string) => key;

describe("formatCustomFieldValue", () => {
  it("formats a Number via locale-aware toLocaleString", () => {
    render(<>{formatCustomFieldValue("Number", 1234.5, "en", t)}</>);
    expect(screen.getByText((1234.5).toLocaleString("en-US"))).toBeInTheDocument();
  });

  it("accepts a stringly-typed Number value the same as a real number", () => {
    render(<>{formatCustomFieldValue("Number", "42", "en", t)}</>);
    expect(screen.getByText((42).toLocaleString("en-US"))).toBeInTheDocument();
  });

  it("renders the empty-cell marker for a Number value that doesn't parse", () => {
    render(<>{formatCustomFieldValue("Number", "not-a-number", "en", t)}</>);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders an info Badge labelled via t('common.yes') for a truthy Boolean value", () => {
    render(<>{formatCustomFieldValue("Boolean", true, "en", t)}</>);
    const badge = screen.getByText("common.yes");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("text-info");
  });

  it("renders a secondary Badge labelled via t('common.no') for a falsy Boolean value", () => {
    render(<>{formatCustomFieldValue("Boolean", false, "en", t)}</>);
    const badge = screen.getByText("common.no");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("text-nx-ink-2");
  });

  // Wave 3.1 Task 6 (backend) made Date a true calendar date: the wire value
  // is now a BARE "yyyy-MM-dd" string (System.Text.Json's built-in DateOnly
  // converter), never a full ISO instant -- these fixtures were updated from
  // the pre-Wave-3.1 `"2026-01-15T00:00:00Z"` shape to match. See the
  // dedicated "day-shift regression pin" describe block below for the actual
  // bug this task fixed in the Date case itself.
  it("formats a Date via locale-aware toLocaleDateString, constructed LOCALLY (never through a UTC instant)", () => {
    render(<>{formatCustomFieldValue("Date", "2026-01-15", "en", t)}</>);
    expect(screen.getByText(new Date(2026, 0, 15).toLocaleDateString("en-US"))).toBeInTheDocument();
  });

  it("renders the empty-cell marker for a Date value that doesn't parse", () => {
    render(<>{formatCustomFieldValue("Date", "not-a-date", "en", t)}</>);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders the empty-cell marker for a full ISO instant -- Date must never accept one", () => {
    // The pre-Wave-3.1 wire shape (a full instant) must now be REJECTED, not
    // silently reinterpreted -- this type's own contract (Task 6/12) is a
    // bare calendar date, never an instant.
    render(<>{formatCustomFieldValue("Date", "2026-01-15T00:00:00Z", "en", t)}</>);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  // ── Day-shift regression pin (Wave 3.1 Task 12) ─────────────────────────
  // THE bug: `new Date("2026-08-18")` parses as UTC MIDNIGHT (ECMA-262
  // 21.4.3.2 -- a date-only ISO string is always UTC), and the pre-fix code
  // then called `toLocaleDateString()`, which renders in the VIEWER's own
  // LOCAL zone. For any viewer west of UTC that instant falls on the
  // PREVIOUS local calendar day, so the pre-fix implementation would print
  // "8/17/2026" for a stored "2026-08-18" -- silently wrong, every time, for
  // every such viewer. These tests set `process.env.TZ` to a real IANA zone
  // (something `vi.setSystemTime` cannot do -- it changes the clock, not the
  // zone) so they would FAIL under the old `new Date(iso).toLocaleDateString()`
  // implementation and only pass against the fix (parse the three components
  // and construct a LOCAL Date, never touching UTC).
  describe("day-shift regression pin (must not shift the calendar day in any timezone)", () => {
    it("does not print the day before for a viewer west of UTC (America/Los_Angeles, UTC-8)", () => {
      const originalTz = process.env.TZ;
      try {
        process.env.TZ = "America/Los_Angeles";
        render(<>{formatCustomFieldValue("Date", "2026-08-18", "en", t)}</>);
        expect(screen.getByText("8/18/2026")).toBeInTheDocument();
        expect(screen.queryByText("8/17/2026")).not.toBeInTheDocument();
      } finally {
        process.env.TZ = originalTz;
      }
    });

    it("does not print the day after for a viewer east of UTC (Pacific/Kiritimati, UTC+14)", () => {
      const originalTz = process.env.TZ;
      try {
        process.env.TZ = "Pacific/Kiritimati";
        render(<>{formatCustomFieldValue("Date", "2026-08-18", "en", t)}</>);
        expect(screen.getByText("8/18/2026")).toBeInTheDocument();
        expect(screen.queryByText("8/19/2026")).not.toBeInTheDocument();
      } finally {
        process.env.TZ = originalTz;
      }
    });

    it("renders the identical calendar day at a UTC-crossing boundary regardless of viewer timezone", () => {
      // A date deliberately chosen with no other significance beyond
      // exercising the same UTC-midnight-parse hazard at a different point
      // in the calendar.
      const originalTz = process.env.TZ;
      try {
        process.env.TZ = "America/Los_Angeles";
        render(<>{formatCustomFieldValue("Date", "2026-01-01", "en", t)}</>);
        expect(screen.getByText("1/1/2026")).toBeInTheDocument();
      } finally {
        process.env.TZ = originalTz;
      }
    });
  });

  it("returns the raw value as a plain string for Text", () => {
    expect(formatCustomFieldValue("Text", "Cairo", "en", t)).toBe("Cairo");
  });

  it("returns the raw value as a plain string for Select (same fallthrough as Text)", () => {
    expect(formatCustomFieldValue("Select", "M", "en", t)).toBe("M");
  });

  it("uses the Arabic-digit locale for Number/Date formatting when language is 'ar'", () => {
    render(<>{formatCustomFieldValue("Number", 1234.5, "ar", t)}</>);
    expect(screen.getByText((1234.5).toLocaleString("ar-EG-u-nu-latn"))).toBeInTheDocument();
  });

  // ── Wave 3.1 Task 10: LongText/MultiSelect/DateTime ─────────────────────

  it("returns the raw value as a plain string for LongText (same fallthrough as Text/Select)", () => {
    expect(formatCustomFieldValue("LongText", "A much longer paragraph of text.", "en", t)).toBe(
      "A much longer paragraph of text."
    );
  });

  it("renders each selected MultiSelect label as its own chip, not a joined string", () => {
    render(<>{formatCustomFieldValue("MultiSelect", ["Red", "Blue"], "en", t)}</>);
    expect(screen.getByText("Red")).toBeInTheDocument();
    expect(screen.getByText("Blue")).toBeInTheDocument();
    // The joined-comma string must never appear as a single text node --
    // that is precisely the ambiguous-with-Text failure mode chips exist to
    // avoid (pre-plan analysis §5.2).
    expect(screen.queryByText("Red,Blue")).not.toBeInTheDocument();
  });

  it("renders the empty-cell marker for a MultiSelect value with zero selections", () => {
    render(<>{formatCustomFieldValue("MultiSelect", [], "en", t)}</>);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("formats a DateTime value with both the instant and its stored zone id", () => {
    const value = { value: "2026-01-15T12:30:00Z", timeZoneId: "UTC" };
    render(<>{formatCustomFieldValue("DateTime", value, "en", t)}</>);
    expect(screen.getByText(/UTC/)).toBeInTheDocument();
  });

  it("renders the empty-cell marker for a DateTime value missing its zone id", () => {
    render(<>{formatCustomFieldValue("DateTime", { value: "2026-01-15T12:30:00Z" }, "en", t)}</>);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders the empty-cell marker for a DateTime value with an unrecognized zone id", () => {
    const value = { value: "2026-01-15T12:30:00Z", timeZoneId: "Not/AZone" };
    render(<>{formatCustomFieldValue("DateTime", value, "en", t)}</>);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  // Completeness exit-gate (Final whole-branch review, I2 fix). The original
  // gate here (`.not.toThrow()` + `.not.toBeUndefined()`) was VACUOUS: this
  // function's own `default: return String(value)` fallthrough always
  // satisfies both assertions for ANY type, handled or not -- the reviewer
  // proved a hypothetical 6th type with NO real case added here still passed
  // the whole suite, 367/367 green. A `default: return String(value)`
  // fallback is fine to KEEP (Text/Select deliberately share it, per this
  // file's own header comment) -- the fix is a gate that can tell "real,
  // type-specific handling" apart from "silently fell through to the
  // generic fallback", not removing the fallback itself.
  //
  // Every member of ALL_VALUE_TYPES (imported from valueTypeRegistry.ts, not
  // a hardcoded literal list -- so a new catalog entry is picked up here for
  // free) must be explicitly classified below as EITHER producing output
  // that is provably distinct from the raw String(value) fallthrough
  // (Number/Boolean/Date -- locale formatting or a Badge element, not a bare
  // stringified value), OR named as one of the two types that deliberately
  // share that fallthrough by design (Text/Select). A type this switch has
  // no case for -- exactly the shape of the reviewer's `__NeverAValueType__`
  // probe (a permanent sentinel that can never collide with a real
  // CustomFieldValueType member, unlike the `Email` literal formerly used
  // here, which is scheduled to become a real type in Wave 3.2) -- throws
  // instead of silently passing, which is what makes this gate actually
  // fail for an unwired 6th type.
  it.each(ALL_VALUE_TYPES)(
    "has explicit, provably-type-specific handling (or a documented deliberate fallthrough) for %s",
    (type) => {
      switch (type) {
        case "Number": {
          const out = formatCustomFieldValue(type, 1234.5, "en", t);
          // String(1234.5) would be the un-grouped "1234.5" -- a real Number
          // branch's toLocaleString output ("1,234.5") is what proves this
          // isn't the generic fallthrough.
          expect(out).not.toBe(String(1234.5));
          expect(out).toBe((1234.5).toLocaleString("en-US"));
          break;
        }
        case "Boolean": {
          // String(true) is the bare string "true" -- a real Boolean branch
          // returns a <Badge> React element, not a string at all.
          const out = formatCustomFieldValue(type, true, "en", t);
          expect(out).not.toBe(String(true));
          expect(React.isValidElement(out)).toBe(true);
          render(<>{out}</>);
          expect(screen.getByText("common.yes")).toBeInTheDocument();
          break;
        }
        case "Date": {
          // Bare "yyyy-MM-dd" -- the true-calendar-date wire shape (Wave 3.1
          // Task 6), never a full instant (see the dedicated "never accepts
          // a full instant" test above).
          const bareDate = "2026-01-15";
          const out = formatCustomFieldValue(type, bareDate, "en", t);
          // String(bareDate) would be the raw string unchanged -- a real
          // Date branch's toLocaleDateString output, constructed LOCALLY
          // from the parsed y/m/d (never through a UTC-anchored
          // `new Date(iso)` -- see this file's day-shift regression pin
          // block), is what proves formatting actually happened.
          expect(out).not.toBe(bareDate);
          expect(out).toBe(new Date(2026, 0, 15).toLocaleDateString("en-US"));
          break;
        }
        case "LongText":
        case "Text":
        case "Select":
          // Documented, deliberate fallthrough (this file's own header
          // comment names both explicitly) -- not a gap to "fix" by adding
          // a redundant branch, just a fact this gate must state on purpose
          // rather than accept by accident.
          expect(formatCustomFieldValue(type, "Cairo", "en", t)).toBe("Cairo");
          break;
        case "MultiSelect": {
          // String(["Red","Blue"]) would be the joined "Red,Blue" -- a real
          // MultiSelect branch renders one Badge element per label, not a
          // string at all.
          const out = formatCustomFieldValue(type, ["Red", "Blue"], "en", t);
          expect(out).not.toBe(String(["Red", "Blue"]));
          expect(React.isValidElement(out)).toBe(true);
          render(<>{out}</>);
          expect(screen.getByText("Red")).toBeInTheDocument();
          expect(screen.getByText("Blue")).toBeInTheDocument();
          break;
        }
        case "DateTime": {
          // String({ value, timeZoneId }) would be the useless
          // "[object Object]" -- a real DateTime branch resolves the
          // instant AND names its zone.
          const raw = { value: "2026-01-15T12:30:00Z", timeZoneId: "UTC" };
          const out = formatCustomFieldValue(type, raw, "en", t);
          expect(out).not.toBe(String(raw));
          expect(String(out)).toContain("UTC");
          break;
        }
        default:
          throw new Error(
            `formatCustomFieldValue completeness gate has no classification for value type ` +
              `"${type}". Add a real format branch in formatCustomFieldValue.tsx (or, if it should ` +
              `deliberately share the generic String(value) fallthrough like Text/Select do, add an ` +
              `explicit case for it above) before this type can be considered wired.`
          );
      }
    }
  );

  it("has exactly 8 known value types to cover", () => {
    expect(ALL_VALUE_TYPES).toHaveLength(8);
  });
});
