import type { AvailabilityWindow, WeekDay } from "../../domain/entities/Availability";

/**
 * Documentation for module export
 */
export interface WeeklyWindowDraft extends AvailabilityWindow {
  id: string;
  dayOfWeek: WeekDay;
}

/**
 * Documentation for "capacity"
 */
export type WeeklyWindowError = "required" | "range" | "overlap" | "capacity";

/**
 * Documentation for validateWeeklyWindows
 */
export function validateWeeklyWindows(
  windows: WeeklyWindowDraft[],
  maximumCapacity: number
): WeeklyWindowError[] {
  const errors = new Set<WeeklyWindowError>();
  if (windows.length === 0) errors.add("required");

  for (const window of windows) {
    if (!window.startLocal || !window.endLocal || window.startLocal >= window.endLocal) {
      errors.add("range");
    }
    if (
      window.capacityOverride !== null &&
      (window.capacityOverride < 1 || window.capacityOverride > maximumCapacity)
    ) {
      errors.add("capacity");
    }
  }

  const sorted = [...windows].sort((a, b) =>
    a.dayOfWeek === b.dayOfWeek
      ? a.startLocal.localeCompare(b.startLocal)
      : a.dayOfWeek.localeCompare(b.dayOfWeek)
  );
  for (let i = 1; i < sorted.length; i += 1) {
    const previous = sorted[i - 1];
    const current = sorted[i];
    if (previous.dayOfWeek === current.dayOfWeek && current.startLocal < previous.endLocal) {
      errors.add("overlap");
    }
  }

  return [...errors];
}
