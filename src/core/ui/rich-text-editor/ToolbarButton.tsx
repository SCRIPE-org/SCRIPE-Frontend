"use client";

import React from "react";
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";

// ─── Types ──────────────────────────────────────────────────
export interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  /**
   * The control's name, already localized by the caller.
   *
   * It is spent TWICE on purpose: as the hover tooltip AND as the button's
   * aria-label. A tooltip is a hover affordance — it lives in a portal that is
   * never part of the button's accessible name, so a toolbar of twenty-four
   * glyph-only buttons announced twenty-four times as "button" until this
   * label existed.
   */
  title: string;
  children: React.ReactNode;
}

// ─── Component ──────────────────────────────────────────────
export function ToolbarButton({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            // The active mark is the accent wash + accent ink, the same pair the
            // menus use for a current value. It replaces the legacy shadcn
            // accent/foreground pair, which in this theme resolves to the plain
            // neutral hover fill — so an engaged Bold button looked exactly like
            // a hovered one and the toolbar had no readable state at all.
            className={cn("h-8 w-8 p-0", active && "bg-nx-accent-wash text-nx-accent")}
            onClick={onClick}
            disabled={disabled}
            aria-label={title}
            // Undefined for one-shot commands (undo, redo, insert divider) so
            // they stay plain buttons; only real toggles report pressed state.
            aria-pressed={active}
          >
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{title}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
