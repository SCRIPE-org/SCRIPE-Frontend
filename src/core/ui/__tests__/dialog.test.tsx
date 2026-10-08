/* eslint-disable jsx-a11y/role-has-required-aria-props */
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Dialog, DialogContent, DialogTitle } from "../dialog";

/**
 * Dialog outside-click allowlist tests.
 *
 * DialogContent's onInteractOutside/onPointerDownOutside handlers call
 * e.preventDefault() when the outside-click target is inside one of six
 * allowlisted portal selectors (dropdown/select/date-picker/popper/listbox/
 * option), so pointer-downs inside those live portals never dismiss the
 * dialog. Any other outside click falls through to Radix's default dismiss
 * behavior and closes it.
 */

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    direction: "ltr",
  }),
}));

function renderDialog(onOpenChange: (open: boolean) => void) {
  return render(
    <div>
      {/* Sits outside the Dialog's portal tree — a plain non-allowlisted node. */}
      <button type="button">outside-plain</button>
      {/* Simulates a live portal (e.g. a Select's popper content) rendered
          outside the DialogContent DOM subtree but allowlisted by selector. */}
      <div data-radix-popper-content-wrapper="">
        <div role="listbox">
          <div role="option">option-1</div>
        </div>
      </div>
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Test dialog</DialogTitle>
          <button type="button">inside</button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Radix's DismissableLayer registers its `pointerdown` listener on
// `document` inside a `setTimeout(0)` (so the open-triggering pointerdown
// itself is never seen), and — for a non-"touch" pointerType — dispatches
// onPointerDownOutside synchronously from that same listener. So a real
// test has to: wait a tick for the listener to attach, then fire a
// `pointerdown` (not click) whose `pointerType` is anything but "touch".
function pointerDownOutside(target: Element) {
  fireEvent.pointerDown(target, { pointerId: 1, button: 0, pointerType: "mouse" });
}

describe("Dialog outside-click allowlist", () => {
  it("does not close when the outside click lands inside an allowlisted portal selector", async () => {
    const onOpenChange = vi.fn();
    // Radix marks every sibling of the modal `aria-hidden="true"` while open
    // (its aria-hide side effect), so the allowlisted portal content below
    // is invisible to `getByRole`/`getByText` even though it's live DOM —
    // query it directly off `baseElement` instead.
    const { baseElement } = renderDialog(onOpenChange);

    expect(screen.getByText("Test dialog")).toBeInTheDocument();

    // Let DismissableLayer's effect (setTimeout(0)) attach its listener.
    await new Promise((resolve) => setTimeout(resolve, 0));

    const option = baseElement.querySelector("[role='option']");
    expect(option).not.toBeNull();
    pointerDownOutside(option as Element);

    await waitFor(() => {
      expect(onOpenChange).not.toHaveBeenCalledWith(false);
    });
    expect(screen.getByText("Test dialog")).toBeInTheDocument();
  });

  it("closes when the outside click lands on a non-allowlisted element", async () => {
    const onOpenChange = vi.fn();
    const { baseElement } = renderDialog(onOpenChange);

    expect(screen.getByText("Test dialog")).toBeInTheDocument();

    await new Promise((resolve) => setTimeout(resolve, 0));

    const outsideButton = baseElement.querySelector("button");
    expect(outsideButton).not.toBeNull();
    expect(outsideButton?.textContent).toBe("outside-plain");
    pointerDownOutside(outsideButton as Element);

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
