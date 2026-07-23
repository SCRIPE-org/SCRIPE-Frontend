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
    //
    // The z-index is the named `overlay` step, not a template literal: Tailwind
    // scans source text, so `z-[${OVERLAY_Z_INDEX}]` was never a real class and
    // the `!z-[999]` below was a patch for a class that never existed.
    //
    // Fades ride the token pair — 200ms enter, ~2/3 exit — and a fade is the
    // one movement reduced motion keeps, so no motion-safe split is needed.
    className={cn(
      "fixed inset-0 z-overlay bg-scrim duration-nx-standard ease-nx-enter data-[state=closed]:duration-nx-micro data-[state=closed]:ease-nx-exit data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
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

// One overlay-surface recipe for the whole modal family (alert-dialog mirrors
// it 1:1): nx popover surface behind a hairline, the modal step of the shadow
// ladder, the large radius token. Motion is the token pair — 200ms standard
// enter, micro (~2/3) exit.
const dialogSurfaceClasses =
  "gap-4 border-nx-line bg-nx-popover p-6 text-nx-ink shadow-nx-modal";
const dialogMotionClasses =
  "duration-nx-standard ease-nx-enter data-[state=closed]:duration-nx-micro data-[state=closed]:ease-nx-exit data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0";

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, dir, variant = "default", ...props }, ref) => {
  const { direction } = useI18n();
  const isRtl = (dir || direction) === "rtl";

  const positionClasses =
    variant === "drawer"
      ? cn(
          "fixed inset-y-0 end-0 z-modal grid w-full max-w-lg rounded-s-nx-lg border-s",
          dialogSurfaceClasses,
          dialogMotionClasses,
          // tailwindcss-animate slides are physical, so the logical end edge
          // resolves against the live direction here. motion-safe keeps only
          // the crossfade under reduced motion.
          isRtl
            ? "motion-safe:data-[state=open]:slide-in-from-left motion-safe:data-[state=closed]:slide-out-to-left"
            : "motion-safe:data-[state=open]:slide-in-from-right motion-safe:data-[state=closed]:slide-out-to-right"
        )
      : cn(
          "fixed left-[50%] top-[50%] z-modal grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border sm:rounded-nx-lg",
          dialogSurfaceClasses,
          dialogMotionClasses,
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
        {/* end-4 replaces the old isRtl left/right ternary; focus is the nx
            lit-edge treatment on :focus-visible, not an offset ring halo. */}
        <DialogPrimitive.Close className="absolute end-4 top-4 rounded-nx-sm opacity-70 transition-opacity duration-nx-micro hover:opacity-100 focus-visible:outline-none focus-visible:shadow-nx-focus disabled:pointer-events-none data-[state=open]:bg-nx-hover data-[state=open]:text-nx-ink-2">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  // text-start is direction-aware by itself — the old isRtl ternary re-derived
  // what the logical property already knows.
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-start", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  // gap works in both axes and both directions — no space-x-reverse bookkeeping.
  <div
    className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
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
    className={cn("text-sm text-nx-ink-2", className)}
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
