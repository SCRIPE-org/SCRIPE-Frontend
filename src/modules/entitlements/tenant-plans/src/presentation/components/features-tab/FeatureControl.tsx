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
}

export function FeatureControl({ valueType, value, onChange }: FeatureControlProps) {
  if (valueType === "Boolean") {
    return (
      <Switch
        checked={value === "true"}
        onCheckedChange={(checked) => onChange(checked ? "true" : "false")}
      />
    );
  }

  if (valueType === "Numeric") {
    return (
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-24 text-right"
        min={-1}
        placeholder="0"
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
    />
  );
}
