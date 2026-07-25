"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, ChevronLeft, MoreHorizontal } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";

import { cn } from "@core/common/utils";

// Three ink steps, so the trail reads as a trail: the chrome (separators) sits
// at ink-3, the travellable ancestors at ink-2, the page you are on at full ink
// and medium weight. Before this pass every part of the crumb was ink-3 and the
// current page was font-normal — the row was one flat grey string.
//
// `separator` is accepted for API compatibility and consumed here rather than
// spread: React would otherwise render separator="…" as an unknown attribute on
// the <nav>.
const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & {
    separator?: React.ReactNode;
  }
>(({ separator: _separator, ...props }, ref) => (
  <nav ref={ref} aria-label="breadcrumb" {...props} />
));
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.ComponentPropsWithoutRef<"ol">>(
  ({ className, ...props }, ref) => (
    <ol
      ref={ref}
      className={cn(
        "flex flex-wrap items-center gap-1.5 break-words text-sm text-nx-ink-3 sm:gap-2.5",
        className
      )}
      {...props}
    />
  )
);
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<"li">>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...props} />
  )
);
BreadcrumbItem.displayName = "BreadcrumbItem";

// The link carried a bare `transition-colors` — no duration, no easing, no
// reduced-motion path — and no focus treatment whatsoever, so tabbing through a
// breadcrumb was invisible. Both fixed; the radius is only here to give the
// lit-edge ring a shape to trace.
const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean;
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      ref={ref}
      className={cn(
        "rounded-nx-sm text-nx-ink-2 transition-colors duration-nx-micro ease-nx-enter hover:text-nx-ink focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  );
});
BreadcrumbLink.displayName = "BreadcrumbLink";

// aria-current is the whole story here. The upstream shadcn version also puts
// role="link" aria-disabled="true" on this span, which announces "link,
// disabled" for something that is neither a link nor disabled — it is simply
// where you already are.
const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<"span">>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      aria-current="page"
      className={cn("font-medium text-nx-ink", className)}
      {...props}
    />
  )
);
BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbSeparator = ({ children, className, ...props }: React.ComponentProps<"li">) => {
  // If children provided, use it; otherwise, we need direction-aware icon
  if (children) {
    return (
      <li
        role="presentation"
        aria-hidden="true"
        className={cn("text-nx-ink-3 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:shrink-0", className)}
        {...props}
      >
        {children}
      </li>
    );
  }

  // Use direction-aware separator
  return <BreadcrumbSeparatorWithDirection className={className} {...props} />;
};
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

// Internal component that uses useI18n hook
const BreadcrumbSeparatorWithDirection = ({ className, ...props }: React.ComponentProps<"li">) => {
  const { direction } = useI18n();
  const SeparatorIcon = direction === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <li
      role="presentation"
      aria-hidden="true"
      className={cn("text-nx-ink-3 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:shrink-0", className)}
      {...props}
    >
      <SeparatorIcon />
    </li>
  );
};

// The ellipsis stands in for crumbs that were dropped, which is information —
// so it is NOT aria-hidden any more. It used to carry both aria-hidden="true"
// and an sr-only label, i.e. a translated string that no screen reader could
// ever reach. The glyph is hidden; the word is announced.
const BreadcrumbEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => {
  const { t } = useI18n();
  return (
    <span
      className={cn("flex h-9 w-9 items-center justify-center text-nx-ink-3", className)}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="sr-only">{t("common.more")}</span>
    </span>
  );
};
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
