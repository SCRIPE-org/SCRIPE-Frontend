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

export type OccupyingReservationStatus = "Held" | "Confirmed" | "CheckedIn";

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

export interface OperationsCalendarDay {
  dateLocal: string;
  timeZoneId: string;
  fromUtc: string;
  toUtc: string;
  asOfUtc: string;
  isTruncated: boolean;
  blocks: OperationsCalendarBlock[];
}

export interface OperationsCalendarQuery {
  dateLocal: string;
  timeZoneId: string;
  resourceIds: string[];
}

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
}

export type OperationsCalendarStage = "loading" | "ready" | "empty" | "featureUnavailable" | "error";

export interface OperationsCalendarState {
  stage: OperationsCalendarStage;
  day: OperationsCalendarDay | null;
  errorMessage: string | null;
}
