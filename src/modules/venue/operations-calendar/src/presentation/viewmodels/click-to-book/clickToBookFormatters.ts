import type { CalendarResource } from "../../../domain/entities/OperationsCalendar";

export interface ClickToBookSlotPolicy {
  slotDurationMinutes: number;
  startIncrementMinutes?: number;
  allowMultiSlot?: boolean;
}

/**
 * Computes legal duration multiples (in minutes) from a resource slot policy.
 */
export function getAllowedDurationsForPolicy(policy: ClickToBookSlotPolicy | null): number[] {
  const baseSlotDuration = policy?.slotDurationMinutes ?? 60;
  const allowMultiSlot = policy?.allowMultiSlot ?? true;
  return policy && allowMultiSlot === false
    ? [baseSlotDuration]
    : [baseSlotDuration, baseSlotDuration * 2, baseSlotDuration * 3];
}

/**
 * Formats the selected slot's local start and end times for display in context summaries.
 */
export function formatBookingTimeRange(
  startUtc: string,
  endUtc: string,
  language: string,
  timeZoneId: string,
): string {
  try {
    const tz = timeZoneId || "UTC";
    const s = new Intl.DateTimeFormat(language, {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: tz,
    }).format(new Date(startUtc));
    const e = new Intl.DateTimeFormat(language, {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: tz,
    }).format(new Date(endUtc));
    return `${s} – ${e}`;
  } catch {
    return "";
  }
}

/**
 * Formats the selected booking date in the facility timezone.
 */
export function formatBookingDateDisplay(
  startUtc: string,
  language: string,
  timeZoneId: string,
): string {
  try {
    return new Intl.DateTimeFormat(language, {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: timeZoneId || "UTC",
    }).format(new Date(startUtc));
  } catch {
    return "";
  }
}

/**
 * Derives the active slot policy for the selected resource, preferring inline policy over async fetched policy.
 */
export function resolveActiveSlotPolicy(
  selectedResource: CalendarResource | null,
  fetchedPolicy: { resourceId: string; policy: ClickToBookSlotPolicy } | null,
): ClickToBookSlotPolicy | null {
  if (selectedResource?.slotPolicy) {
    return selectedResource.slotPolicy;
  }
  if (selectedResource && fetchedPolicy?.resourceId === selectedResource.id) {
    return fetchedPolicy.policy;
  }
  return null;
}
