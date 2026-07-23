"use client";

/**
 * EmptyState — nothing here yet, and what to do about it
 *
 * An empty state that only says "no data" wastes the one moment the user is
 * most willing to act, so the action slot is part of the contract rather than
 * an afterthought. Three sizes cover the panel, the page and the table cell.
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

const SIZES = {
  sm: { wrap: "py-6", glyph: "h-9 w-9", icon: "h-4 w-4", title: "text-sm" },
  md: { wrap: "py-10", glyph: "h-12 w-12", icon: "h-5 w-5", title: "text-base" },
  lg: { wrap: "py-16", glyph: "h-14 w-14", icon: "h-6 w-6", title: "text-lg" },
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
            "mb-3 grid place-items-center rounded-nx-md border border-nx-line bg-nx-raised text-nx-ink-3",
            s.glyph
          )}
          aria-hidden="true"
        >
          <Icon className={s.icon} />
        </div>
      )}

      <h3 className={cn("font-semibold text-nx-ink", s.title)}>{title}</h3>

      {description && (
        <p className="mt-1 max-w-[42ch] text-sm text-nx-ink-2">{description}</p>
      )}

      {(action || secondaryAction) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
