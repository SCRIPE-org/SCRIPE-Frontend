/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { OptionSetPicker } from "./OptionSetPicker";
import { OptionSet } from "../../../../../option-set/src/domain/entities/OptionSet";

/**
 * The searchable combobox half of the option-set binding dialog.
 *
 * WHAT EACH CASE PROTECTS
 * ------------------------
 *  1. Real accessible name via `aria-label`, not `<Label htmlFor>` alone -- `select-trigger.tsx`'s
 *     own header explains why a `for` pointing at a `role="combobox"` div computes no name. Asserted
 *     with `getByRole(..., { name })`, never `getByLabelText`, matching this module's own convention.
 *  2. Keyboard-operable open path: Enter, Space and ArrowDown each open the panel, not just a
 *     pointer click.
 *  3. Real content in the empty state -- "no shared option sets yet" is a reachable answer, not a
 *     placeholder, and the hint names the actual next step (publish a version).
 */

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
    language: "en",
  }),
}));

// `SelectTrigger` reads workspace input-style settings; not under test here, so it is stubbed to a
// fixed shape rather than requiring a real provider tree.
vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    switchStyle: "default",
    fontSize: "default",
    inputStyle: "default",
    badgeStyle: "default",
  }),
}));

// The Popover+cmdk stack this control is built on needs both of these in jsdom, even for a test that
// never opens the panel -- same polyfills EntityReferenceCustomFieldControl.test.tsx carries for the
// same underlying primitives.
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

function set(over: Record<string, unknown> = {}): OptionSet {
  return new OptionSet({
    id: (over.id as string) ?? "set-1",
    stableKey: (over.stableKey as string) ?? "sizes",
    labelEn: (over.labelEn as string) ?? "Sizes",
    labelAr: null,
    description: null,
    isSystemManaged: false,
    isPlatformOwned: false,
    versionCount: 1,
    publishedVersionId: "osv-1",
    publishedVersionNumber: 1,
    ...over,
  });
}

function renderPicker(props: Partial<React.ComponentProps<typeof OptionSetPicker>> = {}) {
  const onSelect = vi.fn();
  const onRetry = vi.fn();
  render(
    <OptionSetPicker
      id="picker"
      label="Shared option set"
      sets={[set()]}
      isLoading={false}
      isError={false}
      onRetry={onRetry}
      language="en"
      selectedSetId={null}
      onSelect={onSelect}
      {...props}
    />
  );
  return { onSelect, onRetry };
}

describe("OptionSetPicker", () => {
  it("names the combobox from its real label, via aria-label rather than <label for>", () => {
    renderPicker();

    // getByRole with name, not getByLabelText -- this module's own tests document why: the trigger
    // is a role="combobox" div, which is Name From: author, so a <Label htmlFor> pointing at it
    // computes no accessible name at all.
    expect(screen.getByRole("combobox", { name: "Shared option set" })).toBeInTheDocument();
  });

  it("opens the panel on Enter", () => {
    renderPicker();
    const trigger = screen.getByRole("combobox");

    fireEvent.keyDown(trigger, { key: "Enter" });

    expect(screen.getByRole("option", { name: /Sizes/ })).toBeInTheDocument();
  });

  it("opens the panel on Space", () => {
    renderPicker();
    const trigger = screen.getByRole("combobox");

    fireEvent.keyDown(trigger, { key: " " });

    expect(screen.getByRole("option", { name: /Sizes/ })).toBeInTheDocument();
  });

  it("opens the panel on ArrowDown", () => {
    renderPicker();
    const trigger = screen.getByRole("combobox");

    fireEvent.keyDown(trigger, { key: "ArrowDown" });

    expect(screen.getByRole("option", { name: /Sizes/ })).toBeInTheDocument();
  });

  it("reports the chosen set and closes the panel", () => {
    const { onSelect } = renderPicker();
    fireEvent.click(screen.getByRole("combobox"));

    fireEvent.click(screen.getByRole("option", { name: /Sizes/ }));

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "set-1" }));
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("shows a real, reachable empty state when no set has ever been published", () => {
    renderPicker({ sets: [] });
    fireEvent.click(screen.getByRole("combobox"));

    expect(
      screen.getByText("customField.optionSetBinding.noSetsAvailable")
    ).toBeInTheDocument();
    expect(
      screen.getByText("customField.optionSetBinding.noSetsAvailableHint")
    ).toBeInTheDocument();
  });

  it("shows a retryable error, distinct from the empty state, on a failed fetch", () => {
    const { onRetry } = renderPicker({ isError: true, sets: [] });
    fireEvent.click(screen.getByRole("combobox"));

    expect(
      screen.getByText("customField.optionSetBinding.loadSetsFailed")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("customField.optionSetBinding.noSetsAvailable")
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "common.retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("cannot be opened while disabled, by pointer or by keyboard", () => {
    renderPicker({ disabled: true });
    const trigger = screen.getByRole("combobox");

    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: "Enter" });

    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });
});
