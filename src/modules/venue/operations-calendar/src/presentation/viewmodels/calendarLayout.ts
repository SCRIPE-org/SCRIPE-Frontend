import type {
  OccupyingReservationStatus,
  OperationsCalendarBlock,
  OperationsCalendarDay,
} from "../../domain/entities/OperationsCalendar";

const OCCUPYING = new Set<OccupyingReservationStatus>(["Held", "Confirmed", "CheckedIn"]);
const HOUR_MS = 60 * 60 * 1000;

export interface CalendarTimeSlot {
  instantUtc: string;
  label: string;
}

export interface TrackedCalendarBlock {
  block: OperationsCalendarBlock;
  track: number;
}

export function occupyingBlocks(blocks: OperationsCalendarBlock[]): OperationsCalendarBlock[] {
  return blocks.filter((block) => OCCUPYING.has(block.status as OccupyingReservationStatus));
}

export function placeBlocksOnTracks(blocks: OperationsCalendarBlock[]): TrackedCalendarBlock[] {
  const trackEnds: number[] = [];
  return [...occupyingBlocks(blocks)]
    .sort((left, right) => Date.parse(left.startUtc) - Date.parse(right.startUtc) ||
      Date.parse(left.endUtc) - Date.parse(right.endUtc) ||
      left.reservationId.localeCompare(right.reservationId))
    .map((block) => {
      const start = Date.parse(block.startUtc);
      let track = trackEnds.findIndex((end) => end <= start);
      if (track < 0) track = trackEnds.length;
      trackEnds[track] = Date.parse(block.endUtc);
      return { block, track };
    });
}

export function buildTimeSlots(day: OperationsCalendarDay, locale: string): CalendarTimeSlot[] {
  const from = Date.parse(day.fromUtc);
  const to = Date.parse(day.toUtc);
  const count = Math.max(0, Math.ceil((to - from) / HOUR_MS));
  const formatter = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: day.timeZoneId,
  });
  return Array.from({ length: count }, (_, index) => {
    const instant = new Date(from + index * HOUR_MS);
    return { instantUtc: instant.toISOString(), label: formatter.format(instant) };
  });
}

export function blockPosition(block: OperationsCalendarBlock, day: OperationsCalendarDay) {
  const from = Date.parse(day.fromUtc);
  const to = Date.parse(day.toUtc);
  const duration = Math.max(1, to - from);
  const clippedStart = Math.max(from, Date.parse(block.startUtc));
  const clippedEnd = Math.min(to, Date.parse(block.endUtc));
  return {
    leftPercent: ((clippedStart - from) / duration) * 100,
    widthPercent: Math.max(0, ((clippedEnd - clippedStart) / duration) * 100),
  };
}

export function localPrefillForInstant(instantUtc: string, timeZoneId: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: timeZoneId,
  }).formatToParts(new Date(instantUtc));
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    startTime: `${value("hour")}:${value("minute")}`,
  };
}
