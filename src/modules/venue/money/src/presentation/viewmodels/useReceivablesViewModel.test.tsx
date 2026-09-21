import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getVenueContainer } from "@modules/venue/di";
import { useReceivablesViewModel } from "./useReceivablesViewModel";

vi.mock("@modules/venue/di", () => ({ getVenueContainer: vi.fn() }));

describe("useReceivablesViewModel", () => {
  it("loads Finance-owned receivables only when the operator has view permission", async () => {
    const moneyRepository = {
      getInvoices: vi.fn().mockResolvedValue({ items: [{ id: "invoice-1" }], totalCount: 1 }),
    };
    vi.mocked(getVenueContainer).mockReturnValue({ moneyRepository } as never);
    const { result } = renderHook(() => useReceivablesViewModel(true, "unavailable"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([{ id: "invoice-1" }]);
    expect(moneyRepository.getInvoices).toHaveBeenCalledOnce();
  });

  it("does not read Finance data when authorization is absent", async () => {
    const moneyRepository = { getInvoices: vi.fn() };
    vi.mocked(getVenueContainer).mockReturnValue({ moneyRepository } as never);
    renderHook(() => useReceivablesViewModel(false, "unavailable"));

    expect(moneyRepository.getInvoices).not.toHaveBeenCalled();
  });
});
