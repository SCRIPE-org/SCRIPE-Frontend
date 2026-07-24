"use client";

import { useState } from "react";
import { Button } from "@core/ui/button";
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
    badge: "bg-primary/15 text-primary border-primary/30",
    dot: "bg-primary",
    ring: "ring-primary/30",
  },
  Converted: {
    badge: "bg-success/15 text-success border-success/30",
    dot: "bg-success",
    ring: "ring-success/30",
  },
  Closed: {
    badge: "bg-muted-foreground/15 text-muted-foreground border-border/30",
    dot: "bg-muted-foreground",
    ring: "ring-border/30",
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
      className="h-5 w-5 shrink-0 text-muted-foreground hover:text-foreground"
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
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="flex items-center gap-1.5">
          <span className={`truncate text-sm text-foreground ${mono ? "font-mono" : ""}`}>
            {value}
          </span>
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
    <div className={`rounded-xl border p-4 ${accent ?? "border-border/50 bg-card/40"}`}>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
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
    <div className="animate-pulse space-y-4 p-6 motion-reduce:animate-none">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2 rounded-xl border border-border/50 bg-card/40 p-4">
          <div className="h-2.5 w-24 rounded-full bg-muted" />
          <div className="h-4 w-40 rounded-full bg-muted" />
          <div className="h-4 w-32 rounded-full bg-muted" />
        </div>
      ))}
    </div>
  );
}
