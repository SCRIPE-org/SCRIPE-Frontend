"use client";

import React, { useState } from "react";
import { cn } from "@core/common/utils";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";

// ─── Types ──────────────────────────────────────────────────
export interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  presets?: string[];
  className?: string;
}

// ─── Default Content-Color Presets ──────────────────────────
// COLOUR EXCEPTION — this palette is deliberately literal hex. It is not the
// app's own chrome: it is a general-purpose picker for colors the user
// applies to THEIR content (button fills, text colors inside an authored
// email/template). --nx- tokens encode this app's one workspace hue; they
// have no meaning as "a red, a teal, a slate" swatch set for someone else's
// design. Do not remap these to --nx- tokens.
const DEFAULT_PRESETS = [
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#1e293b",
  "#334155",
  "#64748b",
  "#94a3b8",
  "#f1f5f9",
  "#f8fafc",
  "#ffffff",
  "#000000",
];

// ─── Main Component ─────────────────────────────────────────
export function ColorPickerField({
  label,
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  className,
}: ColorPickerFieldProps) {
  const [customHex, setCustomHex] = useState("");

  const handleCustomApply = () => {
    const hex = customHex.startsWith("#") ? customHex : `#${customHex}`;
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex)) {
      onChange(hex);
      setCustomHex("");
    }
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex min-h-9 w-full items-center gap-2 rounded-nx-control border border-nx-line px-3 py-2 text-left transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:border-nx-line-hi hover:bg-nx-hover focus-visible:outline-none focus-visible:border-nx-accent focus-visible:shadow-nx-focus"
          >
            <span
              className="h-5 w-5 shrink-0 rounded-nx-sm border border-nx-line"
              style={{ backgroundColor: value }}
            />
            <span className="font-mono text-sm text-nx-ink-2">{value}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3" align="start">
          <div className="space-y-3">
            {/* Preset Grid */}
            <div className="grid grid-cols-10 gap-1">
              {presets.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={cn(
                    "h-5 w-5 rounded-nx-sm border transition-transform duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:scale-125 active:scale-100",
                    value === c
                      ? "border-nx-accent ring-2 ring-[var(--nx-accent)] ring-offset-1 ring-offset-[var(--nx-popover)]"
                      : "border-nx-line"
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => onChange(c)}
                  title={c}
                />
              ))}
            </div>

            {/* Custom Hex */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-nx-ink-3">#</span>
              <Input
                value={customHex.replace("#", "")}
                onChange={(e) => setCustomHex(e.target.value)}
                placeholder="3b82f6"
                className="h-7 flex-1 font-mono text-xs"
                maxLength={7}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCustomApply();
                  }
                }}
              />
              {customHex && (
                <span
                  className="h-5 w-5 shrink-0 rounded-nx-sm border border-nx-line"
                  style={{
                    backgroundColor: customHex.startsWith("#") ? customHex : `#${customHex}`,
                  }}
                />
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default ColorPickerField;
