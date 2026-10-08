/* eslint-disable @typescript-eslint/no-explicit-any */
// SelectTrigger -- the POINTER half of disabled/read-only enforcement.
//
// WHY THIS FILE RENDERS SelectTrigger DIRECTLY AND NOT GenericSelect.
//
// GenericSelect refuses to open a disabled or read-only select in its own
// `handleOpenChange` (`if (disabled || readOnly) return`). So a test driven
// through GenericSelect passes whether or not the trigger itself enforces
// anything -- it cannot distinguish "the primitive is correct" from "the one
// consumer that happens to remember masks it". This suite therefore mounts the
// trigger inside a bare Popover, which is exactly what a direct consumer does
// (EntityReferenceCustomFieldControl is one), and is the only arrangement in
// which the guard under test is the thing being observed.
//
// What was wrong: `<PopoverTrigger asChild disabled={!interactive}>` over a
// `<div>` is inert. `disabled` on PopoverTrigger is the native attribute, live
// only while Radix renders its default `Primitive.button`; over a div the
// browser ignores it and Radix wires no disabled check into `onOpenToggle`.
// The keyboard path carried an explicit `if (!interactive) return`; the pointer
// path carried nothing, so a click opened a disabled field. Same root cause the
// component's own doc comment already sets out for Enter/Space -- carried only
// half way.
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { Popover, PopoverContent } from "@core/ui/popover";
import { SelectTrigger } from "./select-trigger";

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

// Radix measures the trigger with ResizeObserver -- same jsdom gap the sibling
// keyboard suite polyfills.
if (typeof (globalThis as any).ResizeObserver === "undefined") {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

const PANEL_TEXT = "the panel body";

/**
 * Mounts the trigger the way a direct consumer does: a controlled Popover whose
 * open state the test can observe, with a body distinctive enough to assert on.
 */
function renderTrigger(props: Partial<React.ComponentProps<typeof SelectTrigger>> = {}) {
  const onOpenChange = vi.fn();

  function Harness() {
    const [open, setOpen] = React.useState(false);
    return (
      <Popover
        open={open}
        onOpenChange={(next) => {
          onOpenChange(next);
          setOpen(next);
        }}
      >
        <SelectTrigger
          id="target"
          open={open}
          multi={false}
          ariaLabel="Target record"
          placeholder="Select a record"
          selectedOptions={[]}
          displayLabel=""
          maxSelectedDisplay={3}
          allowClear={false}
          onClear={() => {}}
          onRemoveOne={() => {}}
          {...props}
        />
        <PopoverContent>{PANEL_TEXT}</PopoverContent>
      </Popover>
    );
  }

  render(<Harness />);
  return { onOpenChange };
}

const click = () => fireEvent.click(screen.getByRole("combobox"));

describe("SelectTrigger pointer enforcement", () => {
  it("opens on a pointer click when the field is interactive", () => {
    // The control case, and it is load-bearing: without it, the two assertions
    // below would also pass against a trigger that never opens at all.
    const { onOpenChange } = renderTrigger();

    click();

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByText(PANEL_TEXT)).toBeInTheDocument();
  });

  it("does not open a disabled field on a pointer click", () => {
    const { onOpenChange } = renderTrigger({ disabled: true });

    click();

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.queryByText(PANEL_TEXT)).not.toBeInTheDocument();
  });

  it("does not open a read-only field on a pointer click", () => {
    // read-only is the likelier of the two in practice: a view-mode form renders
    // its selects read-only rather than disabled, so before this guard every
    // view-mode select in the product opened a working picker on click.
    const { onOpenChange } = renderTrigger({ readOnly: true });

    click();

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.queryByText(PANEL_TEXT)).not.toBeInTheDocument();
  });

  it("keeps the keyboard path refused too, so neither channel is the loose one", () => {
    // Asserted here rather than trusted from the sibling suite, because the fix
    // for the pointer path touches the same element's props and could plausibly
    // have shadowed onKeyDown.
    const { onOpenChange } = renderTrigger({ disabled: true });

    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("still runs a consumer's own click handler on an inert field", () => {
    // Deliberate, and symmetric with the keyboard path, which also calls the
    // consumer handler before bailing. A consumer that wants to ignore clicks on
    // its own disabled field checks its own state; what it must NOT be able to do
    // is replace this guard by passing onClick through wrapperProps.
    const consumerClick = vi.fn();
    const { onOpenChange } = renderTrigger({
      disabled: true,
      wrapperProps: { onClick: consumerClick },
    });

    click();

    expect(consumerClick).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("does not suppress the open when a consumer handler is present and the field is live", () => {
    // The guard reads `!interactive`, not "a consumer handler ran". Passing
    // wrapperProps.onClick must not turn a working select into a dead one.
    const consumerClick = vi.fn();
    const { onOpenChange } = renderTrigger({ wrapperProps: { onClick: consumerClick } });

    click();

    expect(consumerClick).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
