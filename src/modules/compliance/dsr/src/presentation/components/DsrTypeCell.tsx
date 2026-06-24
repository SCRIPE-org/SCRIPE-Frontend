"use client";

import { FileText, XCircle, Shield, Clock } from "lucide-react";
import type { DsrRequestType } from "../../domain/entities/DataSubjectRequest";

// ── Request Type Badge ────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  Export: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Erasure: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  Rectification: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  Restriction: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
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
 * React presentation component representing the dsr type cell UI element.
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
