/**
 * FeatureValueCell — Renders a single feature value based on its type.
 *
 * - Boolean: ✓/✗ icon via BooleanIndicator
 * - Numeric: number (∞ for -1, ✗ for 0)
 * - String: text or dash
 */
import { X, Infinity } from "lucide-react";
import { BooleanIndicator } from "./BooleanIndicator";
import type { EditionFeatureDto } from "../../../domain/entities/Edition";

interface FeatureValueCellProps {
  feature: EditionFeatureDto | undefined;
}

/**
 * React presentation component representing the feature value cell UI element.
 */
export function FeatureValueCell({ feature }: FeatureValueCellProps) {
  if (!feature) return <X className="h-4 w-4 text-muted-foreground/40" />;

  const { value, valueType } = feature;

  if (valueType === "Boolean") {
    return <BooleanIndicator value={value === "true"} />;
  }

  if (valueType === "Numeric") {
    const num = Number(value);
    if (num === -1) return <Infinity className="h-4 w-4 text-primary" />;
    if (num === 0) return <X className="h-4 w-4 text-muted-foreground/40" />;
    return <span className="text-sm font-semibold tabular-nums">{num.toLocaleString()}</span>;
  }

  return <span className="text-sm">{value || "—"}</span>;
}
