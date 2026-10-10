import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VenueReportsView } from "./VenueReportsView";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? key,
    language: "en",
    direction: "ltr",
  }),
}));

vi.mock("@core/hooks/use-permission", () => ({
  usePermission: vi.fn().mockReturnValue(true),
}));

describe("VenueReportsView", () => {
  it("renders truthful reports placeholder with status message and non-dead-end quick links", () => {
    render(<VenueReportsView />);

    expect(screen.getByTestId("venue-reports-view")).toBeInTheDocument();
    expect(screen.getByText("Reports & Analytics")).toBeInTheDocument();
    expect(screen.getByText("Reporting tools are being configured")).toBeInTheDocument();

    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute("href", "/venue");

    const moneyLink = screen.getByRole("link", { name: /money workspace/i });
    expect(moneyLink).toHaveAttribute("href", "/venue/money");
  });
});
