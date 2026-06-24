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
 * React presentation component representing the slider input UI element.
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
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
        <span className="font-mono text-xs font-medium tabular-nums text-foreground">
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
