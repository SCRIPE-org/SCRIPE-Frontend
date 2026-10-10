import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { VenueSettingsView } from "./VenueSettingsView";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";

const mockSetLanguage = vi.fn();

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? key,
    language: "en",
    setLanguage: mockSetLanguage,
    direction: "ltr",
  }),
}));

vi.mock("@core/hooks/use-permission", () => ({
  usePermission: vi.fn().mockImplementation((perm) => {
    if (perm === VENUE_PERMISSIONS.TEAM_VIEW) return true;
    if (perm === VENUE_PERMISSIONS.FACILITY_VIEW) return true;
    return false;
  }),
}));

vi.mock("@core/store/useAppStore", () => ({
  useAppStore: (selector: any) =>
    selector({
      user: { tenantId: "tenant-1", firstName: "Ahmed" },
    }),
}));

vi.mock("@modules/venue/di", () => ({
  getVenueContainer: () => ({
    facilityRepository: {
      getAll: vi.fn().mockResolvedValue({
        items: [{ id: "fac-1", name: "Nasr City Club", timeZoneId: "Africa/Cairo" }],
      }),
    },
  }),
}));

describe("VenueSettingsView", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    vi.clearAllMocks();
    store.clear();
    localStorage.getItem = (key: string) => store.get(key) ?? null;
    localStorage.setItem = (key: string, val: string) => {
      store.set(key, String(val));
    };
    localStorage.clear = () => store.clear();
  });

  it("renders settings header and default Branch tab with operating branch details", () => {
    render(<VenueSettingsView />);

    expect(screen.getByTestId("venue-settings-view")).toBeInTheDocument();
    expect(screen.getByText("Venue Settings")).toBeInTheDocument();
    expect(screen.getByText("Branch & Venue")).toBeInTheDocument();
    expect(screen.getByText("Operating Branch Details")).toBeInTheDocument();
  });

  it("allows switching management mode between solo and team and stores in localStorage", () => {
    render(<VenueSettingsView />);

    // Switch to Team & Access tab using mouseDown for Radix Tabs
    const teamTab = screen.getByRole("tab", { name: /team & access/i });
    fireEvent.mouseDown(teamTab);

    // Switch to team mode
    const teamModeBtn = screen.getByRole("button", { name: /me and my team/i });
    fireEvent.click(teamModeBtn);

    expect(localStorage.getItem("scripe_venue_management_mode")).toBe("team");
    expect(screen.getByRole("link", { name: /open team management/i })).toHaveAttribute("href", "/admins");
  });

  it("exposes advanced technical registries under Advanced tab via progressive disclosure", () => {
    render(<VenueSettingsView />);

    // Switch to Advanced tab using mouseDown for Radix Tabs
    const advancedTab = screen.getByRole("tab", { name: /advanced/i });
    fireEvent.mouseDown(advancedTab);

    expect(screen.getByText("Advanced Administrative Configuration")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /branch & facility registry/i })).toHaveAttribute("href", "/venue/facilities");
    expect(screen.getByRole("link", { name: /operating hours & matrix/i })).toHaveAttribute("href", "/venue/availability");
    expect(screen.getByRole("link", { name: /sites & campuses/i })).toHaveAttribute("href", "/venue/sites");
    expect(screen.getByRole("link", { name: /commercial pricing catalog/i })).toHaveAttribute("href", "/venue/pricing");
    expect(screen.getByRole("link", { name: /resource builder/i })).toHaveAttribute("href", "/venue/resource-builder");
    expect(screen.getByRole("link", { name: /resource profiles/i })).toHaveAttribute("href", "/venue/resource-profiles");
  });
});
