"use client";

/**
 * CollapsibleSection — collapsible accordion row for settings panels.
 *
 * The chevron reports STATE, not direction. It previously swapped glyph by
 * writing direction — ChevronRight in English, ChevronLeft in Arabic — which
 * made "closed" look like two different things depending on the build, and
 * made the transition between states a glyph swap rather than a movement. One
 * ChevronDown rotated 180° on open reads identically in both directions and is
 * the same disclosure idiom the Accordion primitive already uses.
 *
 * Locking is a real `disabled` button with dedicated dim ink rather than an
 * opacity veil: a 50% veil over a tinted panel fades the row toward the panel
 * colour instead of toward "unavailable".
 *
 * @module core/ui/collapsible-section
 */

import * as React from "react";
import { cn } from "@/core/common/utils";
import { ChevronDown, Lock } from "lucide-react";
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
  const { t } = useI18n();
  const contentId = React.useId();

  return (
    <div className={cn("border-b border-nx-line last:border-0", className)}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={isOpen ? contentId : undefined}
        className={cn(
          "flex w-full items-center gap-2 px-1 py-2.5 text-start text-nx-ink",
          "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
          "hover:bg-nx-hover",
          "focus-visible:outline-none focus-visible:shadow-nx-focus",
          "disabled:cursor-not-allowed disabled:text-nx-ink-3 disabled:hover:bg-transparent"
        )}
        disabled={isLocked}
        dir="auto"
      >
        <Icon className="h-3.5 w-3.5 shrink-0 text-nx-ink-3" aria-hidden="true" />
        {/* No colour of its own — it inherits the button's ink so the disabled
            state dims the label with it. */}
        <span className="flex-1 truncate text-[11px] font-semibold">{title}</span>
        {count != null && (
          <span
            className="shrink-0 text-[11px] tabular-nums text-nx-ink-3"
            aria-label={t("chrome.section.itemCount", { count })}
          >
            {count}
          </span>
        )}
        {isLocked && (
          <>
            <Lock className="h-3 w-3 shrink-0 text-warning" aria-hidden="true" />
            <span className="sr-only">{t("chrome.section.locked")}</span>
          </>
        )}
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "h-3 w-3 shrink-0 text-nx-ink-3",
            "transition-transform duration-nx-micro ease-nx-enter motion-reduce:transition-none",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <div id={contentId} className="space-y-3 px-0.5 pb-3">
          {children}
        </div>
      )}
    </div>
  );
}
