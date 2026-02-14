"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, ChevronLeft, MoreHorizontal } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";

import { cn } from "@core/common/utils";

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & {
    separator?: React.ReactNode;
  }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />);
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.ComponentPropsWithoutRef<"ol">>(
  ({ className, ...props }, ref) => (
    <ol
      ref={ref}
      className={cn(
        "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
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
      className={cn("transition-colors hover:text-foreground", className)}
      {...props}
    />
  );
});
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<"span">>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-normal text-foreground", className)}
      {...props}
    />
  )
);
BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbSeparator = ({ children, className, ...props }: React.ComponentProps<"li">) => {
  // Only use i18n if children is not provided (default separator)
  const SeparatorIcon = children
    ? null
    : React.memo(() => {
        // This will be wrapped in a component that uses useI18n
        return null;
      });
  // If children provided, use it; otherwise, we need direction-aware icon
  if (children) {
    return (
      <li
        role="presentation"
        aria-hidden="true"
        className={cn("[&>svg]:h-3.5 [&>svg]:w-3.5", className)}
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
      className={cn("[&>svg]:h-3.5 [&>svg]:w-3.5", className)}
      {...props}
    >
      <SeparatorIcon />
    </li>
  );
};

const BreadcrumbEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => {
  const { t } = useI18n();
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={cn("flex h-9 w-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
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
