import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourcesWorkspaceView } from "./ResourcesWorkspaceView";
import { useResourcesWorkspaceViewModel } from "../viewmodels/useResourcesWorkspaceViewModel";

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn().mockReturnValue(new URLSearchParams()),
  usePathname: vi.fn().mockReturnValue("/venue/resources"),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, opts?: { defaultValue?: string }) => {
      const map: Record<string, string> = {
        "resources.title": "Courts & Spaces",
        "resources.subtitle": "Manage your courts, spaces, working hours, booking slots, and pricing.",
        "resources.addCourt": "+ Add Court / Space",
        "resources.advancedSetup": "Settings",
        "resources.empty.title": "No courts or spaces yet",
        "resources.empty.action": "Start Setup Journey",
        "resources.card.viewEdit": "Edit",
        "resources.card.calendar": "Calendar",
        "resources.card.book": "Book",
        "resources.card.slot": "min slots",
        "resources.card.perSlot": "/ slot",
        "resources.card.open247": "Open 24/7",
        "resources.tabs.workingHours": "Working Hours",
        "resources.tabs.bookingRules": "Booking Rules",
        "resources.tabs.pricing": "Pricing",
      };
      return map[key] ?? opts?.defaultValue ?? key;
    },
    language: "en",
    direction: "ltr",
  }),
}));

vi.mock("../viewmodels/useResourcesWorkspaceViewModel", () => ({
  useResourcesWorkspaceViewModel: vi.fn(),
}));

const mockItems = [
  {
    id: "res-1",
    name: "Padel Court 1",
    sportType: "Padel",
    profileId: "prof-1",
    facilityId: "fac-1",
    facilityName: "Nasr City",
    capacity: 1,
    workingHoursSummary: "Open 24/7",
    isOpen247: true,
    slotDurationMinutes: 60,
    startIncrementMinutes: 60,
    pricePerSlot: 800,
    currencyCode: "EGP",
    isPublished: true,
    timeZoneId: "Africa/Cairo",
  },
];

describe("ResourcesWorkspaceView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders court cards and header with primary actions", () => {
    vi.mocked(useResourcesWorkspaceViewModel).mockReturnValue({
      loading: false,
      error: null,
      items: mockItems,
      allItems: mockItems,
      facilities: [{ id: "fac-1", name: "Nasr City", code: "NASR", venueProfileId: "" } as never],
      selectedFacilityId: "",
      setSelectedFacilityId: vi.fn(),
      searchQuery: "",
      setSearchQuery: vi.fn(),
      wizardOpen: false,
      setWizardOpen: vi.fn(),
      wizardSubmitting: false,
      executeFirstTimeSetup: vi.fn(),
      refresh: vi.fn(),
    });

    render(<ResourcesWorkspaceView />);

    expect(screen.getByTestId("venue-resources-workspace")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Courts & Spaces" })).toBeInTheDocument();
    expect(screen.getByText("Padel Court 1")).toBeInTheDocument();
    expect(screen.getByText("800 EGP")).toBeInTheDocument();
    expect(screen.getAllByText("Settings")[0]).toBeInTheDocument();
  });

  it("renders empty state when no items exist", () => {
    vi.mocked(useResourcesWorkspaceViewModel).mockReturnValue({
      loading: false,
      error: null,
      items: [],
      allItems: [],
      facilities: [],
      selectedFacilityId: "",
      setSelectedFacilityId: vi.fn(),
      searchQuery: "",
      setSearchQuery: vi.fn(),
      wizardOpen: false,
      setWizardOpen: vi.fn(),
      wizardSubmitting: false,
      executeFirstTimeSetup: vi.fn(),
      refresh: vi.fn(),
    });

    render(<ResourcesWorkspaceView />);

    expect(screen.getByText("No courts or spaces yet")).toBeInTheDocument();
    expect(screen.getByText("Start Setup Journey")).toBeInTheDocument();
  });

  it("opens wizard when + Add Court / Space button is clicked", () => {
    vi.mocked(useResourcesWorkspaceViewModel).mockReturnValue({
      loading: false,
      error: null,
      items: mockItems,
      allItems: mockItems,
      facilities: [],
      selectedFacilityId: "",
      setSelectedFacilityId: vi.fn(),
      searchQuery: "",
      setSearchQuery: vi.fn(),
      wizardOpen: false,
      setWizardOpen: vi.fn(),
      wizardSubmitting: false,
      executeFirstTimeSetup: vi.fn(),
      refresh: vi.fn(),
    });

    render(<ResourcesWorkspaceView />);

    const addButtons = screen.getAllByRole("button", { name: /\+ Add Court/i });
    fireEvent.click(addButtons[0]);
    expect(screen.getByText("1. Branch")).toBeInTheDocument();
  });
});
