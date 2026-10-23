import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NexusSecondaryRail } from "./nexus-secondary-rail";
import { MenuItem } from "@core/navigation/domain/entities/MenuItem";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/venue/resources",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

const mockActiveWorkspace = {
  workspaceKey: "venue",
  workspaceNameEn: "Venue",
  workspaceNameAr: "المنشآت والملاعب",
  getLocalizedName: (lang: string) => (lang === "ar" ? "المنشآت والملاعب" : "Venue"),
};

const makeMockItem = (
  id: string,
  nameEn: string,
  href: string,
  children: MenuItem[] = []
): MenuItem =>
  new MenuItem({
    id,
    slug: id,
    name: nameEn,
    nameEn,
    nameAr: nameEn,
    href,
    icon: "LayoutGrid",
    order: 0,
    resource: null,
    actions: null,
    children,
  });

const operationsGroup = makeMockItem("venue-group-operations", "Operations & Bookings", "", [
  makeMockItem("venue-dashboard", "Operations Dashboard", "/venue"),
  makeMockItem("venue-calendar", "Calendar Grid", "/venue/calendar"),
  makeMockItem("venue-booking-create", "New Booking", "/venue/bookings/new"),
  makeMockItem("venue-attention", "Attention Queue", "/venue/attention"),
  makeMockItem("venue-customers", "Customers & Guests", "/venue/customers"),
]);

const spacesGroup = makeMockItem("venue-group-spaces", "Courts & Facilities", "", [
  makeMockItem("venue-resources", "Courts & Spaces", "/venue/resources"),
  makeMockItem("venue-facilities", "Facilities & Complexes", "/venue/facilities"),
  makeMockItem("venue-availability", "Operating Hours & Schedules", "/venue/availability"),
  makeMockItem("venue-resource-profiles", "Resource Profiles", "/venue/resource-profiles"),
  makeMockItem("venue-resource-builder", "Resource Builder", "/venue/resource-builder"),
]);

const mockRootMenuItems = [operationsGroup, spacesGroup];

let mockActiveRootItem: MenuItem | null = spacesGroup;

vi.mock("@core/providers/workspace-provider", () => ({
  useWorkspace: () => ({
    activeWorkspace: mockActiveWorkspace,
    activeRootItem: mockActiveRootItem,
    isModuleMode: true,
    rootMenuItems: mockRootMenuItems,
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
    canAccessPage: () => true,
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

describe("NexusSecondaryRail — Generic Multi-Group Workspace Secondary Rail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveRootItem = spacesGroup;
  });

  it("1. Displays the active root group title and context label", () => {
    render(<NexusSecondaryRail />);

    expect(screen.getByText("Courts & Facilities")).toBeInTheDocument();
    expect(screen.getByText(/venue/i)).toBeInTheDocument();
  });

  it("2. Displays children of active group with proper links", () => {
    render(<NexusSecondaryRail />);

    expect(screen.getByRole("link", { name: /courts & spaces/i })).toHaveAttribute("href", "/venue/resources");
    expect(screen.getByRole("link", { name: /facilities & complexes/i })).toHaveAttribute("href", "/venue/facilities");
    expect(screen.getByRole("link", { name: /operating hours & schedules/i })).toHaveAttribute("href", "/venue/availability");
    expect(screen.getByRole("link", { name: /resource profiles/i })).toHaveAttribute("href", "/venue/resource-profiles");
    expect(screen.getByRole("link", { name: /resource builder/i })).toHaveAttribute("href", "/venue/resource-builder");
  });

  it("3. Displays Operations & Bookings children when active root item switches", () => {
    mockActiveRootItem = operationsGroup;
    render(<NexusSecondaryRail />);

    expect(screen.getByText("Operations & Bookings")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /operations dashboard/i })).toHaveAttribute("href", "/venue");
    expect(screen.getByRole("link", { name: /calendar grid/i })).toHaveAttribute("href", "/venue/calendar");
    expect(screen.getByRole("link", { name: /new booking/i })).toHaveAttribute("href", "/venue/bookings/new");
  });
});
