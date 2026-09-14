"use client";

import React from "react";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Textarea } from "@core/ui/textarea";
import { cn } from "@core/common/utils";
import { AlertTriangle } from "lucide-react";
import type { SettingsFieldProps } from "./dynamicSettingsTypes";

/**
 * Renders an individual form input control based on a dynamic JSON schema field definition.
 * Supports string inputs, textarea blocks, numeric bounds, boolean toggles, and select options.
 *
 * @param props The settings field presentation and change handling properties.
 * @returns An accessible, styled field control matching the platform design tokens.
 */
export function SettingsField({
  field,
  value,
  error,
  onChange,
  selectPlaceholder,
}: SettingsFieldProps): React.JSX.Element {
  const id = `settings-field-${field.key}`;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label (hidden for boolean switches as they render an inline label) */}
      {field.type !== "boolean" && (
        <Label htmlFor={id} className={cn("text-sm font-medium", error && "text-destructive")}>
          {field.label}
          {field.required && <span className="ms-0.5 text-destructive">*</span>}
        </Label>
      )}

      {/* Text input control */}
      {field.type === "string" && (
        <Input
          id={id}
          value={String(value)}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder={field.description}
          aria-invalid={!!error}
        />
      )}

      {/* Multiline textarea control */}
      {field.type === "textarea" && (
        <Textarea
          id={id}
          value={String(value)}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder={field.description}
          rows={4}
          aria-invalid={!!error}
          className="resize-y"
        />
      )}

      {/* Numeric bounded input control */}
      {field.type === "number" && (
        <Input
          id={id}
          type="number"
          value={Number(value)}
          min={field.min}
          max={field.max}
          onChange={(e) => onChange(field.key, Number(e.target.value))}
          aria-invalid={!!error}
        />
      )}

      {/* Boolean switch toggle */}
      {field.type === "boolean" && (
        <div className="flex items-center justify-between rounded-nx-md border border-nx-line p-3">
          <div>
            <Label htmlFor={id} className="cursor-pointer text-sm font-medium">
              {field.label}
            </Label>
            {field.description && <p className="text-xs text-nx-ink-3">{field.description}</p>}
          </div>
          <Switch
            id={id}
            checked={Boolean(value)}
            onCheckedChange={(checked) => onChange(field.key, checked)}
          />
        </div>
      )}

      {/* Selection dropdown */}
      {field.type === "select" && (
        <Select value={String(value)} onValueChange={(v) => onChange(field.key, v)}>
          <SelectTrigger id={id} aria-invalid={!!error}>
            <SelectValue placeholder={selectPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Auxiliary field description */}
      {field.type !== "boolean" && field.description && (
        <p className="text-xs leading-relaxed text-nx-ink-3">{field.description}</p>
      )}

      {/* Validation feedback message */}
      {error && (
        <p className="flex items-center gap-1 text-xs font-medium leading-relaxed text-destructive">
          <AlertTriangle className="size-3 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
