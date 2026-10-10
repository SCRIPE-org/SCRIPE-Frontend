import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GuestBookingPortalView } from "./GuestBookingPortalView";
import { guestPortalService } from "../../data/services/guest-portal.service";

// Mock i18n
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (params?.reservationNumber) return `Cancel ${params.reservationNumber}?`;
      return key;
    },
    language: "en",
    direction: "ltr",
    setLanguage: vi.fn(),
    registerBothLanguages: vi.fn(),
  }),
}));

describe("GuestBookingPortalView", () => {
  const mockBooking = {
    reservationNumber: "RES-9999",
    venueName: "Metropolis Sports Hub",
    facilityName: "Olympic Arena",
    resourceName: "Court 4",
    startUtc: "2026-10-10T10:00:00Z",
    endUtc: "2026-10-10T11:00:00Z",
    timeZoneId: "UTC",
    status: "Confirmed",
    quantity: 1,
    customerName: "Jane Doe",
    financialSummary: {
      invoiceNumber: "INV-001",
      currencyCode: "USD",
      totalAmount: 100,
      paidAmount: 100,
      outstandingAmount: 0,
      status: "Paid",
    },
    allowedActions: ["Cancel"],
    canCancel: true,
    instructions: "Please enter through gate 4.",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.location.hash = "";
  });

  it("extracts token from hash, strips hash via replaceState, and exchanges session", async () => {
    window.location.hash = "#test-opaque-token-12345";
    const replaceStateSpy = vi.spyOn(window.history, "replaceState");

    vi.spyOn(guestPortalService, "exchangeSession").mockResolvedValueOnce({
      guestSessionToken: "session-token-xyz",
      expiresAtUtc: "2026-10-11T10:00:00Z",
      reservation: mockBooking,
    });

    render(<GuestBookingPortalView />);

    // Hash should be wiped immediately
    expect(replaceStateSpy).toHaveBeenCalledWith(null, "", window.location.pathname);

    // Should call exchangeSession with the token from the hash
    expect(guestPortalService.exchangeSession).toHaveBeenCalledWith("test-opaque-token-12345");

    // Wait for booking details to render
    await waitFor(() => {
      expect(screen.getByText("RES-9999")).toBeInTheDocument();
      expect(screen.getByText("Olympic Arena")).toBeInTheDocument();
      expect(screen.getByText("Court 4")).toBeInTheDocument();
    });
  });

  it("displays empty state when no token is in hash and no active session exists", async () => {
    window.location.hash = "";
    vi.spyOn(guestPortalService, "getBooking").mockRejectedValueOnce(new Error("Unauthorized"));

    render(<GuestBookingPortalView />);

    await waitFor(() => {
      expect(screen.getByText("Invalid or Expired Link")).toBeInTheDocument();
    });
  });

  it("allows guest to cancel booking when canCancel is true", async () => {
    window.location.hash = "#token-for-cancel";
    vi.spyOn(window.history, "replaceState").mockImplementation(() => {});

    vi.spyOn(guestPortalService, "exchangeSession").mockResolvedValueOnce({
      guestSessionToken: "session-token-xyz",
      expiresAtUtc: "2026-10-11T10:00:00Z",
      reservation: mockBooking,
    });

    const cancelSpy = vi
      .spyOn(guestPortalService, "cancelBooking")
      .mockResolvedValueOnce({
        reservationNumber: "RES-9999",
        status: "Cancelled",
      });

    render(<GuestBookingPortalView />);

    await waitFor(() => {
      expect(screen.getByText("RES-9999")).toBeInTheDocument();
    });

    const cancelBtn = screen.getByText("Cancel Reservation");
    expect(cancelBtn).toBeInTheDocument();

    fireEvent.click(cancelBtn);

    // Modal opens
    await waitFor(() => {
      expect(screen.getByText("Yes, Cancel Booking")).toBeInTheDocument();
    });

    const confirmBtn = screen.getByText("Yes, Cancel Booking");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(cancelSpy).toHaveBeenCalled();
      expect(
        screen.getByText("Your reservation has been cancelled successfully.")
      ).toBeInTheDocument();
    });
  });
});
