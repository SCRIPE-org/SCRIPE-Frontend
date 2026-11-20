import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { HubModuleTile } from "../HubModuleTile";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    buttonStyle: "default",
    borderRadius: "default",
    animationLevel: "default",
  }),
}));

describe("HubModuleTile — non-nested interactive controls & lock states", () => {
  it("renders stretched primary button and sibling pin button without nesting, and prevents pin clicks from opening tile", () => {
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

    const primaryBtn = screen.getByRole("button", { name: /Venue Operations/i });
    const pinBtn = screen.getByRole("button", { name: "workspaceHub.pin.pin" });

    expect(primaryBtn).not.toBe(pinBtn);
    expect(primaryBtn.contains(pinBtn)).toBe(false);
    expect(pinBtn.contains(primaryBtn)).toBe(false);

    fireEvent.click(pinBtn);
    expect(onTogglePin).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();

    fireEvent.click(primaryBtn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders unpin action when pinned and disables opening while hiding pin button when locked", () => {
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

    expect(screen.getByRole("button", { name: "workspaceHub.pin.unpin" })).toBeInTheDocument();

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

    const lockedPrimary = screen.getByRole("button", { name: /Academy/i });
    expect(lockedPrimary).toHaveAttribute("aria-disabled", "true");
    expect(screen.queryByRole("button", { name: "workspaceHub.pin.unpin" })).not.toBeInTheDocument();
    expect(screen.getByText("Upgrade")).toBeInTheDocument();
  });

  it("omits overflow-hidden from the outer tile wrapper so focus-visible rings are never clipped", () => {
    const { container } = render(
      <HubModuleTile
        name="Finance"
        icon="Layers"
        colorHue={145}
        colorChroma={0.14}
        isLocked={true}
        isPinned={false}
        accessibleItemCount={6}
        itemLabel="6 items"
        onClick={vi.fn()}
        upgradeBadgeText="Upgrade"
      />
    );

    const tileCard = container.firstElementChild;
    expect(tileCard).not.toBeNull();
    expect(tileCard?.className).not.toContain("overflow-hidden");
    expect(container.innerHTML).toContain("rounded-nx-lg");
  });
});
