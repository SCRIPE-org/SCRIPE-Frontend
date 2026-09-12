import type {
  AvailabilityCandidate,
  BookingHoldResult,
  BookingWorkspaceState,
  ReservationDetails,
} from "../../domain/entities/Booking";

export const initialBookingWorkspaceState: BookingWorkspaceState = {
  stage: "initial",
  candidates: [],
  selectedCandidate: null,
  reservationId: null,
  reservation: null,
  hold: null,
  errorMessage: null,
  partialSearchFailure: false,
};

export type BookingWorkspaceAction =
  | { type: "criteriaChanged" | "customerChanged" | "searching" | "holdConflict" | "holdExpired" | "confirming" }
  | { type: "searchSucceeded"; candidates: AvailabilityCandidate[]; partialFailure: boolean }
  | { type: "searchFailed"; message: string }
  | { type: "featureUnavailable" }
  | { type: "candidateSelected"; candidate: AvailabilityCandidate }
  | { type: "holding"; reservationId?: string }
  | { type: "held"; result: BookingHoldResult; reservation: ReservationDetails }
  | { type: "confirmed"; reservation: ReservationDetails }
  | { type: "operationFailed"; message: string }
  | { type: "reset" };

export function reduceBookingWorkspace(
  state: BookingWorkspaceState,
  action: BookingWorkspaceAction
): BookingWorkspaceState {
  switch (action.type) {
    case "criteriaChanged":
    case "customerChanged":
      return { ...initialBookingWorkspaceState };
    case "searching":
      return {
        ...state,
        stage: "searching",
        candidates: [],
        selectedCandidate: null,
        errorMessage: null,
        partialSearchFailure: false,
      };
    case "searchSucceeded": {
      const available = action.candidates.filter((candidate) => candidate.isAvailable);
      return {
        ...state,
        stage: available.length > 0 ? "results" : "noAvailability",
        candidates: action.candidates,
        selectedCandidate: null,
        errorMessage: null,
        partialSearchFailure: action.partialFailure,
      };
    }
    case "searchFailed":
    case "operationFailed":
      return { ...state, stage: "error", errorMessage: action.message };
    case "featureUnavailable":
      return { ...state, stage: "featureUnavailable", errorMessage: null };
    case "candidateSelected":
      return action.candidate.isAvailable
        ? { ...state, stage: "results", selectedCandidate: action.candidate, errorMessage: null }
        : state;
    case "holding":
      return {
        ...state,
        stage: "holding",
        reservationId: action.reservationId ?? state.reservationId,
        errorMessage: null,
      };
    case "held":
      return {
        ...state,
        stage: "held",
        reservationId: action.result.reservationId,
        reservation: action.reservation,
        hold: {
          bookingHoldId: action.result.bookingHoldId,
          expiresAtUtc: action.result.expiresAtUtc,
        },
        errorMessage: null,
      };
    case "holdConflict":
      return {
        ...state,
        stage: "holdConflict",
        candidates: [],
        selectedCandidate: null,
        hold: null,
        errorMessage: null,
      };
    case "holdExpired":
      return state.stage === "confirmed" ? state : { ...state, stage: "holdExpired" };
    case "confirming":
      return state.stage === "held" ? { ...state, stage: "confirming", errorMessage: null } : state;
    case "confirmed":
      return { ...state, stage: "confirmed", reservation: action.reservation, errorMessage: null };
    case "reset":
      return { ...initialBookingWorkspaceState };
  }
}
