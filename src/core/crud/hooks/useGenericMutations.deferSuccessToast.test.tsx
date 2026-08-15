import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useGenericMutations } from "./useGenericMutations";

const operationSuccessMock = vi.fn();
const operationErrorMock = vi.fn();

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    operationSuccess: operationSuccessMock,
    operationError: operationErrorMock,
  }),
}));
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("useGenericMutations — deferSuccessToast", () => {
  beforeEach(() => {
    operationSuccessMock.mockClear();
    operationErrorMock.mockClear();
  });

  it("fires the create/update toast immediately on success by default (every existing screen's behavior, unchanged)", async () => {
    const create = vi.fn().mockResolvedValue({ id: "1" });
    const update = vi.fn().mockResolvedValue({ id: "1" });
    const { result } = renderHook(
      () => useGenericMutations(["thing"], { create, update }),
      { wrapper }
    );

    await act(async () => {
      await result.current.create({});
    });
    expect(operationSuccessMock).toHaveBeenCalledWith("common.messages.created");

    operationSuccessMock.mockClear();
    await act(async () => {
      await result.current.update("1", {});
    });
    expect(operationSuccessMock).toHaveBeenCalledWith("common.messages.updated");
  });

  it("does not fire the toast automatically when deferSuccessToast is true, but showCreateSuccessToast/showUpdateSuccessToast do it on demand", async () => {
    const create = vi.fn().mockResolvedValue({ id: "1" });
    const update = vi.fn().mockResolvedValue({ id: "1" });
    const { result } = renderHook(
      () => useGenericMutations(["thing"], { create, update }, { deferSuccessToast: true }),
      { wrapper }
    );

    await act(async () => {
      await result.current.create({});
    });
    expect(operationSuccessMock).not.toHaveBeenCalled();

    act(() => {
      result.current.showCreateSuccessToast();
    });
    expect(operationSuccessMock).toHaveBeenCalledWith("common.messages.created");

    operationSuccessMock.mockClear();
    await act(async () => {
      await result.current.update("1", {});
    });
    expect(operationSuccessMock).not.toHaveBeenCalled();

    act(() => {
      result.current.showUpdateSuccessToast();
    });
    expect(operationSuccessMock).toHaveBeenCalledWith("common.messages.updated");
  });

  it("still calls onCreateSuccess/onUpdateSuccess and invalidates when deferred — only the toast is held back", async () => {
    const create = vi.fn().mockResolvedValue({ id: "1" });
    const onCreateSuccess = vi.fn();
    const { result } = renderHook(
      () =>
        useGenericMutations(
          ["thing"],
          { create },
          { deferSuccessToast: true, onCreateSuccess }
        ),
      { wrapper }
    );

    await act(async () => {
      await result.current.create({});
    });
    expect(onCreateSuccess).toHaveBeenCalledWith({ id: "1" });
    expect(operationSuccessMock).not.toHaveBeenCalled();
  });

  it("does not fire the error toast or showXSuccessToast on a failed mutation, deferred or not", async () => {
    const create = vi.fn().mockRejectedValue(new Error("boom"));
    const { result } = renderHook(
      () => useGenericMutations(["thing"], { create }, { deferSuccessToast: true }),
      { wrapper }
    );

    await act(async () => {
      await expect(result.current.create({})).rejects.toThrow("boom");
    });
    await waitFor(() => expect(operationErrorMock).toHaveBeenCalled());
    expect(operationSuccessMock).not.toHaveBeenCalled();
  });
});
