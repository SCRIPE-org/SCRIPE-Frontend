import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  isSudoCancelledError,
  SudoCancelledError,
  useSudoStore,
} from "@core/store/useSudoStore";
import { useGenericMutations } from "../useGenericMutations";

const { mockOperationSuccess, mockOperationError } = vi.hoisted(() => ({
  mockOperationSuccess: vi.fn(),
  mockOperationError: vi.fn(),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    operationSuccess: mockOperationSuccess,
    operationError: mockOperationError,
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    direction: "ltr" as const,
  }),
}));

interface SampleItem {
  id: string;
  name: string;
}

describe("useSudoStore cancellation contract & useGenericMutations rollback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSudoStore.getState().reset();
  });

  it("rejects waiters with SudoCancelledError on closeModal, markLocked, and reset and matches legacy shapes", async () => {
    const cancelWaiter = useSudoStore.getState().requestElevation();
    useSudoStore.getState().closeModal();
    await expect(cancelWaiter).rejects.toSatisfy(
      (err: unknown) =>
        err instanceof SudoCancelledError &&
        err.code === "SUDO_CANCELLED" &&
        err.message === "Sudo verification was cancelled." &&
        isSudoCancelledError(err)
    );

    const lockWaiter = useSudoStore.getState().requestElevation();
    useSudoStore.getState().markLocked();
    await expect(lockWaiter).rejects.toSatisfy(
      (err: unknown) =>
        err instanceof SudoCancelledError &&
        err.code === "SUDO_CANCELLED" &&
        err.message === "Sudo session locked." &&
        isSudoCancelledError(err)
    );

    const resetWaiter = useSudoStore.getState().requestElevation();
    useSudoStore.getState().reset();
    await expect(resetWaiter).rejects.toSatisfy(
      (err: unknown) =>
        err instanceof SudoCancelledError &&
        err.code === "SUDO_CANCELLED" &&
        err.message === "Sudo session reset." &&
        isSudoCancelledError(err)
    );

    expect(isSudoCancelledError({ code: "SUDO_CANCELLED" })).toBe(true);
    expect(isSudoCancelledError(new Error("Sudo verification was cancelled."))).toBe(true);
    expect(isSudoCancelledError(new Error("Forbidden"))).toBe(false);
    expect(isSudoCancelledError(null)).toBe(false);
  });

  it("suppresses operationError toast on SudoCancelledError across create/update/delete while still rolling back optimisticDelete", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const baseKey = ["identity", "admins"] as const;
    const initialList = {
      items: [
        { id: "1", name: "Alice" },
        { id: "2", name: "Bob" },
      ],
    };
    queryClient.setQueryData(baseKey, initialList);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const onErrorCallback = vi.fn();
    const cancelledErr = new SudoCancelledError("Sudo verification was cancelled.");

    const { result } = renderHook(
      () =>
        useGenericMutations<SampleItem, { name: string }, { name: string }>(
          baseKey,
          {
            create: vi.fn().mockRejectedValue(cancelledErr),
            update: vi.fn().mockRejectedValue(cancelledErr),
            delete: vi.fn().mockRejectedValue(cancelledErr),
          },
          { optimisticDelete: true, onError: onErrorCallback }
        ),
      { wrapper }
    );

    await act(async () => {
      await expect(result.current.create({ name: "Charlie" })).rejects.toBe(cancelledErr);
      await expect(result.current.update("1", { name: "Alice2" })).rejects.toBe(cancelledErr);
      await expect(result.current.remove("1")).rejects.toBe(cancelledErr);
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(baseKey)).toEqual(initialList);
    });
    expect(mockOperationError).not.toHaveBeenCalled();
    expect(onErrorCallback).toHaveBeenCalledTimes(3);

    // Non-cancellation error STILL triggers operationError toast AND rolls back optimisticDelete
    const networkErr = new Error("Upstream unavailable");
    const { result: failResult } = renderHook(
      () =>
        useGenericMutations<SampleItem>(
          baseKey,
          { delete: vi.fn().mockRejectedValue(networkErr) },
          { optimisticDelete: true }
        ),
      { wrapper }
    );

    await act(async () => {
      await expect(failResult.current.remove("2")).rejects.toBe(networkErr);
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(baseKey)).toEqual(initialList);
    });
    expect(mockOperationError).toHaveBeenCalledWith("Delete", undefined, "Upstream unavailable");
  });
});
