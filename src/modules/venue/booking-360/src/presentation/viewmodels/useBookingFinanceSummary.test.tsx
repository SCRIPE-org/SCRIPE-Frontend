import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getVenueContainer } from "@modules/venue/di";
import { useBookingFinanceSummary } from "./useBookingFinanceSummary";

vi.mock("@modules/venue/di", () => ({ getVenueContainer: vi.fn() }));

describe("useBookingFinanceSummary", () => {
  it("composes Finance-owned invoice truth by reservation only for an authorized operator", async () => {
    const moneyRepository = {
      getInvoices: vi.fn().mockResolvedValue({
        items: [
          {
            id: "invoice-1",
            invoiceNumber: "INV-1",
            currencyCode: "EGP",
            effectiveTotalAmount: 250,
            outstandingAmount: 100,
            paidAmount: 150,
            status: "Issued",
          },
        ],
        totalCount: 1,
      }),
      getPayments: vi.fn().mockResolvedValue({ items: [], totalCount: 0 }),
    };
    vi.mocked(getVenueContainer).mockReturnValue({ moneyRepository } as never);
    const { result } = renderHook(() => useBookingFinanceSummary("reservation-1", true));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(moneyRepository.getInvoices).toHaveBeenCalledWith(1, 50, {
      reservationId: "reservation-1",
    });
    expect(result.current.summary).toEqual({
      invoiceId: "invoice-1",
      invoiceNumber: "INV-1",
      currencyCode: "EGP",
      effectiveTotalAmount: 250,
      paidAmount: 150,
      outstandingAmount: 100,
      creditAmount: 0,
      status: "Issued",
      unallocatedPaymentAmount: 0,
      refundedAmount: 0,
      allocationState: "Synchronized",
      payments: [],
    });
  });

  it("reconciles invoice when payment is allocated (Invoice 500, Paid 200, Remaining 300, PartiallyPaid, Synchronized)", async () => {
    const moneyRepository = {
      getInvoices: vi.fn().mockResolvedValue({
        items: [
          {
            id: "inv-500",
            invoiceNumber: "INV-500",
            currencyCode: "EGP",
            effectiveTotalAmount: 500,
            outstandingAmount: 300,
            paidAmount: 200,
            status: "PartiallyPaid",
          },
        ],
        totalCount: 1,
      }),
      getPayments: vi.fn().mockResolvedValue({
        items: [
          {
            id: "pay-200",
            paymentNumber: "PAY-200",
            amount: 200,
            allocatedAmount: 200,
            unallocatedAmount: 0,
            method: "Cash",
            status: "Completed",
            recordedAtUtc: "2026-10-19T10:00:00Z",
          },
        ],
        totalCount: 1,
      }),
    };
    vi.mocked(getVenueContainer).mockReturnValue({ moneyRepository } as never);
    const { result } = renderHook(() => useBookingFinanceSummary("reservation-500", true));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.summary).toEqual({
      invoiceId: "inv-500",
      invoiceNumber: "INV-500",
      currencyCode: "EGP",
      effectiveTotalAmount: 500,
      paidAmount: 200,
      outstandingAmount: 300,
      creditAmount: 0,
      status: "PartiallyPaid",
      unallocatedPaymentAmount: 0,
      refundedAmount: 0,
      allocationState: "Synchronized",
      payments: [
        {
          id: "pay-200",
          paymentNumber: "PAY-200",
          amount: 200,
          allocatedAmount: 200,
          unallocatedAmount: 0,
          method: "Cash",
          status: "Completed",
          recordedAtUtc: "2026-10-19T10:00:00Z",
          externalReference: null,
        },
      ],
    });
  });

  it("distinguishes unallocated payment without fabricating invoice payment (Invoice 500, Recorded 200 unallocated, Paid 0, Remaining 500, Issued, PendingAllocation)", async () => {
    const moneyRepository = {
      getInvoices: vi.fn().mockResolvedValue({
        items: [
          {
            id: "inv-500",
            invoiceNumber: "INV-500",
            currencyCode: "EGP",
            effectiveTotalAmount: 500,
            outstandingAmount: 500,
            paidAmount: 0,
            status: "Issued",
          },
        ],
        totalCount: 1,
      }),
      getPayments: vi.fn().mockResolvedValue({
        items: [
          {
            id: "pay-200",
            paymentNumber: "PAY-200",
            amount: 200,
            allocatedAmount: 0,
            unallocatedAmount: 200,
            method: "Cash",
            status: "Completed",
            recordedAtUtc: "2026-10-19T10:00:00Z",
          },
        ],
        totalCount: 1,
      }),
    };
    vi.mocked(getVenueContainer).mockReturnValue({ moneyRepository } as never);
    const { result } = renderHook(() =>
      useBookingFinanceSummary("reservation-500-unallocated", true)
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    // Crucial financial invariant: paidAmount stays 0, outstanding stays 500, status stays Issued!
    expect(result.current.summary?.paidAmount).toBe(0);
    expect(result.current.summary?.outstandingAmount).toBe(500);
    expect(result.current.summary?.status).toBe("Issued");
    expect(result.current.summary?.unallocatedPaymentAmount).toBe(200);
    expect(result.current.summary?.allocationState).toBe("PendingAllocation");
  });

  it("handles multiple payments and refunds (300 allocated, 200 allocated, 100 refunded)", async () => {
    const moneyRepository = {
      getInvoices: vi.fn().mockResolvedValue({
        items: [
          {
            id: "inv-500",
            invoiceNumber: "INV-500",
            currencyCode: "EGP",
            effectiveTotalAmount: 500,
            outstandingAmount: 0,
            paidAmount: 500,
            status: "Paid",
          },
        ],
        totalCount: 1,
      }),
      getPayments: vi.fn().mockResolvedValue({
        items: [
          {
            id: "pay-1",
            paymentNumber: "PAY-1",
            amount: 300,
            allocatedAmount: 300,
            unallocatedAmount: 0,
            method: "Card",
            status: "Completed",
            recordedAtUtc: "2026-10-19T10:00:00Z",
          },
          {
            id: "pay-2",
            paymentNumber: "PAY-2",
            amount: 200,
            allocatedAmount: 200,
            unallocatedAmount: 0,
            method: "Cash",
            status: "Completed",
            recordedAtUtc: "2026-10-19T10:05:00Z",
          },
          {
            id: "pay-3",
            paymentNumber: "PAY-3",
            amount: 100,
            allocatedAmount: 0,
            unallocatedAmount: 0,
            method: "Card",
            status: "Refunded",
            recordedAtUtc: "2026-10-19T10:10:00Z",
          },
        ],
        totalCount: 3,
      }),
    };
    vi.mocked(getVenueContainer).mockReturnValue({ moneyRepository } as never);
    const { result } = renderHook(() => useBookingFinanceSummary("reservation-refund", true));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.summary?.paidAmount).toBe(500);
    expect(result.current.summary?.outstandingAmount).toBe(0);
    expect(result.current.summary?.status).toBe("Paid");
    expect(result.current.summary?.refundedAmount).toBe(100);
    expect(result.current.summary?.unallocatedPaymentAmount).toBe(0);
    expect(result.current.summary?.allocationState).toBe("Synchronized");
  });

  it("handles outbox delay with bounded retry when invoice is returned on second attempt", async () => {
    const moneyRepository = {
      getInvoices: vi
        .fn()
        .mockResolvedValueOnce({ items: [], totalCount: 0 })
        .mockResolvedValueOnce({
          items: [
            {
              id: "inv-delayed",
              invoiceNumber: "INV-DELAYED",
              currencyCode: "EGP",
              effectiveTotalAmount: 400,
              outstandingAmount: 400,
              paidAmount: 0,
              status: "Issued",
            },
          ],
          totalCount: 1,
        }),
      getPayments: vi.fn().mockResolvedValue({ items: [], totalCount: 0 }),
    };
    vi.mocked(getVenueContainer).mockReturnValue({ moneyRepository } as never);
    const { result } = renderHook(() => useBookingFinanceSummary("reservation-delayed", true));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(moneyRepository.getInvoices).toHaveBeenCalledTimes(2);
    expect(result.current.summary?.invoiceId).toBe("inv-delayed");
    expect(result.current.summary?.allocationState).toBe("Synchronized");
  });

  it("marks PendingSynchronization when payments exist but invoice has not materialized after retries", async () => {
    const moneyRepository = {
      getInvoices: vi.fn().mockResolvedValue({ items: [], totalCount: 0 }),
      getPayments: vi.fn().mockResolvedValue({
        items: [
          {
            id: "pay-sync",
            paymentNumber: "PAY-SYNC",
            amount: 250,
            allocatedAmount: 0,
            unallocatedAmount: 250,
            method: "POS",
            status: "Completed",
            recordedAtUtc: "2026-10-19T10:00:00Z",
          },
        ],
        totalCount: 1,
      }),
    };
    vi.mocked(getVenueContainer).mockReturnValue({ moneyRepository } as never);
    const { result } = renderHook(() => useBookingFinanceSummary("reservation-sync", true));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.summary?.allocationState).toBe("PendingSynchronization");
    expect(result.current.summary?.status).toBe("PendingSync");
    expect(result.current.summary?.unallocatedPaymentAmount).toBe(250);
  });

  it("does not probe Finance when the operator lacks receivables permission", () => {
    const moneyRepository = { getInvoices: vi.fn() };
    vi.mocked(getVenueContainer).mockReturnValue({ moneyRepository } as never);
    renderHook(() => useBookingFinanceSummary("reservation-1", false));
    expect(moneyRepository.getInvoices).not.toHaveBeenCalled();
  });
});
