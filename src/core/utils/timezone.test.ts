import { describe, it, expect } from "vitest";
import {
  isValidTimeZoneId,
  formatInTimeZone,
  getBrowserLocalTimeZoneId,
  InvalidTimeZoneError,
} from "./timezone";

describe("isValidTimeZoneId", () => {
  it("accepts recognized IANA ids", () => {
    expect(isValidTimeZoneId("America/New_York")).toBe(true);
    expect(isValidTimeZoneId("UTC")).toBe(true);
    expect(isValidTimeZoneId("Africa/Cairo")).toBe(true);
  });

  it("rejects unknown, empty, or missing ids", () => {
    expect(isValidTimeZoneId("Not/A_Real_Zone")).toBe(false);
    expect(isValidTimeZoneId("")).toBe(false);
    expect(isValidTimeZoneId(undefined)).toBe(false);
    expect(isValidTimeZoneId(null)).toBe(false);
  });
});

describe("formatInTimeZone", () => {
  const instant = "2026-07-15T18:30:00.000Z";

  it("throws InvalidTimeZoneError for an unrecognized timezone id", () => {
    expect(() => formatInTimeZone(instant, "Not/A_Real_Zone")).toThrow(InvalidTimeZoneError);
  });

  it("renders the same UTC instant differently across two distinct timezones", () => {
    const inTokyo = formatInTimeZone(instant, "Asia/Tokyo", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const inNewYork = formatInTimeZone(instant, "America/New_York", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // 18:30 UTC in mid-July: Tokyo (UTC+9, no DST) reads 03:30 next day; New York
    // (UTC-4 during DST) reads 14:30 the same day. If this ever silently fell back
    // to the test runner's local zone, both calls would collapse to the same string.
    expect(inTokyo).not.toBe(inNewYork);
  });

  it("accepts a Date instance as well as an ISO string", () => {
    const asDate = formatInTimeZone(new Date(instant), "UTC", { hour12: false });
    const asString = formatInTimeZone(instant, "UTC", { hour12: false });

    expect(asDate).toBe(asString);
  });
});

describe("getBrowserLocalTimeZoneId", () => {
  it("returns a non-empty timezone id string", () => {
    const id = getBrowserLocalTimeZoneId();

    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });
});
