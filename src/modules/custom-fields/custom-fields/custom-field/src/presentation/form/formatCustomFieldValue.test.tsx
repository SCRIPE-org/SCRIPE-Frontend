// formatCustomFieldValue -- Number/Boolean/Date/Text/Select coverage and
// completeness exit-gate (Wave 2 Step 2.2, Task 5), mirroring Task 1's own
// valueTypeRegistry.test.ts completeness-test style.
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import { formatCustomFieldValue } from "./formatCustomFieldValue";
import { ALL_VALUE_TYPES, VALUE_TYPE_CATALOG } from "../registries/valueTypeRegistry";

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

  // ── Wave 3.2 Batch 3: Email/Url/Phone/Percent/Rating ────────────────────

  it("renders Email as a real mailto: link, not plain text", () => {
    render(<>{formatCustomFieldValue("Email", "a@b.com", "en", t)}</>);
    const link = screen.getByText("a@b.com");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "mailto:a@b.com");
  });

  it("renders the empty-cell marker for an empty Email value", () => {
    render(<>{formatCustomFieldValue("Email", "", "en", t)}</>);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  // R4 -- the module's first live <a href>. target=_blank + noopener noreferrer
  // is mandatory (opening a tab that can reach back via window.opener is the
  // exact hazard rel="noopener noreferrer" exists to close).
  it("renders an http(s) Url as a real anchor with target=_blank and rel=noopener noreferrer", () => {
    render(<>{formatCustomFieldValue("Url", "https://example.com", "en", t)}</>);
    const link = screen.getByText("https://example.com");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders a plain http Url as a real clickable anchor too (R4: http is legitimate, not just https)", () => {
    render(<>{formatCustomFieldValue("Url", "http://companysite.com", "en", t)}</>);
    const link = screen.getByText("http://companysite.com");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "http://companysite.com");
  });

  // Defence-in-depth against a HISTORICAL row written before UrlValueTypeHandler's
  // write-time scheme allowlist existed (trap #5 / R4). Every one of these must
  // render as inert plain text -- present (not hidden), but never wired to
  // href, so the browser can never navigate/execute it.
  it.each([
    "javascript:alert(1)",
    "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
  ])("renders a dangerous-scheme Url value (%s) as inert plain text, never a clickable anchor", (dangerous) => {
    render(<>{formatCustomFieldValue("Url", dangerous, "en", t)}</>);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText(dangerous)).toBeInTheDocument();
  });

  it("renders an unparsable Url value as inert plain text rather than throwing", () => {
    expect(() => render(<>{formatCustomFieldValue("Url", "not a url", "en", t)}</>)).not.toThrow();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders the empty-cell marker for an empty Url value", () => {
    render(<>{formatCustomFieldValue("Url", "", "en", t)}</>);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("formats a stored E.164 Phone value in international format, not the raw stored string", () => {
    render(<>{formatCustomFieldValue("Phone", "+201234567890", "en", t)}</>);
    // Proves real formatting happened (spacing/grouping), not a bare
    // passthrough of the stored E.164 string.
    expect(screen.queryByText("+201234567890")).not.toBeInTheDocument();
    expect(screen.getByText(/^\+20/)).toBeInTheDocument();
  });

  it("falls back to the raw stored string for a Phone value that doesn't parse, rather than throwing", () => {
    expect(() =>
      render(<>{formatCustomFieldValue("Phone", "not-a-number", "en", t)}</>)
    ).not.toThrow();
    expect(screen.getByText("not-a-number")).toBeInTheDocument();
  });

  it("renders the empty-cell marker for an empty Phone value", () => {
    render(<>{formatCustomFieldValue("Phone", "", "en", t)}</>);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  // ── R5: THE Percent formatting trap ─────────────────────────────────────
  // Intl.NumberFormat(locale, { style: "percent" }) expects a 0-1 FRACTION
  // and multiplies by 100 -- PercentValueTypeHandler stores 0-100 (PD-2), so
  // naively feeding a stored 25 into that API would render "2500%". This is
  // the test that pins the fix: a stored 25 must display as "25%", and must
  // NEVER display as "2500%".
  it("displays a stored Percent value of 25 as '25%', never '2500%' (R5 pin)", () => {
    const out = formatCustomFieldValue("Percent", 25, "en", t);
    expect(out).toBe("25%");
    expect(out).not.toBe("2500%");
  });

  it("preserves fractional Percent precision (33.5 displays as '33.5%', decimals are allowed)", () => {
    expect(formatCustomFieldValue("Percent", 33.5, "en", t)).toBe("33.5%");
  });

  it("displays a Percent value of 100 as '100%'", () => {
    expect(formatCustomFieldValue("Percent", 100, "en", t)).toBe("100%");
  });

  it("displays a Percent value of 0 as '0%'", () => {
    expect(formatCustomFieldValue("Percent", 0, "en", t)).toBe("0%");
  });

  it("accepts a stringly-typed Percent value the same as a real number", () => {
    expect(formatCustomFieldValue("Percent", "25", "en", t)).toBe("25%");
  });

  it("renders the empty-cell marker for a Percent value that doesn't parse", () => {
    render(<>{formatCustomFieldValue("Percent", "not-a-number", "en", t)}</>);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("formats Rating as 'N / 5', matching the write control's own ceiling", () => {
    expect(formatCustomFieldValue("Rating", 3, "en", t)).toBe("3 / 5");
  });

  it("renders the empty-cell marker for a Rating value that doesn't parse", () => {
    render(<>{formatCustomFieldValue("Rating", "not-a-number", "en", t)}</>);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  // ── Wave 3.3 Batch C: Currency/Duration/Time/Color ──────────────────────

  it("formats a Currency value as a real currency-formatted string (code display, not symbol)", () => {
    // Intl.NumberFormat's currency style separates the code from the amount
    // with a NO-BREAK SPACE (U+00A0), not an ASCII space --   here is
    // deliberate, not a typo.
    expect(formatCustomFieldValue("Currency", { amount: 1234.5, currencyCode: "USD" }, "en", t)).toBe(
      "USD 1,234.50"
    );
  });

  it("degrades a Currency value with a malformed stored code to a plain concatenation, never throwing", () => {
    // "12A" is not a well-formed 3-letter alphabetic code -- Intl.NumberFormat
    // throws a RangeError for it. A historical/corrupt row must still render
    // legibly, not crash the cell.
    expect(() =>
      formatCustomFieldValue("Currency", { amount: 25, currencyCode: "12A" }, "en", t)
    ).not.toThrow();
    expect(formatCustomFieldValue("Currency", { amount: 25, currencyCode: "12A" }, "en", t)).toBe(
      "12A 25"
    );
  });

  it("renders the empty-cell marker for a Currency value missing its amount", () => {
    render(<>{formatCustomFieldValue("Currency", { currencyCode: "USD" }, "en", t)}</>);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders the empty-cell marker for a Currency value missing its currency code", () => {
    render(<>{formatCustomFieldValue("Currency", { amount: 25 }, "en", t)}</>);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders the empty-cell marker for a null Currency value", () => {
    render(<>{formatCustomFieldValue("Currency", null, "en", t)}</>);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  // R4: storage is bare minutes -- the read side must state the unit
  // explicitly, never a bare number (PD-2's own Percent-motivated rule).
  it("formats a Duration value with its explicit minutes unit, not a bare number", () => {
    expect(formatCustomFieldValue("Duration", 90, "en", t)).toBe(
      "90 customField.duration.unitLabel"
    );
  });

  it("preserves fractional Duration precision (1.5 minutes = 90 seconds, per R4)", () => {
    expect(formatCustomFieldValue("Duration", 1.5, "en", t)).toBe(
      "1.5 customField.duration.unitLabel"
    );
  });

  it("renders the empty-cell marker for a Duration value that doesn't parse", () => {
    render(<>{formatCustomFieldValue("Duration", "not-a-number", "en", t)}</>);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("formats a canonical HH:mm:ss Time value via locale-aware time formatting", () => {
    expect(formatCustomFieldValue("Time", "09:05:30", "en", t)).toBe("9:05:30 AM");
  });

  it("formats an afternoon Time value correctly (24h stored, 12h displayed)", () => {
    expect(formatCustomFieldValue("Time", "14:30:00", "en", t)).toBe("2:30:00 PM");
  });

  it("renders the empty-cell marker for a Time value that isn't canonical HH:mm:ss", () => {
    render(<>{formatCustomFieldValue("Time", "9:5:0", "en", t)}</>);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders the empty-cell marker for an out-of-range Time value", () => {
    render(<>{formatCustomFieldValue("Time", "25:00:00", "en", t)}</>);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders a Color value with its stored lowercase hex text", () => {
    render(<>{formatCustomFieldValue("Color", "#3b82f6", "en", t)}</>);
    expect(screen.getByText("#3b82f6")).toBeInTheDocument();
  });

  it("accepts the 3-digit hex shorthand for Color, unexpanded (R5: shorthand is not unified with full form)", () => {
    render(<>{formatCustomFieldValue("Color", "#abc", "en", t)}</>);
    expect(screen.getByText("#abc")).toBeInTheDocument();
  });

  it("renders the empty-cell marker for an empty Color value", () => {
    render(<>{formatCustomFieldValue("Color", "", "en", t)}</>);
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
        // ── Wave 3.2 Batch 3 ────────────────────────────────────────────
        case "Email": {
          // String("a@b.com") would be the bare string -- a real Email
          // branch renders a mailto: anchor element, not a string at all.
          const out = formatCustomFieldValue(type, "a@b.com", "en", t);
          expect(React.isValidElement(out)).toBe(true);
          render(<>{out}</>);
          const link = screen.getByText("a@b.com");
          expect(link.tagName).toBe("A");
          expect(link).toHaveAttribute("href", "mailto:a@b.com");
          break;
        }
        case "Url": {
          // A real Url branch renders a live, target=_blank anchor for a
          // safe scheme -- not a bare string.
          const out = formatCustomFieldValue(type, "https://example.com", "en", t);
          expect(React.isValidElement(out)).toBe(true);
          render(<>{out}</>);
          const link = screen.getByText("https://example.com");
          expect(link.tagName).toBe("A");
          expect(link).toHaveAttribute("target", "_blank");
          break;
        }
        case "Phone": {
          // String("+201234567890") would be the bare E.164 string -- a real
          // Phone branch reformats it into international spacing, provably
          // different from the raw stored value.
          const out = formatCustomFieldValue(type, "+201234567890", "en", t);
          expect(out).not.toBe("+201234567890");
          break;
        }
        case "Percent": {
          // THE R5 trap, restated at the completeness-gate level: a real
          // Percent branch must render "25%", never "2500%"
          // (Intl.NumberFormat's percent style would produce the latter if
          // fed the stored 0-100 number directly).
          const out = formatCustomFieldValue(type, 25, "en", t);
          expect(out).toBe("25%");
          expect(out).not.toBe("2500%");
          break;
        }
        case "Rating": {
          // String(3) would be the bare "3" -- a real Rating branch names
          // the ceiling too ("3 / 5"), provably distinct from the raw value.
          const out = formatCustomFieldValue(type, 3, "en", t);
          expect(out).not.toBe("3");
          expect(out).toBe("3 / 5");
          break;
        }
        // ── Wave 3.3 Batch C ────────────────────────────────────────────
        case "Currency": {
          // String({amount,currencyCode}) would be "[object Object]" -- a
          // real Currency branch renders a locale-formatted currency string.
          const raw = { amount: 1234.5, currencyCode: "USD" };
          const out = formatCustomFieldValue(type, raw, "en", t);
          expect(out).not.toBe(String(raw));
          expect(out).toBe("USD 1,234.50");
          break;
        }
        case "Duration": {
          // String(90) would be the bare "90" -- a real Duration branch
          // states the unit explicitly (R4/PD-2), provably distinct.
          const out = formatCustomFieldValue(type, 90, "en", t);
          expect(out).not.toBe("90");
          expect(out).toContain("90");
          expect(out).toContain("customField.duration.unitLabel");
          break;
        }
        case "Time": {
          // String("09:05:30") would be the raw stored text unchanged -- a
          // real Time branch reformats it via locale-aware time formatting.
          const out = formatCustomFieldValue(type, "09:05:30", "en", t);
          expect(out).not.toBe("09:05:30");
          expect(out).toBe("9:05:30 AM");
          break;
        }
        case "Color": {
          // A real Color branch renders a React element (swatch + text), not
          // a bare string -- provably distinct from String(value).
          const out = formatCustomFieldValue(type, "#3b82f6", "en", t);
          expect(React.isValidElement(out)).toBe(true);
          render(<>{out}</>);
          expect(screen.getByText("#3b82f6")).toBeInTheDocument();
          break;
        }
        case "EntityReference":
        case "UserReference": {
          // Wave 4. Two things are provably true of a real reference branch,
          // and both are the point of it:
          //
          //  1. It is NOT the String(value) fallthrough. That fallthrough
          //     would render the literal "[object Object]" for a two-piece
          //     reference envelope.
          //  2. The ENCRYPTED ID IS NOWHERE IN THE OUTPUT. This is the
          //     assertion that matters: the id is another module's primary
          //     key, opaque to every reader, and rendering it into a table
          //     cell leaks it into screenshots, exports and support tickets
          //     while telling nobody anything. The name it would stand in for
          //     is not stored (by design) and cannot be resolved
          //     synchronously, so the branch renders what IS known -- the
          //     value type's own label plus the target TABLE's key -- and
          //     never the row's id.
          const out = formatCustomFieldValue(
            type,
            { entityTypeKey: "hrms.staff-member", entityId: "ENC-must-not-be-rendered" },
            "en",
            t
          );
          expect(out).not.toBe(String({ entityTypeKey: "x", entityId: "y" }));
          expect(React.isValidElement(out)).toBe(true);
          const { container } = render(<>{out}</>);
          expect(container.textContent).not.toContain("ENC-must-not-be-rendered");
          // And not blank either: a filled reference must never look like a
          // field that was never filled in.
          expect(container.textContent?.trim()).not.toBe("");
          expect(screen.getByText("hrms.staff-member")).toBeInTheDocument();
          expect(
            screen.getByText(VALUE_TYPE_CATALOG[type].labelKey)
          ).toBeInTheDocument();
          break;
        }
        // ── Wave 3.4 ────────────────────────────────────────────────────
        case "File":
        case "Image": {
          // Mechanically the reference case above, and the two assertions that
          // matter are the same two:
          //
          //  1. NOT the String(value) fallthrough, which would print
          //     "[object Object]" for the two-piece envelope.
          //  2. THE ENCRYPTED ID IS NOWHERE IN THE OUTPUT. It is the media row's
          //     primary key; a table cell puts it in every screenshot and export
          //     while telling nobody anything, and there is no name to show
          //     instead -- no lookup provider is registered for `media.file`, so
          //     nothing could resolve one even asynchronously.
          //
          // Plus one fact specific to these two: File and Image render DIFFERENT
          // labels, which is the only thing distinguishing them in a table. A
          // shared arm returning one label for both would satisfy every other
          // assertion here, so the label is checked against each type's OWN
          // catalog entry.
          const out = formatCustomFieldValue(
            type,
            { entityTypeKey: "media.file", entityId: "ENC-must-not-be-rendered" },
            "en",
            t
          );
          expect(out).not.toBe(String({ entityTypeKey: "x", entityId: "y" }));
          expect(React.isValidElement(out)).toBe(true);
          const { container } = render(<>{out}</>);
          expect(container.textContent).not.toContain("ENC-must-not-be-rendered");
          // And not blank either: a filled field must never look like an empty one.
          expect(container.textContent?.trim()).not.toBe("");
          expect(screen.getByText("media.file")).toBeInTheDocument();
          expect(screen.getByText(VALUE_TYPE_CATALOG[type].labelKey)).toBeInTheDocument();
          break;
        }
        case "RichText": {
          // A real RichText branch strips the markup to plain text. Three
          // assertions, each ruling out a different wrong implementation:
          //   - `not.toBe(String(raw))` rules out the generic fallthrough, which
          //     would print "[object Object]" for the envelope.
          //   - the tag text being absent rules out printing `value.html`
          //     verbatim, which would put raw `<p>` markup in the cell.
          //   - the prose being present rules out rendering nothing, and rules
          //     out an implementation that dropped the text along with the tags.
          const raw = { html: "<p>Pressing <strong>drill</strong></p>" };
          const out = formatCustomFieldValue(type, raw, "en", t);
          expect(out).not.toBe(String(raw));
          expect(String(out)).not.toContain("<p>");
          expect(String(out)).not.toContain("<strong>");
          expect(String(out)).toContain("Pressing");
          expect(String(out)).toContain("drill");
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

  // Wave 3.4 raises this from 19 to 22 (File = 19, Image = 20, RichText = 21 on
  // the backend enum). Kept as a literal on purpose: this is the ONE
  // deliberate count-to-maintain in the module -- every other test derives its
  // expectation from ALL_VALUE_TYPES.length, so without this pin a new catalog
  // entry could be added with no branch anywhere and every derived assertion
  // would happily iterate over it. Editing this number is the moment someone
  // has to confirm the new type is actually wired.
  it("has exactly 22 known value types to cover", () => {
    expect(ALL_VALUE_TYPES).toHaveLength(22);
  });
});

// EntityReference / UserReference read-side rendering -- Wave 4.
//
// This is the one case in the switch that CANNOT show the thing a reader
// actually wants (the target's name): names are never stored, by design, and
// resolving one is async and permission-checked. So these tests pin the three
// properties of the compromise, each of which is a decision someone could
// reasonably undo by accident:
//   - the encrypted id never appears (it is opaque and it is a primary key)
//   - a filled reference never renders blank (blank means "never filled in")
//   - a value that is not reference-shaped degrades like every other
//     type-specific parse failure in this switch, not like a filled reference
describe("formatCustomFieldValue -- EntityReference / UserReference", () => {
  const REFERENCE = { entityTypeKey: "hrms.staff-member", entityId: "ENC-do-not-render-me" };

  it.each(["EntityReference", "UserReference"] as const)(
    "never renders the encrypted id for %s",
    (type) => {
      const { container } = render(<>{formatCustomFieldValue(type, REFERENCE, "en", t)}</>);
      expect(container.textContent).not.toContain("ENC-do-not-render-me");
    }
  );

  it.each(["EntityReference", "UserReference"] as const)(
    "never renders blank for a filled %s -- blank is what an unfilled field looks like",
    (type) => {
      const { container } = render(<>{formatCustomFieldValue(type, REFERENCE, "en", t)}</>);
      expect(container.textContent?.trim()).not.toBe("");
      // Specifically not the empty-cell marker either: the value IS there.
      expect(container.textContent).not.toBe("—");
    }
  );

  it("labels the cell with the value type's own catalog label, so the two reference types read differently", () => {
    render(<>{formatCustomFieldValue("EntityReference", REFERENCE, "en", t)}</>);
    expect(screen.getByText("customField.valueTypes.entityReference")).toBeInTheDocument();
    expect(
      screen.queryByText("customField.valueTypes.userReference")
    ).not.toBeInTheDocument();
  });

  it("shows the target entity-type key, which names a TABLE and reveals nothing about the row", () => {
    render(<>{formatCustomFieldValue("UserReference", { ...REFERENCE, entityTypeKey: "identity.user" }, "en", t)}</>);
    expect(screen.getByText("identity.user")).toBeInTheDocument();
  });

  it("renders the empty-cell marker for a value that is not reference-shaped at all", () => {
    // Matches Date/Time/Currency/MultiSelect's own per-type parse-failure
    // posture. Distinct from the blank case above: this is corrupt or
    // out-of-band data, not a valid reference whose name is unavailable.
    render(<>{formatCustomFieldValue("EntityReference", "just-a-string", "en", t)}</>);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders the empty-cell marker for a reference with no target type key", () => {
    // A key with no id names a table but no row, and an id with no key cannot
    // be dispatched to a module at all -- Project() already returns null
    // rather than a half-reference, so reaching here means data corruption.
    render(<>{formatCustomFieldValue("EntityReference", { entityTypeKey: "", entityId: "ENC-1" }, "en", t)}</>);
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});

// RichText read-side rendering -- Wave 3.4.
//
// The read side of a rich-text value has one hard rule and one easy trap. The
// rule: a table cell gets PLAIN TEXT, never markup and never
// `dangerouslySetInnerHTML`. The trap: it is tempting to reach for a DOM parser,
// which would handle entities and malformed markup properly -- and this is a
// "use client" module that Next.js still PRE-RENDERS on the server, where
// `DOMParser` does not exist. A presence guard around it would make the same
// stored value produce two different cell texts depending on which side rendered
// it, so the implementation is a deterministic regex strip and these tests pin
// its limits explicitly rather than leaving them to be discovered.
describe("formatCustomFieldValue -- RichText (Wave 3.4)", () => {
  const t = (key: string, params?: Record<string, string | number>) =>
    params ? `${key}:${JSON.stringify(params)}` : key;

  it("renders plain text, with no angle brackets left anywhere in the output", () => {
    const out = formatCustomFieldValue(
      "RichText",
      { html: "<h2>Session</h2><p>Two-footed <em>tackle</em> drill</p>" },
      "en",
      t
    );
    const { container } = render(<>{out}</>);
    expect(container.textContent).toContain("Session");
    expect(container.textContent).toContain("Two-footed");
    expect(container.textContent).toContain("tackle");
    // The discriminating assertion: no markup survived. `container.innerHTML`
    // rather than textContent, so an implementation that injected the HTML as
    // real elements fails here too -- textContent alone would look identical.
    expect(container.innerHTML).not.toContain("<h2>");
    expect(container.innerHTML).not.toContain("<em>");
    expect(container.innerHTML).not.toContain("&lt;h2&gt;");
  });

  it("does not inject the stored markup as real DOM, even though the value is trusted", () => {
    // The value IS trusted -- the server sanitized it through an allowlist before
    // storing it and returns exactly what it stored. This is not an XSS test. It
    // is a layout and coupling test: block markup inside a fixed-height cell
    // breaks the row rhythm of every other column, and injecting HTML would make
    // this cell's safety depend on a sanitizer running on the other side of the
    // wire. An anchor is used because it is the most conspicuous thing the
    // allowlist DOES permit.
    const { container } = render(
      <>
        {formatCustomFieldValue(
          "RichText",
          { html: '<p>See <a href="https://example.com">the policy</a></p>' },
          "en",
          t
        )}
      </>
    );
    expect(container.querySelector("a")).toBeNull();
    expect(container.textContent).toContain("the policy");
  });

  it("separates block boundaries with a space, so two paragraphs do not read as one word", () => {
    // Without this, `<p>One</p><p>Two</p>` renders "OneTwo", which looks like
    // corrupt data rather than two paragraphs.
    const { container } = render(
      <>{formatCustomFieldValue("RichText", { html: "<p>One</p><p>Two</p>" }, "en", t)}</>
    );
    expect(container.textContent).toBe("One Two");
  });

  it("collapses whitespace instead of preserving the markup's own indentation", () => {
    const { container } = render(
      <>
        {formatCustomFieldValue(
          "RichText",
          { html: "<ul>\n  <li>First</li>\n  <li>Second</li>\n</ul>" },
          "en",
          t
        )}
      </>
    );
    expect(container.textContent).toBe("First Second");
  });

  it("decodes the entities the backend allowlist can emit", () => {
    const { container } = render(
      <>
        {formatCustomFieldValue(
          "RichText",
          { html: "<p>Under-13s &amp; Under-15s &nbsp;&quot;A&quot; squad</p>" },
          "en",
          t
        )}
      </>
    );
    expect(container.textContent).toBe('Under-13s & Under-15s "A" squad');
  });

  it("does not DOUBLE-decode, so escaped text stays escaped text", () => {
    // `&amp;lt;` is the stored form of the literal characters `&lt;`. Decoding
    // `&amp;` before `&lt;` would turn it into `<`, i.e. turn text the author
    // deliberately escaped back into something that reads as markup. The ordering
    // in `htmlToPlainText` is what prevents it, and this is the assertion that
    // catches a reordering.
    const { container } = render(
      <>{formatCustomFieldValue("RichText", { html: "<p>&amp;lt;p&amp;gt;</p>" }, "en", t)}</>
    );
    expect(container.textContent).toBe("&lt;p&gt;");
  });

  it("renders the empty-cell marker for markup that reduces to nothing", () => {
    // Reachable for a real stored value: `<p></p>` is markup the server accepts
    // and stores, because deciding whether markup renders to nothing means
    // parsing it -- which `IsEmpty` declines to do on every field of every save.
    // So the read side is the first place that question gets asked, and a blank
    // cell with no marker would be indistinguishable from a broken formatter.
    const { container } = render(
      <>{formatCustomFieldValue("RichText", { html: "<p></p>" }, "en", t)}</>
    );
    expect(container.textContent?.trim()).not.toBe("");
  });

  it("renders the empty-cell marker for a BARE STRING, which is not a rich-text value", () => {
    // A bare string is the shape the write path refuses, so its presence in
    // stored data means out-of-band or stale data. Rendering it would make a cell
    // that looks fine over a value no save can ever accept.
    const { container } = render(
      <>{formatCustomFieldValue("RichText", "<p>bare</p>", "en", t)}</>
    );
    expect(container.textContent).not.toContain("bare");
  });
});
