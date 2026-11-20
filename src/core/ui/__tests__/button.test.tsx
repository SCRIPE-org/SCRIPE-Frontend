import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { Button } from "../button";

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    buttonStyle: "default",
    borderRadius: "default",
    animationLevel: "default",
  }),
}));

describe("Button", () => {
  it("uses Signal Lime fill with --nx-on-fill ink on default primary variant", () => {
    render(<Button>Save Changes</Button>);

    const btn = screen.getByRole("button", { name: "Save Changes" });
    expect(btn.className).toContain("bg-nx-accent-fill");
    expect(btn.className).toContain("text-nx-on-fill");
    expect(btn.className).toContain("hover:brightness-95");
  });

  it("renders a spinner and disables clicks when loading or isLoading is true", () => {
    const onClick = vi.fn();
    render(
      <Button isLoading onClick={onClick}>
        Submitting
      </Button>
    );

    const btn = screen.getByRole("button", { name: /Submitting/ });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(btn).toHaveAttribute("data-loading", "true");
    expect(btn).not.toHaveAttribute("isLoading");
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("does NOT throw React.Children.only when asChild is combined with loading", () => {
    const onClick = vi.fn();
    render(
      <Button asChild loading onClick={onClick}>
        <a href="#dashboard">Open Dashboard</a>
      </Button>
    );

    const link = screen.getByRole("link", { name: "Open Dashboard" });
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("aria-busy", "true");
    expect(link).toHaveAttribute("data-loading", "true");
    expect(link).not.toHaveAttribute("disabled");

    fireEvent.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("falls back cleanly to native <button> if asChild receives non-single-element children", () => {
    render(
      <Button asChild isLoading>
        <span>First</span>
        <span>Second</span>
      </Button>
    );

    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
  });
});
