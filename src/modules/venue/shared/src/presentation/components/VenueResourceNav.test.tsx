import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { usePathname } from "next/navigation";
import { VenueResourceNav } from "./VenueResourceNav";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "resourceProfile.nav.ariaLabel": "Resource configuration",
        "facility.title": "Facilities",
        "resourceProfile.title": "Resource Profiles",
        "schedulableResource.title": "Resource Builder",
      };
      return map[key] ?? key;
    },
  }),
}));

describe("VenueResourceNav", () => {
  it("renders all resource setup links and highlights active route", () => {
    vi.mocked(usePathname).mockReturnValue("/venue/facilities");

    render(<VenueResourceNav />);

    const nav = screen.getByRole("navigation", { name: "Resource configuration" });
    expect(nav).toBeInTheDocument();

    const facilitiesLink = screen.getByRole("link", { name: /facilities/i });
    const profilesLink = screen.getByRole("link", { name: /resource profiles/i });
    const builderLink = screen.getByRole("link", { name: /resource builder/i });

    expect(facilitiesLink).toHaveAttribute("href", "/venue/facilities");
    expect(profilesLink).toHaveAttribute("href", "/venue/resource-profiles");
    expect(builderLink).toHaveAttribute("href", "/venue/resource-builder");

    // Active link has shadow class
    expect(facilitiesLink.className).toContain("shadow-");
    expect(profilesLink.className).not.toContain("shadow-");
  });
});
