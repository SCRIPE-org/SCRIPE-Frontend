import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { HubAppSquircle } from "../HubAppSquircle";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) =>
      params?.name ? `${key}:${params.name}` : key,
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    buttonStyle: "default",
    borderRadius: "default",
    animationLevel: "default",
  }),
}));

describe("HubAppSquircle — 72x72 framed matte squircle, sibling pin & accessibility", () => {
  it("renders sibling primary and pin buttons (zero nested buttons) and handles pin click without launching workspace", () => {
    const onClick = vi.fn();
    const onTogglePin = vi.fn();

    const { container } = render(
      <HubAppSquircle
        name="Venue Operations"
        icon="Calendar"
        colorHue={145}
        colorChroma={0.14}
        isLocked={false}
        isPinned={false}
        onClick={onClick}
        onTogglePin={onTogglePin}
      />
    );

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).not.toContain("overflow-hidden");
    expect(wrapper.className).toContain("w-[calc((100%-32px)/3)]");
    expect(wrapper.className).toContain("max-w-[112px]");
    expect(wrapper.className).toContain("sm:w-[112px]");

    const primaryBtn = screen.getByRole("button", { name: /^Venue Operations$/i });
    const pinBtn = screen.getByRole("button", {
      name: "workspaceHub.pin.pinWorkspace:Venue Operations",
    });

    expect(primaryBtn).not.toBe(pinBtn);
    expect(primaryBtn.contains(pinBtn)).toBe(false);
    expect(pinBtn.contains(primaryBtn)).toBe(false);
    expect(pinBtn.className).toContain("opacity-100");
    expect(pinBtn.className).toContain("sm:opacity-0");
    expect(pinBtn.className).toContain("sm:group-hover:opacity-100");
    expect(pinBtn.className).toContain("sm:group-focus-within:opacity-100");
    expect(pinBtn.className).toContain("[@media(pointer:coarse)]:opacity-100");

    fireEvent.click(pinBtn);
    expect(onTogglePin).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();

    fireEvent.click(primaryBtn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders always-visible text-nx-accent star when pinned, disables pin during impersonation, and hides pin when locked", () => {
    const { rerender } = render(
      <HubAppSquircle
        name="Academy"
        icon="Users"
        colorHue={210}
        colorChroma={0.12}
        isLocked={false}
        isPinned={true}
        onClick={vi.fn()}
        onTogglePin={vi.fn()}
      />
    );

    const pinnedBtn = screen.getByRole("button", {
      name: "workspaceHub.pin.unpinWorkspace:Academy",
    });
    expect(pinnedBtn.className).toContain("text-nx-accent");
    expect(pinnedBtn.className).toContain("opacity-100");
    expect(pinnedBtn).not.toBeDisabled();

    rerender(
      <HubAppSquircle
        name="Academy"
        icon="Users"
        colorHue={210}
        colorChroma={0.12}
        isLocked={false}
        isPinned={true}
        isPinDisabled={true}
        onClick={vi.fn()}
        onTogglePin={vi.fn()}
      />
    );
    expect(
      screen.getByRole("button", { name: "workspaceHub.pin.unpinWorkspace:Academy" })
    ).toBeDisabled();

    const onLockedClick = vi.fn();
    rerender(
      <HubAppSquircle
        name="Academy"
        icon="Users"
        colorHue={210}
        colorChroma={0.12}
        isLocked={true}
        isPinned={true}
        onClick={onLockedClick}
        onTogglePin={vi.fn()}
        upgradeBadgeText="Upgrade"
      />
    );
    const lockedBtn = screen.getByRole("button", { name: /^Academy$/i });
    const upgradeBadge = screen.getByText("Upgrade");
    expect(lockedBtn).toHaveAttribute("aria-disabled", "true");
    expect(lockedBtn.className).toContain("aria-disabled:pointer-events-auto");
    expect(lockedBtn).toHaveAttribute("aria-describedby", upgradeBadge.id);
    expect(lockedBtn).toHaveAccessibleDescription("Upgrade");
    fireEvent.click(lockedBtn);
    expect(onLockedClick).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole("button", { name: "workspaceHub.pin.unpinWorkspace:Academy" })
    ).not.toBeInTheDocument();
  });
});
