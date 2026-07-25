"use client";

/**
 * EmptyState — nothing here yet, and what to do about it
 *
 * An empty state that only says "no data" wastes the one moment the user is
 * most willing to act, so the action slot is part of the contract rather than
 * an afterthought. Three sizes cover the panel, the page and the table cell.
 *
 * Wave K: the anatomy was right but the rhythm was not — a single mb/mt chain
 * gave the same 4px gap to the glyph, the sentence and the action, so nothing
 * grouped. The three tiers now scale together (glyph, type, gap), the copy
 * wraps on balance points instead of orphaning a word, and the container's
 * dashed hairline is the only decoration in the component.
 */

import * as React from "react";
import { cn } from "@core/common/utils";
import type { LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  /** What is missing, stated plainly. */
  title: string;
  /** Why it is missing or what would fill it. */
  description?: string;
  icon?: LucideIcon;
  /** The next step. Omit only when the user genuinely cannot act. */
  action?: React.ReactNode;
  /** A lower-commitment alternative beside the primary action. */
  secondaryAction?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  /** Renders without the dashed container, for use inside an existing card. */
  bare?: boolean;
  className?: string;
}

// One row per tier so the glyph, the type and the vertical air move together —
// a 14px title beside a 56px glyph is what "sm" used to look like.
const SIZES = {
  sm: {
    wrap: "py-6",
    glyph: "h-9 w-9",
    icon: "h-4 w-4",
    gap: "mt-2.5",
    title: "text-sm",
    body: "text-xs",
    actions: "mt-3",
  },
  md: {
    wrap: "py-10",
    glyph: "h-12 w-12",
    icon: "h-5 w-5",
    gap: "mt-3.5",
    title: "text-base",
    body: "text-sm",
    actions: "mt-5",
  },
  lg: {
    wrap: "py-16",
    glyph: "h-14 w-14",
    icon: "h-6 w-6",
    gap: "mt-4",
    title: "text-lg",
    body: "text-sm",
    actions: "mt-6",
  },
} as const;

/**
 * Presentation UI component rendering an empty result set.
 */
export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  secondaryAction,
  size = "md",
  bare = false,
  className,
}: EmptyStateProps) {
  const s = SIZES[size];

  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center px-6 text-center",
        s.wrap,
        // --nx-hover is the 5% ink tint that layers over any nx surface — the
        // faintest legal wash, which is all an empty container should carry.
        !bare && "rounded-nx-lg border border-dashed border-nx-line bg-nx-hover",
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            "grid place-items-center rounded-nx-md border border-nx-line bg-nx-raised text-nx-ink-3",
            s.glyph
          )}
          aria-hidden="true"
        >
          <Icon className={s.icon} />
        </div>
      )}

      <h3
        className={cn(
          "text-balance font-semibold leading-tight tracking-tight text-nx-ink",
          Icon && s.gap,
          s.title
        )}
      >
        {title}
      </h3>

      {description && (
        <p className={cn("mt-1.5 max-w-[42ch] text-pretty text-nx-ink-2", s.body)}>{description}</p>
      )}

      {(action || secondaryAction) && (
        <div className={cn("flex flex-wrap items-center justify-center gap-2", s.actions)}>
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
