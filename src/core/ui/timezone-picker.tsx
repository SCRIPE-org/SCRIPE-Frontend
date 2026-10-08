"use client";

import * as React from "react";
import { GenericSelect } from "@core/crud/components/generic-select";

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

const offsetCache = new Map<string, string>();

function getZoneOffset(zone: string): string {
  if (offsetCache.has(zone)) return offsetCache.get(zone)!;
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(new Date());
    const offset = parts.find((p) => p.type === "timeZoneName")?.value || "";
    offsetCache.set(zone, offset);
    return offset;
  } catch {
    offsetCache.set(zone, "");
    return "";
  }
}

function optionsFor(currentValue: string): { value: string; label: string }[] {
  const zones = allSupportedTimeZones();
  const withCurrent =
    currentValue && !zones.includes(currentValue) ? [currentValue, ...zones] : zones;

  return withCurrent.map((zone) => {
    const offset = getZoneOffset(zone);
    return {
      value: zone,
      label: offset ? `${zone} (${offset})` : zone,
    };
  });
}

export interface TimezonePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  "aria-label"?: string;
  describedBy?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function TimezonePicker({
  id,
  value,
  onChange,
  "aria-label": ariaLabel = "Time zone",
  describedBy,
  disabled,
  placeholder = "Select time zone...",
  className,
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
      searchPlaceholder="Search time zone or city..."
      disabled={disabled}
      className={className}
    />
  );
}
