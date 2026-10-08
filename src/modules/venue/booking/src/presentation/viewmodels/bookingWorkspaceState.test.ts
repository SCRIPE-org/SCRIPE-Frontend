import { describe, expect, it } from "vitest";
import { initialBookingWorkspaceState, reduceBookingWorkspace } from "./useBookingWorkspaceState";

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
} as const;

describe("bookingWorkspaceState", () => {
  it("represents the availability loading state without retaining an old error", () => {
    const result = reduceBookingWorkspace(
      { ...initialBookingWorkspaceState, stage: "error", errorMessage: "old error" },
      { type: "searching" }
    );

    expect(result.stage).toBe("searching");
    expect(result.errorMessage).toBeNull();
  });

  it("invalidates a selected candidate and draft when request criteria change", () => {
    const selected = reduceBookingWorkspace(initialBookingWorkspaceState, {
      type: "candidateSelected",
      candidate,
    });
    const withDraft = { ...selected, reservationId: "reservation-1" };

    const result = reduceBookingWorkspace(withDraft, { type: "criteriaChanged" });

    expect(result.selectedCandidate).toBeNull();
    expect(result.reservationId).toBeNull();
    expect(result.stage).toBe("initial");
  });

  it("does not reuse booking state after the customer changes", () => {
    const held = {
      ...initialBookingWorkspaceState,
      selectedCandidate: candidate,
      reservationId: "reservation-1",
      hold: { bookingHoldId: "hold-1", expiresAtUtc: "2026-09-10T07:15:00Z" },
      stage: "held" as const,
    };

    const result = reduceBookingWorkspace(held, { type: "customerChanged" });

    expect(result.selectedCandidate).toBeNull();
    expect(result.reservationId).toBeNull();
    expect(result.hold).toBeNull();
  });

  it("turns a Search-to-Hold race into a recoverable search state", () => {
    const result = reduceBookingWorkspace(
      { ...initialBookingWorkspaceState, selectedCandidate: candidate, stage: "holding" },
      { type: "holdConflict" }
    );

    expect(result.stage).toBe("holdConflict");
    expect(result.selectedCandidate).toBeNull();
    expect(result.candidates).toEqual([]);
  });

  it("marks an expired hold and prevents a confirmed state from submitting again", () => {
    const expired = reduceBookingWorkspace(
      {
        ...initialBookingWorkspaceState,
        stage: "held",
        hold: { bookingHoldId: "hold-1", expiresAtUtc: "2026-09-10T07:15:00Z" },
      },
      { type: "holdExpired" }
    );
    const confirmed = reduceBookingWorkspace(
      { ...expired, stage: "confirmed" },
      { type: "confirming" }
    );

    expect(expired.stage).toBe("holdExpired");
    expect(confirmed.stage).toBe("confirmed");
  });

  it("represents server feature denial separately from a generic network error", () => {
    const result = reduceBookingWorkspace(initialBookingWorkspaceState, {
      type: "featureUnavailable",
    });
    expect(result.stage).toBe("featureUnavailable");
    expect(result.errorMessage).toBeNull();
  });
});
