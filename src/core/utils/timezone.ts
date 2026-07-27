/**
 * Timezone display utilities.
 *
 * These helpers are for RENDERING only. The venue/site's IANA timezone id is the
 * caller-supplied source of truth (from Site/Venue configuration) — never the
 * browser's local zone. Authoritative local<->UTC conversion, including DST
 * ambiguous/nonexistent handling, happens server-side
 * (`Core.Application.Scheduling.TimeZoneContext`); this module must not
 * re-implement that logic.
 */

export class InvalidTimeZoneError extends Error {
  constructor(public readonly timeZoneId: string) {
    super(`'${timeZoneId}' is not a recognized IANA timezone id.`);
    this.name = "InvalidTimeZoneError";
  }
}

/** True when `timeZoneId` is a timezone id the runtime's Intl implementation recognizes. */
export function isValidTimeZoneId(timeZoneId: string | undefined | null): boolean {
  if (!timeZoneId) return false;

  try {
    new Intl.DateTimeFormat(undefined, { timeZone: timeZoneId });
    return true;
  } catch {
    return false;
  }
}

/**
 * Formats a UTC instant for display in the given IANA timezone. `timeZoneId` must be
 * explicitly supplied by the caller (e.g. the venue/site's configured timezone) — it is
 * never defaulted to the browser's local zone.
 */
export function formatInTimeZone(
  utcInstant: Date | string,
  timeZoneId: string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  if (!isValidTimeZoneId(timeZoneId)) {
    throw new InvalidTimeZoneError(timeZoneId);
  }

  const date = typeof utcInstant === "string" ? new Date(utcInstant) : utcInstant;
  return new Intl.DateTimeFormat(undefined, { ...options, timeZone: timeZoneId }).format(date);
}

/**
 * Returns the browser/runtime's own local timezone id.
 *
 * For "show in your own clock" UI only (e.g. a personal activity feed timestamp) —
 * never for venue-authoritative scheduling display. Passing this into
 * {@link formatInTimeZone} to render booking/availability data defeats the purpose of
 * a validated, venue-scoped timezone and must not be done.
 */
export function getBrowserLocalTimeZoneId(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
