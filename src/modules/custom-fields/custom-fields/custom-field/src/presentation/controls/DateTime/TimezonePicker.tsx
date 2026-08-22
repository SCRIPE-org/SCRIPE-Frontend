"use client";

/**
 * A searchable IANA timezone picker -- Wave 3.1 Task 12.
 *
 * The governing pre-plan analysis's §5.3 states this plainly: "The only
 * timezone selector in the product is a hardcoded 12-entry list local to the
 * message composer... not exported, not reusable... There is no user
 * timezone preference." DateTime is the first CustomFields control that
 * needs one, and the ruling is explicit: **design a real picker rather than
 * exposing a raw IANA identifier string in a text box.**
 *
 * **Candidate list: the runtime's OWN recognized zones, not a hand-rolled
 * one.** `Intl.supportedValuesOf("timeZone")` (Baseline 2023 -- Chrome 99+,
 * Firefox 93+, Safari 15.4+, and this repo's own Node 26 dev/test runtime)
 * returns the ~400 real IANA ids the engine's ICU data actually recognizes --
 * the same authority `core/utils/timezone.ts`'s `isValidTimeZoneId` already
 * trusts via `Intl.DateTimeFormat`. This mirrors that file's own technique
 * (trust `Intl`, never re-implement the tz database) rather than
 * hand-maintaining a second list that could drift from what the runtime
 * (and the backend's `TimeZoneContext.Create`) actually accepts. Memoized at
 * module scope: the set never changes within a session, and computing it
 * again per render/mount would be wasted work for a ~400-entry array.
 *
 * A runtime that predates `Intl.supportedValuesOf` (older Safari, some
 * embedded webviews) falls back to a small, real, curated list -- degrading
 * to "still usable for the common cases" rather than throwing or rendering
 * an empty, unusable picker.
 *
 * **Searchable, not a flat `<select>`.** §5.1's own GOV.UK citation ("The
 * select component should only be used as a last resort") disqualifies a
 * flat list at ~400 entries -- `GenericSelect type="searchable"` with the
 * default `searchType="client"` is the right shape: cmdk's own client-side
 * filter over an inline option list, no server round-trip needed for a
 * static, session-long-lived set.
 *
 * **`allowClear` is explicitly OFF.** `GenericSelect` defaults `allowClear`
 * to `true` for a single-select (confirmed by reading `generic-select.tsx`
 * directly), which renders an "x" clear button once a value is selected.
 * Left at its default here, that button would let a user clear the timezone
 * back to `""` while a DateTime value's instant is still present -- exactly
 * the half-filled `{ value: <instant>, timeZoneId: "" }` state
 * `DateTimeCustomFieldControl` (and the backend's own `IsEmpty`/`Validate`
 * split, Task 7) must never let a user compose. A timezone picker can only
 * ever REPLACE the current zone with another real one, never blank it.
 */
import * as React from "react";
import { GenericSelect } from "@core/crud/components/generic-select";

/**
 * A short, real fallback list (not exhaustive) for a runtime without
 * `Intl.supportedValuesOf` -- enough common zones to keep the picker usable,
 * not a substitute tz database.
 */
const FALLBACK_TIME_ZONES: readonly string[] = [
  "UTC",
  "Africa/Cairo",
  "Africa/Casablanca",
  "Africa/Johannesburg",
  "Africa/Lagos",
  "America/Chicago",
  "America/Los_Angeles",
  "America/New_York",
  "America/Sao_Paulo",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Riyadh",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Europe/Berlin",
  "Europe/London",
  "Europe/Moscow",
  "Europe/Paris",
  "Pacific/Auckland",
];

let cachedZones: readonly string[] | null = null;

function allSupportedTimeZones(): readonly string[] {
  if (!cachedZones) {
    cachedZones =
      typeof Intl.supportedValuesOf === "function"
        ? Intl.supportedValuesOf("timeZone")
        : FALLBACK_TIME_ZONES;
  }
  return cachedZones;
}

/**
 * The candidate list for one render: the runtime's full set, plus the
 * currently-selected value if (rarely) the runtime doesn't independently
 * enumerate it -- an already-valid stored zone must stay selectable/visible
 * when the picker opens, never silently disappear from its own option list.
 */
function optionsFor(currentValue: string): { value: string; label: string }[] {
  const zones = allSupportedTimeZones();
  const withCurrent = currentValue && !zones.includes(currentValue) ? [currentValue, ...zones] : zones;
  return withCurrent.map((zone) => ({ value: zone, label: zone }));
}

export interface TimezonePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  "aria-label": string;
  describedBy?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function TimezonePicker({
  id,
  value,
  onChange,
  "aria-label": ariaLabel,
  describedBy,
  disabled,
  placeholder,
}: TimezonePickerProps): React.ReactElement {
  const options = React.useMemo(() => optionsFor(value), [value]);

  return (
    <GenericSelect
      id={id}
      aria-label={ariaLabel}
      describedBy={describedBy}
      type="searchable"
      searchType="client"
      allowClear={false}
      options={options}
      value={value}
      onValueChange={(v: string | string[]) => onChange(Array.isArray(v) ? (v[0] ?? value) : v)}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}
