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

// ─── Default Brand Presets ──────────────────────────────────
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
            className="flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left transition-colors hover:bg-accent/50"
          >
            <span
              className="h-5 w-5 shrink-0 rounded-sm border border-border"
              style={{ backgroundColor: value }}
            />
            <span className="font-mono text-sm text-muted-foreground">{value}</span>
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
                    "h-5 w-5 rounded-sm border transition-transform hover:scale-125",
                    value === c
                      ? "border-primary ring-2 ring-primary ring-offset-1"
                      : "border-border"
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => onChange(c)}
                  title={c}
                />
              ))}
            </div>

            {/* Custom Hex */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">#</span>
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
                  className="h-5 w-5 shrink-0 rounded-sm border border-border"
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
