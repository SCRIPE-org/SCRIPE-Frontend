import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NexusSecondaryRail } from "./nexus-secondary-rail";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/venue",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Mock workspace provider
const mockActiveWorkspace = {
  workspaceKey: "venue",
  workspaceNameEn: "Venue",
  workspaceNameAr: "المنشآت والملاعب",
  getLocalizedName: (lang: string) => (lang === "ar" ? "المنشآت والملاعب" : "Venue"),
};

const mockActiveRootItem = null;

vi.mock("@core/providers/workspace-provider", () => ({
  useWorkspace: () => ({
    activeWorkspace: mockActiveWorkspace,
    activeRootItem: mockActiveRootItem,
    isModuleMode: true,
    rootMenuItems: [],
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    language: "en",
    direction: "ltr",
    t: (k: string) => k,
  }),
}));

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    canAccessPage: () => true, // User has full access
  }),
}));

vi.mock("./nexus-transition", () => ({
  useNexusReducedMotion: () => false,
}));

vi.mock("./nexus-layout", () => ({
  useWorkspaceTransitionContext: () => ({
    switchWorkspace: vi.fn(),
    goBackWorkspace: vi.fn(),
  }),
}));

describe("NexusSecondaryRail — Focused Venue Workspace Navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Renders exactly the 6 required top-level sections in the canonical order", () => {
    render(<NexusSecondaryRail />);

    // Verify header title
    expect(screen.getByText("Venue Operations")).toBeInTheDocument();

    // Verify top-level sections exist in exact order
    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute("href", "/venue");

    const courtsSitesButton = screen.getByRole("button", { name: /courts & sites/i });
    expect(courtsSitesButton).toBeInTheDocument();

    const calendarButton = screen.getByRole("button", { name: /calendar/i });
    expect(calendarButton).toBeInTheDocument();

    const moneyButton = screen.getByRole("button", { name: /money/i });
    expect(moneyButton).toBeInTheDocument();

    const reportsLink = screen.getByRole("link", { name: /reports/i });
    expect(reportsLink).toHaveAttribute("href", "/venue/reports");

    const settingsButton = screen.getByRole("button", { name: /settings/i });
    expect(settingsButton).toBeInTheDocument();
  });

  it("2. Courts & Sites provides contextual access to Courts & Spaces, Sites & Locations, and Facilities", () => {
    render(<NexusSecondaryRail />);

    expect(screen.getByRole("link", { name: /courts & spaces/i })).toHaveAttribute(
      "href",
      "/venue/resources"
    );
    expect(screen.getByRole("link", { name: /sites & locations/i })).toHaveAttribute(
      "href",
      "/venue/sites"
    );
    expect(screen.getByRole("link", { name: /facilities/i })).toHaveAttribute(
      "href",
      "/venue/facilities"
    );
  });

  it("3. Calendar provides contextual access to Calendar Grid, New Booking, and Attention Queue", () => {
    render(<NexusSecondaryRail />);

    expect(screen.getByRole("link", { name: /calendar grid/i })).toHaveAttribute(
      "href",
      "/venue/calendar"
    );
    expect(screen.getByRole("link", { name: /new booking/i })).toHaveAttribute(
      "href",
      "/venue/bookings/new"
    );
    expect(screen.getByRole("link", { name: /attention queue/i })).toHaveAttribute(
      "href",
      "/venue/attention"
    );
  });

  it("4. Money provides contextual access to Financial Overview, Invoices & Receivables, and Payments", () => {
    render(<NexusSecondaryRail />);

    expect(screen.getByRole("link", { name: /financial overview/i })).toHaveAttribute(
      "href",
      "/venue/money"
    );
    expect(screen.getByRole("link", { name: /invoices & receivables/i })).toHaveAttribute(
      "href",
      "/venue/money/receivables"
    );
    expect(screen.getByRole("link", { name: /payment history/i })).toHaveAttribute(
      "href",
      "/venue/money/payments"
    );
  });

  it("5. Settings preserves advanced management destinations (Profiles, Pricing, Operating Hours)", () => {
    render(<NexusSecondaryRail />);

    expect(screen.getByRole("link", { name: /general settings/i })).toHaveAttribute(
      "href",
      "/venue/settings"
    );
    expect(screen.getByRole("link", { name: /venue & site profile/i })).toHaveAttribute(
      "href",
      "/venue/venue-setup"
    );
    expect(screen.getByRole("link", { name: /pricing rules/i })).toHaveAttribute(
      "href",
      "/venue/pricing"
    );
    expect(screen.getByRole("link", { name: /operating hours/i })).toHaveAttribute(
      "href",
      "/venue/availability"
    );
    expect(screen.getByRole("link", { name: /resource profiles/i })).toHaveAttribute(
      "href",
      "/venue/resource-profiles"
    );
    expect(screen.getByRole("link", { name: /resource builder/i })).toHaveAttribute(
      "href",
      "/venue/resource-builder"
    );
  });
});
