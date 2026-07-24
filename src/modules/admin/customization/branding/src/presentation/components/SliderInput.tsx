/**
 * SliderInput — Reusable slider using Radix Slider from core/ui
 * Shows label, value display, and the proper Radix track/range/thumb
 */
"use client";

import { Slider } from "@core/ui/slider";

interface SliderInputProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

/**
 * Presentation UI component rendering the slider input.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function SliderInput({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = "px",
  onChange,
}: SliderInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
          {label}
        </label>
        <span className="font-mono text-xs font-medium tabular-nums text-nx-ink">
          {typeof value === "number" ? (Number.isInteger(value) ? value : value.toFixed(1)) : value}
          {unit}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(vals) => onChange(vals[0])}
      />
    </div>
  );
}
