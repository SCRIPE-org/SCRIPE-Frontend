"use client";

import React, { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { cn } from "@core/common/utils";
import { Input } from "@core/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@core/ui/form";
import { useI18n } from "@core/providers/i18n-provider";

// ─── Types ──────────────────────────────────────────────────
export interface ColorPickerFieldProps {
  /** Already-translated field name. */
  label: string;
  value: string;
  onChange: (color: string) => void;
  presets?: string[];
  /** Already-translated hint, rendered below the control. */
  description?: string;
  className?: string;
}

// ─── Default Content-Color Presets ──────────────────────────
// COLOUR EXCEPTION — this palette is deliberately literal hex. It is not the
// app's own chrome: it is a general-purpose picker for colors the user applies
// to THEIR content (button fills, text colors inside an authored email or
// template), and the chosen value is persisted verbatim into that content and
// later rendered by a third-party mail client. --nx- tokens encode this app's
// one workspace hue and resolve differently per theme, so they have no meaning
// as "a red, a teal, a slate" swatch set for someone else's design and would
// not survive the export. Do not remap these to --nx- tokens.
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
  description,
  className,
}: ColorPickerFieldProps) {
  const { t } = useI18n();
  const [customHex, setCustomHex] = useState("");

  // react-hook-form is hosted here ONLY as the field-anatomy context: FormItem,
  // FormLabel and FormControl read their generated id, aria-describedby and
  // aria-invalid out of it, which is what binds the label to the trigger and
  // the hint to both. No field is registered, because the value is owned by
  // the caller through the value/onChange contract — and hosting the provider
  // locally is what lets this control be dropped into a panel that has no form
  // of its own without crashing on a missing context.
  const fieldAnatomy = useForm();

  const labelId = useId();
  const valueId = useId();

  const handleCustomApply = () => {
    const hex = customHex.startsWith("#") ? customHex : `#${customHex}`;
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex)) {
      onChange(hex);
      setCustomHex("");
    }
  };

  return (
    <Form {...fieldAnatomy}>
      <FormItem className={className}>
        <FormLabel id={labelId} className="text-xs font-medium">
          {label}
        </FormLabel>
        <Popover>
          <PopoverTrigger asChild>
            <FormControl>
              {/* The swatch carries no meaning a screen reader can use, so the
                  name is assembled from the field label plus the hex text. */}
              <button
                type="button"
                aria-labelledby={`${labelId} ${valueId}`}
                className="flex min-h-9 w-full items-center gap-2 rounded-nx-control border border-nx-line bg-nx-ground px-3 py-2 text-start transition-[color,border-color,background-color,box-shadow] duration-nx-micro ease-nx-enter hover:border-nx-line-hi focus-visible:border-nx-accent focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
              >
                <span
                  className="h-5 w-5 shrink-0 rounded-nx-sm border border-nx-line"
                  style={{ backgroundColor: value }}
                  aria-hidden="true"
                />
                <span id={valueId} className="font-mono text-sm text-nx-ink-2">
                  {value}
                </span>
              </button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className="w-56 space-y-3" align="start">
            {/* Preset Grid — five per row keeps every swatch a real hit target
                inside a 224px panel; ten per row shrank them below 20px. */}
            <div className="grid grid-cols-5 gap-1.5">
              {presets.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={t("editorBlocks.color.swatch", { color: c })}
                  aria-pressed={value === c}
                  className={cn(
                    "h-7 w-full rounded-nx-sm border transition-[border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                    "focus-visible:shadow-nx-focus focus-visible:outline-none",
                    // Selection is the lit edge closing around the swatch — a
                    // hover that scaled the chip moved the whole grid under the
                    // pointer and made the next target land somewhere else.
                    value === c
                      ? "border-nx-accent shadow-[inset_0_0_0_1px_var(--nx-accent)]"
                      : "border-nx-line hover:border-nx-line-hi"
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => onChange(c)}
                />
              ))}
            </div>

            {/* Custom Hex */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-nx-ink-3" aria-hidden="true">
                #
              </span>
              <Input
                aria-label={t("editorBlocks.color.custom")}
                value={customHex.replace("#", "")}
                onChange={(e) => setCustomHex(e.target.value)}
                placeholder={t("editorBlocks.color.hexPlaceholder")}
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
                  aria-hidden="true"
                />
              )}
            </div>
          </PopoverContent>
        </Popover>
        {description ? <FormDescription>{description}</FormDescription> : null}
        <FormMessage />
      </FormItem>
    </Form>
  );
}

export default ColorPickerField;
