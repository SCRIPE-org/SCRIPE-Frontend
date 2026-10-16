/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

/* ── The overlay family's shared surface language ────────────────────────────
 *
 * Dialog, AlertDialog and Sheet are one object seen from three angles, so they
 * read from the recipes below instead of three near-identical class strings
 * that drift apart on the next edit. They already had drifted: the sheet ran a
 * 500ms enter against the dialog's 200ms, and each file re-typed the scrim.
 *
 * Exported so alert-dialog.tsx and sheet.tsx compose them rather than copy
 * them. The strings stay literal (never assembled from fragments at runtime)
 * because Tailwind scans source text for class names.
 */

/** ONE scrim for the whole app: the token wash on the named overlay step of
 *  the z ladder. Split out from the animated variant below because vaul's
 *  drawer fades the scrim itself, tracking the drag — it needs the paint
 *  without the keyframes, and `animate-none` cannot switch the keyframes off
 *  (the `data-[state=open]:` variant carries an extra attribute selector, so
 *  it outranks a bare utility). */
export const overlayScrimSurfaceClasses = "fixed inset-0 z-overlay bg-scrim";

/** The scrim plus its fade on the token pair — 200ms in, ~2/3 out. A fade is
 *  the one movement reduced motion keeps, so no motion-safe split is needed. */
export const overlayScrimClasses = `${overlayScrimSurfaceClasses} duration-nx-standard ease-nx-enter data-[state=closed]:duration-nx-micro data-[state=closed]:ease-nx-exit data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0`;

/** The floating panel itself: nx popover surface behind a hairline, the modal
 *  step of the shadow ladder (these genuinely float, so a shadow is earned),
 *  and the 24px inset every modal in the product shares. */
export const modalSurfaceClasses =
  "gap-4 border-nx-line bg-nx-popover p-6 text-nx-ink shadow-nx-modal";

/** Enter 200ms on the enter curve, exit at the ~2/3 micro step on the exit
 *  curve. No bounce, no spring — the panel arrives and leaves, it does not
 *  perform. */
export const modalMotionClasses =
  "duration-nx-standard ease-nx-enter data-[state=closed]:duration-nx-micro data-[state=closed]:ease-nx-exit data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0";

/** The dismiss affordance shared by Dialog and Sheet.
 *
 *  Was a bare 16px glyph on `opacity-70 hover:opacity-100` — a 16px hit target
 *  (half the 32px floor), opacity math instead of ink tokens, and a
 *  `data-[state=open]` pair cargo-culted from the *trigger*: a Close button has
 *  no open state, so those two classes could never match anything. Now a real
 *  32px control that picks up a hover tint and the lit-edge focus ring. */
export const overlayCloseButtonClasses =
  "absolute end-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-nx-sm text-nx-ink-3 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:bg-nx-hover hover:text-nx-ink focus-visible:text-nx-ink focus-visible:outline-none focus-visible:shadow-nx-focus disabled:pointer-events-none disabled:text-nx-ink-3";

/** Header column shared by every overlay: real hierarchy (title, then a
 *  quieter description) and an inline-end inset so a long title never runs
 *  under the close button. Start-aligned at every width — the shadcn
 *  `text-center sm:text-left` default centres exactly the strings that read
 *  worst centred (long titles, RTL) and flips alignment mid-breakpoint. */
export const overlayHeaderClasses = "flex flex-col gap-1.5 pe-8 text-start";

/** ONE action-bar order for the whole family, so muscle memory transfers
 *  between a Dialog, an AlertDialog and a Sheet:
 *
 *    DOM order = cancel/secondary first, primary last.
 *
 *  At >= sm that puts the primary on the inline-end edge (justify-end and
 *  flex-end both follow the writing direction, so RTL is free). Below sm the
 *  column reverses, which stacks the primary on TOP where the thumb is. */
export const overlayFooterClasses =
  "flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end";

/**
 * Wheel/touch scroll-chain guard for a hand-rolled non-modal scrim.
 *
 * Radix's own scroll lock (react-remove-scroll) only mounts inside
 * DialogOverlayImpl, and DialogOverlay itself renders nothing at all when
 * the Root is `modal={false}` (`context.modal ? <DialogOverlayImpl/> : null`
 * in @radix-ui/react-dialog) — see GenericModal's own comment
 * (generic-modal.tsx) for the first place this was worked out. Every
 * non-modal dialog that re-adds its own scrim in place of Radix's therefore
 * has to re-supply this too: without it, a wheel/touch gesture over the
 * scrim scroll-chains straight into the page behind it. React's
 * root-delegated wheel/touch handlers are passive and cannot cancel, so this
 * attaches a real, non-passive pair directly to the scrim node; it dies with
 * the node when the portal unmounts.
 */
export function useScrimScrollLock() {
  return React.useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const cancelScroll = (event: Event) => event.preventDefault();
    node.addEventListener("wheel", cancelScroll, { passive: false });
    node.addEventListener("touchmove", cancelScroll, { passive: false });
  }, []);
}

/**
 * The hand-rolled scrim itself, factored out so every `modal={false}` dialog
 * in the family (GenericModal today; InlineAddCustomFieldDialog and its
 * handful of hand-rolled hosts as of Wave 5 row 5.6) renders the exact same
 * recipe instead of a fifth near-identical copy. Not wired into GenericModal
 * itself — that component's scrim predates this extraction and stays as-is
 * (its own deliberate `modal={false}` choice is not to be disturbed) — but
 * every *new* non-modal dialog should reach for this rather than re-deriving
 * it.
 *
 * Render this as a sibling of Content inside the same Portal, exactly where
 * Radix's own Overlay would go — it fully replaces that overlay, it is not
 * layered alongside it.
 */
export function NonModalScrim({ open }: { open: boolean }) {
  const lockScrimScroll = useScrimScrollLock();
  return (
    <div
      ref={lockScrimScroll}
      aria-hidden="true"
      data-state={open ? "open" : "closed"}
      className={overlayScrimClasses}
    />
  );
}

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    // The scrim pushes the page back by taking light away, not by blurring it.
    // This previously applied backdrop-blur twice — once through Tailwind and
    // once through an inline style added to survive purging — which is the
    // single most expensive thing to put under a modal on a low-end device,
    // and an explicit ban in DESIGN.md ("no glassmorphism as default").
    className={cn(overlayScrimClasses, className)}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface DialogContentProps extends React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> {
  /**
   * "drawer" pins the panel to the inline-end edge and slides it in from
   * there. Consumers used to smuggle this in through className (right-edge
   * plus important-translate positional overrides) and the component sniffed
   * the strings back out — an explicit variant replaces that contract, and
   * the slide follows the writing direction instead of being welded to the
   * right edge.
   */
  variant?: "default" | "drawer";
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, dir, variant = "default", onFocusOutside, ...props }, ref) => {
  const { t, direction } = useI18n();
  const isRtl = (dir || direction) === "rtl";

  const positionClasses =
    variant === "drawer"
      ? cn(
          "fixed inset-y-0 end-0 z-modal grid w-full max-w-lg rounded-s-nx-lg border-s",
          modalSurfaceClasses,
          modalMotionClasses,
          // tailwindcss-animate slides are physical, so the logical end edge
          // resolves against the live direction here. motion-safe keeps only
          // the crossfade under reduced motion.
          isRtl
            ? "motion-safe:data-[state=open]:slide-in-from-left motion-safe:data-[state=closed]:slide-out-to-left"
            : "motion-safe:data-[state=open]:slide-in-from-right motion-safe:data-[state=closed]:slide-out-to-right"
        )
      : cn(
          // The gutter is deliberate: `w-full` let the panel butt against both
          // viewport edges on a phone, which is also why the corners had to be
          // square below sm. With 16px of air on each side the large radius
          // token applies at every width and the panel reads as an object.
          "fixed left-[50%] top-[50%] z-modal grid w-[calc(100%-2rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-nx-lg border",
          modalSurfaceClasses,
          modalMotionClasses,
          // The 1/2 and 48% "slides" are the centering, not decoration: while
          // a tailwindcss-animate animation runs, its keyframe transform
          // replaces the translate utilities above, so the counter-translate
          // must ride inside the animation vars. They stay outside motion-safe
          // on purpose — dropping them under reduced motion would make the
          // panel jump to the corner, not calm down. Only the zoom is motion.
          "motion-safe:data-[state=open]:zoom-in-95 motion-safe:data-[state=closed]:zoom-out-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]"
        );

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        dir={dir ?? direction}
        aria-describedby={props["aria-describedby"] ?? undefined}
        className={cn(positionClasses, className)}
        /* ── Focus is NOT suppressed here, and that is deliberate ────────────
         *
         * This file used to prevent BOTH `onOpenAutoFocus` and
         * `onCloseAutoFocus` ("prevent auto focus to allow dropdown inputs to
         * work"). The stated goal was real — a body-portalled select or
         * date-picker search input must be able to take focus out of the panel —
         * but the two preventDefaults were not what delivered it, and each one
         * broke something load-bearing. Traced through the installed Radix
         * sources rather than assumed:
         *
         *   onCloseAutoFocus. DialogContentModal composes the consumer handler
         *   with its own `(event) => { event.preventDefault();
         *   context.triggerRef.current?.focus(); }`, and composeEventHandlers
         *   skips the second handler once the first has called preventDefault.
         *   So preventing it here did not merely skip FocusScope's restore — it
         *   deleted Radix's trigger refocus too. Close a dialog and focus was
         *   simply gone: nothing selected, keyboard position lost, next Tab
         *   starting from the top of the document. DialogContentNonModal has the
         *   same shape, so `modal={false}` hosts (GenericModal and friends) lost
         *   it as well.
         *
         *   onOpenAutoFocus. FocusScope focuses its first tabbable candidate on
         *   mount only if that event was not default-prevented, and its trap
         *   re-focuses `lastFocusedElementRef`, which is only ever assigned from
         *   a focusin landing INSIDE the content. Prevented, the panel started
         *   out owning no focus and the ref stayed null, so the trap had nothing
         *   to pull focus back to. Meanwhile DialogContentModal still calls
         *   `hideOthers(content)` — the rest of the page IS aria-hidden. The net
         *   state was the worst of both: a screen-reader user left outside the
         *   dialog, on a page hidden from them, Tab walking a hidden document.
         *
         * What actually keeps body-portalled inputs alive is three things, none
         * of which is autofocus suppression:
         *
         *   1. `modal={false}` on the Root. Every dialog in this product that
         *      hosts form fields sets it (GenericModal, plus the hand-rolled
         *      hosts that re-add their own scrim — see NonModalScrim above).
         *      Non-modal mode passes `trapFocus: false` and skips hideOthers
         *      outright, so there is no trap to escape from in the first place.
         *      GenericModal's own comment has said exactly this all along.
         *   2. The `onInteractOutside` / `onPointerDownOutside` allow-lists just
         *      below, and the unconditional `onFocusOutside` veto further down.
         *      Those are what stop a live portal from DISMISSING the dialog,
         *      which is what the original bug report actually described.
         *   3. For a genuinely modal dialog, Radix's own layering: every
         *      Popover/Select/DropdownMenu content mounts its own FocusScope,
         *      and focusScopesStack.add() PAUSES the dialog's scope while it is
         *      open. So a GenericSelect panel inside a modal dialog keeps its
         *      search input focused without any help from this file.
         *
         * Known limit, recorded rather than papered over: a HAND-ROLLED body
         * portal (DatePicker's calendar) inside a genuinely modal DialogContent
         * mounts no FocusScope, so it never pauses the dialog's trap and focus
         * is pulled back to the dialog. That is not a regression from this
         * change — the trap already engaged as soon as the user focused anything
         * inside the dialog — and the answer for form-hosting dialogs is
         * `modal={false}`, which is what they all use. Fixing it for the modal
         * case would mean changing where DatePicker portals to, which would
         * break its fixed-position maths under the dialog's own transform.
         *
         * A consumer that genuinely needs different behaviour still overrides
         * both handlers through {...props} below (DocsSearch does).
         */
        onInteractOutside={(e) => {
          // Allow interaction with dropdown portals (Select, DatePicker, etc.)
          const target = e.target as Element;
          if (
            target.closest("[data-dropdown-portal]") ||
            target.closest("[data-searchable-select]") ||
            target.closest("[data-date-picker]") ||
            target.closest("[data-radix-popper-content-wrapper]") ||
            target.closest("[role='listbox']") ||
            target.closest("[role='option']")
          ) {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          // Block closing for non-left clicks (e.g., right-click)
          const orig = (e as any).detail?.originalEvent as PointerEvent | MouseEvent | undefined;
          const button = (orig && "button" in orig ? (orig as any).button : 0) as number;
          if (button !== 0) {
            e.preventDefault();
          }
          // Allow interaction with dropdown portals (Select, DatePicker, etc.)
          const target = e.target as Element;
          if (
            target.closest("[data-dropdown-portal]") ||
            target.closest("[data-searchable-select]") ||
            target.closest("[data-date-picker]") ||
            target.closest("[data-radix-popper-content-wrapper]") ||
            target.closest("[role='listbox']") ||
            target.closest("[role='option']")
          ) {
            e.preventDefault();
          }
        }}
        {...props}
        // A dialog is NEVER dismissed by focus movement — only by pointer-down
        // on the scrim, Escape, or an explicit Close.
        //
        // This is exactly what Radix's own DialogContentModal does. GenericModal
        // opts out of MODAL MODE with modal={false} (deliberately: the focus trap
        // breaks the body-portalled select and date-picker search inputs), which
        // means react-dismissable-layer's undeferred `focusin` listener is live
        // there and fired on the FIRST focus event anywhere outside, dismissing
        // the dialog instantly.
        //
        // The concrete symptom: opening Edit / Assign-to-groups from a table row
        // menu closed the form the moment the menu's exit animation finished and
        // it restored focus to the row's trigger button. The allow-list this
        // replaces only covered six dropdown-portal selectors, and a <Button>
        // inside a <td> matched none of them.
        //
        // THIS handler — not the autofocus suppression that used to sit above —
        // is what keeps a live body-portalled panel from closing the dialog it
        // was opened from. That distinction is the whole point of the block
        // above; do not re-conflate them.
        //
        // Deliberately placed AFTER {...props}: a consumer's own handler still
        // runs (composed below) but cannot re-open this dismissal channel. The
        // other handlers stay before {...props} so consumers keep overriding
        // them — PaymentWallDialog relies on that to stay non-dismissible, and
        // DocsSearch passes its own (now redundant) open/close autofocus
        // handlers through the same channel.
        onFocusOutside={(e) => {
          onFocusOutside?.(e);
          e.preventDefault();
        }}
      >
        {children}
        {/* type="button" so a dialog wrapping a <form> cannot submit it by
            dismissing. The label reads from the existing common.close key —
            it was a hardcoded English string that screen readers announced
            untranslated in the Arabic build. */}
        <DialogPrimitive.Close type="button" className={overlayCloseButtonClasses}>
          <X className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">{t("common.close")}</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(overlayHeaderClasses, className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  // gap works in both axes and both directions — no space-x-reverse bookkeeping.
  <div className={cn(overlayFooterClasses, className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    // leading-tight, not leading-none: a title that wraps to two lines (every
    // Arabic string, most long record names) had its descenders clipped and
    // the lines collided.
    className={cn("text-lg font-semibold leading-tight tracking-tight text-nx-ink", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    // One ink step down from the title and a comfortable measure — this is the
    // sentence people actually read before committing to the action.
    className={cn("text-sm leading-6 text-nx-ink-2", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
