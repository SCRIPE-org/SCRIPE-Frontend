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

/**
 * Documentation for "CheckedIn"
 */
export type OccupyingReservationStatus = "Held" | "Confirmed" | "CheckedIn";

/**
 * Documentation for module export
 */
export interface OperationsCalendarBlock {
  reservationId: string;
  reservationNumber: string;
  resourceId: string;
  status: ReservationStatus;
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
