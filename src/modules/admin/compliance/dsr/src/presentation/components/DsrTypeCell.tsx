"use client";

import { FileText, XCircle, Shield, Clock } from "lucide-react";
import type { DsrRequestType } from "../../domain/entities/DataSubjectRequest";

// ── Request Type Badge ────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  Export: "bg-info/10 text-info border-info/20",
  Erasure: "bg-destructive/10 text-destructive border-destructive/20",
  Rectification: "bg-primary/10 text-primary border-primary/20",
  Restriction: "bg-warning/10 text-warning border-warning/20",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Export: <FileText className="h-3.5 w-3.5" />,
  Erasure: <XCircle className="h-3.5 w-3.5" />,
  Rectification: <Shield className="h-3.5 w-3.5" />,
  Restriction: <Clock className="h-3.5 w-3.5" />,
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
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${TYPE_COLORS[requestType] ?? ""}`}
    >
      {TYPE_ICONS[requestType]}
      {label}
    </span>
  );
}
