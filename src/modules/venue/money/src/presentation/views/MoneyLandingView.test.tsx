import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRouter } from "next/navigation";
import { usePermission } from "@core/hooks/use-permission";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { getVenueContainer } from "@modules/venue/di";
import { en } from "../../../locales/money.en";
import { MoneyLandingView } from "./MoneyLandingView";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn().mockReturnValue("/venue/money"),
}));

function resolveTranslation(key: string, params?: Record<string, string | number>): string {
  const parts = key.split(".");
  let current: unknown = en;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return `__MISSING__:${key}`;
    }
  }
  if (typeof current !== "string") {
    return `__MISSING__:${key}`;
  }
  if (!params) {
    return current;
  }
  return current
    .replace(/\{\{(\w+)\}\}/g, (match, paramKey) =>
      params[paramKey] !== undefined ? String(params[paramKey]) : match
    )
    .replace(/\{(\w+)\}/g, (match, paramKey) =>
      params[paramKey] !== undefined ? String(params[paramKey]) : match
    );
}

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) => resolveTranslation(key, params),
    language: "en",
    direction: "ltr",
  }),
}));

vi.mock("@core/hooks/use-module-locales", () => ({
  useModuleLocales: vi.fn(),
}));

vi.mock("@core/hooks/use-permission", () => ({
  usePermission: vi.fn(),
}));

vi.mock("@modules/venue/di", () => ({
  getVenueContainer: vi.fn(),
}));

function grantAllFinancePermissions() {
  vi.mocked(usePermission).mockImplementation((perm) => {
    if (perm === VENUE_PERMISSIONS.FINANCE_RECEIVABLES_VIEW) return true;
    if (perm === VENUE_PERMISSIONS.FINANCE_PAYMENTS_VIEW) return true;
    if (perm === VENUE_PERMISSIONS.FINANCE_PAYMENTS_CREATE) return true;
    if (perm === VENUE_PERMISSIONS.FINANCE_PAYMENT_ALLOCATIONS_UPDATE) return true;
    return false;
  });
}

function createMockMoneyRepo(overrides: Record<string, unknown> = {}) {
  return {
    getInvoices: vi.fn().mockResolvedValue({
      items: [
        {
          id: "inv-1",
          invoiceNumber: "INV-001",
          effectiveTotalAmount: 1000,
          outstandingAmount: 500,
          paidAmount: 500,
          currencyCode: "EGP",
          status: "Issued",
          reservationId: "res-001",
        },
        {
          id: "inv-2",
          invoiceNumber: "INV-002",
          effectiveTotalAmount: 800,
          outstandingAmount: 0,
          paidAmount: 800,
          currencyCode: "EGP",
          status: "Paid",
        },
      ],
      totalCount: 2,
    }),
    getPayments: vi.fn().mockResolvedValue({
      items: [
        {
          id: "pay-1",
          paymentNumber: "PAY-001",
          method: "Cash",
          amount: 500,
          currencyCode: "EGP",
          reservationId: "res-001",
          status: "Refunded",
          recordedAtUtc: "2026-10-01T12:00:00Z",
          unallocatedAmount: 0,
        },
        {
          id: "pay-2",
          paymentNumber: "PAY-002",
          method: "BankTransfer",
          amount: 300,
          currencyCode: "EGP",
          reservationId: null,
          status: "Recorded",
          recordedAtUtc: "2026-10-01T14:00:00Z",
          unallocatedAmount: 300,
        },
      ],
      totalCount: 2,
    }),
    getSummary: vi.fn().mockResolvedValue({
      items: [
        {
          currencyCode: "EGP",
          commercialValue: 1800,
          collected: 500,
          collectedToday: 500,
          outstanding: 500,
          refunds: 0,
          netCollected: 500,
          openReceivablesCount: 1,
          paymentsCount: 2,
          unallocatedPaymentsCount: 0,
          unallocatedPaymentsAmount: 0,
        },
      ],
      primary: {
        currencyCode: "EGP",
        commercialValue: 1800,
        collected: 500,
        collectedToday: 500,
        outstanding: 500,
        refunds: 0,
        netCollected: 500,
        openReceivablesCount: 1,
        paymentsCount: 2,
        unallocatedPaymentsCount: 0,
        unallocatedPaymentsAmount: 0,
      },
    }),
    getTrend: vi.fn().mockResolvedValue({
      buckets: [
        {
          bucketLabel: "2026-10-01",
          timestampUtc: "2026-10-01T00:00:00Z",
          commercialValue: 1800,
          collected: 500,
          refunds: 0,
          netCollected: 500,
          currencyCode: "EGP",
        },
      ],
    }),
    getByResource: vi.fn().mockResolvedValue([
      {
        resourceId: "court-1",
        commercialValue: 1800,
        collected: 500,
        outstanding: 500,
        invoiceCount: 1,
        paymentCount: 1,
        currencyCode: "EGP",
      },
    ]),
    getByTimeOfDay: vi.fn().mockResolvedValue([
      {
        timeWindow: "18:00 - 20:00",
        startHour: 18,
        endHour: 20,
        commercialValue: 1800,
        bookingCount: 1,
        currencyCode: "EGP",
      },
    ]),
    getPaymentMethods: vi.fn().mockResolvedValue([
      {
        method: "Cash",
        amount: 500,
        count: 1,
        percentage: 100,
        currencyCode: "EGP",
      },
    ]),
    ...overrides,
  };
}

describe("MoneyLandingView", () => {
  const replaceMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      replace: replaceMock,
    } as never);
  });

  it("1. Full access: renders refactored Money workspace sections with strict locale resolution", async () => {
    grantAllFinancePermissions();
    const mockMoneyRepo = createMockMoneyRepo();
    vi.mocked(getVenueContainer).mockReturnValue({
      moneyRepository: mockMoneyRepo,
    } as never);

    const { container } = render(<MoneyLandingView />);

    await waitFor(() => {
      expect(screen.getByTestId("venue-money-landing")).toBeInTheDocument();
    });

    // Strict localization check: no unresolved keys
    expect(container.textContent).not.toContain("__MISSING__:");

    // Header & nav
    expect(screen.getByText("Money & Commercials")).toBeInTheDocument();
    expect(screen.getAllByText("Receivables").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Manual payments").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("View Receivables")).toBeInTheDocument();
    expect(screen.getByText("View Payments")).toBeInTheDocument();
    expect(screen.getAllByText("Record Payment").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: "Refresh" })).toBeInTheDocument();

    // Filter pill styling check (This Month active by default)
    const thisMonthBtn = screen.getByRole("button", { name: "This Month" });
    expect(thisMonthBtn).toHaveAttribute("aria-pressed", "true");
    expect(thisMonthBtn.className).toContain("bg-nx-accent-wash");
    expect(thisMonthBtn.className).toContain("text-nx-accent");
    expect(thisMonthBtn.className).not.toContain("shadow-xs");

    // KPI strip
    expect(screen.getByText("Amount Due (Invoiced)")).toBeInTheDocument();
    expect(screen.getByText("Amount Collected")).toBeInTheDocument();
    expect(screen.getByText("Collected Today")).toBeInTheDocument();
    expect(screen.getByText("Outstanding Balance")).toBeInTheDocument();
    expect(screen.getByText("1 open receivables")).toBeInTheDocument();
    expect(screen.getByText("Refund Status")).toBeInTheDocument();
    expect(screen.getByText("Net Collected")).toBeInTheDocument();

    // Chart, Court performance, Time of day, Payment methods
    await waitFor(() => {
      expect(screen.getByText("Commercial Value vs Collected")).toBeInTheDocument();
      expect(screen.getByText("1 courts")).toBeInTheDocument();
      expect(screen.getByText("Court court-1")).toBeInTheDocument();
      expect(screen.getByText("1 invoices • 1 payments")).toBeInTheDocument();
      expect(screen.getByText("18:00 - 20:00")).toBeInTheDocument();
      expect(screen.getByText("1 bookings")).toBeInTheDocument();
      expect(screen.getByText("1 total payments")).toBeInTheDocument();
      expect(screen.getByText("1 transactions")).toBeInTheDocument();
    });

    // Tables (Outstanding Receivables & Recent Payments)
    expect(screen.getByText("1 active invoices with balances")).toBeInTheDocument();
    expect(screen.getByText("2 operational transactions")).toBeInTheDocument();
    expect(screen.getByText("INV-001")).toBeInTheDocument();
    expect(screen.getByText("Issued")).toBeInTheDocument();
    expect(screen.getByText("PAY-001")).toBeInTheDocument();
    expect(screen.getByText("Refunded")).toBeInTheDocument();
    expect(screen.getByText("PAY-002")).toBeInTheDocument();
    expect(screen.getByText("Unallocated")).toBeInTheDocument();
    expect(screen.getByTestId("receivable-booking-link-inv-1")).toHaveAttribute(
      "href",
      "/venue/bookings/res-001"
    );
    expect(screen.getByTestId("payment-booking-link-pay-1")).toHaveAttribute(
      "href",
      "/venue/bookings/res-001"
    );

    // Switch to Today filter to activate Today's Operational Shift Summary card
    fireEvent.click(screen.getByRole("button", { name: "Today" }));

    await waitFor(() => {
      expect(screen.getByTestId("today-shift-summary-card")).toBeInTheDocument();
      expect(screen.getByText("2 transactions today")).toBeInTheDocument();
    });

    expect(container.textContent).not.toContain("__MISSING__:");
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("2. Renders unallocated payments exception banner and summary retry state", async () => {
    grantAllFinancePermissions();
    const mockMoneyRepo = createMockMoneyRepo({
      getSummary: vi
        .fn()
        .mockRejectedValueOnce(new Error("Service unavailable"))
        .mockResolvedValueOnce({
          items: [],
          primary: {
            currencyCode: "EGP",
            commercialValue: 500,
            collected: 200,
            collectedToday: 200,
            outstanding: 300,
            refunds: 0,
            netCollected: 200,
            openReceivablesCount: 1,
            paymentsCount: 1,
            unallocatedPaymentsCount: 2,
            unallocatedPaymentsAmount: 200,
          },
        }),
    });
    vi.mocked(getVenueContainer).mockReturnValue({
      moneyRepository: mockMoneyRepo,
    } as never);

    render(<MoneyLandingView />);

    await waitFor(() => {
      expect(
        screen.getByText("The authoritative Finance service is temporarily unavailable.")
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(
        screen.getByText("2 unallocated payment(s) require reconciliation to invoice balance.")
      ).toBeInTheDocument();
    });
  });

  it("3. Renders clean empty states when analytics and tables have no records", async () => {
    grantAllFinancePermissions();
    const mockMoneyRepo = createMockMoneyRepo({
      getInvoices: vi.fn().mockResolvedValue({ items: [], totalCount: 0 }),
      getPayments: vi.fn().mockResolvedValue({ items: [], totalCount: 0 }),
      getTrend: vi.fn().mockResolvedValue({ buckets: [] }),
      getByResource: vi.fn().mockResolvedValue([]),
      getByTimeOfDay: vi.fn().mockResolvedValue([]),
      getPaymentMethods: vi.fn().mockResolvedValue([]),
    });
    vi.mocked(getVenueContainer).mockReturnValue({
      moneyRepository: mockMoneyRepo,
    } as never);

    const { container } = render(<MoneyLandingView />);

    await waitFor(() => {
      expect(screen.getByText("No financial activity recorded in this period.")).toBeInTheDocument();
    });
    expect(screen.getByText("No court activity recorded for this period.")).toBeInTheDocument();
    expect(screen.getByText("No booking activity recorded for this period.")).toBeInTheDocument();
    expect(screen.getByText("No payments recorded in this period.")).toBeInTheDocument();
    expect(screen.getByText("No outstanding balances found.")).toBeInTheDocument();
    expect(screen.getByText("No recent payments recorded.")).toBeInTheDocument();
    expect(container.textContent).not.toContain("__MISSING__:");
  });

  it("4. Receivables-only user: redirects directly to /venue/money/receivables", async () => {
    vi.mocked(usePermission).mockImplementation((perm) => {
      return perm === VENUE_PERMISSIONS.FINANCE_RECEIVABLES_VIEW;
    });

    render(<MoneyLandingView />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/venue/money/receivables");
    });
  });

  it("5. Payments-only user: redirects directly to /venue/money/payments", async () => {
    vi.mocked(usePermission).mockImplementation((perm) => {
      return perm === VENUE_PERMISSIONS.FINANCE_PAYMENTS_VIEW;
    });

    render(<MoneyLandingView />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/venue/money/payments");
    });
  });

  it("6. No finance permissions: shows access denied EmptyState and does not query finance data", () => {
    vi.mocked(usePermission).mockReturnValue(false);

    render(<MoneyLandingView />);

    expect(screen.getByTestId("venue-money-denied")).toBeInTheDocument();
    expect(screen.getByText("Finance access required")).toBeInTheDocument();
    expect(getVenueContainer).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
