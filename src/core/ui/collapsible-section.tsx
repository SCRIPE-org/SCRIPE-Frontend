"use client";

/**
 * CollapsibleSection — RTL-aware collapsible accordion for settings panels.
 *
 * Features:
 * - Auto-mirrors chevron direction in RTL (ChevronLeft when closed in RTL)
 * - Logical ordering of icon, title, badge, lock, and arrow
 * - Smooth open/close animation
 * - Edition lock badge support
 *
 * @module core/ui/collapsible-section
 */

import * as React from "react";
import { cn } from "@/core/common/utils";
import { ChevronDown, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";

export interface CollapsibleSectionProps {
  /** Icon component rendered before the title */
  icon: React.ElementType;
  /** Section title text */
  title: string;
  /** Item count badge (e.g. "6 settings") */
  count?: number;
  /** Whether the section is open */
  isOpen: boolean;
  /** Toggle callback */
  onToggle: () => void;
  /** Show edition-lock badge */
  isLocked?: boolean;
  /** Section content */
  children: React.ReactNode;
  /** Additional CSS classes for the wrapper */
  className?: string;
}

export function CollapsibleSection({
  icon: Icon,
  title,
  count,
  isOpen,
  onToggle,
  isLocked,
  children,
  className,
}: CollapsibleSectionProps) {
  const { direction } = useI18n();
  const isRtl = direction === "rtl";

  // Determine the correct chevron for closed state:
  // LTR closed → ChevronRight (pointing toward content)
  // RTL closed → ChevronLeft (pointing toward content)
  const ClosedChevron = isRtl ? ChevronLeft : ChevronRight;
  const Arrow = isOpen ? ChevronDown : ClosedChevron;

  return (
    <div className={cn("border-b border-border/50 last:border-0", className)}>
      <button
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-2 px-1 py-2.5 text-start transition-colors",
          "hover:bg-accent/30",
          isLocked && "opacity-50"
        )}
        disabled={isLocked}
        dir="auto"
      >
        <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="flex-1 text-[11px] font-semibold text-foreground truncate">
          {title}
        </span>
        {count != null && (
          <span className="text-[9px] text-muted-foreground/60 tabular-nums shrink-0">
            {count}
          </span>
        )}
        {isLocked && <Lock className="h-3 w-3 text-amber-500 shrink-0" />}
        <Arrow className="h-3 w-3 text-muted-foreground shrink-0" />
      </button>
      {isOpen && (
        <div className="space-y-3 pb-3 px-0.5">
          {children}
        </div>
      )}
    </div>
  );
}
