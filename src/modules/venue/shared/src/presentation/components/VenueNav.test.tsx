import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePathname } from "next/navigation";
import { usePermission } from "@core/hooks/use-permission";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { VenueNav } from "./VenueNav";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

vi.mock("@core/hooks/use-permission", () => ({
  usePermission: vi.fn(),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, opts?: { defaultValue?: string }) => {
      const map: Record<string, string> = {
        "venueNav.resources": "Courts & Spaces",
        "venueNav.allResources": "Courts & Spaces",
        "venueNav.addCourt": "+ Add Court / Space",
        "venueNav.advancedSetup": "Settings",
        "venueNav.money": "Money",
        "venueNav.receivables": "Receivables",
        "venueNav.payments": "Payments",
        "venueNav.calendar": "Calendar",
        "venueNav.dashboard": "Dashboard",
      };
      return map[key] ?? opts?.defaultValue ?? key;
    },
    language: "en",
  }),
}));

describe("VenueNav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Full Finance access: Money points to /venue/money and Resources shows Courts & Spaces", () => {
    vi.mocked(usePathname).mockReturnValue("/venue/resources");
    vi.mocked(usePermission).mockImplementation((perm) => {
      if (perm === VENUE_PERMISSIONS.FINANCE_RECEIVABLES_VIEW) return true;
      if (perm === VENUE_PERMISSIONS.FINANCE_PAYMENTS_VIEW) return true;
      return false;
    });

    render(<VenueNav />);

    const moneyLink = screen.getByRole("link", { name: /money/i });
    expect(moneyLink).toHaveAttribute("href", "/venue/money");

    const resourcesLinks = screen.getAllByRole("link", { name: /courts & spaces/i });
    expect(resourcesLinks.length).toBeGreaterThanOrEqual(1);
    expect(resourcesLinks[0]).toHaveAttribute("href", "/venue/resources");

    const addCourtLink = screen.getByRole("link", { name: /\+ add court \/ space/i });
    expect(addCourtLink).toHaveAttribute("href", "/venue/resources?setup=new");

    const settingsLink = screen.getByRole("link", { name: /settings/i });
    expect(settingsLink).toHaveAttribute("href", "/venue/settings");
  });

  it("2. Receivables-only user: Money points directly to /venue/money/receivables", () => {
    vi.mocked(usePathname).mockReturnValue("/venue");
    vi.mocked(usePermission).mockImplementation((perm) => {
      return perm === VENUE_PERMISSIONS.FINANCE_RECEIVABLES_VIEW;
    });

    render(<VenueNav />);

    const moneyLink = screen.getByRole("link", { name: /money/i });
    expect(moneyLink).toHaveAttribute("href", "/venue/money/receivables");
  });

  it("3. Payments-only user: Money points directly to /venue/money/payments", () => {
    vi.mocked(usePathname).mockReturnValue("/venue");
    vi.mocked(usePermission).mockImplementation((perm) => {
      return perm === VENUE_PERMISSIONS.FINANCE_PAYMENTS_VIEW;
    });

    render(<VenueNav />);

    const moneyLink = screen.getByRole("link", { name: /money/i });
    expect(moneyLink).toHaveAttribute("href", "/venue/money/payments");
  });

  it("4. No Finance permissions: Money link is omitted and hidden", () => {
    vi.mocked(usePathname).mockReturnValue("/venue");
    vi.mocked(usePermission).mockReturnValue(false);

    render(<VenueNav />);

    expect(screen.queryByRole("link", { name: /money/i })).not.toBeInTheDocument();
  });

  it("5. reservations.view does not grant Finance visibility", () => {
    vi.mocked(usePathname).mockReturnValue("/venue");
    vi.mocked(usePermission).mockImplementation((perm) => {
      // Operator has reservations permissions only
      return perm === VENUE_PERMISSIONS.RESERVATION_VIEW;
    });

    render(<VenueNav />);

    expect(screen.queryByRole("link", { name: /money/i })).not.toBeInTheDocument();
  });
});
