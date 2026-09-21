export interface CustomerSummary {
  id: string;
  type: string;
  displayName: string;
}

export interface BookingRequestCriteria {
  facilityId: string;
  resourceId: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  quantity: number;
  resourceKindCode: string;
  usageTypeCode: string;
}

export interface BookingWorkspacePrefill {
  facilityId?: string;
  resourceId?: string;
  date?: string;
  startTime?: string;
  durationMinutes?: number;
}

export interface AvailabilityCandidate {
  resourceId: string;
  resourceName: string;
  facilityId: string;
  facilityName: string;
  profileName: string;
  timeZoneId: string;
  startUtc: string;
  endUtc: string;
  requestedQuantity: number;
  isAvailable: boolean;
  maximumCapacity: number;
  consumedCapacity: number;
  remainingCapacity: number;
  reasonCode: string;
  reason?: string;
}

export interface CreateBookingDraftInput {
  resourceId: string;
  customerPartyId: string;
  requestedStartUtc: string;
  requestedEndUtc: string;
  quantity: number;
}

export interface BookingHoldResult {
  reservationId: string;
  bookingHoldId: string;
  expiresAtUtc: string;
}

export interface ReservationDetails {
  id: string;
  reservationNumber: string;
  status: string;
  resourceId: string;
  requestedStartUtc: string;
  requestedEndUtc: string;
  quantity: number;
  customerPartyId: string;
}

export interface ConfirmBookingResult {
  reservationId: string;
  bookingHoldId: string;
}

export type ReservationLifecycleStatus = "CheckedIn" | "Completed" | "NoShow";

export interface ReservationLifecycleResult {
  reservationId: string;
  status: ReservationLifecycleStatus;
}

export interface RescheduleReservationInput {
  resourceId: string;
  requestedStartUtc: string;
  requestedEndUtc: string;
  idempotencyKey: string;
  priceQuoteId?: string;
}

export interface ChangeReservationResourceInput {
  targetResourceId: string;
  requestedStartUtc: string;
  requestedEndUtc: string;
  idempotencyKey: string;
  priceQuoteId?: string;
}

export type BookingWorkspaceStage =
  | "initial"
  | "searching"
  | "results"
  | "noAvailability"
  | "holding"
  | "held"
  | "holdConflict"
  | "holdExpired"
  | "confirming"
  | "confirmed"
  | "featureUnavailable"
  | "error";

export interface BookingWorkspaceState {
  stage: BookingWorkspaceStage;
  candidates: AvailabilityCandidate[];
  selectedCandidate: AvailabilityCandidate | null;
  reservationId: string | null;
  reservation: ReservationDetails | null;
  hold: Pick<BookingHoldResult, "bookingHoldId" | "expiresAtUtc"> | null;
  errorMessage: string | null;
  partialSearchFailure: boolean;
}

export interface BookingBackendErrorDetails {
  statusCode?: number;
  errorCode?: string;
  message?: string;
}

export function backendErrorDetails(error: unknown): BookingBackendErrorDetails {
  if (!(error instanceof Error)) return {};
  const details = (error as Error & { details?: BookingBackendErrorDetails }).details;
  return details ?? {};
}

export function isOperationalConflict(error: unknown): boolean {
  const details = backendErrorDetails(error);
  return details.statusCode === 409 || details.errorCode === "ENTITY_OPERATION_CONFLICT";
}

export function isFeatureUnavailable(error: unknown): boolean {
  return backendErrorDetails(error).errorCode === "Error.Forbidden";
}
