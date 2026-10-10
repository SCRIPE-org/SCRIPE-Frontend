import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import React from "react";
import { VenueCustomersView } from "./VenueCustomersView";
import { getVenueContainer } from "@modules/venue/di";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "en",
    direction: "ltr",
  }),
}));

const mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

vi.mock("@modules/venue/di", () => ({
  getVenueContainer: vi.fn(),
}));

describe("VenueCustomersView", () => {
  const mockCustomerRepo = {
    search: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete("partyId");
    vi.mocked(getVenueContainer).mockReturnValue({
      customerRepository: mockCustomerRepo,
    } as any);
  });

  it("renders page header and customer list successfully", async () => {
    mockCustomerRepo.search.mockResolvedValue([
      { id: "cust-1", displayName: "Ahmed Ali", type: "Person" },
      { id: "cust-2", displayName: "Padel Club Org", type: "Organization" },
    ]);

    render(<VenueCustomersView />);

    expect(screen.getByText("Customers")).toBeInTheDocument();
    expect(screen.getByText("+ New Customer")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Ahmed Ali")).toBeInTheDocument();
      expect(screen.getByText("Padel Club Org")).toBeInTheDocument();
    });
  });

  it("shows empty state when no customers exist", async () => {
    mockCustomerRepo.search.mockResolvedValue([]);

    render(<VenueCustomersView />);

    await waitFor(() => {
      expect(screen.getByText("No customers found")).toBeInTheDocument();
      expect(screen.getByText("Add Customer")).toBeInTheDocument();
    });
  });

  it("spotlights customer when partyId searchParam is provided", async () => {
    mockSearchParams.set("partyId", "cust-1");
    mockCustomerRepo.search.mockResolvedValue([
      { id: "cust-1", displayName: "Ahmed Ali", type: "Person" },
    ]);
    mockCustomerRepo.getById.mockResolvedValue({
      id: "cust-1",
      displayName: "Ahmed Ali",
      type: "Person",
    });

    render(<VenueCustomersView />);

    await waitFor(() => {
      expect(screen.getByText("Book for Customer")).toBeInTheDocument();
    });
  });

  it("filters customer list when search query is submitted", async () => {
    mockCustomerRepo.search.mockResolvedValue([
      { id: "cust-1", displayName: "Ahmed Ali", type: "Person" },
    ]);

    render(<VenueCustomersView />);

    await waitFor(() => {
      expect(screen.getByText("Ahmed Ali")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search customers by name, phone or email...");
    fireEvent.change(searchInput, { target: { value: "Padel" } });
    fireEvent.submit(searchInput.closest("form")!);

    expect(mockCustomerRepo.search).toHaveBeenCalledWith("Padel");
  });
});
