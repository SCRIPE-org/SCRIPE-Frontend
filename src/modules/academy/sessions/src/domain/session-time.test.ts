import { describe, expect, it } from "vitest";
import { localSessionTimeToUtc, utcToSessionInput } from "./session-time";

describe("session wall time", () => {
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
});
