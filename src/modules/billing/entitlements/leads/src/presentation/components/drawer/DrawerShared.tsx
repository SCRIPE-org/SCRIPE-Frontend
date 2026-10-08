"use client";

import { useState } from "react";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import { Copy, CheckCheck } from "lucide-react";
import type { LeadStatus } from "../../../domain/entities/PlatformLead";

// Re-export for convenience
/**
 * Exported type in the entitlements/leads module.
 */
export type { LeadStatus };

// ── Status config ─────────────────────────────────────────────────────────────

/**
 * Exported constant defining parameters and fields for a l l_ s t a t u s e s configurations.
 */
export const ALL_STATUSES: LeadStatus[] = ["New", "Contacted", "Qualified", "Converted", "Closed"];

/**
 * Exported constant defining parameters and fields for s t a t u s_ s t y l e s configurations.
 */
export const STATUS_STYLES: Record<LeadStatus, { badge: string; dot: string; ring: string }> = {
  New: {
    badge: "bg-info/15 text-info border-info/30",
    dot: "bg-info",
    ring: "ring-info/30",
  },
  Contacted: {
    badge: "bg-warning/15 text-warning border-warning/30",
    dot: "bg-warning",
    ring: "ring-warning/30",
  },
  Qualified: {
    badge:
      "bg-[color:color-mix(in_srgb,var(--nx-accent)_15%,transparent)] text-nx-accent border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)]",
    dot: "bg-nx-accent",
    ring: "ring-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)]",
  },
  Converted: {
    badge: "bg-success/15 text-success border-success/30",
    dot: "bg-success",
    ring: "ring-success/30",
  },
  Closed: {
    badge:
      "bg-[color:color-mix(in_srgb,var(--nx-ink-3)_15%,transparent)] text-nx-ink-3 border-nx-line",
    dot: "bg-nx-ink-3",
    ring: "ring-nx-line",
  },
};

// ── CopyButton ────────────────────────────────────────────────────────────────

/**
 * Presentation UI component rendering the copy button.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      variant="ghost"
      size="icon"
      className="h-5 w-5 shrink-0 text-nx-ink-2 hover:text-nx-ink"
    >
      {copied ? <CheckCheck className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}

// ── InfoRow ───────────────────────────────────────────────────────────────────

/**
 * Presentation UI component rendering the info row.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function InfoRow({
  icon: Icon,
  label,
  value,
  copyable,
  mono,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  copyable?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-1">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-nx-ink-3" />
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-nx-ink-3">
          {label}
        </p>
        <div className="flex items-center gap-1.5">
          <span className={`truncate text-sm text-nx-ink ${mono ? "font-mono" : ""}`}>{value}</span>
          {copyable && <CopyButton value={copyable} />}
        </div>
      </div>
    </div>
  );
}

// ── SectionCard ───────────────────────────────────────────────────────────────

/**
 * Presentation UI component rendering the section card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function SectionCard({
  title,
  icon: Icon,
  accent,
  children,
}: {
  title: string;
  icon: React.ElementType;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-nx-md border p-4 ${accent ?? "border-nx-line bg-[color:color-mix(in_srgb,var(--nx-surface)_40%,transparent)]"}`}
    >
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-nx-ink-3" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-nx-ink-3">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

// ── SkeletonPanel ─────────────────────────────────────────────────────────────

/**
 * Presentation UI component rendering the skeleton panel.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function SkeletonPanel() {
  return (
    <div className="space-y-4 p-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="space-y-2 rounded-nx-md border border-nx-line bg-[color:color-mix(in_srgb,var(--nx-surface)_40%,transparent)] p-4"
        >
          <Skeleton shape="text" className="h-2.5 w-24 rounded-full" />
          <Skeleton shape="text" className="h-4 w-40 rounded-full" />
          <Skeleton shape="text" className="h-4 w-32 rounded-full" />
        </div>
      ))}
    </div>
  );
}
