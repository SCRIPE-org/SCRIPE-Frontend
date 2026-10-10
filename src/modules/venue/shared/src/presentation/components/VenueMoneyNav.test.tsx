import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePathname } from "next/navigation";
import { usePermission } from "@core/hooks/use-permission";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { VenueMoneyNav } from "./VenueMoneyNav";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

vi.mock("@core/hooks/use-permission", () => ({
  usePermission: vi.fn(),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "money.nav.ariaLabel": "Money operations",
        "money.nav.overview": "Overview",
        "money.receivables.title": "Receivables",
        "money.payments.title": "Payments",
      };
      return map[key] ?? key;
    },
  }),
}));

describe("VenueMoneyNav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders receivables and payments links and highlights active route when user has full access", () => {
    vi.mocked(usePathname).mockReturnValue("/venue/money/receivables");
    vi.mocked(usePermission).mockReturnValue(true);

    render(<VenueMoneyNav />);

    const nav = screen.getByRole("navigation", { name: "Money operations" });
    expect(nav).toBeInTheDocument();

    const receivablesLink = screen.getByRole("link", { name: /receivables/i });
    const paymentsLink = screen.getByRole("link", { name: /payments/i });

    expect(receivablesLink).toHaveAttribute("href", "/venue/money/receivables");
    expect(paymentsLink).toHaveAttribute("href", "/venue/money/payments");

    expect(receivablesLink.className).toContain("shadow-");
    expect(paymentsLink.className).not.toContain("shadow-");
  });

  it("renders only receivables link when user only has receivables view permission", () => {
    vi.mocked(usePathname).mockReturnValue("/venue/money/receivables");
    vi.mocked(usePermission).mockImplementation((perm) => {
      return perm === VENUE_PERMISSIONS.FINANCE_RECEIVABLES_VIEW;
    });

    render(<VenueMoneyNav />);

    expect(screen.getByRole("link", { name: /receivables/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^payments$/i })).not.toBeInTheDocument();
  });

  it("renders only payments link when user only has payments view permission", () => {
    vi.mocked(usePathname).mockReturnValue("/venue/money/payments");
    vi.mocked(usePermission).mockImplementation((perm) => {
      return perm === VENUE_PERMISSIONS.FINANCE_PAYMENTS_VIEW;
    });

    render(<VenueMoneyNav />);

    expect(screen.queryByRole("link", { name: /receivables/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /payments/i })).toBeInTheDocument();
  });
});
