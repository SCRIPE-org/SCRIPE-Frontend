import { describe, expect, it } from "vitest";
import { remainingHoldSeconds } from "./holdExpiry";

describe("remainingHoldSeconds", () => {
  it("uses the server expiry instant and never reports negative time", () => {
    expect(remainingHoldSeconds("2026-09-02T10:00:10Z", Date.parse("2026-09-02T10:00:00Z"))).toBe(10);
    expect(remainingHoldSeconds("2026-09-02T10:00:00Z", Date.parse("2026-09-02T10:00:01Z"))).toBe(0);
  });
});
