import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import { Progress, PROGRESS_VARIANTS } from "../progress";

describe("Progress", () => {
  it("renders default contrast-safe indicator and preserves RTL origin and reduced motion", () => {
    render(<Progress aria-label="Upload progress" value={60} />);

    const bar = screen.getByRole("progressbar", { name: "Upload progress" });
    const indicator = bar.firstElementChild as HTMLElement;
    expect(indicator).not.toBeNull();
    expect(PROGRESS_VARIANTS.default).toBe("bg-nx-accent dark:bg-nx-accent-fill");
    expect(indicator.className).toContain(PROGRESS_VARIANTS.default);
    expect(indicator.className).toContain("rtl:origin-right");
    expect(indicator.className).toContain("motion-reduce:transition-none");
    expect(indicator.style.transform).toBe("scaleX(0.6)");
  });

  it("supports semantic variants (success, warning, danger, neutral) and indicatorClassName", () => {
    const cases = [
      ["success", PROGRESS_VARIANTS.success],
      ["warning", PROGRESS_VARIANTS.warning],
      ["danger", PROGRESS_VARIANTS.danger],
      ["neutral", PROGRESS_VARIANTS.neutral],
    ] as const;

    for (const [variant, tokenClass] of cases) {
      const { unmount } = render(
        <Progress
          aria-label={`progress-${variant}`}
          value={50}
          variant={variant}
          indicatorClassName="custom-indicator"
        />
      );
      const indicator = screen.getByRole("progressbar").firstElementChild as HTMLElement;
      expect(indicator.className).toContain(tokenClass);
      expect(indicator.className).toContain("custom-indicator");
      unmount();
    }
  });

  it("scales indicator transform relative to custom max", () => {
    render(<Progress aria-label="Steps" value={3} max={5} />);

    const bar = screen.getByRole("progressbar", { name: "Steps" });
    const indicator = bar.firstElementChild as HTMLElement;
    expect(bar).toHaveAttribute("aria-valuemax", "5");
    expect(indicator.style.transform).toBe("scaleX(0.6)");
  });
});
