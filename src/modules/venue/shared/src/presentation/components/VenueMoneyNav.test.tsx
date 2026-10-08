import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { usePathname } from "next/navigation";
import { VenueMoneyNav } from "./VenueMoneyNav";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "money.nav.ariaLabel": "Money operations",
        "money.receivables.title": "Receivables",
        "money.payments.title": "Manual Payments",
      };
      return map[key] ?? key;
    },
  }),
}));

describe("VenueMoneyNav", () => {
  it("renders receivables and payments links and highlights active route", () => {
    vi.mocked(usePathname).mockReturnValue("/venue/money/receivables");

    render(<VenueMoneyNav />);

    const nav = screen.getByRole("navigation", { name: "Money operations" });
    expect(nav).toBeInTheDocument();

    const receivablesLink = screen.getByRole("link", { name: /receivables/i });
    const paymentsLink = screen.getByRole("link", { name: /manual payments/i });

    expect(receivablesLink).toHaveAttribute("href", "/venue/money/receivables");
    expect(paymentsLink).toHaveAttribute("href", "/venue/money/payments");

    expect(receivablesLink.className).toContain("shadow-");
    expect(paymentsLink.className).not.toContain("shadow-");
  });
});
