/**
 * ColorInput — Reusable color picker with hex text input
 */
"use client";

import { useCallback, useId } from "react";
import { Input } from "@core/ui/input";

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Presentation UI component rendering the color input.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function ColorInput({ label, value, onChange, className = "" }: ColorInputProps) {
  const textFieldId = useId();

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
        <Input
          type="color"
          value={value || "#000000"}
          onChange={handleColorChange}
          aria-label={label}
          className="h-8 w-8 cursor-pointer rounded-nx-control border border-nx-line bg-transparent p-0.5 transition-colors duration-nx-micro ease-nx-enter hover:border-nx-line-hi focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-nx-sm [&::-webkit-color-swatch]:border-0"
        />
      </div>
      <div className="min-w-0 flex-1">
        <label htmlFor={textFieldId} className="mb-0.5 block text-[11px] font-medium text-nx-ink-2">
          {label}
        </label>
        <Input
          id={textFieldId}
          type="text"
          value={value || ""}
          onChange={handleTextChange}
          placeholder="#000000"
          className="h-7 px-2 font-mono text-xs"
        />
      </div>
    </div>
  );
}
