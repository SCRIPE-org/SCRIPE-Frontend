/**
 * useResolveEntityReference tests (Wave 4)
 *
 * The load-bearing test in this file is `keeps forbidden, missing and invalid three distinct
 * statuses`. Everything else is supporting: if those three ever collapse into one, a reference
 * pointing at a deleted record becomes indistinguishable from one the viewer merely cannot see, and
 * nobody finds out until someone audits the data by hand.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, StrictMode, type ReactNode } from "react";
import { useResolveEntityReference } from "./useResolveEntityReference";
import { customFieldsContainer } from "../../../../di";
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

const resolve = vi.mocked(customFieldsContainer.entityLookupRepository.resolve);

function strictModeWrapper({ children }: { children: ReactNode }) {
  return createElement(StrictMode, null, children);
}

const REFERENCE = { entityTypeKey: "hrms.staff-member", entityId: "AbC-dEf_123" };

function resolvedItem(overrides: Partial<EntityLookupItem> = {}): EntityLookupItem {
  return {
    id: "AbC-dEf_123",
    displayName: "Ali Hassan",
    secondary: "Head Coach",
    isActive: true,
    ...overrides,
  };
}

/** The transport's shape for a failure that carried an `ErrorResponse` body. */
function apiErrorWithBody(statusCode: number, errorCode: string) {
  const error = new Error(`status ${statusCode}`) as Error & { details?: unknown };
  error.details = { statusCode, errorCode, message: `status ${statusCode}` };
  return error;
}

function deferred<T>() {
  let settle!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    settle = r;
  });
  return { promise, settle };
}

describe("useResolveEntityReference", () => {
  beforeEach(() => {
    resolve.mockReset();
    resolve.mockResolvedValue(resolvedItem());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resolves a held reference after StrictMode replays the effect", async () => {
    const record = resolvedItem({ displayName: "Super Admin", secondary: "superadmin" });
    const response = deferred<EntityLookupItem>();
    resolve.mockReturnValue(response.promise);

    const { result } = renderHook(() => useResolveEntityReference(REFERENCE), {
      wrapper: strictModeWrapper,
      reactStrictMode: true,
    });

    await act(async () => {
      response.settle(record);
      await response.promise;
    });

    await waitFor(() => expect(result.current.status).toBe("resolved"));
    expect(result.current.item).toEqual(record);
  });

  it("is idle and silent when no reference is held", async () => {
    const { result } = renderHook(() => useResolveEntityReference(null));

    expect(result.current.status).toBe("idle");
    expect(result.current.item).toBeNull();
    expect(resolve).not.toHaveBeenCalled();
  });

  it("resolves a held reference to its display record", async () => {
    const { result } = renderHook(() => useResolveEntityReference(REFERENCE));

    await waitFor(() => expect(result.current.status).toBe("resolved"));
    expect(result.current.item?.displayName).toBe("Ali Hassan");
    expect(result.current.item?.secondary).toBe("Head Coach");
    expect(resolve).toHaveBeenCalledWith(
      "hrms.staff-member",
      "AbC-dEf_123",
      expect.any(AbortSignal)
    );
  });

  it("treats a dormant row as resolved and still valid", async () => {
    resolve.mockResolvedValue(resolvedItem({ isActive: false, displayName: "Departed Coach" }));

    const { result } = renderHook(() => useResolveEntityReference(REFERENCE));

    // isActive:false is a live row that is merely dormant. Anything other than `resolved` here would
    // make a historical reference look broken.
    await waitFor(() => expect(result.current.status).toBe("resolved"));
    expect(result.current.item?.isActive).toBe(false);
  });

  it("reports 403 as forbidden — the caller's role, not the data", async () => {
    resolve.mockRejectedValue(apiErrorWithBody(403, "AUTH_FORBIDDEN"));

    const { result } = renderHook(() => useResolveEntityReference(REFERENCE));

    await waitFor(() => expect(result.current.status).toBe("forbidden"));
    expect(result.current.item).toBeNull();
  });

  it("reports 404 as missing — the data, not the caller", async () => {
    resolve.mockRejectedValue(apiErrorWithBody(404, "ENTITY_NOT_FOUND"));

    const { result } = renderHook(() => useResolveEntityReference(REFERENCE));

    await waitFor(() => expect(result.current.status).toBe("missing"));
  });

  it("reports a malformed stored id as invalid", async () => {
    resolve.mockRejectedValue(apiErrorWithBody(422, "ENTITY_INVALID_ID"));

    const { result } = renderHook(() => useResolveEntityReference(REFERENCE));

    await waitFor(() => expect(result.current.status).toBe("invalid"));
  });

  it("keeps forbidden, missing and invalid three distinct statuses", async () => {
    const statuses: string[] = [];
    for (const error of [
      apiErrorWithBody(403, "AUTH_FORBIDDEN"),
      apiErrorWithBody(404, "ENTITY_NOT_FOUND"),
      apiErrorWithBody(422, "ENTITY_INVALID_ID"),
    ]) {
      resolve.mockReset();
      resolve.mockRejectedValue(error);
      const { result, unmount } = renderHook(() => useResolveEntityReference(REFERENCE));
      await waitFor(() => expect(result.current.status).not.toBe("loading"));
      statuses.push(result.current.status);
      unmount();
    }

    expect(statuses).toEqual(["forbidden", "missing", "invalid"]);
    expect(new Set(statuses).size).toBe(3);
  });

  it("narrows an entity type this deployment cannot answer for to a generic error, not to missing", async () => {
    resolve.mockRejectedValue(apiErrorWithBody(404, "ENTITY_UNKNOWN_TYPE"));

    const { result } = renderHook(() => useResolveEntityReference(REFERENCE));

    // A configuration fault is not a deleted record. Saying "no longer exists" would send someone
    // hunting for data loss that never happened.
    await waitFor(() => expect(result.current.status).toBe("error"));
  });

  it("falls back to a generic error when the failure carried nothing to classify", async () => {
    resolve.mockRejectedValue(new Error("Network Error"));

    const { result } = renderHook(() => useResolveEntityReference(REFERENCE));

    await waitFor(() => expect(result.current.status).toBe("error"));
  });

  it("does not re-request when re-rendered with an equal but newly allocated reference object", async () => {
    const { result, rerender } = renderHook(
      (props: { reference: { entityTypeKey: string; entityId: string } }) =>
        useResolveEntityReference(props.reference),
      { initialProps: { reference: { ...REFERENCE } } }
    );
    await waitFor(() => expect(result.current.status).toBe("resolved"));

    // Callers hold this in form state and hand over a fresh literal on most renders. Depending on
    // the object identity would fire a cross-module query per keystroke typed into an UNRELATED
    // field on the same form.
    rerender({ reference: { ...REFERENCE } });
    rerender({ reference: { ...REFERENCE } });

    expect(resolve).toHaveBeenCalledTimes(1);
  });

  it("re-requests when the reference actually changes, and the older answer cannot win", async () => {
    const slowFirst = deferred<EntityLookupItem>();
    resolve
      .mockImplementationOnce(() => slowFirst.promise)
      .mockImplementationOnce(() => Promise.resolve(resolvedItem({ displayName: "Second Pick" })));

    const { result, rerender } = renderHook(
      (props: { reference: { entityTypeKey: string; entityId: string } }) =>
        useResolveEntityReference(props.reference),
      { initialProps: { reference: REFERENCE } }
    );

    rerender({ reference: { entityTypeKey: "hrms.staff-member", entityId: "second-id" } });
    await waitFor(() => expect(result.current.item?.displayName).toBe("Second Pick"));

    await act(async () => {
      slowFirst.settle(resolvedItem({ displayName: "First Pick" }));
      await slowFirst.promise;
    });

    // Without the ticket guard the field displays the record the user just replaced while holding
    // the id of the one they chose — a mismatch nothing on screen explains.
    expect(result.current.item?.displayName).toBe("Second Pick");
  });

  it("clearing the reference cannot be undone by a resolve still in flight", async () => {
    const hanging = deferred<EntityLookupItem>();
    resolve.mockImplementationOnce(() => hanging.promise);

    const { result, rerender } = renderHook(
      (props: { reference: { entityTypeKey: string; entityId: string } | null }) =>
        useResolveEntityReference(props.reference),
      { initialProps: { reference: REFERENCE as { entityTypeKey: string; entityId: string } | null } }
    );
    await waitFor(() => expect(result.current.status).toBe("loading"));

    rerender({ reference: null });
    expect(result.current.status).toBe("idle");

    await act(async () => {
      hanging.settle(resolvedItem());
      await hanging.promise;
    });

    // A field the user just emptied must not repopulate itself a moment later.
    expect(result.current.status).toBe("idle");
    expect(result.current.item).toBeNull();
  });

  it("unmounting aborts the in-flight resolve and writes no state afterwards", async () => {
    const hanging = deferred<EntityLookupItem>();
    let capturedSignal: AbortSignal | undefined;
    resolve.mockImplementation((_key, _id, signal) => {
      capturedSignal = signal;
      return hanging.promise;
    });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const { unmount } = renderHook(() => useResolveEntityReference(REFERENCE));
    await waitFor(() => expect(resolve).toHaveBeenCalledTimes(1));

    unmount();
    expect(capturedSignal?.aborted).toBe(true);

    await act(async () => {
      hanging.settle(resolvedItem());
      await hanging.promise;
    });

    expect(consoleError).not.toHaveBeenCalled();
  });

  it("retry re-runs the resolve for the same reference", async () => {
    resolve.mockRejectedValueOnce(new Error("Network Error"));
    resolve.mockResolvedValueOnce(resolvedItem());

    const { result } = renderHook(() => useResolveEntityReference(REFERENCE));
    await waitFor(() => expect(result.current.status).toBe("error"));

    act(() => result.current.retry());

    await waitFor(() => expect(result.current.status).toBe("resolved"));
    expect(resolve).toHaveBeenCalledTimes(2);
  });

  it("does not report an aborted resolve as a failure", async () => {
    const aborted = new Error("Download intercepted by external download manager");
    aborted.name = "DownloadInterceptedError";
    resolve.mockRejectedValue(aborted);

    const { result } = renderHook(() => useResolveEntityReference(REFERENCE));

    // Our own cancellation reaches the transport's `isExternalAbort` check and comes back as a
    // DownloadInterceptedError. Left unrecognised it would flash "no access" over a field that is
    // simply mid-refresh.
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.status).toBe("loading");
  });
});
