import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { HubModuleTile } from "../HubModuleTile";

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

describe("HubModuleTile — non-nested interactive controls, unique aria-labels & touch visibility", () => {
  it("renders unique aria-label per workspace, supports pointer:coarse touch visibility, and prevents pin clicks from opening tile", () => {
    const onClick = vi.fn();
    const onTogglePin = vi.fn();

    render(
      <HubModuleTile
        name="Venue Operations"
        icon="Calendar"
        colorHue={145}
        colorChroma={0.14}
        isLocked={false}
        isPinned={false}
        accessibleItemCount={12}
        itemLabel="12 items"
        onClick={onClick}
        onTogglePin={onTogglePin}
      />
    );

    const primaryBtn = screen.getByRole("button", { name: /^Venue Operations$/i });
    const pinBtn = screen.getByRole("button", {
      name: "workspaceHub.pin.pinWorkspace:Venue Operations",
    });

    expect(primaryBtn).not.toBe(pinBtn);
    expect(primaryBtn.contains(pinBtn)).toBe(false);
    expect(pinBtn.contains(primaryBtn)).toBe(false);
    expect(pinBtn.className).toContain("[@media(pointer:coarse)]:opacity-100");
    expect(pinBtn.className).toContain("opacity-100");

    fireEvent.click(pinBtn);
    expect(onTogglePin).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();

    fireEvent.click(primaryBtn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders unique unpin aria-label, guards pin during impersonation, and hides pin button when locked", () => {
    const onClick = vi.fn();
    const onTogglePin = vi.fn();

    const { rerender } = render(
      <HubModuleTile
        name="Academy"
        icon="Users"
        colorHue={210}
        colorChroma={0.12}
        isLocked={false}
        isPinned={true}
        accessibleItemCount={4}
        itemLabel="4 items"
        onClick={onClick}
        onTogglePin={onTogglePin}
      />
    );

    expect(
      screen.getByRole("button", { name: "workspaceHub.pin.unpinWorkspace:Academy" })
    ).toBeInTheDocument();

    rerender(
      <HubModuleTile
        name="Academy"
        icon="Users"
        colorHue={210}
        colorChroma={0.12}
        isLocked={false}
        isPinned={true}
        isPinDisabled={true}
        accessibleItemCount={4}
        itemLabel="4 items"
        onClick={onClick}
        onTogglePin={onTogglePin}
      />
    );

    const disabledPinBtn = screen.getByRole("button", {
      name: "workspaceHub.pin.unpinWorkspace:Academy",
    });
    expect(disabledPinBtn).toBeDisabled();

    rerender(
      <HubModuleTile
        name="Academy"
        icon="Users"
        colorHue={210}
        colorChroma={0.12}
        isLocked={true}
        isPinned={true}
        accessibleItemCount={4}
        itemLabel="4 items"
        onClick={onClick}
        onTogglePin={onTogglePin}
        upgradeBadgeText="Upgrade"
      />
    );

    const lockedPrimary = screen.getByRole("button", { name: /^Academy$/i });
    expect(lockedPrimary).toHaveAttribute("aria-disabled", "true");
    expect(
      screen.queryByRole("button", { name: "workspaceHub.pin.unpinWorkspace:Academy" })
    ).not.toBeInTheDocument();
    expect(screen.getByText("Upgrade")).toBeInTheDocument();
  });

  it("omits overflow-hidden from the outer tile wrapper so focus-visible rings are never clipped", () => {
    const { container } = render(
      <HubModuleTile
        name="Finance"
        icon="Wallet"
        colorHue={180}
        colorChroma={0.14}
        isLocked={false}
        isPinned={false}
        accessibleItemCount={3}
        itemLabel="3 items"
        onClick={vi.fn()}
        onTogglePin={vi.fn()}
      />
    );

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toBeTruthy();
    expect(wrapper.className).not.toContain("overflow-hidden");
  });
});
