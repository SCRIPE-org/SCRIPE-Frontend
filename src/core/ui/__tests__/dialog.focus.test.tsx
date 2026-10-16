// DialogContent -- focus reception, focus restoration, and the body-portalled
// input cases that the old autofocus suppression was believed to protect.
//
// WHAT WAS WRONG. This file's DialogContent used to preventDefault BOTH
// `onOpenAutoFocus` and `onCloseAutoFocus`. Consequences, each verified against
// the installed Radix sources:
//
//   * DialogContentModal composes the consumer's onCloseAutoFocus with its own
//     `(e) => { e.preventDefault(); context.triggerRef.current?.focus(); }` via
//     composeEventHandlers, which SKIPS the second handler once the first has
//     called preventDefault. So preventing it here deleted Radix's trigger
//     refocus. Closing a dialog left focus nowhere.
//   * FocusScope only focuses on mount if that event was not default-prevented,
//     and its trap re-focuses `lastFocusedElementRef`, which is only ever set
//     from a focusin landing inside the content. Prevented, the panel started
//     out owning no focus at all -- while DialogContentModal still called
//     hideOthers(content), so the whole page behind it WAS aria-hidden. A
//     screen-reader user was left outside the dialog on a hidden page.
//
// WHAT THE SUPPRESSION WAS BELIEVED TO DO, and why it did not. The comments said
// it was what let body-portalled select / date-picker search inputs take focus.
// The tests below drive both of those shapes and show the protection actually
// comes from elsewhere:
//
//   * `modal={false}` on the Root -- which every form-hosting dialog in this
//     product sets (GenericModal and the hand-rolled hosts). Non-modal mode
//     passes `trapFocus: false`, so there is no trap to escape.
//   * DialogContent's own onFocusOutside / onInteractOutside allow-lists, which
//     are what stop a live portal from DISMISSING the dialog -- the symptom the
//     original bug report actually described.
//   * For a genuinely modal dialog, Radix's own layering: Popover/Select/
//     DropdownMenu content each mount their own FocusScope, and
//     focusScopesStack.add() PAUSES the dialog's scope while they are open.
import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { createPortal } from "react-dom";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../dialog";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    direction: "ltr",
  }),
}));

/** Radix runs its close-autofocus in a setTimeout(0) out of FocusScope's cleanup. */
async function flushTimers() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

function TriggeredDialog({ modal, children }: { modal?: boolean; children?: React.ReactNode }) {
  return (
    <Dialog modal={modal}>
      <DialogTrigger>open me</DialogTrigger>
      <DialogContent>
        <DialogTitle>Test dialog</DialogTitle>
        <button type="button">first inside</button>
        {children}
      </DialogContent>
    </Dialog>
  );
}

describe("DialogContent receives focus on open", () => {
  it("lands focus inside the panel for a modal dialog", () => {
    render(<TriggeredDialog />);
    fireEvent.click(screen.getByText("open me"));

    const panel = screen.getByRole("dialog");
    expect(panel.contains(document.activeElement)).toBe(true);
  });

  it("lands focus inside the panel for a modal={false} dialog (GenericModal's shape)", () => {
    render(<TriggeredDialog modal={false} />);
    fireEvent.click(screen.getByText("open me"));

    const panel = screen.getByRole("dialog");
    expect(panel.contains(document.activeElement)).toBe(true);
  });

  it("leaves focus outside if a consumer opts out via its own onOpenAutoFocus", () => {
    // DocsSearch-style override: the four inner handlers sit before {...props},
    // so a consumer keeps full control.
    render(
      <Dialog>
        <DialogTrigger>open me</DialogTrigger>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogTitle>Test dialog</DialogTitle>
          <button type="button">first inside</button>
        </DialogContent>
      </Dialog>
    );
    fireEvent.click(screen.getByText("open me"));

    const panel = screen.getByRole("dialog");
    expect(panel.contains(document.activeElement)).toBe(false);
  });
});

describe("DialogContent restores focus on close", () => {
  it("returns focus to the trigger for a modal dialog", async () => {
    render(<TriggeredDialog />);
    const trigger = screen.getByText("open me");
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await flushTimers();

    expect(trigger).toHaveFocus();
  });

  it("returns focus to the trigger for a modal={false} dialog", async () => {
    render(<TriggeredDialog modal={false} />);
    const trigger = screen.getByText("open me");
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await flushTimers();

    expect(trigger).toHaveFocus();
  });
});

describe("body-portalled inputs inside a dialog", () => {
  it("a Radix Popover's own input keeps focus inside a MODAL dialog", async () => {
    // This is GenericSelect's exact shape: Popover + PopoverContent portalled to
    // document.body. Its content mounts its own FocusScope, so
    // focusScopesStack.add() pauses the dialog's scope and the input is usable
    // even under a live focus trap. No help from DialogContent required -- which
    // is the point: the autofocus suppression was never what made this work.
    const onOpenChange = vi.fn();
    render(
      <Dialog defaultOpen onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Test dialog</DialogTitle>
          <PopoverPrimitive.Root defaultOpen>
            <PopoverPrimitive.Trigger>pick one</PopoverPrimitive.Trigger>
            <PopoverPrimitive.Portal>
              <PopoverPrimitive.Content data-radix-popper-content-wrapper="">
                <input aria-label="portalled search" />
              </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
          </PopoverPrimitive.Root>
        </DialogContent>
      </Dialog>
    );

    const search = screen.getByLabelText("portalled search");
    await act(async () => {
      search.focus();
    });

    expect(search).toHaveFocus();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("a HAND-ROLLED body portal keeps focus inside a modal={false} dialog", async () => {
    // The date-picker calendar's shape: a plain createPortal to document.body,
    // with none of Radix's focus machinery. This is the case the old comment
    // described, and `modal={false}` -- what every form-hosting dialog in this
    // product already uses -- is what makes it work: trapFocus is false, so
    // there is no trap, and this file's onFocusOutside veto keeps the focus
    // move from dismissing the dialog.
    const onOpenChange = vi.fn();
    const { baseElement } = render(
      <Dialog defaultOpen modal={false} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Test dialog</DialogTitle>
          {createPortal(
            <div data-date-picker="true">
              <input aria-label="portalled time" />
            </div>,
            document.body
          )}
        </DialogContent>
      </Dialog>
    );

    // Let DismissableLayer's deferred focusin listener attach first, so this is
    // a real test of the allow-list rather than of a race.
    await flushTimers();

    const timeInput = baseElement.querySelector("[data-date-picker] input") as HTMLInputElement;
    expect(timeInput).not.toBeNull();
    await act(async () => {
      timeInput.focus();
      fireEvent.focusIn(timeInput);
    });

    expect(timeInput).toHaveFocus();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("does not DISMISS a modal dialog when a hand-rolled portal takes focus", async () => {
    // Documented limitation, pinned to the part that matters. A hand-rolled body
    // portal inside a genuinely MODAL DialogContent mounts no FocusScope, so it
    // never pauses the dialog's trap and focus is pulled back into the dialog.
    // That predates this change (the trap engaged as soon as anything inside the
    // dialog was focused) and the product's answer is modal={false}, which every
    // form-hosting dialog uses. What must hold either way is that the dialog is
    // not DISMISSED -- losing the whole form was the original bug report.
    const onOpenChange = vi.fn();
    const { baseElement } = render(
      <Dialog defaultOpen onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Test dialog</DialogTitle>
          {createPortal(
            <div data-date-picker="true">
              <input aria-label="portalled time" />
            </div>,
            document.body
          )}
        </DialogContent>
      </Dialog>
    );

    await flushTimers();

    const timeInput = baseElement.querySelector("[data-date-picker] input") as HTMLInputElement;
    await act(async () => {
      timeInput.focus();
      fireEvent.focusIn(timeInput);
    });

    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(screen.getByText("Test dialog")).toBeInTheDocument();
  });
});
