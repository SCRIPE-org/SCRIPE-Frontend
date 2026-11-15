import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  toast,
  sileo,
  subscribeActiveToasts,
  getActiveToasts,
  getResolvedThemeFill,
  setActiveToasterOptions,
} from "../sileo-toast";

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
    setActiveToasterOptions(undefined);
    document.documentElement.classList.remove("dark", "light");
    document.body.classList.remove("dark", "light");
    document.documentElement.removeAttribute("dir");
    toast.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    setActiveToasterOptions(undefined);
    document.documentElement.classList.remove("dark", "light");
    document.body.classList.remove("dark", "light");
    document.documentElement.removeAttribute("dir");
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
        fill: "var(--nx-surface)",
        roundness: 16,
        styles: expect.objectContaining({
          description: expect.stringContaining("text-nx-ink-2"),
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

  it("permits same-origin action.href paths and blocks unsafe schemes or external redirects", () => {
    const originalLocation = window.location;
    const mockLocation = {
      ...originalLocation,
      origin: "https://app.scripe.test",
      href: "https://app.scripe.test/dashboard",
    };
    Object.defineProperty(window, "location", {
      configurable: true,
      value: mockLocation,
    });

    try {
      toast({
        title: "Unsafe scheme",
        action: { label: "Bad", href: "javascript:alert(1)" },
      });
      const jsPayload = (sileo.action as any).mock.calls.at(-1)?.[0];
      jsPayload.button.onClick();
      expect(mockLocation.href).toBe("https://app.scripe.test/dashboard");

      toast({
        title: "Protocol relative",
        action: { label: "Bad", href: "//evil.example/phish" },
      });
      const protoRelPayload = (sileo.action as any).mock.calls.at(-1)?.[0];
      protoRelPayload.button.onClick();
      expect(mockLocation.href).toBe("https://app.scripe.test/dashboard");

      toast({
        title: "Cross origin",
        action: { label: "Bad", href: "https://evil.example/phish" },
      });
      const crossOriginPayload = (sileo.action as any).mock.calls.at(-1)?.[0];
      crossOriginPayload.button.onClick();
      expect(mockLocation.href).toBe("https://app.scripe.test/dashboard");

      toast({
        title: "Explicit scheme without slashes",
        action: { label: "Bad", href: "http:evil.example" },
      });
      const noSlashSchemePayload = (sileo.action as any).mock.calls.at(-1)?.[0];
      noSlashSchemePayload.button.onClick();
      expect(mockLocation.href).toBe("https://app.scripe.test/dashboard");

      toast({
        title: "Data URI",
        action: { label: "Bad", href: "data:text/html,<script>alert(1)</script>" },
      });
      const dataPayload = (sileo.action as any).mock.calls.at(-1)?.[0];
      dataPayload.button.onClick();
      expect(mockLocation.href).toBe("https://app.scripe.test/dashboard");

      toast({
        title: "Safe relative",
        action: { label: "View billing", href: "/account/billing?tab=plan" },
      });
      const safePayload = (sileo.action as any).mock.calls.at(-1)?.[0];
      safePayload.button.onClick();
      expect(mockLocation.href).toBe("https://app.scripe.test/account/billing?tab=plan");
    } finally {
      Object.defineProperty(window, "location", {
        configurable: true,
        value: originalLocation,
      });
    }
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

  it("prioritizes explicit .light/.dark classes over OS prefers-color-scheme in getResolvedThemeFill()", () => {
    const originalMatchMedia = window.matchMedia;
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("dark"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });

    try {
      // Explicit app light must beat OS dark
      document.documentElement.classList.add("light");
      expect(getResolvedThemeFill()).toBe("#ffffff");

      // Explicit app dark returns #15181c
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      expect(getResolvedThemeFill()).toBe("#15181c");

      // Fallback when neither class exists consults OS matchMedia
      document.documentElement.classList.remove("dark");
      expect(getResolvedThemeFill()).toBe("#15181c");
    } finally {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        configurable: true,
        value: originalMatchMedia,
      });
    }
  });

  it("merges custom fill, styles.description, and button.className cleanly via twMerge", () => {
    toast.action({
      title: "Custom Styled",
      description: "Contrast-safe body",
      fill: "#171717",
      styles: {
        description: "text-white/80",
      },
      button: {
        title: "Inspect",
        className: "bg-indigo-500 text-white",
        onClick: vi.fn(),
      },
    });

    expect(sileo.action).toHaveBeenCalledWith(
      expect.objectContaining({
        fill: "#171717",
        styles: expect.objectContaining({
          description: expect.stringContaining("text-white/80"),
          button: expect.stringContaining("bg-indigo-500"),
        }),
      })
    );

    const callArg = vi.mocked(sileo.action).mock.calls.at(-1)?.[0];
    expect(callArg?.styles?.description).not.toContain("text-nx-ink-2");
    expect(callArg?.styles?.button).not.toContain("bg-nx-raised");
    expect(callArg?.styles?.button).toContain("text-white");
  });

  it("inherits <SileoToaster options={{ fill, styles }} /> unless overridden per toast", () => {
    setActiveToasterOptions({
      fill: "#222222",
      styles: { description: "text-amber-300" },
    });

    toast.info("Inherited");
    expect(sileo.info).toHaveBeenCalledWith(
      expect.objectContaining({
        fill: "#222222",
        styles: expect.objectContaining({
          description: expect.stringContaining("text-amber-300"),
        }),
      })
    );

    toast.info({ title: "Per-toast override", fill: "#101010" });
    expect(sileo.info).toHaveBeenLastCalledWith(
      expect.objectContaining({
        fill: "#101010",
      })
    );
  });

  it("preserves variant and clears stale auto-dismiss timers on toast.update()", () => {
    vi.useFakeTimers();

    const handle = toast.loading({ title: "Uploading" });
    expect(getActiveToasts().find((t) => t.id === handle.id)?.variant).toBe("loading");

    // Partial update without variant keeps existing loading variant
    handle.update({ title: "50% complete" });
    expect(sileo.show).toHaveBeenCalledWith(
      expect.objectContaining({
        id: handle.id,
        title: "50% complete",
        type: "loading",
      })
    );
    expect(getActiveToasts().find((t) => t.id === handle.id)?.variant).toBe("loading");

    // Timed update clears previous timer and schedules only the latest duration
    const timedHandle = toast.success({ title: "Step 1", duration: 1000 });
    vi.advanceTimersByTime(600);
    timedHandle.update({ title: "Step 2", duration: 2000 });
    vi.advanceTimersByTime(500); // 1100ms since Step 1, 500ms since Step 2
    expect(getActiveToasts().some((t) => t.id === timedHandle.id)).toBe(true);

    vi.advanceTimersByTime(1600); // 2100ms since Step 2
    expect(getActiveToasts().some((t) => t.id === timedHandle.id)).toBe(false);
  });

  it("wires error callback in toast.promise() with destructive state", async () => {
    let capturedErrorPayload: any;
    vi.mocked(sileo.promise).mockImplementationOnce((p: any, opts: any) =>
      Promise.resolve(typeof p === "function" ? p() : p).catch((err) => {
        capturedErrorPayload = opts.error(err);
        return capturedErrorPayload;
      })
    );

    await toast.promise(Promise.reject(new Error("Gateway timeout")), {
      loading: "Processing",
      success: "Done",
      error: (err) => ({ title: "Failed", description: (err as Error).message }),
    });

    expect(capturedErrorPayload).toEqual(
      expect.objectContaining({
        title: "Failed",
        description: "Gateway timeout",
        type: "error",
      })
    );
    expect(getActiveToasts()[0]?.variant).toBe("destructive");
  });

  it("avoids double-mirroring RTL position when calling toast() with action variant", () => {
    document.documentElement.setAttribute("dir", "rtl");
    toast({
      title: "RTL Action",
      variant: "action",
      position: "top-right",
      button: { title: "Open", onClick: vi.fn() },
    });

    expect(sileo.action).toHaveBeenCalledTimes(1);
    expect(sileo.action).toHaveBeenCalledWith(
      expect.objectContaining({
        position: "top-left",
      })
    );
  });
});
