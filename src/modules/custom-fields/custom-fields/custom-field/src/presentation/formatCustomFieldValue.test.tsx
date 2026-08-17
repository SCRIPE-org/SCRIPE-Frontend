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

  it("formats a Date via locale-aware toLocaleDateString", () => {
    const iso = "2026-01-15T00:00:00Z";
    render(<>{formatCustomFieldValue("Date", iso, "en", t)}</>);
    expect(screen.getByText(new Date(iso).toLocaleDateString("en-US"))).toBeInTheDocument();
  });

  it("renders the empty-cell marker for a Date value that doesn't parse", () => {
    render(<>{formatCustomFieldValue("Date", "not-a-date", "en", t)}</>);
    expect(screen.getByText("—")).toBeInTheDocument();
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

  // Completeness exit-gate: every known CustomFieldValueTypeName must be
  // handled by this function without throwing, mirroring
  // valueTypeRegistry.test.ts's own "every type has a complete entry" gate
  // for Task 1's VALUE_TYPE_CATALOG.
  it.each(ALL_VALUE_TYPES)("has a read/format entry for %s", (type) => {
    expect(() => formatCustomFieldValue(type, "1", "en", t)).not.toThrow();
    expect(formatCustomFieldValue(type, "1", "en", t)).not.toBeUndefined();
  });

  it("has exactly 5 known value types to cover", () => {
    expect(ALL_VALUE_TYPES).toHaveLength(5);
  });
});
