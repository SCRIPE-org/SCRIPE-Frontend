import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getVenueContainer } from "@modules/venue/di";
import { useResourcePricingViewModel } from "./useResourcePricingViewModel";

vi.mock("@modules/venue/di", () => ({ getVenueContainer: vi.fn() }));

const resource = { id: "resource-1", name: "Court 1", isPublished: true, isComposite: false };
const configuration = {
  offeringId: "offering-1", displayName: "Court rental", currencyCode: "EGP", unitPrice: 250,
  effectiveFromUtc: "2026-09-19T00:00:00Z", minDurationMinutes: 60, maxDurationMinutes: 180, incrementMinutes: 30, taxCategoryId: null,
};

function container() {
  return {
    schedulableResourceRepository: { getAll: vi.fn().mockResolvedValue({ items: [resource] }) },
    commercialPricingRepository: {
      getResourceConfiguration: vi.fn().mockResolvedValue(configuration),
      configureResourcePrice: vi.fn().mockResolvedValue(configuration),
      getTaxCategories: vi.fn().mockResolvedValue([]),
      createTaxCategory: vi.fn(),
    },
  };
}

describe("useResourcePricingViewModel", () => {
  it("loads only published non-composite resources and their server configuration", async () => {
    const value = container();
    vi.mocked(getVenueContainer).mockReturnValue(value as never);
    const { result } = renderHook(() => useResourcePricingViewModel({
      messages: { fallbackError: "unavailable", validation: "invalid" },
    }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => expect(result.current.currencyCode).toBe("EGP"));
    expect(result.current.resources).toEqual([resource]);
    expect(value.commercialPricingRepository.getResourceConfiguration).toHaveBeenCalledWith("resource-1");
    expect(result.current.currencyCode).toBe("EGP");
  });

  it("creates a tenant tax category and selects it for subsequent rate configuration", async () => {
    const value = container();
    value.commercialPricingRepository.createTaxCategory.mockResolvedValue({ id: "tax-1", name: "VAT", code: "VAT14", ratePercentage: .14, isInclusive: false, status: "Active" });
    vi.mocked(getVenueContainer).mockReturnValue(value as never);
    const { result } = renderHook(() => useResourcePricingViewModel({ messages: { fallbackError: "unavailable", validation: "invalid" } }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.setNewTaxName("VAT"); result.current.setNewTaxCode("vat14"); result.current.setNewTaxRate("14"); });

    await act(async () => { await result.current.createTax(); });

    expect(value.commercialPricingRepository.createTaxCategory).toHaveBeenCalledWith({ name: "VAT", code: "VAT14", ratePercentage: .14, isInclusive: false });
    expect(result.current.taxCategoryId).toBe("tax-1");
  });

  it("submits explicit currency, effective time, and rate configuration through the repository", async () => {
    const value = container();
    vi.mocked(getVenueContainer).mockReturnValue(value as never);
    const { result } = renderHook(() => useResourcePricingViewModel({
      messages: { fallbackError: "unavailable", validation: "invalid" },
    }));
    await waitFor(() => expect(result.current.currencyCode).toBe("EGP"));

    await act(async () => { await result.current.save(); });

    expect(value.commercialPricingRepository.configureResourcePrice).toHaveBeenCalledWith(expect.objectContaining({
      schedulableResourceId: "resource-1", currencyCode: "EGP", unitPrice: 250,
      effectiveFromUtc: "2026-09-19T00:00:00.000Z",
    }));
  });
});
