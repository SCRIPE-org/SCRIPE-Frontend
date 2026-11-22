import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import { LIGHT_THEME } from "@core/ui/tokens/brand";
import { SignupThemeProvider } from "@core/providers/signup-theme";
import { SignupShell } from "../common/SignupShell";
import { OptionGrid } from "../discovery/OptionGrid";

const setThemeMock = vi.fn();
let currentResolvedTheme: "light" | "dark" = "light";

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: currentResolvedTheme,
    setTheme: setThemeMock,
  }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    direction: "ltr" as const,
    language: "en" as const,
    isRtl: false,
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    buttonStyle: "default",
    borderRadius: "default",
    animationLevel: "default",
  }),
}));

describe("SignupThemeProvider, SignupShell, and OptionGrid — SSR matchMedia safety & contrast", () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    currentResolvedTheme = "light";
    setThemeMock.mockClear();
  });

  afterEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: originalMatchMedia,
    });
  });

  it("renders SignupShell safely when window.matchMedia is undefined and exposes single main + h-14 header", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: undefined,
    });

    const { container } = render(
      <SignupThemeProvider>
        <SignupShell phaseLabel="Discovery">
          <div>Wizard step content</div>
        </SignupShell>
      </SignupThemeProvider>
    );

    const mains = container.querySelectorAll("main");
    expect(mains).toHaveLength(1);
    expect(mains[0]).toHaveAttribute("id", "signup-content");

    const header = container.querySelector("header");
    expect(header?.className).toContain("h-14");

    const themeButton = screen.getByRole("button", { name: "signup.shell.themeToDark" });
    fireEvent.click(themeButton);
    expect(setThemeMock).toHaveBeenCalledWith("dark");
  });

  it("pairs selected OptionGrid indicator with Signal Lime gradientCta and Ink foreground in Light mode", () => {
    render(
      <SignupThemeProvider>
        <OptionGrid
          options={[
            {
              value: "club",
              label: "Football Club",
              sublabel: "Multi-pitch operations",
              iconKey: "Trophy",
              sortOrder: 1,
              signalWeight: 10,
              relevanceBoost: 0,
              conditions: [],
            },
            {
              value: "academy",
              label: "Youth Academy",
              sublabel: "Training & rosters",
              iconKey: "Users",
              sortOrder: 2,
              signalWeight: 8,
              relevanceBoost: 0,
              conditions: [],
            },
          ]}
          selectedValues={["club"]}
          isSingleSelect={true}
          isMaxReached={false}
          topPriority={null}
          topLabel="Top priority"
          onToggle={vi.fn()}
        />
      </SignupThemeProvider>
    );

    const selectedBtn = screen.getByRole("button", { name: /Football Club/i });
    expect(selectedBtn).toHaveAttribute("aria-pressed", "true");

    // Verify Light-mode selected check badge does NOT pair #4C6200 accent fill with #0B0D10 ink.
    // Instead it uses gradientCta (Signal Lime #C6FF00) paired with accentContrast (#0B0D10 Ink).
    const checkCircle = selectedBtn.querySelector("span[aria-hidden='true']");
    expect(checkCircle).not.toBeNull();
    expect(LIGHT_THEME.gradientCta).toContain("#C6FF00");
    expect(LIGHT_THEME.accentContrast).toBe("#0B0D10");
    expect(checkCircle).toHaveStyle({ color: "rgb(11, 13, 16)" });
    const inlineStyle = checkCircle?.getAttribute("style") ?? "";
    expect(inlineStyle).toContain("rgb(198, 255, 0)");
    expect(inlineStyle).not.toContain("rgb(76, 98, 0)");
  });
});
