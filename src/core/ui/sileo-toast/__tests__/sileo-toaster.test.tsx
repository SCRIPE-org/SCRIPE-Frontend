import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
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

const mockTheme = { resolvedTheme: "dark" };
vi.mock("next-themes", () => ({
  useTheme: () => mockTheme,
}));

let mockDirection = "ltr";
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ direction: mockDirection }),
}));

describe("SileoToaster — Component Viewport", () => {
  it("renders with dark theme fill by default when resolvedTheme is dark", () => {
    mockTheme.resolvedTheme = "dark";
    mockDirection = "ltr";
    render(<SileoToaster position="top-right" />);

    expect(mockToaster).toHaveBeenCalledWith(
      expect.objectContaining({
        position: "top-right",
        options: expect.objectContaining({
          fill: "#15181c",
          roundness: 16,
          autopilot: true,
        }),
      })
    );
  });

  it("automatically mirrors top-right to top-left when direction is RTL", () => {
    mockTheme.resolvedTheme = "light";
    mockDirection = "rtl";
    render(<SileoToaster position="top-right" rtlAutoMirror={true} />);

    expect(mockToaster).toHaveBeenCalledWith(
      expect.objectContaining({
        position: "top-left",
        options: expect.objectContaining({
          fill: "#ffffff",
          roundness: 16,
          autopilot: true,
        }),
      })
    );
  });

  it("allows overriding theme and position explicitly", () => {
    mockDirection = "ltr";
    render(<SileoToaster position="bottom-center" options={{ fill: "#222222" }} />);

    expect(mockToaster).toHaveBeenCalledWith(
      expect.objectContaining({
        position: "bottom-center",
        options: expect.objectContaining({
          fill: "#222222",
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
