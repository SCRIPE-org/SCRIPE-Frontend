"use client";

import React from "react";
import { Badge } from "@core/ui/badge";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
} from "lucide-react";

/**
 * Props for JobStatusBadge component.
 */
export interface JobStatusBadgeProps {
  status: string;
  label: string;
}

/**
 * Renders an execution status badge with appropriate semantic token styling.
 */
export function JobStatusBadge({ status, label }: JobStatusBadgeProps): React.ReactElement {
  switch (status) {
    case "Running":
      return (
        <Badge variant="info" data-status={status} className="gap-1 font-mono text-xs">
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          {label}
        </Badge>
      );
    case "Queued":
      return (
        <Badge variant="pending" data-status={status} className="gap-1 font-mono text-xs">
          <Clock className="h-3 w-3" aria-hidden="true" />
          {label}
        </Badge>
      );
    case "Pending":
      return (
        <Badge variant="warning" data-status={status} className="gap-1 font-mono text-xs">
          <Clock className="h-3 w-3" aria-hidden="true" />
          {label}
        </Badge>
      );
    case "Completed":
      return (
        <Badge variant="success" data-status={status} className="gap-1 font-mono text-xs">
          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
          {label}
        </Badge>
      );
    case "CompletedWithErrors":
      return (
        <Badge variant="warning" data-status={status} className="gap-1 font-mono text-xs">
          <AlertTriangle className="h-3 w-3" aria-hidden="true" />
          {label}
        </Badge>
      );
    case "Failed":
      return (
        <Badge variant="danger" data-status={status} className="gap-1 font-mono text-xs">
          <XCircle className="h-3 w-3" aria-hidden="true" />
          {label}
        </Badge>
      );
    case "Cancelled":
    case "Expired":
    default:
      return (
        <Badge variant="secondary" data-status={status} className="gap-1 font-mono text-xs">
          <Ban className="h-3 w-3" aria-hidden="true" />
          {label}
        </Badge>
      );
  }
}
