"use client";

/**
 * Pagination — the page rail
 *
 * This shipped as the stock shadcn scaffold and never got a second look. What
 * was wrong:
 *  • the ACTIVE page was a filled primary button and every other page an
 *    outlined one, so the loudest thing on the strip was a row of five equal
 *    boxes and the current page had to shout over them. Light collects on the
 *    active thing now: the current page wears the lit accent edge and the rest
 *    are quiet ghost targets;
 *  • `PaginationEllipsis` was `aria-hidden` AND carried an `sr-only` label
 *    inside it, so the label could never be announced — dead markup pretending
 *    to be an accessibility affordance;
 *  • the bounds states (first page / last page) were styled entirely at the
 *    call site with `opacity-50` on a tinted surface, which is the exact
 *    disabled-by-opacity-maths this system bans. `aria-disabled` is now a
 *    designed state with its own ink;
 *  • page numbers were proportional, so the strip jittered between 8 and 9;
 *    they are tabular now.
 *
 * Every export, prop and the `size` contract are unchanged — generic-table
 * drives this component with `href="#"`, `aria-disabled` and its own h-8 w-8
 * overrides, and all three keep working.
 */

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@core/common/utils";
import { ButtonProps } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex flex-row items-center gap-1", className)} {...props} />
  )
);
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ className, ...props }, ref) => <li ref={ref} className={className} {...props} />
);
PaginationItem.displayName = "PaginationItem";

// The size ladder mirrors Button's so `size` keeps meaning what it always did;
// callers that pass their own h-*/w-* still win through tailwind-merge.
const LINK_SIZES: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "h-10 min-w-10 px-4",
  sm: "h-9 min-w-9 px-3",
  lg: "h-11 min-w-11 px-8",
  icon: "h-10 w-10",
};

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">;

const PaginationLink = ({ className, isActive, size = "icon", ...props }: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      "inline-flex select-none items-center justify-center gap-1 rounded-nx-control border text-sm tabular-nums",
      "transition-[color,background-color,border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
      "focus-visible:shadow-nx-focus focus-visible:outline-none",
      // Bounds states: dedicated ink, no opacity maths over a tinted surface.
      "aria-disabled:pointer-events-none aria-disabled:border-transparent aria-disabled:bg-transparent aria-disabled:text-nx-ink-3",
      LINK_SIZES[size ?? "icon"],
      isActive
        ? // The lit edge — accent hairline, accent wash, accent ink.
          "cursor-default border-nx-accent bg-nx-accent-wash font-semibold text-nx-accent"
        : "cursor-pointer border-transparent bg-transparent font-medium text-nx-ink-2 hover:border-nx-line hover:bg-nx-hover hover:text-nx-ink active:shadow-[inset_0_0_0_1px_var(--nx-accent)]",
      className
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => {
  const { t, direction } = useI18n();
  return (
    <PaginationLink
      aria-label={t("table.previousPage")}
      size="default"
      className={cn("gap-1 px-2.5", className)}
      {...props}
    >
      {direction === "rtl" ? (
        <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0" />
      ) : (
        <ChevronLeft aria-hidden="true" className="h-4 w-4 shrink-0" />
      )}
      <span>{t("common.previous")}</span>
    </PaginationLink>
  );
};
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => {
  const { t, direction } = useI18n();
  return (
    <PaginationLink
      aria-label={t("table.nextPage")}
      size="default"
      className={cn("gap-1 px-2.5", className)}
      {...props}
    >
      <span>{t("common.next")}</span>
      {direction === "rtl" ? (
        <ChevronLeft aria-hidden="true" className="h-4 w-4 shrink-0" />
      ) : (
        <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0" />
      )}
    </PaginationLink>
  );
};
PaginationNext.displayName = "PaginationNext";

// Purely decorative: the pages it stands for are not reachable from here, so
// it is hidden from the accessibility tree outright rather than hidden and
// then given a label nothing can read.
const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span
    aria-hidden="true"
    className={cn("flex h-9 w-9 items-center justify-center text-nx-ink-3", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
