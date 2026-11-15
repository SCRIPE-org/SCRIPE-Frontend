import React from "react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ColumnNormalizationPopover } from "../ColumnNormalizationPopover";

let mockDirection: "ltr" | "rtl" = "ltr";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    direction: mockDirection,
    language: mockDirection === "rtl" ? "ar" : "en",
    t: (key: string) => key,
  }),
}));

describe("ColumnNormalizationPopover", () => {
  beforeAll(() => {
    if (!HTMLElement.prototype.hasPointerCapture) {
      HTMLElement.prototype.hasPointerCapture = () => false;
    }
    if (!HTMLElement.prototype.scrollIntoView) {
      HTMLElement.prototype.scrollIntoView = () => {};
    }
  });

  beforeEach(() => {
    mockDirection = "ltr";
  });

  it("opens Popover on LTR side='left', rotates ArrowRight on RTL, and uses bg-nx-accent-fill CTA", () => {
    const onChange = vi.fn();
    const { unmount } = render(
      <ColumnNormalizationPopover
        sourceColumnHeader="email"
        targetFieldKey="email"
        targetDataType="Email"
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByTestId("dx-norm-trigger-email"));

    const doneButton = screen.getByRole("button", { name: "dataExchange.normalization.done" });
    expect(doneButton.className).toContain("bg-nx-accent-fill");
    expect(doneButton.className).toContain("text-nx-on-fill");

    const popoverEl = doneButton.closest("[data-side]");
    expect(popoverEl).toHaveAttribute("data-side", "left");
    expect(popoverEl?.className).toContain("z-popover");
    expect(popoverEl?.className).not.toContain("z-[950]");

    const arrowSvg = popoverEl?.querySelector("svg.lucide-arrow-right");
    expect(arrowSvg).not.toBeNull();
    expect(arrowSvg?.getAttribute("class")).toContain("rtl:rotate-180");

    unmount();

    // Render in RTL mode and verify Popover flips to side="right"
    mockDirection = "rtl";
    render(
      <ColumnNormalizationPopover
        sourceColumnHeader="email"
        targetFieldKey="email"
        targetDataType="Email"
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByTestId("dx-norm-trigger-email"));
    const rtlDoneButton = screen.getByRole("button", { name: "dataExchange.normalization.done" });
    expect(rtlDoneButton.closest("[data-side]")).toHaveAttribute("data-side", "right");
  });

  it("layers inner caseMode Select above PopoverContent using z-popover instead of z-[960]", () => {
    const onChange = vi.fn();
    render(
      <ColumnNormalizationPopover
        sourceColumnHeader="email"
        targetFieldKey="email"
        targetDataType="String"
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByTestId("dx-norm-trigger-email"));

    const selectTrigger = document.getElementById("norm-case-email")!;
    expect(selectTrigger).not.toBeNull();
    fireEvent.keyDown(selectTrigger, { key: "Enter", code: "Enter" });

    const listbox = screen.getByRole("listbox");
    expect(document.body.innerHTML).not.toContain("z-[960]");
    expect(listbox.closest(".z-popover")).not.toBeNull();

    fireEvent.click(screen.getByRole("option", { name: "dataExchange.normalization.caseUpper" }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        caseMode: "Upper",
        uppercase: true,
        lowercase: false,
      })
    );
  });
});
