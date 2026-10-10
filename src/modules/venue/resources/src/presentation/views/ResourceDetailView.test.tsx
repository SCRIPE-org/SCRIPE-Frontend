import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceDetailView } from "./ResourceDetailView";
import { useResourceDetailViewModel } from "../viewmodels/useResourceDetailViewModel";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn().mockReturnValue("/venue/resources/res-1"),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, opts?: { defaultValue?: string }) => {
      const map: Record<string, string> = {
        "resources.card.calendar": "Calendar",
        "resources.card.book": "Book",
        "resources.tabs.general": "General",
        "resources.tabs.workingHours": "Working Hours",
        "resources.tabs.bookingRules": "Booking Rules",
        "resources.tabs.pricing": "Pricing",
        "resources.tabs.closures": "Closures",
        "resources.detail.back": "Back to Courts & Spaces",
        "resources.workingHours.open247": "Open 24 Hours (24/7)",
        "resources.bookingRules.slotDuration": "Slot Duration",
        "resources.pricing.pricePerSlot": "Price per Slot",
        "resources.closures.blockTimeBtn": "+ Block Time",
      };
      return map[key] ?? opts?.defaultValue ?? key;
    },
    language: "en",
    direction: "ltr",
  }),
}));

vi.mock("../viewmodels/useResourceDetailViewModel", () => ({
  useResourceDetailViewModel: vi.fn(),
}));

const mockResource = {
  id: "res-1",
  name: "Padel Court 1",
  isPublished: true,
  capacity: { maxConcurrentUsage: 1, allocationMode: "SingleUnit" as const },
  slotPolicy: {
    slotDurationMinutes: 60,
    startIncrementMinutes: 60,
    timeZoneId: "Africa/Cairo",
  },
};

const mockProfile = {
  id: "prof-1",
  name: "Padel",
  resourceKindCode: "Padel",
  operatingPolicy: { timeZoneId: "Africa/Cairo" },
};

const mockFacility = {
  id: "fac-1",
  name: "Nasr City Club",
};

describe("ResourceDetailView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders court header with title, facility and all 5 tabs", () => {
    vi.mocked(useResourceDetailViewModel).mockReturnValue({
      loading: false,
      saving: false,
      error: null,
      feedback: null,
      resource: mockResource as never,
      profile: mockProfile as never,
      facility: mockFacility as never,
      calendar: null,
      priceConfig: { unitPrice: 800, currencyCode: "EGP" } as never,
      taxCategories: [],
      maintenanceBlocks: [],
      blackoutBlocks: [],
      isCalendar247: true,
      updateGeneral: vi.fn(),
      updateWorkingHours: vi.fn(),
      updateBookingRules: vi.fn(),
      updatePricing: vi.fn(),
      addClosure: vi.fn(),
      deleteClosure: vi.fn(),
      refresh: vi.fn(),
    });

    render(<ResourceDetailView resourceId="res-1" />);

    expect(screen.getByTestId("resource-detail-view")).toBeInTheDocument();
    expect(screen.getByText("Padel Court 1")).toBeInTheDocument();
    expect(screen.getByText("Nasr City Club")).toBeInTheDocument();

    // 5 tabs
    expect(screen.getByRole("tab", { name: "General" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Working Hours" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Booking Rules" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Pricing" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Closures" })).toBeInTheDocument();

    // Calendar button
    expect(screen.getAllByText("Calendar")[0]).toBeInTheDocument();
  });

  it("switches tabs and displays tab content", () => {
    vi.mocked(useResourceDetailViewModel).mockReturnValue({
      loading: false,
      saving: false,
      error: null,
      feedback: null,
      resource: mockResource as never,
      profile: mockProfile as never,
      facility: mockFacility as never,
      calendar: null,
      priceConfig: { unitPrice: 800, currencyCode: "EGP" } as never,
      taxCategories: [],
      maintenanceBlocks: [],
      blackoutBlocks: [],
      isCalendar247: true,
      updateGeneral: vi.fn(),
      updateWorkingHours: vi.fn(),
      updateBookingRules: vi.fn(),
      updatePricing: vi.fn(),
      addClosure: vi.fn(),
      deleteClosure: vi.fn(),
      refresh: vi.fn(),
    });

    render(<ResourceDetailView resourceId="res-1" />);

    // Switch to Working Hours
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Working Hours" }));
    expect(screen.getByText("Open 24 Hours (24/7)")).toBeInTheDocument();

    // Switch to Booking Rules
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Booking Rules" }));
    expect(screen.getByText("Slot Duration")).toBeInTheDocument();

    // Switch to Pricing
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Pricing" }));
    expect(screen.getByText("Price per Slot")).toBeInTheDocument();

    // Switch to Closures
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Closures" }));
    expect(screen.getByText("+ Block Time")).toBeInTheDocument();
  });

  it("shows Setup Required badge and warning alert when court has no pricing configured", () => {
    vi.mocked(useResourceDetailViewModel).mockReturnValue({
      loading: false,
      saving: false,
      error: null,
      feedback: null,
      resource: mockResource as never,
      profile: mockProfile as never,
      facility: mockFacility as never,
      calendar: null,
      priceConfig: null, // Unpriced!
      taxCategories: [],
      maintenanceBlocks: [],
      blackoutBlocks: [],
      isCalendar247: true,
      updateGeneral: vi.fn(),
      updateWorkingHours: vi.fn(),
      updateBookingRules: vi.fn(),
      updatePricing: vi.fn(),
      addClosure: vi.fn(),
      deleteClosure: vi.fn(),
      refresh: vi.fn(),
    });

    render(<ResourceDetailView resourceId="res-1" />);

    expect(screen.getByText("Setup Required")).toBeInTheDocument();
    expect(screen.getByText(/Setup Required: Configure Pricing/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Configure Pricing" })).toBeInTheDocument();
  });
});
