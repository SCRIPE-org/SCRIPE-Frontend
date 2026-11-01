import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import React from "react";
import { VenueCustomersView } from "./VenueCustomersView";
import { getVenueContainer } from "@modules/venue/di";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "venueCustomers.title": "Customers",
        "venueCustomers.newCustomer": "+ New Customer",
        "venueCustomers.bookForCustomer": "Book for Customer",
        "venueCustomers.bookForCustomerCTA": "+ Book for Customer",
        "venueCustomers.search.placeholder": "Search customers by name, phone or email...",
        "venueCustomers.empty.title": "No customers found",
        "venueCustomers.empty.action": "Add Customer",
        "venueCustomers.pagination.showing": "Showing",
        "venueCustomers.pagination.to": "to",
        "venueCustomers.pagination.of": "of",
        "venueCustomers.pagination.customersCount": "customers",
        "venueCustomers.pagination.previous": "Previous",
        "venueCustomers.pagination.next": "Next",
        "venueCustomers.contact.partyId": "Party Kernel ID",
        "venueCustomers.bookingHistory.title": "Booking History",
        "venueCustomers.bookingHistory.viewBooking360": "View Booking 360",
      };
      return translations[key] ?? key;
    },
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
    searchPaged: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
  };

  const mockBookingRepo = {
    getCustomerReservations: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete("partyId");
    mockCustomerRepo.searchPaged.mockResolvedValue({
      items: [
        {
          id: "cust-1",
          displayName: "Ahmed Ali",
          type: "Person",
          phone: "+201001234567",
          email: "ahmed@example.com",
        },
        {
          id: "cust-2",
          displayName: "Padel Club Org",
          type: "Organization",
          phone: "+201009876543",
          email: "info@padelclub.com",
        },
      ],
      totalCount: 371,
      pageNumber: 1,
      pageSize: 20,
      totalPages: 19,
      hasPreviousPage: false,
      hasNextPage: true,
    });
    mockBookingRepo.getCustomerReservations.mockResolvedValue({
      items: [
        {
          id: "res-1009",
          reservationNumber: "RES-AHLY-1009",
          status: "Confirmed",
          resourceId: "court-1",
          requestedStartUtc: "2026-11-02T10:00:00Z",
          requestedEndUtc: "2026-11-02T11:00:00Z",
          quantity: 1,
          createdAt: "2026-11-01T08:00:00Z",
        },
      ],
      totalCount: 1,
      pageNumber: 1,
      pageSize: 50,
      totalPages: 1,
    });
    vi.mocked(getVenueContainer).mockReturnValue({
      customerRepository: mockCustomerRepo,
      bookingRepository: mockBookingRepo,
    } as unknown as ReturnType<typeof getVenueContainer>);
  });

  it("renders page header, customer list, and total count badge successfully", async () => {
    render(<VenueCustomersView />);

    expect(screen.getByText("Customers")).toBeInTheDocument();
    expect(screen.getByText("+ New Customer")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Ahmed Ali")).toBeInTheDocument();
      expect(screen.getByText("Padel Club Org")).toBeInTheDocument();
      expect(screen.getAllByText("371").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("displays contact details on customer cards", async () => {
    render(<VenueCustomersView />);

    await waitFor(() => {
      expect(screen.getByText("+201001234567")).toBeInTheDocument();
      expect(screen.getByText("ahmed@example.com")).toBeInTheDocument();
    });
  });

  it("renders server-side pagination bar with showing count and controls", async () => {
    render(<VenueCustomersView />);

    await waitFor(() => {
      expect(screen.getByText("Showing")).toBeInTheDocument();
      expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("20")).toBeInTheDocument();
      expect(screen.getAllByText("371").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Next")).toBeInTheDocument();
    });
  });

  it("opens DetailSheet with Party Kernel ID and booking history when a customer is clicked", async () => {
    render(<VenueCustomersView />);

    await waitFor(() => {
      expect(screen.getByText("Ahmed Ali")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Ahmed Ali"));

    await waitFor(() => {
      expect(screen.getByText("Party Kernel ID:")).toBeInTheDocument();
      expect(screen.getByText("cust-1")).toBeInTheDocument();
      expect(screen.getByText("RES-AHLY-1009")).toBeInTheDocument();
      expect(screen.getByText("View Booking 360")).toBeInTheDocument();
      expect(screen.getByText("+ Book for Customer")).toBeInTheDocument();
    });

    const booking360Link = screen.getByText("View Booking 360").closest("a");
    expect(booking360Link).toHaveAttribute("href", "/venue/bookings/res-1009");

    const bookLink = screen.getByText("+ Book for Customer").closest("a");
    expect(bookLink).toHaveAttribute(
      "href",
      "/venue/calendar?newBooking=true&customerPartyId=cust-1"
    );
  });

  it("shows empty state when no customers exist", async () => {
    mockCustomerRepo.searchPaged.mockResolvedValue({
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 20,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    });

    render(<VenueCustomersView />);

    await waitFor(() => {
      expect(screen.getByText("No customers found")).toBeInTheDocument();
      expect(screen.getByText("Add Customer")).toBeInTheDocument();
    });
  });

  it("spotlights customer when partyId searchParam is provided", async () => {
    mockSearchParams.set("partyId", "cust-1");
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
    render(<VenueCustomersView />);

    await waitFor(() => {
      expect(screen.getByText("Ahmed Ali")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search customers by name, phone or email...");
    fireEvent.change(searchInput, { target: { value: "Padel" } });
    fireEvent.submit(searchInput.closest("form")!);

    expect(mockCustomerRepo.searchPaged).toHaveBeenCalledWith("Padel", 1, 20);
  });
});
