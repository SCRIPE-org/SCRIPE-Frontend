import { describe, it, expect } from "vitest";
import { applySettingsToDOM } from "../dom-applicator";
import { defaultSettings } from "../defaults";
import type { Settings } from "../types";

/**
 * applySettingsToDOM batches its DOM writes into a single requestAnimationFrame
 * (see dom-applicator.ts). Tests must flush that frame before asserting.
 */
function flushRaf(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

describe("applySettingsToDOM", () => {
  it("does not write data-theme when colorThemeCustomized is false", async () => {
    // Simulate a stale attribute from a previous session/render to prove the
    // gate actively strips it rather than merely never adding it.
    document.documentElement.setAttribute("data-theme", "green");

    const settings: Settings = {
      ...defaultSettings,
      colorTheme: "blue",
      colorThemeCustomized: false,
    };

    applySettingsToDOM(settings);
    await flushRaf();

    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });

  it("writes data-theme to the current colorTheme when colorThemeCustomized is true", async () => {
    document.documentElement.removeAttribute("data-theme");

    const settings: Settings = {
      ...defaultSettings,
      colorTheme: "violet",
      colorThemeCustomized: true,
    };

    applySettingsToDOM(settings);
    await flushRaf();

    expect(document.documentElement.getAttribute("data-theme")).toBe("violet");
  });
});
