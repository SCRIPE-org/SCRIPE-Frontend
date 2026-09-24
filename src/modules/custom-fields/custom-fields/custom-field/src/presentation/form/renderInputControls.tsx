"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@core/common/utils";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Slider } from "@core/ui/slider";
import { PhoneInput } from "@core/ui/phone-input";
import { ColorPickerField } from "@core/ui/rich-text-editor/ColorPickerField";
import { RATING_MIN, RATING_MAX } from "../registries/valueTypeRegistry";
import { isFieldRequired } from "@core/ui/forms/generic-form";
import type { CustomFieldControlProps } from "./renderCustomFieldControlProps";
import { toFieldInputValue } from "./customFieldControlUtils";

/**
 * Input Controls Renderer
 * Handles email, url, tel, slider (rating), time, color, and standard text/number fallthrough.
 */
export function renderInputControls({
  fc,
  value,
  onChange,
  isViewMode,
  invalid,
  describedBy,
  error,
}: CustomFieldControlProps): React.ReactNode {
  const isRequired = isFieldRequired(fc);

  if (fc.type === "email") {
    return (
      <div key={fc.name} className="space-y-2">
        <Label htmlFor={fc.name} className="text-sm font-medium">
          {fc.label ?? fc.name}
          {isRequired && (
            <span className="text-destructive ms-1" aria-hidden="true">
              *
            </span>
          )}
        </Label>
        <Input
          id={fc.name}
          type="email"
          value={toFieldInputValue(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={fc.placeholder}
          required={isRequired}
          disabled={isViewMode}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid && describedBy ? describedBy : undefined}
          className={cn("text-sm", invalid && "border-destructive focus-visible:ring-destructive")}
        />
        {invalid && error && (
          <p id={describedBy} className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }

  if (fc.type === "url") {
    return (
      <div key={fc.name} className="space-y-2">
        <Label htmlFor={fc.name} className="text-sm font-medium">
          {fc.label ?? fc.name}
          {isRequired && (
            <span className="text-destructive ms-1" aria-hidden="true">
              *
            </span>
          )}
        </Label>
        <Input
          id={fc.name}
          type="url"
          value={toFieldInputValue(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={fc.placeholder}
          required={isRequired}
          disabled={isViewMode}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid && describedBy ? describedBy : undefined}
          className={cn("text-sm", invalid && "border-destructive focus-visible:ring-destructive")}
        />
        {invalid && error && (
          <p id={describedBy} className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }

  if (fc.type === "tel") {
    return (
      <div key={fc.name} className="space-y-2">
        <Label htmlFor={fc.name} className="text-sm font-medium">
          {fc.label ?? fc.name}
          {isRequired && (
            <span className="text-destructive ms-1" aria-hidden="true">
              *
            </span>
          )}
        </Label>
        <PhoneInput
          id={fc.name}
          value={toFieldInputValue(value)}
          onChange={(v) => onChange(v)}
          disabled={isViewMode}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid && describedBy ? describedBy : undefined}
          className={cn(invalid && "border-destructive focus-visible:ring-destructive")}
        />
        {invalid && error && (
          <p id={describedBy} className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }

  if (fc.type === "slider") {
    const numericValue =
      typeof value === "number" && Number.isFinite(value) ? value : RATING_MIN;
    return (
      <div key={fc.name} className="space-y-2">
        <Label htmlFor={fc.name} className="text-sm font-medium">
          {fc.label}
          {isRequired && (
            <span className="text-destructive ms-1" aria-hidden="true">
              *
            </span>
          )}
        </Label>
        <Slider
          id={fc.name}
          aria-label={fc.label ?? fc.name}
          value={[numericValue]}
          onValueChange={(v) => onChange(v[0])}
          min={RATING_MIN}
          max={RATING_MAX}
          step={1}
          disabled={isViewMode}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid && describedBy ? describedBy : undefined}
          className="w-full"
        />
        <div className="flex items-baseline justify-between text-xs text-nx-ink-3">
          <span>{fc.label}</span>
          <span className="font-medium tabular-nums text-nx-ink-2">
            {numericValue} / {RATING_MAX}
          </span>
        </div>
        {invalid && error && (
          <p id={describedBy} className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }

  if (fc.type === "time") {
    return (
      <div key={fc.name} className="space-y-2">
        <Label htmlFor={fc.name} className="text-sm font-medium">
          {fc.label ?? fc.name}
          {isRequired && (
            <span className="text-destructive ms-1" aria-hidden="true">
              *
            </span>
          )}
        </Label>
        <Input
          id={fc.name}
          type="time"
          step={1}
          value={toFieldInputValue(value)}
          onChange={(e) => onChange(e.target.value)}
          required={isRequired}
          disabled={isViewMode}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid && describedBy ? describedBy : undefined}
          className={cn("text-sm", invalid && "border-destructive focus-visible:ring-destructive")}
        />
        {invalid && error && (
          <p id={describedBy} className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }

  if (fc.type === "color") {
    return (
      <div key={fc.name} className="space-y-2">
        <ColorPickerField
          label={fc.label ?? fc.name}
          value={typeof value === "string" && value ? value : "#000000"}
          onChange={(color) => onChange(color)}
          disabled={isViewMode}
          required={isRequired}
          i18nKeyPrefix="customField.color"
        />
        {invalid && error && (
          <p id={describedBy} className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div key={fc.name} className="space-y-2">
      <Label htmlFor={fc.name} className="text-sm font-medium">
        {fc.label}
        {isRequired && (
          <span className="text-destructive ms-1" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      <Input
        id={fc.name}
        type={fc.type === "number" ? "number" : "text"}
        value={toFieldInputValue(value)}
        onChange={(e) => onChange(e.target.value)}
        placeholder={fc.placeholder}
        required={isRequired}
        disabled={isViewMode}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid && describedBy ? describedBy : undefined}
        className={cn("text-sm", invalid && "border-destructive focus-visible:ring-destructive")}
      />
      {invalid && error && (
        <p id={describedBy} className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

