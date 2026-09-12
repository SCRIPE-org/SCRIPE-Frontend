import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { BookingWorkspaceState } from "../../domain/entities/Booking";
import { BookingSummaryActions } from "./BookingSummaryActions";

const t = (key: string) => key;
const candidate = {
  resourceId: "resource-1",
  resourceName: "Court 1",
  facilityId: "facility-1",
  facilityName: "Downtown",
  profileName: "Indoor Court",
  timeZoneId: "Africa/Cairo",
  startUtc: "2026-09-10T07:00:00Z",
  endUtc: "2026-09-10T08:00:00Z",
  requestedQuantity: 1,
  isAvailable: true,
  maximumCapacity: 2,
  consumedCapacity: 0,
  remainingCapacity: 2,
  reasonCode: "Available",
};

function state(patch: Partial<BookingWorkspaceState>): BookingWorkspaceState {
  return {
    stage: "held",
    candidates: [candidate],
    selectedCandidate: candidate,
    reservationId: "reservation-1",
    reservation: {
      id: "reservation-1",
      reservationNumber: "RES-1",
      status: "Held",
      resourceId: "resource-1",
      requestedStartUtc: candidate.startUtc,
      requestedEndUtc: candidate.endUtc,
      quantity: 1,
      customerPartyId: "party-1",
    },
    hold: { bookingHoldId: "hold-1", expiresAtUtc: "2999-09-10T07:15:00Z" },
    errorMessage: null,
    partialSearchFailure: false,
    ...patch,
  };
}

const baseProps = {
  t,
  locale: "en",
  customer: { id: "party-1", type: "Person", displayName: "Mona Hassan" },
  canHold: true,
  onHold: vi.fn(),
  onConfirm: vi.fn(),
  onExpired: vi.fn(),
  onSearchAgain: vi.fn(),
  onCreateAnother: vi.fn(),
};

describe("BookingSummaryActions", () => {
  it("allows Hold but withholds Confirm from an operator without confirm permission", () => {
    render(<BookingSummaryActions {...baseProps} state={state({})} canConfirm={false} />);

    expect(screen.getByText("booking.confirm.noPermissionTitle")).toBeInTheDocument();
    expect(screen.queryByText("booking.confirm.action")).not.toBeInTheDocument();
  });

  it("presents a Search-to-Hold conflict as a recoverable operational state", () => {
    render(<BookingSummaryActions {...baseProps} state={state({ stage: "holdConflict", selectedCandidate: null, candidates: [], hold: null })} canConfirm />);

    expect(screen.getByText("booking.hold.conflictTitle")).toBeInTheDocument();
    expect(screen.getByText("booking.hold.conflictDescription")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "booking.hold.searchAgain" })).toBeInTheDocument();
  });

  it("shows the required booking context after confirmation", () => {
    render(<BookingSummaryActions {...baseProps} state={state({
      stage: "confirmed",
      hold: null,
      reservation: {
        ...state({}).reservation!,
        reservationNumber: "RES-1",
        status: "Confirmed",
      },
    })} canConfirm />);

    expect(screen.getByText("booking.confirm.title")).toBeInTheDocument();
    expect(screen.getByText("Mona Hassan")).toBeInTheDocument();
    expect(screen.getByText("Court 1")).toBeInTheDocument();
    expect(screen.getByText("RES-1")).toBeInTheDocument();
    expect(screen.getByText("booking.confirm.createAnother")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "booking.confirm.viewBooking" })).toHaveAttribute(
      "href", "/venue/bookings/reservation-1");
  });
});
