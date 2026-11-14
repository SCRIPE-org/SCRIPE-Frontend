"use client";

import React from "react";
import { Badge } from "@core/ui/badge";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  Loader2,
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
        <Badge variant="info" className="gap-1 font-mono text-xs">
          <Loader2 className="h-3 w-3 animate-spin" />
          {label}
        </Badge>
      );
    case "Pending":
      return (
        <Badge variant="warning" className="gap-1 font-mono text-xs">
          <Clock className="h-3 w-3" />
          {label}
        </Badge>
      );
    case "Completed":
      return (
        <Badge variant="success" className="gap-1 font-mono text-xs">
          <CheckCircle2 className="h-3 w-3" />
          {label}
        </Badge>
      );
    case "Failed":
      return (
        <Badge variant="destructive" className="gap-1 font-mono text-xs">
          <AlertTriangle className="h-3 w-3" />
          {label}
        </Badge>
      );
    case "Cancelled":
    case "Expired":
    default:
      return (
        <Badge variant="secondary" className="gap-1 font-mono text-xs">
          <Ban className="h-3 w-3" />
          {label}
        </Badge>
      );
  }
}
