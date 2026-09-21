import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getVenueContainer } from "@modules/venue/di";
import { useBookingFinanceSummary } from "./useBookingFinanceSummary";

vi.mock("@modules/venue/di", () => ({ getVenueContainer: vi.fn() }));

describe("useBookingFinanceSummary", () => {
  it("composes Finance-owned invoice truth by reservation only for an authorized operator", async () => {
    const moneyRepository = {
      getInvoices: vi.fn().mockResolvedValue({
        items: [{ id: "invoice-1", invoiceNumber: "INV-1", currencyCode: "EGP", effectiveTotalAmount: 250, outstandingAmount: 100, status: "Issued" }],
        totalCount: 1,
      }),
    };
    vi.mocked(getVenueContainer).mockReturnValue({ moneyRepository } as never);
    const { result } = renderHook(() => useBookingFinanceSummary("reservation-1", true));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(moneyRepository.getInvoices).toHaveBeenCalledWith(1, 50, { reservationId: "reservation-1" });
    expect(result.current.summary).toEqual({ invoiceId: "invoice-1", invoiceNumber: "INV-1", currencyCode: "EGP", effectiveTotalAmount: 250, outstandingAmount: 100, status: "Issued" });
  });

  it("does not probe Finance when the operator lacks receivables permission", () => {
    const moneyRepository = { getInvoices: vi.fn() };
    vi.mocked(getVenueContainer).mockReturnValue({ moneyRepository } as never);
    renderHook(() => useBookingFinanceSummary("reservation-1", false));
    expect(moneyRepository.getInvoices).not.toHaveBeenCalled();
  });
});
