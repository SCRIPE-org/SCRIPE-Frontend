/**
 * BooleanIndicator — Renders a check or X icon for boolean values.
 *
 * Reusable across comparison table rows for billing controls, trial settings, and features.
 */
import { Check, X } from "lucide-react";

interface BooleanIndicatorProps {
  value: boolean;
}

/**
 * React presentation component representing the boolean indicator UI element.
 */
export function BooleanIndicator({ value }: BooleanIndicatorProps) {
  return value ? (
    <Check className="h-4 w-4 text-emerald-500" />
  ) : (
    <X className="h-4 w-4 text-muted-foreground/40" />
  );
}
