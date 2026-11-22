import { describe, expect, it } from "vitest";
import {
  addWallClockMinutes,
  localDateFromKey,
  localDateKey,
  localSessionTimeToUtc,
  sessionDateKey,
  utcToSessionInput,
} from "./session-time";

describe("session wall time", () => {
  it("adds wall-clock minutes without inheriting the browser DST transition", () => {
    expect(addWallClockMinutes("2026-03-08T01:30", 60)).toBe("2026-03-08T02:30");
    expect(addWallClockMinutes("2026-12-31T23:30", 60)).toBe("2027-01-01T00:30");
  });

  it("uses the session timezone even when the browser uses another timezone", () => {
    expect(localSessionTimeToUtc("2026-02-18T17:30", "Africa/Cairo"))
      .toEqual({ utc: "2026-02-18T15:30:00.000Z" });
    expect(utcToSessionInput("2026-02-18T15:30:00.000Z", "Africa/Cairo"))
      .toBe("2026-02-18T17:30");
  });

  it("rejects a wall time skipped at the DST boundary", () => {
    expect(localSessionTimeToUtc("2026-03-08T02:30", "America/New_York"))
      .toEqual({ error: "nonexistentTime" });
  });

  it("does not silently choose one of two possible times during the fall DST shift", () => {
    expect(localSessionTimeToUtc("2026-11-01T01:30", "America/New_York"))
      .toEqual({ error: "ambiguousTime" });
  });

  it("rejects invalid calendar dates and unknown timezones", () => {
    expect(localSessionTimeToUtc("2026-02-30T17:30", "UTC")).toEqual({ error: "invalidTime" });
    expect(localSessionTimeToUtc("2026-02-18T17:30", "Unknown/Branch")).toEqual({ error: "invalidZone" });
  });

  it("places UTC instants on the correct calendar day in the session timezone", () => {
    expect(sessionDateKey("2026-01-01T22:30:00.000Z", "Africa/Cairo")).toBe("2026-01-02");
    expect(sessionDateKey("2026-01-01T22:30:00.000Z", "America/Los_Angeles")).toBe("2026-01-01");
  });

  it("round-trips local calendar keys without UTC conversion", () => {
    const local = new Date(2026, 0, 2, 0, 30);
    expect(localDateKey(local)).toBe("2026-01-02");
    expect(localDateFromKey("2026-01-02").getFullYear()).toBe(2026);
    expect(localDateFromKey("2026-01-02").getMonth()).toBe(0);
    expect(localDateFromKey("2026-01-02").getDate()).toBe(2);
  });
});
