"use client";

/**
 * PageHeader — the standard opening of every record and list page
 *
 * Anatomy: icon tile · title + status · description · actions, with an optional
 * ruled meta strip of the few figures that matter and an optional tab row.
 *
 * Before this existed each module invented its own header, which is how the
 * compliance module ended up with a per-page accent hue found nowhere else in
 * the product. One header means learning one page teaches you all of them.
 */

import * as React from "react";
import { cn } from "@core/common/utils";
import type { LucideIcon } from "lucide-react";

export interface PageHeaderMeta {
  label: string;
  value: React.ReactNode;
}

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon;
  /** Status badges rendered inline after the title. */
  badges?: React.ReactNode;
  /** Primary and secondary actions, right-aligned (start-aligned in RTL). */
  actions?: React.ReactNode;
  /** Ruled strip of key figures beneath the title row. */
  meta?: PageHeaderMeta[];
  /** Breadcrumb or back-link slot rendered above the title. */
  eyebrow?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Presentation UI component rendering the standard page header.
 */
export function PageHeader({
  title,
  description,
  icon: Icon,
  badges,
  actions,
  meta,
  eyebrow,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("mb-6 space-y-4", className)}>
      {eyebrow}

      <div className="flex flex-wrap items-start gap-4">
        {Icon && (
          <div
            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <Icon className="h-5 w-5" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="truncate text-xl font-bold tracking-tight">{title}</h1>
            {badges}
          </div>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>

      {meta && meta.length > 0 && (
        <dl className="grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-muted/40 sm:grid-cols-4">
          {meta.map((entry) => (
            <div key={entry.label} className="border-border p-3 [&+&]:border-s">
              <dt className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                {entry.label}
              </dt>
              <dd className="mt-0.5 truncate text-sm font-semibold tabular-nums">{entry.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {children}
    </header>
  );
}
