"use client";

/**
 * DetailSheet — the row-detail container for high-traffic lists
 *
 * THE RULE: when a user opens one row out of many — a lead, a booking, an
 * invoice — the detail renders in a DetailSheet. Not a modal (a modal steals
 * the list, and triaging is a list-detail-list-detail loop), and not a full
 * page (a navigation throws away scroll position, filters and selection).
 * The sheet keeps the list alive underneath the scrim so closing the panel
 * lands the user exactly where they were.
 *
 * The container composes the remastered Sheet 1:1 and adds only what a
 * row-detail panel needs on top of it:
 *
 *   - width presets (`sm`..`xl`) instead of per-caller max-w arithmetic. The
 *     presets are `sm:`-prefixed on purpose: the Sheet primitive caps itself
 *     at `sm:max-w-sm`, and only a class in the same breakpoint bucket
 *     out-merges it — a bare `max-w-[700px]` (the pre-remaster attempt) lost
 *     to the primitive's cap in the cascade and never actually applied.
 *   - a logical `side` contract — `"start"`/`"end"` only, default `"end"`,
 *     so the panel attaches to the correct edge in RTL without any caller
 *     bookkeeping. Physical sides are deliberately not exposed here.
 *   - slots: DetailSheetHeader (pinned above the scroll), DetailSheetTabBar
 *     (full-bleed underline TabsList), DetailSheetBody (the one scroll
 *     region) and DetailSheetFooter (pinned action bar under the scroll).
 *     They are plain compound components rather than props so a tabbed
 *     consumer can nest them inside its own <Tabs> root — Radix requires
 *     TabsContent under the same root as the triggers.
 *
 * Everything visual is inherited, not restated: the nx overlay surface
 * (bg-nx-popover behind a hairline and the large radius on the attached
 * edge), the modal shadow step, z-modal, the scrim, the 32px close control,
 * and the 200ms-enter / micro-exit motion pair with its reduced-motion path
 * all live in the Sheet primitive.
 *
 * Reference implementation: LeadDetailDrawer (billing/entitlements/leads).
 * The remaining direct-Sheet row-detail callers (billing CatalogView,
 * analytics DashboardStudioPanel) migrate onto this container in Wave E.
 */

import * as React from "react";

import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@core/ui/sheet";
import { TabsList } from "@core/ui/tabs";
import { cn } from "@core/common/utils";

// ── Width presets ─────────────────────────────────────────────────────────────

// Four stops cover every row-detail density from "a handful of fields" to
// "tabbed record with an activity feed". Below the sm breakpoint the panel is
// always full-width — a partial-width sheet on a phone is two unusable
// columns.
type DetailSheetWidth = "sm" | "md" | "lg" | "xl";

const WIDTHS: Record<DetailSheetWidth, string> = {
  sm: "sm:max-w-md",
  md: "sm:max-w-xl",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-3xl",
};

// ── Root ──────────────────────────────────────────────────────────────────────

export interface DetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * The accessible name of the panel. Always rendered, always visually
   * hidden — the visible identity (name, status badge, meta) belongs in
   * DetailSheetHeader, which can be rich in ways a dialog title cannot.
   */
  title: React.ReactNode;
  /** Accessible description, visually hidden like the title. */
  description?: React.ReactNode;
  width?: DetailSheetWidth;
  /**
   * Logical edges only. "end" (the default) attaches the panel to the
   * inline-end edge — the trailing edge in LTR, the leading one in RTL —
   * which is where a detail opened from a list is expected to appear.
   */
  side?: "start" | "end";
  className?: string;
  children: React.ReactNode;
}

/**
 * Presentation UI container rendering a row-detail overlay panel.
 */
export function DetailSheet({
  open,
  onOpenChange,
  title,
  description,
  width = "md",
  side = "end",
  className,
  children,
}: DetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        // A non-scrolling flex column: header and footer slots pin
        // themselves by structure and DetailSheetBody is the only scroll
        // region. gap-0/p-0 clear the primitive's dialog-style padding —
        // the slots own their own insets so the hairlines can run
        // edge-to-edge.
        className={cn("flex w-full flex-col gap-0 overflow-hidden p-0", WIDTHS[width], className)}
        // Radix warns when a dialog has no description; when the caller
        // genuinely has none, opting out explicitly is the supported path.
        {...(description == null ? { "aria-describedby": undefined } : {})}
      >
        <SheetTitle className="sr-only">{title}</SheetTitle>
        {description != null && <SheetDescription className="sr-only">{description}</SheetDescription>}
        {children}
      </SheetContent>
    </Sheet>
  );
}

// ── Slots ─────────────────────────────────────────────────────────────────────

/**
 * Pinned identity region above the scroll. Sits directly on the panel's
 * nx popover surface behind a full-bleed hairline — no translucent wash, no
 * backdrop blur (the scrim already pushed the page back by taking light
 * away).
 *
 * The inline-end inset is the slot's job, not the caller's: the primitive's
 * close control occupies a 32px square in that corner, and "leave it clear"
 * as a doc note meant one consumer patched `pe-12` on and the others let
 * their titles run underneath it.
 */
export function DetailSheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("shrink-0 border-b border-nx-line ps-6 pe-12 py-5", className)} {...props} />
  );
}
DetailSheetHeader.displayName = "DetailSheetHeader";

/**
 * Full-bleed tab strip between header and body. The underline TabsList
 * variant already owns the hairline track and the accent lit edge on the
 * active trigger — this slot only stretches it across the panel and aligns
 * the triggers to the start. Must render inside the consumer's own <Tabs>
 * root so its TabsContent panels can live in DetailSheetBody.
 */
export function DetailSheetTabBar({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsList>) {
  return (
    <TabsList className={cn("w-full shrink-0 justify-start rounded-none px-6", className)} {...props} />
  );
}
DetailSheetTabBar.displayName = "DetailSheetTabBar";

/**
 * The one scroll region of the panel. Everything that is not pinned chrome
 * goes here — including TabsContent panels when the sheet is tabbed.
 *
 * overscroll-contain stops a flick that reaches the end of the detail from
 * carrying on into the list behind the scrim — which is the one thing this
 * container exists to keep exactly where the user left it.
 */
export function DetailSheetBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "custom-scrollbar flex-1 overflow-y-auto overflow-x-hidden overscroll-contain",
        className
      )}
      {...props}
    />
  );
}
DetailSheetBody.displayName = "DetailSheetBody";

/**
 * Pinned action bar under the scroll, behind its own hairline. Primary
 * record actions (convert, assign, send) belong here so they stay reachable
 * however long the detail grows.
 *
 * It lays its children out itself now, on the same contract as every other
 * overlay footer in the family — actions in DOM order, primary last, packed
 * to the inline-end edge. A tertiary action (reset, delete) opts out of the
 * pack with `me-auto`. Every consumer was re-declaring `flex items-center
 * gap-2` on top of a plain block to get here.
 */
export function DetailSheetFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-nx-line px-6 py-4",
        className
      )}
      {...props}
    />
  );
}
DetailSheetFooter.displayName = "DetailSheetFooter";
