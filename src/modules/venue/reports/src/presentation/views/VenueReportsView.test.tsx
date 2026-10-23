import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VenueReportsView } from "./VenueReportsView";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, opts?: { defaultValue?: string }) => {
      const labels: Record<string, string> = {
        "venueReports.title": "Reports & Data Hub",
        "venueReports.ui.financialReport": "Financial Report",
        "venueReports.ui.bookingOperations": "Booking Operations",
        "venueReports.ui.courtPerformance": "Court Performance",
        "venueReports.ui.collectionsReport": "Payments & Collections",
        "venueReports.ui.exportReport": "Export Report",
        "venueReports.importAction": "Import Data",
      };
      return labels[key] ?? opts?.defaultValue ?? key;
    },
    language: "en",
    direction: "ltr",
  }),
}));

vi.mock("@core/providers/tenant-context-provider", () => ({
  useTenantContext: () => ({
    currentTenant: { id: "test-tenant", name: "SCRIPE Venue Test Club" },
  }),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock("@modules/venue/di", () => ({
  getVenueContainer: () => ({
    siteRepository: {
      getAll: vi.fn().mockResolvedValue({ items: [] }),
    },
    schedulableResourceRepository: {
      getAll: vi.fn().mockResolvedValue({ items: [] }),
    },
    customerRepository: {
      search: vi.fn().mockResolvedValue([]),
    },
    moneyRepository: {
      getInvoices: vi.fn().mockResolvedValue({ items: [] }),
      getPayments: vi.fn().mockResolvedValue({ items: [] }),
      getSummary: vi.fn().mockResolvedValue({ items: [] }),
      getByResource: vi.fn().mockResolvedValue([]),
    },
  }),
}));

vi.mock("@/core/services/api-factory", () => ({
  getModuleApiService: () => ({
    get: vi.fn().mockResolvedValue({ items: [] }),
    post: vi.fn().mockResolvedValue({}),
  }),
}));

describe("VenueReportsView", () => {
  it("renders authoritative reports workspace with category tabs and export/import triggers", () => {
    render(<VenueReportsView />);

    expect(screen.getByTestId("venue-reports-view")).toBeInTheDocument();
    expect(screen.getByText("Reports & Data Hub")).toBeInTheDocument();

    // Four authoritative categories
    expect(screen.getByText("Financial Report")).toBeInTheDocument();
    expect(screen.getByText("Booking Operations")).toBeInTheDocument();
    expect(screen.getByText("Court Performance")).toBeInTheDocument();
    expect(screen.getByText("Payments & Collections")).toBeInTheDocument();

    // Export and Import actions
    expect(screen.getByText("Export Report")).toBeInTheDocument();
    expect(screen.getByText("Import Data")).toBeInTheDocument();
  });
});
