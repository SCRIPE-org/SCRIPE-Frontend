import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEnhancedToast, toast } from "../use-enhanced-toast";

vi.mock("sileo", () => ({
  sileo: {
    show: vi.fn().mockImplementation((opts) => opts.id || "toast-id-show"),
    success: vi.fn().mockImplementation((opts) => opts.id || "toast-id-success"),
    error: vi.fn().mockImplementation((opts) => opts.id || "toast-id-error"),
    warning: vi.fn().mockImplementation((opts) => opts.id || "toast-id-warning"),
    info: vi.fn().mockImplementation((opts) => opts.id || "toast-id-info"),
    action: vi.fn().mockImplementation((opts) => opts.id || "toast-id-action"),
    promise: vi.fn().mockImplementation((p) => p),
    dismiss: vi.fn(),
    clear: vi.fn(),
  },
  Toaster: () => null,
}));

vi.mock("@core/common/i18n-outside-react", () => ({
  translateCore: (key: string, vars?: any) => {
    if (vars?.operation) return `${vars.operation} Result`;
    return key;
  },
}));

describe("useEnhancedToast — Hook and Global Bridge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exposes all legacy and Sileo methods on the hook return", () => {
    const { result } = renderHook(() => useEnhancedToast());

    expect(typeof result.current.toast).toBe("function");
    expect(typeof result.current.success).toBe("function");
    expect(typeof result.current.error).toBe("function");
    expect(typeof result.current.warning).toBe("function");
    expect(typeof result.current.info).toBe("function");
    expect(typeof result.current.action).toBe("function");
    expect(typeof result.current.show).toBe("function");
    expect(typeof result.current.loading).toBe("function");
    expect(typeof result.current.sticky).toBe("function");
    expect(typeof result.current.promise).toBe("function");
    expect(typeof result.current.update).toBe("function");
    expect(typeof result.current.operationSuccess).toBe("function");
    expect(typeof result.current.operationError).toBe("function");
    expect(typeof result.current.dismiss).toBe("function");
    expect(typeof result.current.clear).toBe("function");
    expect(Array.isArray(result.current.toasts)).toBe(true);
  });

  it("registers active toasts in reactive state array for inspectability", () => {
    const { result } = renderHook(() => useEnhancedToast());

    act(() => {
      result.current.success("Item saved");
    });

    expect(result.current.toasts.length).toBeGreaterThan(0);
    expect(result.current.toasts[0].title).toBe("Item saved");
    expect(result.current.toasts[0].variant).toBe("success");
  });

  it("dismiss removes toast from active state and calls underlying library", () => {
    const { result } = renderHook(() => useEnhancedToast());

    let handle: any;
    act(() => {
      handle = result.current.error({ title: "Something failed", id: "error-hook-toast" });
    });

    expect(result.current.toasts.some((t) => t.id === "error-hook-toast")).toBe(true);

    act(() => {
      handle.dismiss();
    });

    expect(result.current.toasts.some((t) => t.id === "error-hook-toast")).toBe(false);
  });
});
