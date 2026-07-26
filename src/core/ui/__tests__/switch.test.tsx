import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { Switch } from "../switch";

// Switch reads switchStyle off useSettings() and labels off useI18n() — both
// mocked at the module boundary, matching the project's hook-mocking convention.
vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({ switchStyle: "default" }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe("Switch", () => {
  // Direction is a product decision, not a locale artifact: OFF is always
  // physically left, ON is always physically right, in English and Arabic
  // alike. The pin lives on the Root's own dir="ltr" attribute rather than on
  // a wrapper, so it must survive being rendered inside an ambient RTL tree.
  it("pins dir=\"ltr\" on the Root even inside an RTL ancestor", () => {
    render(
      <div dir="rtl">
        <Switch aria-label="notifications" />
      </div>
    );

    const root = screen.getByRole("switch");
    expect(root).toHaveAttribute("dir", "ltr");
  });

  it("pins dir=\"ltr\" on the Root when unchecked, also inside an RTL ancestor", () => {
    render(
      <div dir="rtl">
        <Switch aria-label="notifications" checked={false} onCheckedChange={() => {}} />
      </div>
    );

    const root = screen.getByRole("switch");
    expect(root).toHaveAttribute("dir", "ltr");
    expect(root).toHaveAttribute("data-state", "unchecked");
  });

  it("keeps the ON state's physical-right travel class regardless of RTL ancestor direction", () => {
    render(
      <div dir="rtl">
        <Switch aria-label="notifications" checked onCheckedChange={() => {}} />
      </div>
    );

    const root = screen.getByRole("switch");
    // Root itself stays LTR-pinned...
    expect(root).toHaveAttribute("dir", "ltr");
    expect(root).toHaveAttribute("data-state", "checked");

    // ...and the thumb's travel class is a plain physical translate with no
    // rtl: variant, so it always lands on the physical right when checked.
    const thumbEl = root.querySelector("span");
    expect(thumbEl).not.toBeNull();
    expect(thumbEl?.className).toMatch(/data-\[state=checked\]:translate-x-5/);
    expect(thumbEl?.className).not.toMatch(/rtl:/);
  });

  it("also pins dir=\"ltr\" on the label row when showLabels is used inside RTL", () => {
    render(
      <div dir="rtl">
        <Switch aria-label="notifications" showLabels onLabel="On" offLabel="Off" />
      </div>
    );

    const root = screen.getByRole("switch");
    expect(root).toHaveAttribute("dir", "ltr");

    // The row wrapping [off][track][on] is itself dir="ltr", so the physical
    // left-to-right order of the three items never flips under RTL.
    const row = root.parentElement;
    expect(row).toHaveAttribute("dir", "ltr");
  });
});
