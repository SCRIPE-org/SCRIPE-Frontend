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

describe("NexusSecondaryRail — Authoritative 5-Group Venue Workspace Navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Renders the authoritative 5 groups matching VenueMenuProvider.cs", () => {
    render(<NexusSecondaryRail />);

    // Verify header title
    expect(screen.getByText("Venue Operations")).toBeInTheDocument();

    // Verify all 5 group section headings exist
    expect(screen.getByText(/operations & bookings/i)).toBeInTheDocument();
    expect(screen.getByText(/courts & facilities/i)).toBeInTheDocument();
    expect(screen.getByText(/commercial & rates/i)).toBeInTheDocument();
    expect(screen.getByText(/analytics & reports/i)).toBeInTheDocument();
    expect(screen.getByText(/settings & setup/i)).toBeInTheDocument();
  });

  it("2. Operations & Bookings group provides access to all 5 operational routes", () => {
    render(<NexusSecondaryRail />);

    expect(screen.getByRole("link", { name: /operations dashboard/i })).toHaveAttribute("href", "/venue");
    expect(screen.getByRole("link", { name: /calendar grid/i })).toHaveAttribute("href", "/venue/calendar");
    expect(screen.getByRole("link", { name: /new booking/i })).toHaveAttribute("href", "/venue/bookings/new");
    expect(screen.getByRole("link", { name: /attention queue/i })).toHaveAttribute("href", "/venue/attention");
    expect(screen.getByRole("link", { name: /customers & guests/i })).toHaveAttribute("href", "/venue/customers");
  });

  it("3. Courts & Facilities group provides access to all 5 spaces routes", () => {
    render(<NexusSecondaryRail />);

    expect(screen.getByRole("link", { name: /courts & spaces/i })).toHaveAttribute("href", "/venue/resources");
    expect(screen.getByRole("link", { name: /facilities & complexes/i })).toHaveAttribute("href", "/venue/facilities");
    expect(screen.getByRole("link", { name: /operating hours & schedules/i })).toHaveAttribute("href", "/venue/availability");
    expect(screen.getByRole("link", { name: /resource profiles/i })).toHaveAttribute("href", "/venue/resource-profiles");
    expect(screen.getByRole("link", { name: /resource builder/i })).toHaveAttribute("href", "/venue/resource-builder");
  });

  it("4. Commercial & Rates group provides access to all 4 financial routes", () => {
    render(<NexusSecondaryRail />);

    expect(screen.getByRole("link", { name: /financial overview/i })).toHaveAttribute("href", "/venue/money");
    expect(screen.getByRole("link", { name: /invoices & receivables/i })).toHaveAttribute("href", "/venue/money/receivables");
    expect(screen.getByRole("link", { name: /payment history/i })).toHaveAttribute("href", "/venue/money/payments");
    expect(screen.getByRole("link", { name: /pricing & rates/i })).toHaveAttribute("href", "/venue/pricing");
  });

  it("5. Analytics & Reports group provides access to reports", () => {
    render(<NexusSecondaryRail />);

    expect(screen.getByRole("link", { name: /reports & analytics/i })).toHaveAttribute("href", "/venue/reports");
  });

  it("6. Settings & Setup group provides access to all 3 setup routes", () => {
    render(<NexusSecondaryRail />);

    expect(screen.getByRole("link", { name: /venue & site profile/i })).toHaveAttribute("href", "/venue/venue-setup");
    expect(screen.getByRole("link", { name: /sites & campuses/i })).toHaveAttribute("href", "/venue/sites");
    expect(screen.getByRole("link", { name: /venue settings/i })).toHaveAttribute("href", "/venue/settings");
  });
});
