import { describe, expect, it } from "vitest";
import { validateWeeklyWindows, type WeeklyWindowDraft } from "./useWeeklyWindows";

describe("validateWeeklyWindows", () => {
  it("accepts touching windows because intervals are half-open", () => {
    const windows: WeeklyWindowDraft[] = [
      { id: "1", dayOfWeek: "Monday", startLocal: "09:00", endLocal: "12:00", capacityOverride: null },
      { id: "2", dayOfWeek: "Monday", startLocal: "12:00", endLocal: "17:00", capacityOverride: null },
    ];

    expect(validateWeeklyWindows(windows, 4)).toEqual([]);
  });

  it("rejects same-day overlaps", () => {
    const windows: WeeklyWindowDraft[] = [
      { id: "1", dayOfWeek: "Monday", startLocal: "09:00", endLocal: "13:00", capacityOverride: null },
      { id: "2", dayOfWeek: "Monday", startLocal: "12:00", endLocal: "17:00", capacityOverride: null },
    ];

    expect(validateWeeklyWindows(windows, 4)).toContain("overlap");
  });

  it("rejects capacity above the selected resource maximum", () => {
    const windows: WeeklyWindowDraft[] = [
      { id: "1", dayOfWeek: "Tuesday", startLocal: "09:00", endLocal: "17:00", capacityOverride: 5 },
    ];

    expect(validateWeeklyWindows(windows, 4)).toContain("capacity");
  });
});
