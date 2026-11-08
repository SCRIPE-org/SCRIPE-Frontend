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
        theme: "dark",
        options: expect.objectContaining({
          fill: "#151719",
          roundness: 16,
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
        theme: "light",
        options: expect.objectContaining({
          fill: "#ffffff",
        }),
      })
    );
  });

  it("allows overriding theme and position explicitly", () => {
    mockDirection = "ltr";
    render(<SileoToaster position="bottom-center" theme="light" />);

    expect(mockToaster).toHaveBeenCalledWith(
      expect.objectContaining({
        position: "bottom-center",
        theme: "light",
      })
    );
  });
});
