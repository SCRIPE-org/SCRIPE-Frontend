/**
 * useEntityLookupAvailableTypes tests (Wave 4 follow-up)
 *
 * The load-bearing case is `an empty list is an ANSWER, not a failure`. If `isEmpty` and `isError`
 * ever collapse into one flag, "you may not reference anything" — a correct authorization outcome the
 * endpoint returns as a 200 — starts rendering as a broken screen, and the admin's actual remedy (ask
 * for view access to the record types they need) is nowhere on it.
 *
 * The second load-bearing case is that `isEmpty` is FALSE while the request is in flight. `[]` is the
 * default `types` value in every state, so a hook that derived emptiness from `types.length === 0`
 * alone would tell the picker "there is nothing you can reference" one render before the first
 * response arrived.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEntityLookupAvailableTypes } from "./useEntityLookupAvailableTypes";
import { getCustomFieldsContainer } from "../../../../di";
import type { EntityLookupType } from "../../data/models/EntityLookupModel";

vi.mock("../../../../di", () => ({ getCustomFieldsContainer: vi.fn() }));

const getAvailableTypes = vi.fn();

/** Real registry shapes: `identity.user` is registered as ("Identity", "User", "المستخدم", "users"). */
const TYPES: EntityLookupType[] = [
  {
    key: "hrms.staff-member",
    owningModule: "Hrms",
    displayNameEn: "Staff Member",
    displayNameAr: "عضو الفريق",
  },
  { key: "identity.user", owningModule: "Identity", displayNameEn: "User", displayNameAr: "المستخدم" },
];

// A fresh client per render: react-query caches by key, and a shared client would let one case's
// answer satisfy the next case's assertion.
function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function deferred<T>() {
  let settle!: (value: T) => void;
  const promise = new Promise<T>((resolve) => {
    settle = resolve;
  });
  return { promise, settle };
}

describe("useEntityLookupAvailableTypes", () => {
  beforeEach(() => {
    getAvailableTypes.mockReset();
    getAvailableTypes.mockResolvedValue(TYPES);
    vi.mocked(getCustomFieldsContainer).mockReturnValue({
      entityLookupRepository: { getAvailableTypes },
    } as never);
  });

  it("returns the server's list in the server's order", async () => {
    const { result } = renderHook(() => useEntityLookupAvailableTypes(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.types).toEqual(TYPES);
    expect(result.current.isError).toBe(false);
    expect(result.current.isEmpty).toBe(false);
  });

  it("an empty list is an ANSWER, not a failure", async () => {
    getAvailableTypes.mockResolvedValue([]);

    const { result } = renderHook(() => useEntityLookupAvailableTypes(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.types).toEqual([]);
    // The whole point: empty and failed are not the same state and must not render the same way.
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.isError).toBe(false);
  });

  it("does not claim emptiness while the request is still in flight", async () => {
    const pending = deferred<EntityLookupType[]>();
    getAvailableTypes.mockReturnValue(pending.promise);

    const { result } = renderHook(() => useEntityLookupAvailableTypes(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    // `types` is already [] here -- which is exactly why isEmpty cannot be derived from it.
    expect(result.current.types).toEqual([]);
    expect(result.current.isEmpty).toBe(false);

    pending.settle([]);
    await waitFor(() => expect(result.current.isEmpty).toBe(true));
  });

  it("reports a real failure as an error, with no types and no emptiness claim", async () => {
    getAvailableTypes.mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useEntityLookupAvailableTypes(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.types).toEqual([]);
    // A failed request tells us nothing about what the caller may reference, so it must not be
    // reported as "there is nothing you can reference".
    expect(result.current.isEmpty).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("asks for nothing, and reports neither loading nor emptiness, when disabled", async () => {
    const { result } = renderHook(() => useEntityLookupAvailableTypes({ enabled: false }), {
      wrapper,
    });

    expect(getAvailableTypes).not.toHaveBeenCalled();
    // A disabled query is permanently pending in react-query v5; surfacing that as `isLoading` would
    // leave a caller spinning forever on a request that is never made.
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isEmpty).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it("refetches on demand and hands back a plain void callback", async () => {
    const { result } = renderHook(() => useEntityLookupAvailableTypes(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(getAvailableTypes).toHaveBeenCalledTimes(1);

    // Returns undefined, not a promise: an onClick handler wired to react-query's own refetch would
    // leak a floating promise.
    expect(result.current.refetch()).toBeUndefined();

    await waitFor(() => expect(getAvailableTypes).toHaveBeenCalledTimes(2));
  });

  it("fetches once for two consumers sharing a client -- the reason this hook is query-backed", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    function sharedWrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }

    // The create form's picker and the edit form's picker are built from one config memo and both read
    // this list. Two requests per modal open is the thing the cache exists to prevent.
    const { result } = renderHook(
      () => [useEntityLookupAvailableTypes(), useEntityLookupAvailableTypes()] as const,
      { wrapper: sharedWrapper }
    );

    await waitFor(() => expect(result.current[0].isLoading).toBe(false));

    expect(getAvailableTypes).toHaveBeenCalledTimes(1);
    expect(result.current[1].types).toEqual(TYPES);
  });
});
