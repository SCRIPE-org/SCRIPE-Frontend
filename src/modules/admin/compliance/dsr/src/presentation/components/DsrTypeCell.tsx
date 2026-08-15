"use client";

import { FileText, XCircle, Shield, Clock, type LucideIcon } from "lucide-react";
import { Badge, type BadgeProps } from "@core/ui/badge";
import type { DsrRequestType } from "../../domain/entities/DataSubjectRequest";

// ── Request Type Badge ────────────────────────────────────────────────────────
// Composes the shared Badge rather than hand-rolling a coloured pill: the icon
// renders in currentColor, so it inherits whichever hue the variant carries.

const TYPE_VARIANT: Record<string, BadgeProps["variant"]> = {
  Export: "info",
  Erasure: "error",
  Rectification: "default",
  Restriction: "warning",
};

const TYPE_ICONS: Record<string, LucideIcon> = {
  Export: FileText,
  Erasure: XCircle,
  Rectification: Shield,
  Restriction: Clock,
};

interface DsrTypeCellProps {
  requestType: DsrRequestType;
  label: string;
}

/**
 * Presentation UI component rendering the dsr type cell.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function DsrTypeCell({ requestType, label }: DsrTypeCellProps) {
  const Icon = TYPE_ICONS[requestType];

  return (
    <Badge variant={TYPE_VARIANT[requestType] ?? "secondary"} className="gap-1.5">
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
      {label}
    </Badge>
  );
}
