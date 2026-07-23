"use client";

import * as React from "react";
import { ChevronUp, ChevronsUpDown } from "lucide-react";

import { cn } from "@core/common/utils";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";

/**
 * The nexus table — quiet surfaces, hairline row edges, light collects on
 * the sorted column and the selected row. Density rides the Settings
 * spacingSize; sorting, sticky headers, numeric alignment and row states
 * live here so consumers stop hand-rolling them.
 */

// Density — the Settings spacingSize mapped onto the row ladder. Unknown or
// legacy stored values fall through to the default step; the stored-value
// migration itself is Wave C's job.
const getHeadDensity = (spacing: string | undefined) => {
  switch (spacing) {
    case "compact":
      return "h-10 px-2";
    case "comfortable":
    case "spacious":
      return "h-14 px-4";
    default:
      return "h-12 px-4";
  }
};

const getCellDensity = (spacing: string | undefined) =>
  spacing === "compact" ? "p-2" : "p-4";

/**
 * Table component with automatic RTL/LTR support
 */
const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, dir, ...props }, ref) => {
    const { direction } = useI18n();

    return (
      <div className="relative w-full overflow-auto" dir={dir ?? direction}>
        <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
      </div>
    );
  }
);
Table.displayName = "Table";

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  /**
   * Pins the header inside the Table's own overflow-auto wrapper. The bg is
   * opaque token surface so rows vanish under it; the hairline renders as an
   * inset shadow because collapsed borders scroll away with the rows.
   */
  sticky?: boolean;
}

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, sticky = false, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn(
        "[&_tr]:border-b",
        sticky &&
          "sticky top-0 z-raised bg-nx-surface [&_th]:shadow-[inset_0_-1px_0_var(--nx-line)]",
        className
      )}
      {...props}
    />
  )
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t border-nx-line bg-nx-hover font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Marks the row selected via data-state — the accent wash light collects on. */
  selected?: boolean;
  /** Interactive row: pointer cursor, keyboard-reachable, lit-edge focus. */
  clickable?: boolean;
  /** Inert row — dimmed, no pointer events, announced via aria-disabled. */
  disabled?: boolean;
  /** Even-row tint for dense scanning — reads --nx-hover so it flips with the theme. */
  striped?: boolean;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, selected, clickable, disabled, striped, tabIndex, ...props }, ref) => {
    const settings = useSettings();
    const hasHoverEffect =
      settings.hoverEffectType !== "none" && settings.hoverEffectIntensity !== "none";

    // If className is provided, it will override defaults - don't add base hover effects
    // This allows GenericTable to fully control the hover behavior
    const baseClasses = className
      ? "border-b data-[state=selected]:bg-muted" // Minimal base classes when custom className provided
      : hasHoverEffect
        ? "border-b border-nx-line transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:bg-nx-hover data-[state=selected]:bg-nx-accent-wash" // Default hover when enabled
        : "border-b border-nx-line transition-none hover:bg-transparent data-[state=selected]:bg-nx-accent-wash"; // No hover when disabled

    return (
      <tr
        ref={ref}
        // Placed before the spread so a consumer-passed data-state still wins.
        data-state={selected ? "selected" : undefined}
        aria-disabled={disabled || undefined}
        tabIndex={clickable && !disabled ? (tabIndex ?? 0) : tabIndex}
        className={cn(
          baseClasses,
          striped && "even:bg-nx-hover",
          // Collapsed table borders swallow box-shadow on <tr>, so the row's
          // lit edge renders as an inset accent outline instead of --nx-focus.
          clickable &&
            "cursor-pointer outline-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-nx-accent",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
TableRow.displayName = "TableRow";

type SortDirection = "asc" | "desc" | null;

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** Renders the sort chevron and aria-sort; the click handler stays yours. */
  sortable?: boolean;
  /** Current sort of this column — null/undefined means sortable-but-unsorted. */
  sortDirection?: SortDirection;
  /** numeric — end-aligned tabular figures for number columns. */
  variant?: "default" | "numeric";
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, sortable, sortDirection, variant = "default", children, ...props }, ref) => {
    const settings = useSettings();

    const ariaSort = sortable
      ? sortDirection === "asc"
        ? "ascending"
        : sortDirection === "desc"
          ? "descending"
          : "none"
      : undefined;

    return (
      <th
        ref={ref}
        // Placed before the spread so a consumer-passed aria-sort still wins.
        aria-sort={ariaSort}
        className={cn(
          // Using text-start instead of text-left for RTL support
          "text-start align-middle font-medium text-nx-ink-2 [&:has([role=checkbox])]:pe-0",
          getHeadDensity(settings.spacingSize),
          sortable &&
            "cursor-pointer select-none transition-colors duration-nx-micro ease-nx-enter hover:text-nx-ink motion-reduce:transition-none",
          variant === "numeric" && "text-end tabular-nums",
          className
        )}
        {...props}
      >
        {sortable ? (
          <span className="inline-flex items-center gap-1">
            {children}
            {sortDirection ? (
              // One chevron, flipped by transform — the active column is the
              // lit thing, so it wears the accent.
              <ChevronUp
                aria-hidden="true"
                className={cn(
                  "h-3.5 w-3.5 shrink-0 text-nx-accent transition-transform duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                  sortDirection === "desc" && "rotate-180"
                )}
              />
            ) : (
              <ChevronsUpDown aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-nx-ink-3" />
            )}
          </span>
        ) : (
          children
        )}
      </th>
    );
  }
);
TableHead.displayName = "TableHead";

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /** numeric — end-aligned tabular figures for number columns. */
  variant?: "default" | "numeric";
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const settings = useSettings();

    return (
      <td
        ref={ref}
        className={cn(
          // Using ps/pe (padding-start/end) instead of pl/pr for RTL support
          "text-start align-middle [&:has([role=checkbox])]:pe-0 [&:has([role=checkbox])]:ps-4",
          getCellDensity(settings.spacingSize),
          variant === "numeric" && "text-end tabular-nums",
          className
        )}
        {...props}
      />
    );
  }
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn("mt-4 text-sm text-nx-ink-3", className)} {...props} />
));
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
