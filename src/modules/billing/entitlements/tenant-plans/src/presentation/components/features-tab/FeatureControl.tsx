/**
 * FeatureControl — Renders the appropriate input based on valueType.
 *
 * Boolean → Switch
 * Numeric → Number Input
 * String → Text Input
 */
"use client";

import { Switch } from "@core/ui/switch";
import { Input } from "@core/ui/input";

interface FeatureControlProps {
  valueType: string;
  value: string;
  onChange: (value: string) => void;
  /** Links the control to its row's visible name for assistive tech. */
  labelledBy?: string;
}

/**
 * Presentation UI component rendering the feature control.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function FeatureControl({ valueType, value, onChange, labelledBy }: FeatureControlProps) {
  if (valueType === "Boolean") {
    return (
      <Switch
        checked={value === "true"}
        onCheckedChange={(checked) => onChange(checked ? "true" : "false")}
        aria-labelledby={labelledBy}
      />
    );
  }

  if (valueType === "Numeric") {
    return (
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-24 text-end"
        min={-1}
        placeholder="0"
        aria-labelledby={labelledBy}
      />
    );
  }

  // String / fallback
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 w-40"
      placeholder="..."
      aria-labelledby={labelledBy}
    />
  );
}
