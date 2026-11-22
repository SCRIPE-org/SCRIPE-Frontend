import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getVenueContainer } from "@modules/venue/di";
import { useVenueCustomersViewModel } from "./useVenueCustomersViewModel";

vi.mock("@modules/venue/di", () => ({ getVenueContainer: vi.fn() }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key, language: "en", direction: "ltr" }),
}));

const customer = { id: "party-1", type: "Person", displayName: "Mona Hassan" };

function makeContainer() {
  return {
    customerRepository: {
      search: vi.fn().mockResolvedValue([]),
      searchPaged: vi.fn().mockResolvedValue({
        items: [customer],
        totalCount: 371,
        pageNumber: 1,
        pageSize: 20,
        totalPages: 19,
        hasPreviousPage: false,
        hasNextPage: true,
      }),
      getById: vi.fn().mockResolvedValue(customer),
      create: vi.fn(),
    },
    bookingRepository: {
      getCustomerReservations: vi.fn().mockResolvedValue({
        items: [
          {
            id: "res-1",
            reservationNumber: "RES-AHLY-1009",
            status: "Confirmed",
            resourceId: "court-1",
            requestedStartUtc: "2026-11-02T10:00:00Z",
            requestedEndUtc: "2026-11-02T11:00:00Z",
            quantity: 1,
            createdAt: "2026-11-01T08:00:00Z",
          },
        ],
        totalCount: 1,
        pageNumber: 1,
        pageSize: 50,
        totalPages: 1,
      }),
    },
  };
}

function submit(result: { current: ReturnType<typeof useVenueCustomersViewModel> }) {
  return result.current.handleCreateCustomer({ preventDefault: vi.fn() } as never);
}

describe("useVenueCustomersViewModel customer-create intent", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reuses a stable key after an ambiguous failure and clears it after success", async () => {
    const container = makeContainer();
    container.customerRepository.create
      .mockRejectedValueOnce(new Error("response lost after commit"))
      .mockResolvedValueOnce(customer)
      .mockResolvedValueOnce({ ...customer, id: "party-2" });
    vi.mocked(getVenueContainer).mockReturnValue(container as never);

    const { result } = renderHook(() => useVenueCustomersViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => {
      result.current.setNewName("Mona Hassan");
      result.current.setNewType("Person");
    });

    await act(async () => submit(result));
    await act(async () => submit(result));

    const firstKey = container.customerRepository.create.mock.calls[0]?.[3]?.idempotencyKey;
    const replayKey = container.customerRepository.create.mock.calls[1]?.[3]?.idempotencyKey;
    expect(firstKey).toBeTruthy();
    expect(replayKey).toBe(firstKey);

    act(() => result.current.setNewName("Mona Hassan"));
    await act(async () => submit(result));
    const nextIntentKey = container.customerRepository.create.mock.calls[2]?.[3]?.idempotencyKey;
    expect(nextIntentKey).toBeTruthy();
    expect(nextIntentKey).not.toBe(firstKey);
  });

  it("starts a new intent when the customer payload changes after a failed attempt", async () => {
    const container = makeContainer();
    container.customerRepository.create
      .mockRejectedValueOnce(new Error("response lost"))
      .mockResolvedValueOnce(customer);
    vi.mocked(getVenueContainer).mockReturnValue(container as never);

    const { result } = renderHook(() => useVenueCustomersViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setNewName("Mona Hassan"));
    await act(async () => submit(result));

    act(() => result.current.setNewName("Mona A. Hassan"));
    await act(async () => submit(result));

    const firstKey = container.customerRepository.create.mock.calls[0]?.[3]?.idempotencyKey;
    const changedPayloadKey = container.customerRepository.create.mock.calls[1]?.[3]?.idempotencyKey;
    expect(firstKey).toBeTruthy();
    expect(changedPayloadKey).toBeTruthy();
    expect(changedPayloadKey).not.toBe(firstKey);
  });
});

describe("useVenueCustomersViewModel pagination & customer booking history", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches paged customers and updates pagination state", async () => {
    const container = makeContainer();
    vi.mocked(getVenueContainer).mockReturnValue(container as never);

    const { result } = renderHook(() => useVenueCustomersViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.totalCount).toBe(371);
    expect(result.current.totalPages).toBe(19);
    expect(result.current.hasPreviousPage).toBe(false);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.customers).toHaveLength(1);
    expect(result.current.customers[0]?.displayName).toBe("Mona Hassan");

    // Navigate to next page
    act(() => {
      result.current.handleNextPage();
    });

    expect(container.customerRepository.searchPaged).toHaveBeenCalledWith("", 2, 20);
  });

  it("automatically fetches booking history when a customer is selected", async () => {
    const container = makeContainer();
    vi.mocked(getVenueContainer).mockReturnValue(container as never);

    const { result } = renderHook(() => useVenueCustomersViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setSelectedCustomer(customer);
    });

    expect(result.current.detailDrawerOpen).toBe(true);
    expect(result.current.selectedCustomer).toEqual(customer);

    await waitFor(() => {
      expect(result.current.customerBookings).toHaveLength(1);
      expect(result.current.customerBookings[0]?.reservationNumber).toBe("RES-AHLY-1009");
    });

    expect(container.bookingRepository.getCustomerReservations).toHaveBeenCalledWith("party-1", 1, 50);

    // Deselecting customer closes drawer and clears bookings
    act(() => {
      result.current.setSelectedCustomer(null);
    });

    expect(result.current.detailDrawerOpen).toBe(false);
    expect(result.current.customerBookings).toHaveLength(0);
  });

  it("handles search queries and resets properly", async () => {
    const container = makeContainer();
    vi.mocked(getVenueContainer).mockReturnValue(container as never);

    const { result } = renderHook(() => useVenueCustomersViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setSearchQuery("Omar");
    });
    act(() => {
      result.current.handleSearch({ preventDefault: vi.fn() } as never);
    });

    expect(container.customerRepository.searchPaged).toHaveBeenCalledWith("Omar", 1, 20);

    act(() => {
      result.current.handleResetSearch();
    });

    expect(result.current.searchQuery).toBe("");
    expect(container.customerRepository.searchPaged).toHaveBeenCalledWith("", 1, 20);
  });
});
