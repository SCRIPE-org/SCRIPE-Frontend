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

export function FeatureValueBadge({
      value,
      valueType,
      isEffective = false,
}: FeatureValueBadgeProps) {
      if (valueType === "Boolean") {
            const isTrue = value.toLowerCase() === "true";
            return isTrue ? (
                  <CheckCircle className={`h-4 w-4 mx-auto ${isEffective ? "text-green-500" : "text-muted-foreground"}`} />
            ) : (
                  <XCircle className={`h-4 w-4 mx-auto ${isEffective ? "text-red-500" : "text-muted-foreground"}`} />
            );
      }

      return (
            <Badge variant={isEffective ? "default" : "secondary"}>
                  {value}
            </Badge>
      );
}
