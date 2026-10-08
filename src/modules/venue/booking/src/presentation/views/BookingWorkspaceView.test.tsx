import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePermission } from "@core/hooks/use-permission";
import { BookingWorkspaceView } from "./BookingWorkspaceView";

vi.mock("@core/hooks/use-module-locales", () => ({ useModuleLocales: vi.fn() }));
vi.mock("@core/hooks/use-permission", () => ({ usePermission: vi.fn() }));
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key, language: "ar", direction: "rtl" }),
}));
vi.mock("../components/CustomerSelection", () => ({ CustomerSelection: () => <div /> }));
vi.mock("../components/RequestCriteriaSection", () => ({ RequestCriteriaSection: () => <div /> }));
vi.mock("../components/AvailabilityCandidates", () => ({ AvailabilityCandidates: () => <div /> }));
vi.mock("../components/BookingSummaryActions", () => ({ BookingSummaryActions: () => <div /> }));
vi.mock("../viewmodels/useBookingWorkspaceViewModel", () => ({
  endLocalFor: () => "2026-09-10T10:00",
  useBookingWorkspaceViewModel: () => ({
    state: {
      stage: "initial",
      candidates: [],
      selectedCandidate: null,
      partialSearchFailure: false,
    },
    criteria: {
      facilityId: "facility-1",
      date: "2026-09-10",
      startTime: "09:00",
      durationMinutes: 60,
      quantity: 1,
    },
    customer: { id: "party-1", displayName: "Ù…Ù†Ù‰", type: "Person" },
    customerResults: [],
    customerSearching: false,
    facilities: [],
    resourceKindOptions: [],
    usageTypeOptions: [],
    setupLoading: false,
    setupError: null,
    setupFeatureUnavailable: false,
    priceQuote: null,
    priceQuoteLoading: false,
    priceQuoteError: null,
    searchCustomers: vi.fn(),
    selectCustomer: vi.fn(),
    clearCustomer: vi.fn(),
    setCriteria: vi.fn(),
    refreshSetup: vi.fn(),
    searchAvailability: vi.fn(),
    selectCandidate: vi.fn(),
    createHold: vi.fn(),
    confirm: vi.fn(),
    markHoldExpired: vi.fn(),
    createAnother: vi.fn(),
  }),
}));

describe("BookingWorkspaceView", () => {
  beforeEach(() => {
    vi.mocked(usePermission).mockImplementation(
      (permission) => permission !== "reservations.confirm"
    );
  });

  it("keeps the complete workflow RTL and supports delegated confirmation", () => {
    render(<BookingWorkspaceView />);

    expect(screen.getByTestId("booking-workspace")).toHaveAttribute("dir", "rtl");
    expect(screen.getByText("booking.confirm.noPermissionTitle")).toBeInTheDocument();
  });

  it("fails closed when a core search-and-hold permission is missing", () => {
    vi.mocked(usePermission).mockImplementation(
      (permission) => permission !== "booking-holds.create"
    );
    render(<BookingWorkspaceView />);

    expect(screen.getByText("booking.permission.title")).toBeInTheDocument();
    expect(screen.queryByTestId("booking-workspace")).not.toBeInTheDocument();
  });
});
