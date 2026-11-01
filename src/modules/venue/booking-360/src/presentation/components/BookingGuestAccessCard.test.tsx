import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BookingGuestAccessCard } from "./BookingGuestAccessCard";

const { booking360RepoMock } = vi.hoisted(() => ({
  booking360RepoMock: {
    getById: vi.fn(),
    getGuestAccessStatus: vi.fn(),
    generateGuestAccess: vi.fn(),
    sendGuestLink: vi.fn(),
    revokeGuestAccess: vi.fn(),
  },
}));

vi.mock("@modules/venue/di", () => ({
  getVenueContainer: vi.fn(() => ({
    booking360Repository: booking360RepoMock,
  })),
}));

describe("BookingGuestAccessCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-expect-error mock canvas getContext in jsdom
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Array(4) })),
      putImageData: vi.fn(),
      createImageData: vi.fn(() => []),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      fillText: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    }));
  });

  it("loads status and displays not generated state if no active link", async () => {
    booking360RepoMock.getGuestAccessStatus.mockResolvedValueOnce({
      hasActiveLink: false,
      isRevoked: false,
    });

    render(
      <BookingGuestAccessCard
        reservationId="res-123"
        t={(k, opts) => String(opts?.defaultValue ?? k)}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Not Generated")).toBeInTheDocument();
      expect(screen.getByText("Generate Guest Link")).toBeInTheDocument();
    });
  });

  it("generates guest link on button click and renders link with copy button, PIN, and QR pass", async () => {
    booking360RepoMock.getGuestAccessStatus.mockResolvedValueOnce({
      hasActiveLink: false,
      isRevoked: false,
    });

    booking360RepoMock.generateGuestAccess.mockResolvedValueOnce({
      guestAccessLink: "/bookings/guest#test-token-777",
      expiresAtUtc: "2026-10-15T00:00:00Z",
    });

    render(
      <BookingGuestAccessCard
        reservationId="res-123"
        t={(k, opts) => String(opts?.defaultValue ?? k)}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Generate Guest Link")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Generate Guest Link"));

    await waitFor(() => {
      expect(booking360RepoMock.generateGuestAccess).toHaveBeenCalledWith("res-123");
      expect(screen.getByDisplayValue(/test-token-777/)).toBeInTheDocument();
      expect(screen.getByTestId("copy-guest-link-button")).toBeInTheDocument();
      expect(screen.getByTestId("guest-access-pin")).toBeInTheDocument();
      expect(screen.getByTestId("copy-pin-button")).toBeInTheDocument();
      expect(screen.getByTestId("guest-access-qrcode")).toBeInTheDocument();
    });
  });

  it("revokes guest link when user clicks revoke", async () => {
    booking360RepoMock.getGuestAccessStatus.mockResolvedValue({
      hasActiveLink: true,
      expiresAtUtc: "2026-10-15T00:00:00Z",
      isRevoked: false,
    });

    booking360RepoMock.revokeGuestAccess.mockResolvedValueOnce(undefined);
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<BookingGuestAccessCard reservationId="res-123" t={(k) => k} />);

    await waitFor(() => {
      expect(screen.getByText("Revoke Access")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Revoke Access"));

    await waitFor(() => {
      expect(booking360RepoMock.revokeGuestAccess).toHaveBeenCalledWith(
        "res-123",
        "Revoked by operator"
      );
    });
  });
});
