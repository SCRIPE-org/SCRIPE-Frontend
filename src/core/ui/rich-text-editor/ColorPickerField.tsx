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
  /** Blocks the trigger from opening the popover; matches every other
   *  CustomFields control's isViewMode/disabled contract (Input/GenericSelect/
   *  Slider all real-disable, not just visually dim). Additive -- every
   *  existing caller omits this and keeps today's always-interactive
   *  behavior unchanged. */
  disabled?: boolean;
  required?: boolean;
  /**
   * i18n key PREFIX for this control's own three strings (`.swatch`,
   * `.custom`, `.hexPlaceholder` suffixes) -- defaults to `"editorBlocks.color"`,
   * this component's ORIGINAL namespace, so every existing caller
   * (ButtonDesigner.tsx, DesignVariablesPanel.tsx) keeps resolving the exact
   * same keys with no change. Wave 3.3 Batch C (CustomFields' Color value
   * type) reuses this mature, accessible picker (20-swatch grid, real hex
   * entry, the label trap already solved via `aria-labelledby` below rather
   * than `<Label htmlFor>`) rather than duplicating it, but must not leak
   * this file's editor-specific `editorBlocks.color.*` locale keys into a
   * different module's namespace -- CustomFields passes `"customField.color"`
   * here so its own translations live under its own namespace instead.
   */
  i18nKeyPrefix?: string;
}

const DEFAULT_I18N_KEY_PREFIX = "editorBlocks.color";

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
  disabled,
  required,
  i18nKeyPrefix = DEFAULT_I18N_KEY_PREFIX,
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
          {required && (
            <span className="text-destructive ms-1" aria-hidden="true">
              *
            </span>
          )}
        </FormLabel>
        <Popover>
          <PopoverTrigger asChild>
            <FormControl>
              {/* The swatch carries no meaning a screen reader can use, so the
                  name is assembled from the field label plus the hex text. */}
              <button
                type="button"
                disabled={disabled}
                aria-labelledby={`${labelId} ${valueId}`}
                className="flex min-h-9 w-full items-center gap-2 rounded-nx-control border border-nx-line bg-nx-ground px-3 py-2 text-start transition-[color,border-color,background-color,box-shadow] duration-nx-micro ease-nx-enter hover:border-nx-line-hi focus-visible:border-nx-accent focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-nx-line"
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
                  disabled={disabled}
                  aria-label={t(`${i18nKeyPrefix}.swatch`, { color: c })}
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
                aria-label={t(`${i18nKeyPrefix}.custom`)}
                value={customHex.replace("#", "")}
                onChange={(e) => setCustomHex(e.target.value)}
                placeholder={t(`${i18nKeyPrefix}.hexPlaceholder`)}
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
