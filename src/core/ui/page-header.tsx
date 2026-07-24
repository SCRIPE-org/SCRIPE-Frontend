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
 *
 * Wave K: the title row relied on the middle column's flex-1 to push the
 * actions to the inline end, which collapsed the moment a title wrapped — the
 * actions are explicitly `ms-auto` now. The meta labels were set at 10.4px (an
 * arbitrary rem fraction) and the tab strip's overflow container clipped the
 * focus ring off the first tab; both are fixed, and the scroll strip wears the
 * shell's own quiet scrollbar rather than the platform default.
 */

import * as React from "react";
import { cn } from "@core/common/utils";
import type { LucideIcon } from "lucide-react";

export interface PageHeaderMeta {
  label: string;
  value: React.ReactNode;
}

// One literal class per entry count — Tailwind only ships classes it can see,
// so the column count cannot be interpolated. Five and six split across two
// even rows on small screens before going single-row on large ones; anything
// past six wraps in fours.
const META_COLS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-3 lg:grid-cols-5",
  6: "sm:grid-cols-3 lg:grid-cols-6",
};

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
  /** Tab row on the header's bottom edge — pass a <Tabs>/<TabsList>. */
  tabs?: React.ReactNode;
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
  tabs,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("mb-6 space-y-4", className)}>
      {eyebrow}

      <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
        {Icon && (
          // The single chromatic anchor on the page. Everything else in the
          // header is ink on a neutral surface.
          <div
            className="grid h-12 w-12 shrink-0 place-items-center rounded-nx-md border border-nx-line bg-nx-accent-wash text-nx-accent"
            aria-hidden="true"
          >
            <Icon className="h-5 w-5" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            <h1 className="min-w-0 truncate text-xl font-bold leading-tight tracking-tight text-nx-ink text-balance">
              {title}
            </h1>
            {badges}
          </div>
          {description && (
            <p className="mt-1.5 max-w-[80ch] text-pretty text-sm leading-relaxed text-nx-ink-2">
              {description}
            </p>
          )}
        </div>

        {actions && <div className="flex flex-wrap items-center gap-2 ms-auto">{actions}</div>}
      </div>

      {meta && meta.length > 0 && (
        <div className="overflow-hidden rounded-nx-md border border-nx-line bg-nx-surface">
          {/* Every cell draws its own start/top hairline; the -1px offsets
              tuck the first row's and first column's lines under the container
              border, so any entry count — 3, 5, wrapped rows — rules itself
              correctly. The old [&+&]:border-s put a stray hairline at the
              start of every wrapped row. */}
          <dl
            className={cn(
              "-ms-px -mt-px grid grid-cols-2",
              META_COLS[meta.length] ?? "sm:grid-cols-4"
            )}
          >
            {meta.map((entry) => (
              <div key={entry.label} className="border-s border-t border-nx-line p-3">
                <dt className="truncate text-[11px] font-semibold uppercase leading-none tracking-wider text-nx-ink-3">
                  {entry.label}
                </dt>
                <dd className="mt-1.5 truncate text-sm font-semibold leading-none tabular-nums text-nx-ink">
                  {entry.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* The negative inline margin gives the first and last tab's focus ring
          room to draw instead of being sheared off by the scroll container. */}
      {tabs && <div className="nexus-custom-scrollbar -mx-1 overflow-x-auto px-1">{tabs}</div>}

      {children}
    </header>
  );
}
