/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { RadioGroup, RadioGroupItem } from "../radio-group";

// Polyfill ResizeObserver for Radix useSize in jsdom
if (typeof (globalThis as any).ResizeObserver === "undefined") {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({ radioStyle: "default" }),
}));

describe("RadioGroup and RadioGroupItem", () => {
  it("renders radio group with options and allows selection", () => {
    const onValueChange = vi.fn();

    render(
      <form>
        <RadioGroup value="custom" onValueChange={onValueChange}>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="custom" id="opt-custom" />
            <label htmlFor="opt-custom">Custom Options</label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="optionSet" id="opt-optionSet" />
            <label htmlFor="opt-optionSet">Shared Option Set</label>
          </div>
        </RadioGroup>
      </form>
    );

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(2);

    expect(radios[0]).toHaveAttribute("data-state", "checked");
    expect(radios[0]).toHaveAttribute("aria-checked", "true");

    expect(radios[1]).toHaveAttribute("data-state", "unchecked");
    expect(radios[1]).toHaveAttribute("aria-checked", "false");

    fireEvent.click(radios[1]);
    expect(onValueChange).toHaveBeenCalledWith("optionSet");
  });

  it("renders Radix hidden bubble input inside form context with aria-hidden", () => {
    const { container } = render(
      <form>
        <RadioGroup value="optionSet">
          <RadioGroupItem value="custom" id="opt-1" />
          <RadioGroupItem value="optionSet" id="opt-2" />
        </RadioGroup>
      </form>
    );

    const hiddenInputs = container.querySelectorAll('input[type="radio"][aria-hidden="true"]');
    expect(hiddenInputs.length).toBeGreaterThanOrEqual(1);

    hiddenInputs.forEach((input) => {
      expect(input).toHaveAttribute("aria-hidden", "true");
      expect(input).toHaveAttribute("tabindex", "-1");
    });
  });
});
