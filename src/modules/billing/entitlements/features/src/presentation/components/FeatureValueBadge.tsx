/**
 * FeatureValueBadge — Displays a feature value as a typed badge.
 *
 * Boolean values render as check/x icons; others as text badges.
 */
"use client";

import { Badge } from "@core/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

interface FeatureValueBadgeProps {
  value: string;
  valueType: string;
  isEffective?: boolean;
}

/**
 * Presentation UI component rendering the feature value badge.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function FeatureValueBadge({
  value,
  valueType,
  isEffective = false,
}: FeatureValueBadgeProps) {
  if (valueType === "Boolean") {
    const isTrue = value.toLowerCase() === "true";
    return isTrue ? (
      <CheckCircle
        className={`mx-auto h-4 w-4 ${isEffective ? "text-success" : "text-muted-foreground"}`}
      />
    ) : (
      <XCircle
        className={`mx-auto h-4 w-4 ${isEffective ? "text-destructive" : "text-muted-foreground"}`}
      />
    );
  }

  return <Badge variant={isEffective ? "default" : "secondary"}>{value}</Badge>;
}
