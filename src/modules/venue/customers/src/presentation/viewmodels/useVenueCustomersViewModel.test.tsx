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
      getById: vi.fn().mockResolvedValue(customer),
      create: vi.fn(),
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
