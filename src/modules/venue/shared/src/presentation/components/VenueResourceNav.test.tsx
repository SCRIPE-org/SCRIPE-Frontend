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
        "resources.title": "Courts & Spaces",
        "facility.title": "Branches & Facilities",
        "venueSettings.title": "Settings & Profile",
      };
      return map[key] ?? key;
    },
  }),
}));

describe("VenueResourceNav", () => {
  it("renders consolidated resource setup links and highlights active route", () => {
    vi.mocked(usePathname).mockReturnValue("/venue/facilities");

    render(<VenueResourceNav />);

    const nav = screen.getByRole("navigation", { name: /location and resource/i });
    expect(nav).toBeInTheDocument();

    const resourcesLink = screen.getByRole("link", { name: /courts & spaces/i });
    const facilitiesLink = screen.getByRole("link", { name: /branches & facilities/i });
    const settingsLink = screen.getByRole("link", { name: /settings & profile/i });

    expect(resourcesLink).toHaveAttribute("href", "/venue/resources");
    expect(facilitiesLink).toHaveAttribute("href", "/venue/facilities");
    expect(settingsLink).toHaveAttribute("href", "/venue/settings");

    // Active link has shadow class
    expect(facilitiesLink.className).toContain("shadow-");
    expect(resourcesLink.className).not.toContain("shadow-");
  });
});
