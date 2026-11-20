import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import * as React from "react";
import { SileoToaster } from "../sileo-toaster";

const mockToaster = vi.fn();
vi.mock("sileo", () => ({
  Toaster: (props: any) => {
    mockToaster(props);
    return <div data-testid="mock-sileo-toaster" />;
  },
  sileo: {},
}));

let mockDirection: "ltr" | "rtl" = "ltr";
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ direction: mockDirection }),
}));

describe("SileoToaster — Component Viewport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    mockDirection = "ltr";
  });

  it("uses live var(--nx-surface) fill by default and never passes upstream theme inversion prop", () => {
    render(<SileoToaster position="top-right" />);

    expect(mockToaster).toHaveBeenCalledWith(
      expect.objectContaining({
        position: "top-right",
        options: expect.objectContaining({
          fill: "var(--nx-surface)",
          roundness: 16,
          autopilot: true,
        }),
      })
    );
    const props = mockToaster.mock.calls[0]?.[0];
    expect(props).not.toHaveProperty("theme");
  });

  it("automatically mirrors top-right to top-left when direction is RTL", () => {
    mockDirection = "rtl";
    render(<SileoToaster position="top-right" rtlAutoMirror={true} />);

    expect(mockToaster).toHaveBeenCalledWith(
      expect.objectContaining({
        position: "top-left",
        options: expect.objectContaining({
          fill: "var(--nx-surface)",
          roundness: 16,
          autopilot: true,
        }),
      })
    );
  });

  it("applies locked theme='dark' and theme='light' fills with contrast-matched fallback styles", () => {
    render(<SileoToaster position="top-right" theme="dark" />);
    expect(mockToaster).toHaveBeenLastCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          fill: "#15181c",
          styles: expect.objectContaining({
            description: expect.stringContaining("text-[#c5ccc6]"),
          }),
        }),
      })
    );

    render(<SileoToaster position="top-right" theme="light" />);
    expect(mockToaster).toHaveBeenLastCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          fill: "#ffffff",
          styles: expect.objectContaining({
            description: expect.stringContaining("text-[#4b504c]"),
          }),
        }),
      })
    );
  });

  it("allows overriding fill, position, and button.className explicitly", () => {
    render(
      <SileoToaster
        position="bottom-center"
        options={{
          fill: "#222222",
          button: {
            title: "Retry",
            onClick: vi.fn(),
            className: "bg-indigo-500 text-white",
          },
        }}
      />
    );

    expect(mockToaster).toHaveBeenCalledWith(
      expect.objectContaining({
        position: "bottom-center",
        options: expect.objectContaining({
          fill: "#222222",
          styles: expect.objectContaining({
            button: expect.stringContaining("bg-indigo-500"),
          }),
        }),
      })
    );
  });

  describe("resolveRtlPosition()", () => {
    it("preserves positions in LTR mode", async () => {
      const { resolveRtlPosition } = await import("../sileo-toaster");
      expect(resolveRtlPosition("top-right", "ltr", true)).toBe("top-right");
      expect(resolveRtlPosition("top-left", "ltr", true)).toBe("top-left");
      expect(resolveRtlPosition("top-center", "ltr", true)).toBe("top-center");
      expect(resolveRtlPosition("bottom-right", "ltr", true)).toBe("bottom-right");
      expect(resolveRtlPosition("bottom-left", "ltr", true)).toBe("bottom-left");
      expect(resolveRtlPosition("bottom-center", "ltr", true)).toBe("bottom-center");
    });

    it("mirrors horizontal positions in RTL mode", async () => {
      const { resolveRtlPosition } = await import("../sileo-toaster");
      expect(resolveRtlPosition("top-right", "rtl", true)).toBe("top-left");
      expect(resolveRtlPosition("top-left", "rtl", true)).toBe("top-right");
      expect(resolveRtlPosition("bottom-right", "rtl", true)).toBe("bottom-left");
      expect(resolveRtlPosition("bottom-left", "rtl", true)).toBe("bottom-right");
      expect(resolveRtlPosition("top-center", "rtl", true)).toBe("top-center");
      expect(resolveRtlPosition("bottom-center", "rtl", true)).toBe("bottom-center");
    });

    it("resolves logical positions (top-end, top-start, bottom-end, bottom-start)", async () => {
      const { resolveRtlPosition } = await import("../sileo-toaster");
      // Top-End: top-right in LTR, top-left in RTL
      expect(resolveRtlPosition("top-end", "ltr", true)).toBe("top-right");
      expect(resolveRtlPosition("top-end", "rtl", true)).toBe("top-left");

      // Top-Start: top-left in LTR, top-right in RTL
      expect(resolveRtlPosition("top-start", "ltr", true)).toBe("top-left");
      expect(resolveRtlPosition("top-start", "rtl", true)).toBe("top-right");

      // Bottom-End: bottom-right in LTR, bottom-left in RTL
      expect(resolveRtlPosition("bottom-end", "ltr", true)).toBe("bottom-right");
      expect(resolveRtlPosition("bottom-end", "rtl", true)).toBe("bottom-left");

      // Bottom-Start: bottom-left in LTR, bottom-right in RTL
      expect(resolveRtlPosition("bottom-start", "ltr", true)).toBe("bottom-left");
      expect(resolveRtlPosition("bottom-start", "rtl", true)).toBe("bottom-right");
    });
  });
});
