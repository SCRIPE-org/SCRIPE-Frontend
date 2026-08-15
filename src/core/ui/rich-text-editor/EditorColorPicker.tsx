"use client";

import React, { useId, useState } from "react";
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Separator } from "@core/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { useI18n } from "@core/providers/i18n-provider";

// ─── Types ──────────────────────────────────────────────────
/**
 * One offered colour. `value` is a CSS colour EXPRESSION over the design
 * tokens — a var() read of the ink ladder, or a resolved global chart slot —
 * never a literal, so the palette follows the theme instead of freezing one
 * theme's rendering into the document. `labelKey` is what a screen reader
 * hears: a 20px square with no text is otherwise announced as "button" sixteen
 * times in a row.
 */
export interface EditorSwatch {
  value: string;
  labelKey: string;
}

export interface EditorColorPickerProps {
  swatches: readonly EditorSwatch[];
  currentColor?: string;
  onSelect: (color: string) => void;
  icon: React.ReactNode;
  /** Already localized: names the trigger and titles the panel. */
  label: string;
}

// ─── Component ──────────────────────────────────────────────
export function EditorColorPicker({
  swatches,
  currentColor,
  onSelect,
  icon,
  label,
}: EditorColorPickerProps) {
  const { t } = useI18n();
  const [custom, setCustom] = useState("");
  const customId = useId();

  return (
    <Popover>
      {/* Tooltip OUTSIDE, Popover trigger INSIDE: both primitives render through
          Slot, so the button is the tooltip's anchor and the popover's trigger
          at once — and it keeps the hover hint the removed `title` used to
          give, which aria-label alone does not show to a sighted user. */}
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="relative h-8 w-8 p-0"
                aria-label={label}
              >
                {icon}
                {currentColor && (
                  // The current-colour underline. Centred with inset-x-0 + mx-auto
                  // rather than a physical half-offset plus a transform, so it
                  // does not need a direction to be correct.
                  <span
                    className="absolute inset-x-0 bottom-0.5 mx-auto h-1 w-4 rounded-full"
                    style={{ backgroundColor: currentColor }}
                    aria-hidden="true"
                  />
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">{label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent className="w-56 p-3" align="start" aria-label={label}>
        <div className="mb-2 grid grid-cols-8 gap-1">
          {swatches.map((swatch) => {
            const selected = currentColor === swatch.value;
            return (
              <button
                key={swatch.value}
                type="button"
                className={cn(
                  "h-5 w-5 rounded-nx-sm border",
                  "transition-[border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                  "focus-visible:shadow-nx-focus focus-visible:outline-none",
                  // A swatch is a reading of a colour; it does not lift or grow
                  // on hover. The hairline steps up instead — the same answer
                  // every other surface in the system gives.
                  selected
                    ? "border-nx-accent ring-2 ring-nx-accent ring-offset-1 ring-offset-nx-popover"
                    : "border-nx-line hover:border-nx-line-hi"
                )}
                style={{ backgroundColor: swatch.value }}
                onClick={() => onSelect(swatch.value)}
                aria-label={t(swatch.labelKey)}
                aria-pressed={selected}
              />
            );
          })}
        </div>
        <Separator className="my-2" />
        <div className="space-y-1.5">
          <Label htmlFor={customId} className="text-xs">
            {t("editor.toolbar.color.custom")}
          </Label>
          <div className="flex items-center gap-1.5">
            <Input
              id={customId}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder={t("editor.toolbar.color.customPlaceholder")}
              className="h-7 font-mono text-xs"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() => {
                if (custom.startsWith("#") && custom.length >= 4) {
                  onSelect(custom);
                }
              }}
            >
              {t("editor.toolbar.color.apply")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
