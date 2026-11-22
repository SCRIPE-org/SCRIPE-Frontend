import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getVenueContainer } from "@modules/venue/di";
import type { MoneyInvoice } from "../../domain/entities/Money";
import { useReceivablesViewModel } from "./useReceivablesViewModel";

vi.mock("@modules/venue/di", () => ({ getVenueContainer: vi.fn() }));

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
    paidAmount: 0,
    outstandingAmount: 1000,
    issuedAtUtc: "2026-10-01T10:00:00Z",
    dueAtUtc: "2026-10-15T10:00:00Z",
    ...overrides,
  };
}

describe("useReceivablesViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads Finance-owned receivables only when the operator has view permission", async () => {
    const invoice = makeInvoice();
    const moneyRepository = {
      getInvoices: vi.fn().mockResolvedValue({ items: [invoice], totalCount: 1 }),
    };
    vi.mocked(getVenueContainer).mockReturnValue({ moneyRepository } as never);
    const { result } = renderHook(() => useReceivablesViewModel(true, "unavailable"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([invoice]);
    expect(moneyRepository.getInvoices).toHaveBeenCalledWith(1, 100, undefined);
  });

  it("does not read Finance data when authorization is absent", () => {
    const moneyRepository = { getInvoices: vi.fn() };
    vi.mocked(getVenueContainer).mockReturnValue({ moneyRepository } as never);
    const { result } = renderHook(() => useReceivablesViewModel(false, "unavailable"));

    expect(result.current.loading).toBe(false);
    expect(moneyRepository.getInvoices).not.toHaveBeenCalled();
  });

  it("aggregates totals strictly by currency without merging differing or unspecified currencies", async () => {
    const invoices = [
      makeInvoice({
        id: "inv-1",
        currencyCode: "EGP",
        effectiveTotalAmount: 1200,
        paidAmount: 200,
        outstandingAmount: 1000,
      }),
      makeInvoice({
        id: "inv-2",
        currencyCode: "egp",
        effectiveTotalAmount: 800,
        paidAmount: 800,
        outstandingAmount: 0,
        status: "Paid",
      }),
      makeInvoice({
        id: "inv-3",
        currencyCode: "USD",
        effectiveTotalAmount: 300,
        paidAmount: 100,
        outstandingAmount: 200,
        status: "PartiallyPaid",
      }),
      makeInvoice({
        id: "inv-4",
        currencyCode: "",
        effectiveTotalAmount: 450,
        paidAmount: 0,
        outstandingAmount: 450,
      }),
    ];
    const moneyRepository = {
      getInvoices: vi.fn().mockResolvedValue({ items: invoices, totalCount: 4 }),
    };
    vi.mocked(getVenueContainer).mockReturnValue({ moneyRepository } as never);

    const { result } = renderHook(() => useReceivablesViewModel(true, "unavailable"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.currencyTotals).toEqual({
      EGP: {
        total: 2000,
        paid: 1000,
        outstanding: 1000,
        count: 2,
      },
      USD: {
        total: 300,
        paid: 100,
        outstanding: 200,
        count: 1,
      },
      UNSPECIFIED: {
        total: 450,
        paid: 0,
        outstanding: 450,
        count: 1,
      },
    });
    expect(result.current.totalOutstandingCount).toBe(3);
  });

  it("filters by status tab and search query, and clears both via resetFilters", async () => {
    const invoices = [
      makeInvoice({
        id: "inv-open",
        invoiceNumber: "INV-OPEN-1",
        payerPartyId: "club-alpha",
        status: "Issued",
        paidAmount: 0,
        outstandingAmount: 500,
      }),
      makeInvoice({
        id: "inv-part",
        invoiceNumber: "INV-PART-2",
        payerPartyId: "club-beta",
        status: "PartiallyPaid",
        paidAmount: 300,
        outstandingAmount: 200,
      }),
      makeInvoice({
        id: "inv-paid",
        invoiceNumber: "INV-PAID-3",
        payerPartyId: "club-gamma",
        status: "Paid",
        paidAmount: 500,
        outstandingAmount: 0,
      }),
    ];
    const moneyRepository = {
      getInvoices: vi.fn().mockResolvedValue({ items: invoices, totalCount: 3 }),
    };
    vi.mocked(getVenueContainer).mockReturnValue({ moneyRepository } as never);

    const { result } = renderHook(() => useReceivablesViewModel(true, "unavailable"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setStatusFilter("outstanding"));
    expect(result.current.items.map((i) => i.id)).toEqual(["inv-open", "inv-part"]);
    expect(result.current.hasActiveFilters).toBe(true);

    act(() => result.current.setStatusFilter("partiallyPaid"));
    expect(result.current.items.map((i) => i.id)).toEqual(["inv-part"]);

    act(() => result.current.setStatusFilter("paid"));
    expect(result.current.items.map((i) => i.id)).toEqual(["inv-paid"]);

    act(() => {
      result.current.setStatusFilter("all");
      result.current.setSearchQuery("beta");
    });
    expect(result.current.items.map((i) => i.id)).toEqual(["inv-part"]);
    expect(result.current.isPartial).toBe(true);

    act(() => result.current.resetFilters());
    expect(result.current.statusFilter).toBe("all");
    expect(result.current.searchQuery).toBe("");
    expect(result.current.items).toHaveLength(3);
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it("applies initialReservationId filter to repository fetch and supports pagination changes", async () => {
    const firstPage = [makeInvoice({ id: "inv-r1", reservationId: "res-99" })];
    const secondPage = [makeInvoice({ id: "inv-r2", reservationId: "res-99" })];
    const moneyRepository = {
      getInvoices: vi
        .fn()
        .mockResolvedValueOnce({ items: firstPage, totalCount: 60 })
        .mockResolvedValueOnce({ items: secondPage, totalCount: 60 }),
    };
    vi.mocked(getVenueContainer).mockReturnValue({ moneyRepository } as never);

    const { result } = renderHook(() => useReceivablesViewModel(true, "unavailable", "res-99"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(moneyRepository.getInvoices).toHaveBeenCalledWith(1, 100, { reservationId: "res-99" });
    expect(result.current.isPartial).toBe(true);

    act(() => result.current.changePageSize(25));
    await waitFor(() =>
      expect(moneyRepository.getInvoices).toHaveBeenCalledWith(1, 25, { reservationId: "res-99" })
    );
    expect(result.current.pagination.pagesCount).toBe(3);
    expect(result.current.pagination.hasNextPage).toBe(true);
    expect(result.current.pagination.hasPreviousPage).toBe(false);
  });

  it("captures fallback error when repository fails with a non-Error value and clears on refresh", async () => {
    const invoice = makeInvoice();
    const moneyRepository = {
      getInvoices: vi
        .fn()
        .mockRejectedValueOnce("network-down")
        .mockResolvedValueOnce({ items: [invoice], totalCount: 1 }),
    };
    vi.mocked(getVenueContainer).mockReturnValue({ moneyRepository } as never);

    const { result } = renderHook(() => useReceivablesViewModel(true, "Finance unavailable"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Finance unavailable");
    expect(result.current.loadedCount).toBe(0);

    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.items).toEqual([invoice]);
  });
});
