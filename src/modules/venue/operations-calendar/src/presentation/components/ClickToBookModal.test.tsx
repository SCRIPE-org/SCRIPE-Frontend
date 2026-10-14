import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClickToBookModal } from "./ClickToBookModal";

const mocks = vi.hoisted(() => ({
  bookingRepository: {
    createDraft: vi.fn(),
    createHold: vi.fn(),
    confirm: vi.fn(),
    getReservation: vi.fn(),
  },
  customerRepository: { searchCustomers: vi.fn().mockResolvedValue([]) },
  commercialPricingRepository: {
    getResourceConfiguration: vi.fn(),
    calculateQuote: vi.fn(),
  },
  moneyRepository: {},
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    language: "en",
    t: (_key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? _key,
  }),
}));

vi.mock("@modules/venue", () => ({
  useVenueServiceLocator: () => ({
    bookingRepository: mocks.bookingRepository,
    customerRepository: mocks.customerRepository,
    commercialPricingRepository: mocks.commercialPricingRepository,
    moneyRepository: mocks.moneyRepository,
  }),
}));

describe("ClickToBookModal quote intent retry", () => {
  it("reuses the same CatalogPricing key and expiry when the first response is lost", async () => {
    mocks.commercialPricingRepository.getResourceConfiguration.mockResolvedValue({
      offeringId: "offering-1",
      currencyCode: "EGP",
    });
    mocks.commercialPricingRepository.calculateQuote
      .mockRejectedValueOnce(new Error("quote response lost after commit"))
      .mockResolvedValueOnce({
        id: "quote-1",
        quoteNumber: "Q-1",
        grandTotal: 250,
        currencyCode: "EGP",
      });
    const resource = {
      id: "resource-1",
      name: "Court 1",
      profileId: "profile-1",
      profileName: "Court",
      facilityId: "facility-1",
      facilityName: "Main Facility",
      resourceKindCode: "COURT",
      timeZoneId: "UTC",
    };
    const props = {
      open: true,
      onOpenChange: vi.fn(),
      resource,
      instantUtc: "2026-10-20T09:00:00.000Z",
      timeZoneId: "UTC",
      onSuccess: vi.fn(),
    };
    const view = render(<ClickToBookModal {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "+ Quick Add" }));
    fireEvent.change(screen.getByPlaceholderText("Customer Name (e.g. Ahmed Hassan)"), {
      target: { value: "Synthetic Customer" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Select Customer" }));

    await waitFor(() =>
      expect(mocks.commercialPricingRepository.calculateQuote).toHaveBeenCalledTimes(1)
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Confirm Booking" })).toBeEnabled()
    );

    view.rerender(<ClickToBookModal {...props} resource={{ ...resource }} />);

    await waitFor(() =>
      expect(mocks.commercialPricingRepository.calculateQuote).toHaveBeenCalledTimes(2)
    );
    const quoteCalls = mocks.commercialPricingRepository.calculateQuote.mock.calls;
    expect(quoteCalls[1][0].idempotencyKey).toBe(quoteCalls[0][0].idempotencyKey);
    expect(quoteCalls[1][0].expiresAtUtc).toBe(quoteCalls[0][0].expiresAtUtc);
  });
});
