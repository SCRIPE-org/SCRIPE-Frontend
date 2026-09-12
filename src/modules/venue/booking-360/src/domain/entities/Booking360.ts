export type Booking360Status =
  | "Draft" | "Requested" | "Held" | "PendingApproval" | "Confirmed" | "CheckedIn"
  | "Completed" | "PartiallyFulfilled" | "Cancelled" | "Rejected" | "Expired" | "NoShow";

export interface Booking360HistoryItem {
  fromStatus: Booking360Status | null;
  toStatus: Booking360Status;
  transitionCode: string;
  occurredAtUtc: string;
  reason: string | null;
}

export interface Booking360Reservation {
  id: string;
  reservationNumber: string;
  status: Booking360Status;
  resourceId: string;
  requestedStartUtc: string;
  requestedEndUtc: string;
  quantity: number;
  customerPartyId: string;
  createdAt: string;
  modifiedAt: string | null;
  asOfUtc: string;
  activeHold: { id: string; expiresAtUtc: string } | null;
  history: Booking360HistoryItem[];
}

/**
 * Display-only enrichment owned by the Booking 360 composition surface. These deliberately narrow
 * shapes keep the Booking 360 domain independent from Party, Facility Operations, and the other
 * Venue submodules' concrete entity classes. The view model maps approved repository results into
 * these values; Booking 360 never becomes an owner of their source data.
 */
export interface Booking360CustomerContext {
  displayName: string;
}

export interface Booking360ResourceContext {
  name: string;
}

export interface Booking360ProfileContext {
  name: string;
  timeZoneId: string | null;
}

export interface Booking360FacilityContext {
  name: string;
}

export type Booking360OperationalAction =
  | "confirm"
  | "checkIn"
  | "complete"
  | "noShow"
  | "cancel"
  | "reschedule"
  | "changeResource";

export type Booking360OperationalFeedbackKind =
  | "success"
  | "invalidState"
  | "concurrency"
  | "permission"
  | "feature"
  | "validation"
  | "network";

export interface Booking360OperationalFeedback {
  action: Exclude<Booking360OperationalAction, "confirm">;
  kind: Booking360OperationalFeedbackKind;
  /** Authoritative status after the post-action reload, when one completed. */
  status: Booking360Status | null;
}

export type Booking360Stage = "loading" | "notFound" | "failed" | "ready" | "featureUnavailable" | "error";

export interface Booking360State {
  stage: Booking360Stage;
  reservation: Booking360Reservation | null;
  customer: Booking360CustomerContext | null;
  resource: Booking360ResourceContext | null;
  profile: Booking360ProfileContext | null;
  facility: Booking360FacilityContext | null;
  enrichmentLoading: boolean;
  customerError: boolean;
  resourceError: boolean;
  facilityError: boolean;
  activeAction: Booking360OperationalAction | null;
  actionError: "expired" | "conflict" | "failed" | null;
  operationalFeedback: Booking360OperationalFeedback | null;
}
