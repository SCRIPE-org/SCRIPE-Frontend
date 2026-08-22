/**
 * useEntityLookupSearch tests (Wave 4)
 *
 * Every test here is named after a PROPERTY rather than a method, because the properties are the
 * point: each one corresponds to a defect that is invisible on a fast local network and obvious in
 * production. The debounce, the out-of-order guard and the page-reset are the three.
 *
 * REAL TIMERS, NOT `vi.useFakeTimers()`. Nothing in this suite fakes timers, and doing it here would
 * mean teaching React Testing Library to advance them around `act` — machinery that fails in ways
 * that look like defects in the hook. 300ms of real waiting per debounce test costs under a second
 * in total and tests the actual timer the browser will use.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useEntityLookupSearch } from "./useEntityLookupSearch";
import { customFieldsContainer } from "../../../../di";
import { ENTITY_LOOKUP_SEARCH_DEBOUNCE_MS } from "../../data/models/EntityLookupModel";
import type { EntityLookupItem } from "../../data/models/EntityLookupModel";

vi.mock("../../../../di", () => ({
  customFieldsContainer: {
    entityLookupRepository: {
      getAvailableTypes: vi.fn(),
      search: vi.fn(),
      resolve: vi.fn(),
    },
  },
}));

const search = vi.mocked(customFieldsContainer.entityLookupRepository.search);

/** One picker row. */
function item(id: string): EntityLookupItem {
  return { id, displayName: `Name ${id}`, secondary: null, isActive: true };
}

/** A `PagedResult` envelope with only the members this hook reads. */
function page(ids: string[], hasNextPage = false) {
  return {
    items: ids.map(item),
    totalCount: ids.length,
    pageNumber: 1,
    pageSize: 20,
    totalPages: 1,
    hasNextPage,
    hasPreviousPage: false,
  };
}

/** A promise whose resolution this test controls, for forcing a response order. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

/** Waits out one full debounce window plus margin, so a second timer would have fired by now. */
const waitOutDebounce = () =>
  new Promise((resolve) => setTimeout(resolve, ENTITY_LOOKUP_SEARCH_DEBOUNCE_MS + 80));

/**
 * Real milliseconds between two simulated keystrokes.
 *
 * Must be > 0 or the debounce test is not red-verifiable: five `act` calls in the same synchronous
 * block each cancel the previous timer, so the hook would fire exactly one request even with the
 * delay set to zero. Letting real time pass between them is what makes the WINDOW the thing under
 * test rather than the cleanup. Five gaps of this size must still total well under
 * ENTITY_LOOKUP_SEARCH_DEBOUNCE_MS.
 */
const KEYSTROKE_GAP_MS = 30;

/** Advances real time inside `act`, so effects scheduled by the elapsed timers are flushed. */
const typePause = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, KEYSTROKE_GAP_MS));
  });

describe("useEntityLookupSearch", () => {
  beforeEach(() => {
    search.mockReset();
    search.mockResolvedValue(page([]));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("typing five characters fires ONE request, not five", async () => {
    const { result } = renderHook(() =>
      useEntityLookupSearch({ entityTypeKey: "hrms.staff-member" })
    );
    // Let the mount-time first page settle so it is not counted against the debounce.
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    search.mockClear();

    for (const text of ["a", "al", "ali", "ali ", "ali h"]) {
      act(() => result.current.setQuery(text));
      // Real time passes between keystrokes, which is what makes this a test of the 300ms window
      // rather than of the effect cleanup — see KEYSTROKE_GAP_MS.
      await typePause();
    }

    // 150ms of real typing later, nothing has gone out: five keystrokes inside one window leave one
    // pending timer, not five requests.
    expect(search).not.toHaveBeenCalled();

    await waitFor(() => expect(search).toHaveBeenCalledTimes(1));
    // And no trailing timer fires a sixth request after the fact.
    await act(async () => {
      await waitOutDebounce();
    });
    expect(search).toHaveBeenCalledTimes(1);
    expect(search.mock.calls[0][1]).toMatchObject({ search: "ali h", page: 1 });
  });

  it("a superseded response never overwrites a newer one", async () => {
    const slowFirst = deferred<ReturnType<typeof page>>();
    search
      // Mount-time page 1 for the empty query — deliberately left hanging.
      .mockImplementationOnce(() => slowFirst.promise)
      // The debounced request for "ali", which comes back first.
      .mockImplementationOnce(() => Promise.resolve(page(["newer"])));

    const { result } = renderHook(() =>
      useEntityLookupSearch({ entityTypeKey: "hrms.staff-member" })
    );

    act(() => result.current.setQuery("ali"));
    await waitFor(() => expect(result.current.items.map((i) => i.id)).toEqual(["newer"]));

    // Now the stale first response lands. Without the ticket guard this repopulates the list with
    // results for the empty query while the box still says "ali" — and looks like a server bug.
    await act(async () => {
      slowFirst.resolve(page(["stale"]));
      await slowFirst.promise;
    });

    expect(result.current.items.map((i) => i.id)).toEqual(["newer"]);
  });

  it("a superseded FAILURE never overwrites a newer successful result", async () => {
    const slowFailure = deferred<ReturnType<typeof page>>();
    const failing = new Error("Network Error");
    search
      .mockImplementationOnce(() => slowFailure.promise.then(() => Promise.reject(failing)))
      .mockImplementationOnce(() => Promise.resolve(page(["newer"])));

    const { result } = renderHook(() =>
      useEntityLookupSearch({ entityTypeKey: "hrms.staff-member" })
    );

    act(() => result.current.setQuery("ali"));
    await waitFor(() => expect(result.current.items.map((i) => i.id)).toEqual(["newer"]));

    await act(async () => {
      slowFailure.resolve(page([]));
      await slowFailure.promise.catch(() => undefined);
    });

    // An error banner over a correct list is worse than either alone: it tells the user the results
    // they can see are wrong.
    expect(result.current.error).toBeNull();
    expect(result.current.items.map((i) => i.id)).toEqual(["newer"]);
  });

  it("unmounting aborts the in-flight request and writes no state afterwards", async () => {
    const hanging = deferred<ReturnType<typeof page>>();
    let capturedSignal: AbortSignal | undefined;
    search.mockImplementation((_key, _query, signal) => {
      capturedSignal = signal;
      return hanging.promise;
    });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const { unmount } = renderHook(() =>
      useEntityLookupSearch({ entityTypeKey: "hrms.staff-member" })
    );
    await waitFor(() => expect(search).toHaveBeenCalledTimes(1));

    unmount();
    expect(capturedSignal?.aborted).toBe(true);

    // Resolving after unmount must be inert. If the guard were missing, React would either warn or
    // silently drop a write into a dead fiber — neither of which is a state this hook should reach.
    await act(async () => {
      hanging.resolve(page(["late"]));
      await hanging.promise;
    });

    expect(consoleError).not.toHaveBeenCalled();
  });

  it("paging accumulates items rather than replacing them", async () => {
    search
      .mockResolvedValueOnce(page(["a", "b"], true))
      .mockResolvedValueOnce(page(["c", "d"], false));

    const { result } = renderHook(() =>
      useEntityLookupSearch({ entityTypeKey: "hrms.staff-member" })
    );
    await waitFor(() => expect(result.current.items).toHaveLength(2));
    expect(result.current.hasNextPage).toBe(true);

    act(() => result.current.loadMore());

    await waitFor(() => expect(result.current.items).toHaveLength(4));
    expect(result.current.items.map((i) => i.id)).toEqual(["a", "b", "c", "d"]);
    expect(search.mock.calls[1][1]).toMatchObject({ page: 2 });
    expect(result.current.hasNextPage).toBe(false);
  });

  it("loadMore is a no-op at the end of the list, so it cannot skip a page", async () => {
    search.mockResolvedValue(page(["a"], false));

    const { result } = renderHook(() =>
      useEntityLookupSearch({ entityTypeKey: "hrms.staff-member" })
    );
    await waitFor(() => expect(result.current.items).toHaveLength(1));

    act(() => result.current.loadMore());
    await act(async () => {
      await waitOutDebounce();
    });

    expect(search).toHaveBeenCalledTimes(1);
  });

  it("a query change resets to page 1 and clears the accumulated items", async () => {
    // The third response is held open on purpose. Letting it resolve immediately would make the
    // clear and the refill indistinguishable, and the assertion that matters is that the old rows
    // are gone BEFORE the new ones arrive -- leaving four stale rows on screen for the length of a
    // round trip reads as a filter that ignored the text just typed.
    const thirdResponse = deferred<ReturnType<typeof page>>();
    search
      .mockImplementationOnce(() => Promise.resolve(page(["a", "b"], true)))
      .mockImplementationOnce(() => Promise.resolve(page(["c", "d"], true)))
      .mockImplementationOnce(() => thirdResponse.promise);

    const { result } = renderHook(() =>
      useEntityLookupSearch({ entityTypeKey: "hrms.staff-member" })
    );
    await waitFor(() => expect(result.current.items).toHaveLength(2));
    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.items).toHaveLength(4));

    act(() => result.current.setQuery("fresh"));

    await waitFor(() => expect(search).toHaveBeenCalledTimes(3));
    expect(result.current.items).toEqual([]);
    expect(result.current.hasNextPage).toBe(false);
    expect(search.mock.calls[2][1]).toMatchObject({ search: "fresh", page: 1 });

    await act(async () => {
      thirdResponse.resolve(page(["fresh"], false));
      await thirdResponse.promise;
    });
    expect(result.current.items.map((i) => i.id)).toEqual(["fresh"]);
  });

  it("does not request anything when no target entity type is configured", async () => {
    const { result } = renderHook(() => useEntityLookupSearch({ entityTypeKey: null }));

    act(() => result.current.setQuery("ali"));
    await act(async () => {
      await waitOutDebounce();
    });

    // An unconfigured EntityReference field is a resting state, not an error: the control renders
    // "no target entity type configured" and this hook must stay silent rather than 404 on "".
    expect(search).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("does not request anything while disabled, and loads once enabled", async () => {
    const { result, rerender } = renderHook(
      (props: { enabled: boolean }) =>
        useEntityLookupSearch({ entityTypeKey: "hrms.staff-member", enabled: props.enabled }),
      { initialProps: { enabled: false } }
    );

    await act(async () => {
      await waitOutDebounce();
    });
    expect(search).not.toHaveBeenCalled();

    rerender({ enabled: true });

    await waitFor(() => expect(search).toHaveBeenCalledTimes(1));
    expect(result.current.items).toEqual([]);
  });

  it("classifies a search failure instead of reporting an empty list", async () => {
    const forbidden = new Error("Permission required") as Error & { details?: unknown };
    forbidden.details = { statusCode: 403, errorCode: "AUTH_FORBIDDEN", message: "nope" };
    search.mockRejectedValue(forbidden);

    const { result } = renderHook(() =>
      useEntityLookupSearch({ entityTypeKey: "hrms.staff-member" })
    );

    // `items: []` with `error: null` means "no matches". A failure must not be able to produce that
    // same pair, or a permission problem renders as "this type has no records".
    await waitFor(() => expect(result.current.error?.kind).toBe("forbidden"));
    expect(result.current.isLoading).toBe(false);
  });

  it("reload re-runs the current query from page 1", async () => {
    search.mockResolvedValue(page(["a"], false));

    const { result } = renderHook(() =>
      useEntityLookupSearch({ entityTypeKey: "hrms.staff-member" })
    );
    await waitFor(() => expect(result.current.items).toHaveLength(1));

    act(() => result.current.reload());

    await waitFor(() => expect(search).toHaveBeenCalledTimes(2));
    expect(search.mock.calls[1][1]).toMatchObject({ page: 1 });
    // Not two copies of page 1 stacked on each other.
    expect(result.current.items).toHaveLength(1);
  });

  it("changing the target entity type clears the box as well as the list", async () => {
    search.mockResolvedValue(page(["a"], false));

    const { result, rerender } = renderHook(
      (props: { key: string }) => useEntityLookupSearch({ entityTypeKey: props.key }),
      { initialProps: { key: "hrms.staff-member" } }
    );
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    act(() => result.current.setQuery("ali"));
    await waitFor(() => expect(search).toHaveBeenCalledTimes(2));

    rerender({ key: "identity.user" });

    // The typed text was a search of a DIFFERENT type's records; carrying it over would show results
    // for a query the user never made against this type.
    await waitFor(() => expect(result.current.query).toBe(""));
    await waitFor(() => expect(search.mock.calls.at(-1)?.[0]).toBe("identity.user"));
    expect(search.mock.calls.at(-1)?.[1]).toMatchObject({ search: null, page: 1 });
  });
});
