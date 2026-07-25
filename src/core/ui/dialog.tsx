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
>(({ className, children, dir, variant = "default", ...props }, ref) => {
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
        className={cn(positionClasses, className)}
        onOpenAutoFocus={(e) => {
          // Prevent auto focus to allow dropdown inputs to work
          e.preventDefault();
        }}
        onCloseAutoFocus={(e) => {
          // Prevent auto focus restoration
          e.preventDefault();
        }}
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
        onFocusOutside={(e) => {
          // Allow focus to move into dropdown portals so search input can receive focus
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
