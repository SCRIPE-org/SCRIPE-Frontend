// UI-EXCEPTION: compact studio layout
/**
 * ColorInput — Reusable color picker with hex text input
 */
"use client";

import { useCallback } from "react";

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * React presentation component representing the color input UI element.
 */
export function ColorInput({ label, value, onChange, className = "" }: ColorInputProps) {
  const handleColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let v = e.target.value;
      if (!v.startsWith("#")) v = "#" + v;
      if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
    },
    [onChange]
  );

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <input
          type="color"
          value={value || "#000000"}
          onChange={handleColorChange}
          className="h-8 w-8 cursor-pointer rounded-md border border-border bg-transparent p-0.5 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-0"
        />
      </div>
      <div className="min-w-0 flex-1">
        <label className="mb-0.5 block text-[11px] font-medium text-muted-foreground">
          {label}
        </label>
        <input
          type="text"
          value={value || ""}
          onChange={handleTextChange}
          placeholder="#000000"
          className="h-7 w-full rounded-md border border-border bg-background px-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
        />
      </div>
    </div>
  );
}
