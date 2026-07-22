/**
 * Shared UI helpers for TenantPlan detail views.
 * Used by all tab components.
 */
"use client";

import React from "react";
import { Card, CardContent } from "@core/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";

// ── Types ──
/**
 * Exported type defining parameters and fields for t fn configurations.
 */
export type TFn = (key: string) => string;

// ── Stat Card ──
/**
 * Presentation UI component rendering the stat card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-1 flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <p className="text-lg font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

// ── Info Row (label: value) ──
/**
 * Presentation UI component rendering the info row.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="whitespace-nowrap text-muted-foreground">{label}</span>
      <span className="truncate text-end font-medium">{value}</span>
    </div>
  );
}

// ── Flag Row (label: ✓ / ✗) ──
/**
 * Presentation UI component rendering the flag row.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function FlagRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="h-4 w-4 [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>
        <span>{label}</span>
      </div>
      {value ? (
        <CheckCircle2 className="h-4 w-4 text-success" />
      ) : (
        <XCircle className="h-4 w-4 text-destructive/60" />
      )}
    </div>
  );
}

// ── Currency Formatter ──
/**
 * Presentation UI component rendering the format amount.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}
