import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePermission } from "@core/hooks/use-permission";
import { getVenueContainer } from "@modules/venue/di";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { en as moneyEn } from "../../../locales/money.en";
import type { MoneyInvoice } from "../../domain/entities/Money";
import { ReceivablesView } from "./ReceivablesView";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@core/hooks/use-module-locales", () => ({
  useModuleLocales: vi.fn(),
}));

vi.mock("@core/hooks/use-permission", () => ({
  usePermission: vi.fn(),
}));

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    hasPermission: () => true,
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    language: "en",
    direction: "ltr",
    t: (key: string, params?: Record<string, string | number>) => {
      const parts = key.split(".");
      let current: unknown = moneyEn;
      for (const part of parts) {
        if (current && typeof current === "object" && part in current) {
          current = (current as Record<string, unknown>)[part];
        } else {
          return key;
        }
      }
      if (typeof current !== "string") return key;
      if (!params) return current;
      return current
        .replace(/\{\{(\w+)\}\}/g, (_, k) => (k in params ? String(params[k]) : `{{${k}}}`))
        .replace(/\{(\w+)\}/g, (_, k) => (k in params ? String(params[k]) : `{${k}}`));
    },
  }),
}));

vi.mock("@modules/venue", () => ({
  VenueMoneyNav: () => <nav data-testid="venue-money-nav" />,
}));

vi.mock("@modules/venue/di", () => ({
  getVenueContainer: vi.fn(),
}));

function makeInvoice(overrides: Partial<MoneyInvoice> = {}): MoneyInvoice {
  return {
    id: "inv-1",
    invoiceNumber: "INV-2026-001",
    status: "Issued",
    currencyCode: "EGP",
    payerPartyId: "payer-ahly-01",
    reservationId: "res-101",
    schedulableResourceId: null,
    totalAmount: 1000,
    creditAmount: 0,
    adjustmentAmount: 0,
    effectiveTotalAmount: 1000,
    paidAmount: 250,
    outstandingAmount: 750,
    issuedAtUtc: "2026-10-01T10:00:00Z",
    dueAtUtc: "2026-10-15T10:00:00Z",
    ...overrides,
  };
}

describe("ReceivablesView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders permission denied state when user cannot view receivables", () => {
    vi.mocked(usePermission).mockReturnValue(false);
    vi.mocked(getVenueContainer).mockReturnValue({
      moneyRepository: { getInvoices: vi.fn() },
    } as never);

    render(<ReceivablesView />);

    expect(screen.getByTestId("venue-receivables-denied")).toBeInTheDocument();
    expect(screen.getByText("Finance access required")).toBeInTheDocument();
  });

  it("renders error state on initial load failure and retries cleanly", async () => {
    vi.mocked(usePermission).mockReturnValue(true);
    const getInvoices = vi
      .fn()
      .mockRejectedValueOnce(new Error("Finance timeout"))
      .mockResolvedValueOnce({ items: [makeInvoice()], totalCount: 1 });
    vi.mocked(getVenueContainer).mockReturnValue({
      moneyRepository: { getInvoices },
    } as never);

    render(<ReceivablesView />);

    await waitFor(() => {
      expect(screen.getByTestId("venue-receivables-error")).toBeInTheDocument();
    });
    expect(screen.getByText("Finance timeout")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(screen.getByTestId("venue-receivables")).toBeInTheDocument();
    });
    expect(getInvoices).toHaveBeenCalledTimes(2);
    expect(screen.getAllByText("INV-2026-001").length).toBeGreaterThanOrEqual(1);
  });

  it("renders currency-isolated summaries, supports GenericCrudView view switching, and filters cleanly", async () => {
    vi.mocked(usePermission).mockReturnValue(true);
    const invoices = [
      makeInvoice({
        id: "inv-1",
        invoiceNumber: "INV-EGP-1",
        currencyCode: "EGP",
        payerPartyId: "alpha-fc",
        status: "PartiallyPaid",
        effectiveTotalAmount: 1000,
        paidAmount: 250,
        outstandingAmount: 750,
      }),
      makeInvoice({
        id: "inv-2",
        invoiceNumber: "INV-USD-2",
        currencyCode: "USD",
        payerPartyId: "beta-sc",
        reservationId: null,
        status: "Paid",
        effectiveTotalAmount: 500,
        paidAmount: 500,
        outstandingAmount: 0,
      }),
    ];
    vi.mocked(getVenueContainer).mockReturnValue({
      moneyRepository: {
        getInvoices: vi.fn().mockResolvedValue({ items: invoices, totalCount: 2 }),
      },
    } as never);

    render(<ReceivablesView />);

    await waitFor(() => {
      expect(screen.getAllByText("INV-EGP-1").length).toBeGreaterThanOrEqual(1);
    });

    // Multi-currency isolated cards
    expect(screen.getAllByText("EGP").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("USD").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("All 2 records loaded")).toBeInTheDocument();

    // Status filter pills
    fireEvent.click(screen.getByRole("button", { name: "Paid" }));
    expect(screen.queryByText("INV-EGP-1")).not.toBeInTheDocument();
    expect(screen.getAllByText("INV-USD-2").length).toBeGreaterThanOrEqual(1);

    // Reset back to all and test search empty state + reset button
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getAllByText("INV-EGP-1").length).toBeGreaterThanOrEqual(1);

    const searchInput = screen.getByPlaceholderText("Search by invoice # or customer...");
    fireEvent.change(searchInput, { target: { value: "does-not-exist" } });
    expect(screen.getAllByText("No receivables match your filters").length).toBeGreaterThanOrEqual(
      1
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Reset Filters" })[0]);
    expect(screen.getAllByText("INV-EGP-1").length).toBeGreaterThanOrEqual(1);

    // Switch GenericCrudView to CardGrid and verify Due formatting + Card content
    fireEvent.click(screen.getByTestId("toggle-cardgrid-view"));
    expect(screen.getAllByText("INV-EGP-1").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Payer: alpha-fc").length).toBeGreaterThanOrEqual(1);

    // Switch GenericCrudView to SplitPane
    fireEvent.click(screen.getByTestId("toggle-splitpane-view"));
    expect(screen.getAllByText("INV-EGP-1").length).toBeGreaterThanOrEqual(1);
  });

  it("hides Record Payment CTA when payment creation permission is missing", async () => {
    vi.mocked(usePermission).mockImplementation(
      (perm) => perm === VENUE_PERMISSIONS.FINANCE_RECEIVABLES_VIEW
    );
    vi.mocked(getVenueContainer).mockReturnValue({
      moneyRepository: {
        getInvoices: vi.fn().mockResolvedValue({ items: [makeInvoice()], totalCount: 1 }),
      },
    } as never);

    render(<ReceivablesView />);

    await waitFor(() => {
      expect(screen.getAllByText("INV-2026-001").length).toBeGreaterThanOrEqual(1);
    });

    expect(screen.queryByRole("link", { name: "Record payment" })).not.toBeInTheDocument();
  });
});
