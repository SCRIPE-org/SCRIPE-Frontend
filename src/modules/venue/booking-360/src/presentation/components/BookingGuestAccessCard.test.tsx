import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BookingGuestAccessCard } from "./BookingGuestAccessCard";

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockDelete = vi.fn();

vi.mock("@/core/services/api-factory", () => ({
  getModuleApiService: () => ({
    get: mockGet,
    post: mockPost,
    delete: mockDelete,
  }),
}));

describe("BookingGuestAccessCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads status and displays not generated state if no active link", async () => {
    mockGet.mockResolvedValueOnce({
      hasActiveLink: false,
      isRevoked: false,
    });

    render(
      <BookingGuestAccessCard
        reservationId="res-123"
        t={(k) => k}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Not Generated")).toBeInTheDocument();
      expect(screen.getByText("Generate Guest Link")).toBeInTheDocument();
    });
  });

  it("generates guest link on button click and renders link with copy button", async () => {
    mockGet.mockResolvedValueOnce({
      hasActiveLink: false,
      isRevoked: false,
    });

    mockPost.mockResolvedValueOnce({
      guestAccessLink: "/bookings/guest#test-token-777",
      expiresAtUtc: "2026-10-15T00:00:00Z",
    });

    render(
      <BookingGuestAccessCard
        reservationId="res-123"
        t={(k) => k}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Generate Guest Link")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Generate Guest Link"));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/v1/reservations/res-123/guest-access");
      expect(screen.getByDisplayValue(/test-token-777/)).toBeInTheDocument();
      expect(screen.getByText("Copy")).toBeInTheDocument();
    });
  });

  it("revokes guest link when user clicks revoke", async () => {
    mockGet.mockResolvedValue({
      hasActiveLink: true,
      expiresAtUtc: "2026-10-15T00:00:00Z",
      isRevoked: false,
    });

    mockDelete.mockResolvedValueOnce(true);
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <BookingGuestAccessCard
        reservationId="res-123"
        t={(k) => k}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Revoke Link")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Revoke Link"));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith(
        expect.stringContaining("/v1/reservations/res-123/guest-access")
      );
    });
  });
});
