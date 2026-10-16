/**
 * Documentation for module export
 */
export interface CustomerSummary {
  id: string;
  type: string;
  displayName: string;
}

/**
 * Documentation for module export
 */
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

/**
 * Documentation for module export
 */
export interface BookingWorkspacePrefill {
  facilityId?: string;
  resourceId?: string;
  date?: string;
  startTime?: string;
  durationMinutes?: number;
}

/**
 * Documentation for module export
 */
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

/**
 * Documentation for module export
 */
export interface CreateBookingDraftInput {
  resourceId: string;
  customerPartyId: string;
  requestedStartUtc: string;
  requestedEndUtc: string;
  quantity: number;
}

/**
 * Documentation for module export
 */
export interface BookingHoldResult {
  reservationId: string;
  bookingHoldId: string;
  expiresAtUtc: string;
}

/**
 * Documentation for module export
 */
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

/**
 * Documentation for module export
 */
export interface ConfirmBookingResult {
  reservationId: string;
  bookingHoldId: string;
}

/**
 * Documentation for "NoShow"
 */
export type ReservationLifecycleStatus = "CheckedIn" | "Completed" | "NoShow";

/**
 * Documentation for module export
 */
export interface ReservationLifecycleResult {
  reservationId: string;
  status: ReservationLifecycleStatus;
}

/**
 * Documentation for module export
 */
export interface RescheduleReservationInput {
  resourceId: string;
  requestedStartUtc: string;
  requestedEndUtc: string;
  idempotencyKey: string;
  priceQuoteId?: string;
}

/**
 * Documentation for module export
 */
export interface ChangeReservationResourceInput {
  targetResourceId: string;
  requestedStartUtc: string;
  requestedEndUtc: string;
  idempotencyKey: string;
  priceQuoteId?: string;
}

/**
 * Documentation for =
 */
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

/**
 * Documentation for module export
 */
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

/**
 * Documentation for module export
 */
export interface BookingBackendErrorDetails {
  statusCode?: number;
  errorCode?: string;
  message?: string;
}

/**
 * Documentation for module export
 */
export function backendErrorDetails(error: unknown): BookingBackendErrorDetails {
  if (!(error instanceof Error)) return {};
  const details = (error as Error & { details?: BookingBackendErrorDetails }).details;
  return details ?? {};
}

/**
 * Documentation for module export
 */
export function isOperationalConflict(error: unknown): boolean {
  const details = backendErrorDetails(error);
  return details.statusCode === 409 || details.errorCode === "ENTITY_OPERATION_CONFLICT";
}

/**
 * Documentation for module export
 */
export function isFeatureUnavailable(error: unknown): boolean {
  return backendErrorDetails(error).errorCode === "Error.Forbidden";
}
