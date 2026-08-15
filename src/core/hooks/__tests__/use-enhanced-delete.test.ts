import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useEnhancedDelete } from "../use-enhanced-delete";

// Stage-4 ErrorHandling.md finding F2: executeDelete's catch block used to
// discard the real caught error entirely and always show a generic
// "Failed to delete {itemType}" message — same bug class as F-78/F-98/F-99
// in useGenericMutations.ts, different mechanism. Mock the toast layer at
// the same module boundary use-permission.test.ts mocks its store, so these
// tests assert exactly what executeDelete passes to operationError without
// depending on the toast dispatch/render pipeline.
const { mockOperationError, mockOperationSuccess } = vi.hoisted(() => ({
  mockOperationError: vi.fn(),
  mockOperationSuccess: vi.fn(),
}));

vi.mock("../use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    operationError: mockOperationError,
    operationSuccess: mockOperationSuccess,
  }),
}));

describe("useEnhancedDelete — error surfacing on delete failure", () => {
  beforeEach(() => {
    mockOperationError.mockClear();
    mockOperationSuccess.mockClear();
  });

  it("surfaces the real backend error message (response.data.message) instead of a generic fallback", async () => {
    const { result } = renderHook(() => useEnhancedDelete());
    const backendError = Object.assign(
      new Error("Cannot delete this admin: protected super-admin account"),
      {
        response: {
          data: { message: "Cannot delete this admin: protected super-admin account" },
        },
      }
    );
    const deleteFn = vi.fn().mockRejectedValue(backendError);

    await act(async () => {
      await result.current.confirmDelete(deleteFn, { itemType: "Admin", itemName: "root-admin" });
    });
    await act(async () => {
      await result.current.executeDelete();
    });

    expect(mockOperationError).toHaveBeenCalledWith(
      "Delete",
      "root-admin",
      "Cannot delete this admin: protected super-admin account"
    );
  });

  it("reads response.data.error when response.data.message is absent", async () => {
    const { result } = renderHook(() => useEnhancedDelete());
    const backendError = { response: { data: { error: "Webhook has active deliveries" } } };
    const deleteFn = vi.fn().mockRejectedValue(backendError);

    await act(async () => {
      await result.current.confirmDelete(deleteFn, { itemType: "Webhook" });
    });
    await act(async () => {
      await result.current.executeDelete();
    });

    expect(mockOperationError).toHaveBeenCalledWith(
      "Delete",
      undefined,
      "Webhook has active deliveries"
    );
  });

  it("falls back to a plain Error's .message when there is no response envelope", async () => {
    const { result } = renderHook(() => useEnhancedDelete());
    const deleteFn = vi.fn().mockRejectedValue(new Error("Network request failed"));

    await act(async () => {
      await result.current.confirmDelete(deleteFn, { itemType: "ApiKey" });
    });
    await act(async () => {
      await result.current.executeDelete();
    });

    expect(mockOperationError).toHaveBeenCalledWith("Delete", undefined, "Network request failed");
  });

  it("falls back to the generic message only when the caught error carries nothing usable", async () => {
    const { result } = renderHook(() => useEnhancedDelete());
    const deleteFn = vi.fn().mockRejectedValue({});

    await act(async () => {
      await result.current.confirmDelete(deleteFn, { itemType: "Widget" });
    });
    await act(async () => {
      await result.current.executeDelete();
    });

    expect(mockOperationError).toHaveBeenCalledWith("Delete", undefined, "Failed to delete widget");
  });

  it("still invokes the caller's onError callback with the original error", async () => {
    const { result } = renderHook(() => useEnhancedDelete());
    const backendError = new Error("real reason");
    const deleteFn = vi.fn().mockRejectedValue(backendError);
    const onError = vi.fn();

    await act(async () => {
      await result.current.confirmDelete(deleteFn, { onError });
    });
    await act(async () => {
      await result.current.executeDelete();
    });

    expect(onError).toHaveBeenCalledWith(backendError);
  });
});
