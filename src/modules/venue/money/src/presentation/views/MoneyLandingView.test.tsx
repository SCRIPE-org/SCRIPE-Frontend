import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRouter } from "next/navigation";
import { usePermission } from "@core/hooks/use-permission";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { getVenueContainer } from "@modules/venue/di";
import { MoneyLandingView } from "./MoneyLandingView";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn().mockReturnValue("/venue/money"),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, opts?: { defaultValue?: string }) => {
      const map: Record<string, string> = {
        "money.landing.title": "Money & Commercials",
        "money.receivables.title": "Receivables",
        "money.payments.title": "Payments",
        "money.permission.title": "Finance access required",
        "money.permission.description": "You do not have permission to view Venue financial records.",
        "money.landing.viewReceivables": "View Receivables",
        "money.landing.viewPayments": "View Payments",
        "money.landing.recordPayment": "Record Payment",
      };
      return map[key] ?? opts?.defaultValue ?? key;
    },
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

describe("MoneyLandingView", () => {
  const replaceMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      replace: replaceMock,
    } as never);
  });

  it("1. Full access: renders Money workspace landing with Receivables and Payments entries and metrics", async () => {
    // Both permissions granted
    vi.mocked(usePermission).mockImplementation((perm) => {
      if (perm === VENUE_PERMISSIONS.FINANCE_RECEIVABLES_VIEW) return true;
      if (perm === VENUE_PERMISSIONS.FINANCE_PAYMENTS_VIEW) return true;
      if (perm === VENUE_PERMISSIONS.FINANCE_PAYMENTS_CREATE) return true;
      if (perm === VENUE_PERMISSIONS.FINANCE_PAYMENT_ALLOCATIONS_UPDATE) return true;
      return false;
    });

    const mockInvoices = {
      items: [
        { id: "inv-1", invoiceNumber: "INV-001", effectiveTotalAmount: 1000, outstandingAmount: 500, currencyCode: "EGP" },
        { id: "inv-2", invoiceNumber: "INV-002", effectiveTotalAmount: 800, outstandingAmount: 0, currencyCode: "EGP" },
      ],
      totalCount: 2,
    };

    const mockPayments = {
      items: [
        { id: "pay-1", paymentNumber: "PAY-001", amount: 500, currencyCode: "EGP" },
      ],
      totalCount: 1,
    };

    const mockMoneyRepo = {
      getInvoices: vi.fn().mockResolvedValue(mockInvoices),
      getPayments: vi.fn().mockResolvedValue(mockPayments),
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
            paymentsCount: 1,
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
          paymentsCount: 1,
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
    };

    vi.mocked(getVenueContainer).mockReturnValue({
      moneyRepository: mockMoneyRepo,
    } as never);

    render(<MoneyLandingView />);

    await waitFor(() => {
      expect(screen.getByTestId("venue-money-landing")).toBeInTheDocument();
    });

    expect(screen.getByText("Money & Commercials")).toBeInTheDocument();
    expect(screen.getAllByText("Receivables").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Payments").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("View Receivables")).toBeInTheDocument();
    expect(screen.getByText("View Payments")).toBeInTheDocument();
    expect(screen.getAllByText("Record Payment").length).toBeGreaterThanOrEqual(1);
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("2. Receivables-only user: redirects directly to /venue/money/receivables", async () => {
    vi.mocked(usePermission).mockImplementation((perm) => {
      return perm === VENUE_PERMISSIONS.FINANCE_RECEIVABLES_VIEW;
    });

    render(<MoneyLandingView />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/venue/money/receivables");
    });
  });

  it("3. Payments-only user: redirects directly to /venue/money/payments", async () => {
    vi.mocked(usePermission).mockImplementation((perm) => {
      return perm === VENUE_PERMISSIONS.FINANCE_PAYMENTS_VIEW;
    });

    render(<MoneyLandingView />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/venue/money/payments");
    });
  });

  it("4. No finance permissions: shows access denied EmptyState and does not query finance data", () => {
    vi.mocked(usePermission).mockReturnValue(false);

    render(<MoneyLandingView />);

    expect(screen.getByTestId("venue-money-denied")).toBeInTheDocument();
    expect(screen.getByText("Finance access required")).toBeInTheDocument();
    expect(getVenueContainer).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
