// SelectTrigger -- keyboard operability of the whole select family.
//
// WHY THIS FILE USES fireEvent.keyDown AND NOT fireEvent.click.
//
// The trigger is `<PopoverTrigger asChild><div role="combobox" tabIndex={0}>`.
// Radix's PopoverTrigger wires exactly one interaction -- `onClick:
// composeEventHandlers(props.onClick, context.onOpenToggle)` -- and gets
// Enter/Space for free only because it normally renders `Primitive.button`,
// where the BROWSER synthesises a click from those keys. Over a `<div>` there
// is no such synthesis and there was no onKeyDown anywhere in the file, so a
// keyboard-only user could not open a Select, MultiSelect, tree select or
// timezone picker anywhere in the product.
//
// That bug survived because every existing test opened the panel with
// `fireEvent.click` (generic-form.a11y.test.tsx's "still opens the panel"
// case among them). A click-based test passes against a completely
// keyboard-inoperable trigger -- it exercises the one channel Radix DID wire.
// Every open in this file therefore goes through a key event.
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import GenericSelect from "../generic-select";

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({ switchStyle: "default", fontSize: "default", inputStyle: "default" }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "en",
    direction: "ltr",
  }),
}));

// Same jsdom gaps the other GenericSelect suites polyfill: Radix measures the
// trigger with ResizeObserver, cmdk scrolls the highlighted row into view.
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

const OPTIONS = [
  { value: "low", label: "Low" },
  { value: "high", label: "High" },
];

function renderSelect(extra: Record<string, unknown> = {}) {
  const onValueChange = vi.fn();
  const utils = render(
    <GenericSelect
      id="priority"
      aria-label="Priority"
      options={OPTIONS}
      value=""
      onValueChange={onValueChange}
      {...extra}
    />
  );
  return { ...utils, onValueChange };
}

describe("SelectTrigger keyboard operability", () => {
  it("is in the tab order", () => {
    renderSelect();
    expect(screen.getByRole("combobox", { name: "Priority" })).toHaveAttribute("tabindex", "0");
  });

  it.each(["Enter", " ", "ArrowDown"])(
    "opens the panel on %s -- via a KEY event, never a synthetic click",
    (key) => {
      renderSelect();
      const trigger = screen.getByRole("combobox", { name: "Priority" });
      expect(trigger).toHaveAttribute("aria-expanded", "false");

      fireEvent.keyDown(trigger, { key });

      expect(trigger).toHaveAttribute("aria-expanded", "true");
      // The real payoff: the options are reachable, not just an attribute flip.
      expect(screen.getByRole("option", { name: "High" })).toBeInTheDocument();
    }
  );

  it("lets a keyboard-only user actually SET a value end to end", () => {
    const { onValueChange } = renderSelect();
    const trigger = screen.getByRole("combobox", { name: "Priority" });

    fireEvent.keyDown(trigger, { key: "Enter" });

    // cmdk owns the panel keymap once the panel is up, and it can only see keys
    // that bubble through its own subtree -- which is exactly why select-panel
    // keeps a focusable (sr-only) CommandInput mounted even for a
    // non-searchable select, and why PopoverContent's FocusScope lands focus on
    // it. Everything from here is arrows + Enter on that input; the pointer is
    // never used.
    // Queried by cmdk's own attribute rather than by accessible name: cmdk puts
    // an `aria-labelledby` of its own on this input alongside select-panel's
    // `aria-label`, and labelledby wins the name computation, so there is no
    // stable name to match on here. Not this component's concern.
    const panelInput = document.querySelector("[cmdk-input]") as HTMLInputElement;
    expect(panelInput).not.toBeNull();
    expect(panelInput).toHaveFocus();

    // cmdk highlights the first row on open; step down to the second.
    fireEvent.keyDown(panelInput, { key: "ArrowDown" });
    fireEvent.keyDown(panelInput, { key: "Enter" });

    expect(onValueChange).toHaveBeenCalledWith("high");
  });

  it("Enter and Space stop the page/form from also acting on the key", () => {
    renderSelect();
    const trigger = screen.getByRole("combobox", { name: "Priority" });

    // Space would scroll the page; Enter would submit a surrounding <form>.
    for (const key of ["Enter", " "]) {
      const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
      trigger.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    }
  });

  it("Enter and Space TOGGLE, so a keyboard user can close the panel again", () => {
    renderSelect();
    const trigger = screen.getByRole("combobox", { name: "Priority" });

    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("ArrowDown only OPENS -- it must not close an open panel out from under cmdk", () => {
    renderSelect();
    const trigger = screen.getByRole("combobox", { name: "Priority" });

    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("ignores keys that are not activation keys, and modifier combinations", () => {
    renderSelect();
    const trigger = screen.getByRole("combobox", { name: "Priority" });

    fireEvent.keyDown(trigger, { key: "a" });
    fireEvent.keyDown(trigger, { key: "Tab" });
    fireEvent.keyDown(trigger, { key: "Enter", ctrlKey: true });
    fireEvent.keyDown(trigger, { key: "ArrowDown", altKey: true });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("stays shut for a disabled select", () => {
    renderSelect({ disabled: true });
    const trigger = screen.getByRole("combobox", { name: "Priority" });

    fireEvent.keyDown(trigger, { key: "Enter" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("tabindex", "-1");
  });

  it("stays shut for a read-only select", () => {
    renderSelect({ readOnly: true });
    const trigger = screen.getByRole("combobox", { name: "Priority" });

    fireEvent.keyDown(trigger, { key: "Enter" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("does not toggle the panel when the key came from a nested chip control", () => {
    // The nested chip-remove / clear buttons are the reason this element is a
    // <div> and not a <button> at all (a button may not contain a button), so
    // activating one must remove the chip WITHOUT also opening the panel.
    const onValueChange = vi.fn();
    render(
      <GenericSelect
        id="tags"
        aria-label="Tags"
        type="multi"
        options={OPTIONS}
        value={["low"]}
        onValueChange={onValueChange}
      />
    );

    const trigger = screen.getByRole("combobox", { name: "Tags" });
    const remove = screen.getByRole("button", { name: /select.chip.remove/ });

    fireEvent.keyDown(remove, { key: "Enter" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("still opens on pointer click -- the key handler must not replace that path", () => {
    renderSelect();
    const trigger = screen.getByRole("combobox", { name: "Priority" });

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("composes a consumer onKeyDown instead of being replaced by it", () => {
    // wrapperProps is spread BEFORE this handler on purpose: a caller that
    // happens to pass onKeyDown must not silently delete the only keyboard
    // route into the control.
    const consumerHandler = vi.fn();
    renderSelect({ onKeyDown: consumerHandler });
    const trigger = screen.getByRole("combobox", { name: "Priority" });

    fireEvent.keyDown(trigger, { key: "Enter" });

    expect(consumerHandler).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("lets a consumer veto activation by calling preventDefault", () => {
    renderSelect({
      onKeyDown: (event: React.KeyboardEvent) => event.preventDefault(),
    });
    const trigger = screen.getByRole("combobox", { name: "Priority" });

    fireEvent.keyDown(trigger, { key: "Enter" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
