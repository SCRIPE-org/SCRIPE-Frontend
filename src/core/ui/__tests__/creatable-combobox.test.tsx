/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { CreatableCombobox } from "../creatable-combobox";

if (typeof (globalThis as any).ResizeObserver === "undefined") {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
}

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    buttonStyle: "default",
    borderRadius: "default",
    animationLevel: "default",
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      (params?.defaultValue as string) ?? key,
    direction: "ltr" as const,
  }),
}));

describe("CreatableCombobox", () => {
  it("renders sibling clear control with NO nested interactive elements inside role=combobox", () => {
    const onChange = vi.fn();
    const { container } = render(
      <CreatableCombobox options={["Maadi", "Zamalek"]} value="Maadi" onChange={onChange} />
    );

    expect(
      container.querySelectorAll('button button, button [role="button"], [role="button"] button')
    ).toHaveLength(0);

    const combobox = screen.getByRole("combobox");
    expect(combobox).toHaveAttribute("aria-controls");
    expect(combobox.className).toContain("border-nx-line-hi");

    const clearBtn = screen.getByRole("button", { name: "Clear selection" });
    fireEvent.click(clearBtn);

    expect(onChange).toHaveBeenCalledWith("");
    expect(combobox).toHaveFocus();
  });

  it("applies Nexus danger border when aria-invalid is true", () => {
    render(
      <CreatableCombobox
        options={["Maadi"]}
        value=""
        onChange={vi.fn()}
        aria-invalid={true}
      />
    );

    const combobox = screen.getByRole("combobox");
    expect(combobox.className).toContain("border-nx-danger");
  });

  it("allows selecting an existing option and creating a custom entry", () => {
    const onChange = vi.fn();
    render(
      <CreatableCombobox options={["Maadi", "Zamalek"]} value="" onChange={onChange} />
    );

    fireEvent.click(screen.getByRole("combobox"));
    const searchInput = screen.getByPlaceholderText("Search...");
    fireEvent.change(searchInput, { target: { value: "Hadayek El Maadi" } });

    const createItem = screen.getByText('Use "{value}"');
    fireEvent.click(createItem);
    expect(onChange).toHaveBeenCalledWith("Hadayek El Maadi");
  });
});
