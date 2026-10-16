import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClickToBookModal } from "./ClickToBookModal";

const mocks = vi.hoisted(() => ({
  translate: vi.fn((_key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? _key),
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
    t: mocks.translate,
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
      expect(screen.getByRole("button", { name: "Confirm Booking" })).toBeDisabled()
    );
    expect(screen.getByText("A verified price quote is required before confirmation. Please retry.")).toBeInTheDocument();

    view.rerender(<ClickToBookModal {...props} resource={{ ...resource }} />);

    await waitFor(() =>
      expect(mocks.commercialPricingRepository.calculateQuote).toHaveBeenCalledTimes(2)
    );
    const quoteCalls = mocks.commercialPricingRepository.calculateQuote.mock.calls;
    expect(quoteCalls[1][0].idempotencyKey).toBe(quoteCalls[0][0].idempotencyKey);
    expect(quoteCalls[1][0].expiresAtUtc).toBe(quoteCalls[0][0].expiresAtUtc);
    expect(screen.getByRole("button", { name: "Confirm Booking" })).toBeEnabled();
  });

  it("does not fabricate a quote or allow confirmation while CatalogPricing is unavailable", async () => {
    mocks.commercialPricingRepository.getResourceConfiguration.mockResolvedValue({
      offeringId: "offering-1",
      currencyCode: "EGP",
    });
    mocks.commercialPricingRepository.calculateQuote.mockRejectedValue(new Error("service unavailable"));
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
    render(
      <ClickToBookModal
        open
        onOpenChange={vi.fn()}
        resource={resource}
        instantUtc="2026-10-20T09:00:00.000Z"
        timeZoneId="UTC"
        onSuccess={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "+ Quick Add" }));
    fireEvent.change(screen.getByPlaceholderText("Customer Name (e.g. Ahmed Hassan)"), {
      target: { value: "Synthetic Customer" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Select Customer" }));

    await waitFor(() =>
      expect(screen.getByText("A verified price quote is required before confirmation. Please retry.")).toBeInTheDocument()
    );
    expect(screen.getByRole("button", { name: "Confirm Booking" })).toBeDisabled();
    expect(screen.queryByText("ESTIMATE")).not.toBeInTheDocument();
    expect(mocks.bookingRepository.createDraft).not.toHaveBeenCalled();
  });

  it("reuses an ambiguous booking intent key after the dialog closes and reopens", async () => {
    mocks.bookingRepository.createDraft.mockReset()
      .mockRejectedValueOnce(new Error("draft response was lost after commit"))
      .mockResolvedValueOnce({ id: "draft-1" })
      .mockResolvedValueOnce({ id: "draft-2" });
    mocks.bookingRepository.createHold.mockReset().mockResolvedValue({
      expiresAtUtc: "2026-10-16T13:00:00.000Z",
    });
    mocks.bookingRepository.confirm.mockReset().mockResolvedValue(undefined);
    mocks.bookingRepository.getReservation.mockReset().mockResolvedValue({
      reservationNumber: "R-1",
    });
    mocks.customerRepository.searchCustomers.mockReset().mockResolvedValue([]);
    mocks.commercialPricingRepository.getResourceConfiguration.mockReset().mockResolvedValue({
      offeringId: "offering-1",
      currencyCode: "EGP",
    });
    mocks.commercialPricingRepository.calculateQuote.mockReset().mockResolvedValue({
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
    await waitFor(() => expect(screen.getByRole("button", { name: "Confirm Booking" })).toBeEnabled());

    fireEvent.click(screen.getByRole("button", { name: "Confirm Booking" }));
    await waitFor(() => expect(screen.getByText("draft response was lost after commit")).toBeInTheDocument());
    const firstIntentKey = mocks.bookingRepository.createDraft.mock.calls[0]?.[0].idempotencyKey;
    expect(firstIntentKey).toBeTruthy();

    view.rerender(<ClickToBookModal {...props} open={false} />);
    view.rerender(<ClickToBookModal {...props} open />);
    await waitFor(() => expect(mocks.commercialPricingRepository.calculateQuote).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByRole("button", { name: "Confirm Booking" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Confirm Booking" }));

    await waitFor(() => expect(mocks.bookingRepository.createDraft).toHaveBeenCalledTimes(2));
    expect(mocks.bookingRepository.createDraft.mock.calls[1]?.[0].idempotencyKey).toBe(firstIntentKey);
    await waitFor(() => expect(props.onSuccess).toHaveBeenCalledTimes(1));

    view.rerender(<ClickToBookModal {...props} open={false} />);
    view.rerender(<ClickToBookModal {...props} open />);
    await waitFor(() => expect(mocks.commercialPricingRepository.calculateQuote).toHaveBeenCalledTimes(3));
    await waitFor(() => expect(screen.getByRole("button", { name: "Confirm Booking" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Confirm Booking" }));

    await waitFor(() => expect(mocks.bookingRepository.createDraft).toHaveBeenCalledTimes(3));
    expect(mocks.bookingRepository.createDraft.mock.calls[2]?.[0].idempotencyKey).not.toBe(firstIntentKey);
    await waitFor(() => expect(props.onSuccess).toHaveBeenCalledTimes(2));
  });

  it("renews the hold intent key after the server-reported hold expiry", async () => {
    mocks.bookingRepository.createDraft.mockReset().mockResolvedValue({ id: "draft-1" });
    mocks.bookingRepository.createHold
      .mockReset()
      .mockResolvedValueOnce({ expiresAtUtc: new Date(Date.now() - 1_000).toISOString() })
      .mockResolvedValueOnce({ expiresAtUtc: new Date(Date.now() + 60_000).toISOString() });
    mocks.bookingRepository.getReservation.mockReset().mockResolvedValue({
      reservationNumber: "R-1",
    });
    mocks.customerRepository.searchCustomers.mockReset().mockResolvedValue([]);
    mocks.commercialPricingRepository.getResourceConfiguration.mockReset().mockResolvedValue({
      offeringId: "offering-1",
      currencyCode: "EGP",
    });
    mocks.commercialPricingRepository.calculateQuote.mockReset().mockResolvedValue({
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
    await waitFor(() => expect(screen.getByRole("button", { name: "Hold Temporarily" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Hold Temporarily" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Confirm Booking Now" })).toBeInTheDocument());

    const firstDraftKey = mocks.bookingRepository.createDraft.mock.calls[0]?.[0].idempotencyKey;
    const firstHoldKey = mocks.bookingRepository.createHold.mock.calls[0]?.[1];
    expect(firstDraftKey).toBeTruthy();
    expect(firstHoldKey).toBeTruthy();

    view.rerender(<ClickToBookModal {...props} open={false} />);
    view.rerender(<ClickToBookModal {...props} open />);
    await waitFor(() => expect(mocks.commercialPricingRepository.calculateQuote).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByRole("button", { name: "Hold Temporarily" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Hold Temporarily" }));

    await waitFor(() => expect(mocks.bookingRepository.createHold).toHaveBeenCalledTimes(2));
    expect(mocks.bookingRepository.createDraft.mock.calls[1]?.[0].idempotencyKey).toBe(firstDraftKey);
    expect(mocks.bookingRepository.createHold.mock.calls[1]?.[1]).not.toBe(firstHoldKey);
  });
});
