import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePathname } from "next/navigation";
import { usePermission } from "@core/hooks/use-permission";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { VenueShell } from "./VenueShell";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

vi.mock("@core/hooks/use-permission", () => ({
  usePermission: vi.fn(),
}));

const mockSetLanguage = vi.fn();
let mockLang = "en";
let mockDir = "ltr";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, opts?: { defaultValue?: string }) => {
      const map: Record<string, string> = {
        "venueNav.dashboard": "Dashboard",
        "venueNav.calendar": "Calendar",
        "venueNav.resources": "Courts & Spaces",
        "venueNav.money": "Money",
        "venueNav.customers": "Customers",
        "venueNav.team": "Team",
        "venueNav.reports": "Reports",
        "venueNav.settings": "Settings",
      };
      return map[key] ?? opts?.defaultValue ?? key;
    },
    language: mockLang,
    direction: mockDir,
    setLanguage: mockSetLanguage,
  }),
}));

vi.mock("@core/store/useAppStore", () => ({
  useAppStore: (selector: any) =>
    selector({
      user: { firstName: "Ahmed", username: "ahmed@example.com" },
    }),
}));

describe("VenueShell — Gate 1 Navigation & Shell", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    vi.clearAllMocks();
    store.clear();
    localStorage.getItem = (key: string) => store.get(key) ?? null;
    localStorage.setItem = (key: string, val: string) => {
      store.set(key, String(val));
    };
    localStorage.clear = () => store.clear();
    mockLang = "en";
    mockDir = "ltr";
  });

  it("1. Dominant primary navigation: renders Dashboard, Calendar, Courts & Spaces, Money, and Reports for full manager", () => {
    vi.mocked(usePathname).mockReturnValue("/venue");
    vi.mocked(usePermission).mockImplementation((perm) => {
      if (perm === VENUE_PERMISSIONS.FINANCE_RECEIVABLES_VIEW) return true;
      if (perm === VENUE_PERMISSIONS.FINANCE_PAYMENTS_VIEW) return true;
      if (perm === VENUE_PERMISSIONS.FACILITY_VIEW) return true;
      return false;
    });

    render(
      <VenueShell>
        <div>Page Content</div>
      </VenueShell>
    );

    // Primary 5 dominant items
    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute("href", "/venue");
    expect(screen.getByRole("link", { name: /calendar/i })).toHaveAttribute("href", "/venue/calendar");
    expect(screen.getByRole("link", { name: /courts & spaces/i })).toHaveAttribute("href", "/venue/resources");
    expect(screen.getByRole("link", { name: /money/i })).toHaveAttribute("href", "/venue/money");
    expect(screen.getByRole("link", { name: /reports/i })).toHaveAttribute("href", "/venue/reports");

    // Client-safe Settings entry
    expect(screen.getByRole("link", { name: /settings/i })).toHaveAttribute("href", "/venue/settings");

    // No technical configurations in primary navigation
    expect(screen.queryByText("Resource Profile")).not.toBeInTheDocument();
    expect(screen.queryByText("Schedulable Resource")).not.toBeInTheDocument();
    expect(screen.queryByText("Facility Resource Profile")).not.toBeInTheDocument();
  });

  it("2. Restricted operator: Money is omitted when user has no finance permissions", () => {
    vi.mocked(usePathname).mockReturnValue("/venue");
    vi.mocked(usePermission).mockImplementation((perm) => {
      // Operator has reservations permissions only
      return perm === VENUE_PERMISSIONS.RESERVATION_VIEW;
    });

    render(
      <VenueShell>
        <div>Restricted Content</div>
      </VenueShell>
    );

    // Dominant core remains
    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /calendar/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /courts & spaces/i })).toBeInTheDocument();

    // Money is completely hidden
    expect(screen.queryByRole("link", { name: /money/i })).not.toBeInTheDocument();
  });

  it("3. Receivables-only operator: Money points directly to receivables", () => {
    vi.mocked(usePathname).mockReturnValue("/venue");
    vi.mocked(usePermission).mockImplementation((perm) => {
      return perm === VENUE_PERMISSIONS.FINANCE_RECEIVABLES_VIEW;
    });

    render(
      <VenueShell>
        <div>Content</div>
      </VenueShell>
    );

    const moneyLink = screen.getByRole("link", { name: /money/i });
    expect(moneyLink).toHaveAttribute("href", "/venue/money/receivables");
  });

  it("4. Solo owner mode ('Just me'): Team is hidden to prevent unnecessary complexity", () => {
    vi.mocked(usePathname).mockReturnValue("/venue");
    store.set("scripe_venue_management_mode", "solo");
    localStorage.setItem("scripe_venue_management_mode", "solo");
    vi.mocked(usePermission).mockImplementation((perm) => {
      if (perm === VENUE_PERMISSIONS.TEAM_VIEW) return true;
      return false;
    });

    render(
      <VenueShell>
        <div>Content</div>
      </VenueShell>
    );

    // Team must NOT appear in solo owner mode
    expect(screen.queryByRole("link", { name: /team/i })).not.toBeInTheDocument();
  });

  it("5. Team venue mode ('Me and my team'): Team appears when user has backend permission", () => {
    vi.mocked(usePathname).mockReturnValue("/venue");
    store.set("scripe_venue_management_mode", "team");
    localStorage.setItem("scripe_venue_management_mode", "team");
    vi.mocked(usePermission).mockImplementation((perm) => {
      if (perm === VENUE_PERMISSIONS.TEAM_VIEW) return true;
      return false;
    });

    render(
      <VenueShell>
        <div>Content</div>
      </VenueShell>
    );

    const teamLink = screen.getByRole("link", { name: /team/i });
    expect(teamLink).toBeInTheDocument();
    expect(teamLink).toHaveAttribute("href", "/admins");
  });

  it("6. Restricted operator without admins permission: Team is never shown even in team mode", () => {
    vi.mocked(usePathname).mockReturnValue("/venue");
    store.set("scripe_venue_management_mode", "team");
    localStorage.setItem("scripe_venue_management_mode", "team");
    vi.mocked(usePermission).mockReturnValue(false); // No admin permission

    render(
      <VenueShell>
        <div>Content</div>
      </VenueShell>
    );

    expect(screen.queryByRole("link", { name: /team/i })).not.toBeInTheDocument();
  });

  it("7. Customers link appears only when user has customer permission", () => {
    vi.mocked(usePathname).mockReturnValue("/venue");
    vi.mocked(usePermission).mockImplementation((perm) => {
      return perm === VENUE_PERMISSIONS.CUSTOMER_PARTY_VIEW;
    });

    render(
      <VenueShell>
        <div>Content</div>
      </VenueShell>
    );

    const customersLink = screen.getByRole("link", { name: /customers/i });
    expect(customersLink).toBeInTheDocument();
    expect(customersLink).toHaveAttribute("href", "/venue/customers");
  });

  it("8. Mobile Drawer: Hamburger button opens navigation drawer dialog and close button closes it", () => {
    vi.mocked(usePathname).mockReturnValue("/venue");
    vi.mocked(usePermission).mockReturnValue(true);

    render(
      <VenueShell>
        <div>Content</div>
      </VenueShell>
    );

    const hamburger = screen.getByRole("button", { name: /open mobile menu/i });
    expect(hamburger).toBeInTheDocument();

    // Click hamburger to open drawer
    fireEvent.click(hamburger);

    const drawer = screen.getByRole("dialog");
    expect(drawer).toBeInTheDocument();

    // Close drawer
    const closeBtn = screen.getByRole("button", { name: /close menu/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("9. Locale switch: toggles between EN and AR", () => {
    vi.mocked(usePathname).mockReturnValue("/venue");
    vi.mocked(usePermission).mockReturnValue(true);

    render(
      <VenueShell>
        <div>Content</div>
      </VenueShell>
    );

    const arButton = screen.getByRole("button", { name: "AR" });
    fireEvent.click(arButton);
    expect(mockSetLanguage).toHaveBeenCalledWith("ar");

    const enButton = screen.getByRole("button", { name: "EN" });
    fireEvent.click(enButton);
    expect(mockSetLanguage).toHaveBeenCalledWith("en");
  });

  it("10. RTL layout: applies rtl dir and classes when language is Arabic", () => {
    vi.mocked(usePathname).mockReturnValue("/venue");
    vi.mocked(usePermission).mockReturnValue(true);
    mockLang = "ar";
    mockDir = "rtl";

    render(
      <VenueShell>
        <div>Content</div>
      </VenueShell>
    );

    const shell = screen.getByTestId("venue-shell");
    expect(shell).toHaveAttribute("dir", "rtl");
    expect(shell.className).toContain("rtl");
  });
});
