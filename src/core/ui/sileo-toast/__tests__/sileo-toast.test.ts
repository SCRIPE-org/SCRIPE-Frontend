import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast, sileo, subscribeActiveToasts, getActiveToasts } from "../sileo-toast";

// Mock sileo underlying library methods
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

describe("Sileo Toast System — Core Controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fires success toast and returns ToastHandle with string coercion and dismiss/update", () => {
    const handle = toast.success("Operation complete");

    // String coercion and property checks
    expect(String(handle)).toBeTruthy();
    expect(handle.id).toBeTruthy();
    expect(typeof handle.dismiss).toBe("function");
    expect(typeof handle.update).toBe("function");

    expect(sileo.success).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Operation complete",
        type: "success",
        duration: 4000,
        roundness: 16,
        styles: expect.objectContaining({
          description: expect.stringContaining("text-nx-ink-2!"),
        }),
      })
    );

    // Test calling handle.dismiss()
    handle.dismiss();
    expect(sileo.dismiss).toHaveBeenCalledWith(handle.id);

    // Test calling handle.update()
    handle.update({ title: "Updated complete", variant: "info" });
    expect(sileo.show).toHaveBeenCalledWith(
      expect.objectContaining({
        id: handle.id,
        title: "Updated complete",
        type: "info",
      })
    );
  });

  it("supports invoice and action workflow where handle.dismiss() is invoked directly", () => {
    const processingToast = toast({
      title: "Downloading Invoice PDF",
      description: "INV-2026-001",
      variant: "info",
      duration: 30000,
    });

    expect(typeof processingToast.dismiss).toBe("function");
    expect(() => processingToast.dismiss()).not.toThrow();
    expect(sileo.dismiss).toHaveBeenCalledWith(processingToast.id);
  });

  it("fires error / destructive toast with full options and custom duration", () => {
    const handle = toast.error({
      title: "Failed to save",
      description: "Database connection timed out",
      duration: 8000,
      roundness: 12,
      id: "custom-error-id",
    });

    expect(handle.id).toBe("custom-error-id");
    expect(sileo.error).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "custom-error-id",
        title: "Failed to save",
        description: "Database connection timed out",
        type: "error",
        duration: 8000,
        roundness: 12,
      })
    );
  });

  it("fires warning and info toasts cleanly", () => {
    toast.warning("Low disk space");
    expect(sileo.warning).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Low disk space",
        type: "warning",
      })
    );

    toast.info("Update available");
    expect(sileo.info).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Update available",
        type: "info",
      })
    );
  });

  it("supports interactive action toasts with action button or href object", () => {
    const onClick = vi.fn();
    const handle = toast.action({
      title: "Entity deleted",
      description: "Do you wish to undo this action?",
      button: {
        title: "Undo",
        onClick,
      },
    });

    expect(typeof handle.dismiss).toBe("function");
    expect(sileo.action).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Entity deleted",
        type: "action",
        button: expect.objectContaining({
          title: "Undo",
          onClick,
        }),
      })
    );

    // Legacy action with label/onClick
    toast({
      title: "Quota reached",
      action: {
        label: "Upgrade Plan",
        onClick,
      },
    });
    expect(sileo.action).toHaveBeenCalledWith(
      expect.objectContaining({
        button: expect.objectContaining({
          title: "Upgrade Plan",
        }),
      })
    );
  });

  it("chains promise states with loading, success, and error", async () => {
    const mockPromise = Promise.resolve({ data: "ok" });
    const result = toast.promise(mockPromise, {
      loading: { title: "Processing..." },
      success: (res: any) => ({ title: `Completed: ${res.data}` }),
      error: { title: "Failed to process" },
    });

    expect(sileo.promise).toHaveBeenCalledWith(
      mockPromise,
      expect.objectContaining({
        loading: expect.objectContaining({ title: "Processing..." }),
        position: undefined,
      })
    );
    expect(result).toBe(mockPromise);
  });

  it("supports sticky toasts and dismiss / clear operations", () => {
    toast.sticky("Persistent banner");
    expect(sileo.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Persistent banner",
        duration: null,
      })
    );

    toast.dismiss("toast-123");
    expect(sileo.dismiss).toHaveBeenCalledWith("toast-123");

    toast.clear("top-right");
    expect(sileo.clear).toHaveBeenCalledWith("top-right");
  });

  it("tracks active toasts reactively through subscribeActiveToasts", () => {
    let activeList: any[] = [];
    const unsubscribe = subscribeActiveToasts((toasts) => {
      activeList = toasts;
    });

    const h = toast.success({ title: "Tracked toast", id: "tracked-1" });
    expect(activeList.some((t) => t.id === "tracked-1")).toBe(true);

    h.dismiss();
    expect(activeList.some((t) => t.id === "tracked-1")).toBe(false);

    unsubscribe();
  });

  it("supports operationSuccess and operationError helpers", () => {
    toast.operationSuccess("Create", "Court");
    expect(sileo.success).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Create Result",
      })
    );

    toast.operationError("Delete", "Court", "Foreign key constraint");
    expect(sileo.error).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Delete Result",
        description: "Foreign key constraint",
      })
    );
  });

  it("supports calling toast() directly as function with variant mapping", () => {
    toast("Quick message");
    expect(sileo.success).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Quick message" })
    );

    toast({
      title: "Danger",
      description: "Severe warning",
      variant: "destructive",
    });
    expect(sileo.error).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Danger", description: "Severe warning" })
    );
  });

  it("supports toast.rich() with full options, rich description, and action button", () => {
    const onClick = vi.fn();
    const handle = toast.rich({
      title: "Rich Notification",
      description: "Detailed system event with action button",
      button: {
        title: "Action",
        onClick,
      },
      duration: 5000,
    });

    expect(handle.id).toBeTruthy();
    expect(sileo.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Rich Notification",
        description: "Detailed system event with action button",
        button: expect.objectContaining({
          title: "Action",
        }),
        duration: 5000,
      })
    );
  });

  it("supports button with 'label' property fallback and custom alias", () => {
    const onClick = vi.fn();
    const handle = toast.custom({
      title: "Custom Notification",
      button: {
        label: "Retry",
        onClick,
      } as any,
    });

    expect(handle.id).toBeTruthy();
    expect(sileo.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Custom Notification",
        button: expect.objectContaining({
          title: "Retry",
        }),
      })
    );
  });

  it("resolves logical positions (top-end, bottom-end) in toast options", () => {
    toast.rich({
      title: "Logical End Notification",
      position: "top-end",
    });

    expect(sileo.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Logical End Notification",
        position: "top-right", // LTR document default
      })
    );
  });
});
