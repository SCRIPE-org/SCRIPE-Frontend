/**
 * Documentation for =
 */
export type ReservationStatus =
  | "Draft"
  | "Requested"
  | "Held"
  | "PendingApproval"
  | "Confirmed"
  | "CheckedIn"
  | "Completed"
  | "PartiallyFulfilled"
  | "Cancelled"
  | "Rejected"
  | "Expired"
  | "NoShow";

/** Status values emitted by resource closure blocks rendered on the calendar timeline. */
export type ClosureBlockStatus = "Maintenance" | "Blocked" | "Unavailable";

/** Union of reservation statuses and closure block statuses displayed on calendar blocks. */
export type CalendarBlockStatus = ReservationStatus | ClosureBlockStatus;

/**
 * Reservation statuses that occupy a time slot on the timeline.
 */
export type OccupyingReservationStatus = "Held" | "Confirmed" | "CheckedIn";

/**
 * Documentation for module export
 */
export interface OperationsCalendarBlock {
  reservationId: string;
  reservationNumber: string;
  resourceId: string;
  status: CalendarBlockStatus;
  startUtc: string;
  endUtc: string;
  quantity: number;
  customerPartyId: string;
  holdExpiresAtUtc: string | null;
}

/**
 * Documentation for module export
 */
export interface OperationsCalendarDay {
  dateLocal: string;
  timeZoneId: string;
  fromUtc: string;
  toUtc: string;
  asOfUtc: string;
  isTruncated: boolean;
  blocks: OperationsCalendarBlock[];
}

/**
 * Documentation for module export
 */
export interface OperationsCalendarQuery {
  dateLocal: string;
  timeZoneId: string;
  resourceIds: string[];
}

/**
 * Documentation for module export
 */
export interface CalendarResource {
  id: string;
  name: string;
  profileId: string;
  profileName: string;
  facilityId: string;
  facilityName: string;
  resourceKindCode: string;
  timeZoneId: string;
  slotPolicy?: {
    slotDurationMinutes: number;
    startIncrementMinutes?: number;
    timeZoneId?: string | null;
    allowMultiSlot?: boolean;
  } | null;
  priceEffectiveFromUtc?: string | null;
}

/**
 * Documentation for "error"
 */
export type OperationsCalendarStage =
  "loading" | "ready" | "empty" | "featureUnavailable" | "error";

/**
 * Documentation for module export
 */
export interface OperationsCalendarState {
  stage: OperationsCalendarStage;
  day: OperationsCalendarDay | null;
  errorMessage: string | null;
}

/** Aggregated block counts displayed in the calendar utility summary card. */
export interface CalendarStatusCounts {
  inUse: number;
  noActiveBooking: number;
  maintenance: number;
}

/**
 * Returns true when a calendar block represents a maintenance/unavailable closure
 * rather than a customer reservation.
 */
export function isClosureBlock(block: Pick<OperationsCalendarBlock, "reservationId" | "status">): boolean {
  return (
    block.reservationId.startsWith("closure-") ||
    block.status === "Maintenance" ||
    block.status === "Blocked" ||
    block.status === "Unavailable"
  );
}

/**
 * Computes active status counts across the current calendar day's blocks.
 */
export function computeCalendarStatusCounts(
  blocks: readonly OperationsCalendarBlock[],
  visibleResourceCount: number,
  nowMs: number = Date.now(),
): CalendarStatusCounts {
  let inUse = 0;
  let activeOccupiedNow = 0;
  let maintenance = 0;

  for (const b of blocks) {
    const closure = isClosureBlock(b);
    if (b.status === "CheckedIn") {
      inUse++;
    }
    if (closure) {
      maintenance++;
    }

    const s = Date.parse(b.startUtc);
    const e = Date.parse(b.endUtc);
    if (s <= nowMs && nowMs < e && (b.status === "CheckedIn" || b.status === "Confirmed" || closure)) {
      activeOccupiedNow++;
    }
  }

  return {
    inUse,
    noActiveBooking: Math.max(0, visibleResourceCount - activeOccupiedNow),
    maintenance,
  };
}
