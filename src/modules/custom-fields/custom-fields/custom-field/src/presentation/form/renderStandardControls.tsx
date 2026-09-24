"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@core/common/utils";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { DatePicker } from "@core/ui/date-picker";
import { GenericSelect } from "@core/crud/components/generic-select";
import { MultiSelectCustomFieldControl } from "../controls/MultiSelect/MultiSelectCustomFieldControl";
import { LongTextCustomFieldControl } from "../controls/LongText/LongTextCustomFieldControl";
import { DateTimeCustomFieldControl } from "../controls/DateTime/DateTimeCustomFieldControl";
import { CurrencyCustomFieldControl } from "../controls/Currency/CurrencyCustomFieldControl";
import { DurationCustomFieldControl } from "../controls/Duration/DurationCustomFieldControl";
import { isFieldRequired } from "@core/ui/forms/generic-form";
import type { CustomFieldControlProps } from "./renderCustomFieldControlProps";
import { toFieldInputValue } from "./customFieldControlUtils";

/**
 * Standard Controls Renderer
 * Handles switch, date, select, textarea, multi-select, datetime, currency, and duration.
 */
export function renderStandardControls({
  fc,
  value,
  onChange,
  isViewMode,
  invalid,
  describedBy,
  error,
}: CustomFieldControlProps): React.ReactNode | null {
  const isRequired = isFieldRequired(fc);

  if (fc.type === "switch") {
    return (
      <div key={fc.name} className="space-y-1">
        <div className="flex items-center justify-between">
          <Label htmlFor={fc.name} className="text-sm font-medium">
            {fc.label}
            {isRequired && (
              <span className="text-destructive ms-1" aria-hidden="true">
                *
              </span>
            )}
          </Label>
          <Switch
            id={fc.name}
            checked={Boolean(value)}
            onCheckedChange={(v) => onChange(v)}
            readOnly={isViewMode}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid && describedBy ? describedBy : undefined}
          />
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

  if (fc.type === "date") {
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
        <DatePicker
          id={fc.name}
          type="date"
          value={toFieldInputValue(value)}
          onChange={(v) => onChange(v)}
          required={isRequired}
          disabled={isViewMode}
          placeholder={fc.placeholder || fc.label || fc.name}
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

  if (fc.type === "select") {
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
        <GenericSelect
          id={fc.name}
          aria-label={fc.label ?? fc.name}
          options={fc.options?.map((opt) => ({ value: opt.value, label: opt.label })) ?? []}
          value={toFieldInputValue(value)}
          onValueChange={(v: string | string[]) => {
            onChange(v);
          }}
          placeholder={fc.placeholder || fc.label}
          type="searchable"
          searchable={true}
          required={isRequired}
          disabled={isViewMode}
          aria-invalid={invalid || undefined}
          describedBy={invalid && describedBy ? describedBy : undefined}
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

  if (fc.type === "textarea") {
    return (
      <LongTextCustomFieldControl
        key={fc.name}
        fc={fc}
        value={value}
        onChange={onChange}
        isViewMode={isViewMode}
        invalid={invalid}
        describedBy={describedBy}
        error={error}
      />
    );
  }

  if (fc.type === "multi-select") {
    return (
      <MultiSelectCustomFieldControl
        key={fc.name}
        fc={fc}
        value={value}
        onChange={onChange}
        isViewMode={isViewMode}
        invalid={invalid}
        describedBy={describedBy}
        error={error}
      />
    );
  }

  if (fc.type === "datetime") {
    return (
      <DateTimeCustomFieldControl
        key={fc.name}
        fc={fc}
        value={value}
        onChange={onChange}
        isViewMode={isViewMode}
        invalid={invalid}
        describedBy={describedBy}
        error={error}
      />
    );
  }

  if (fc.type === "currency") {
    return (
      <CurrencyCustomFieldControl
        key={fc.name}
        fc={fc}
        value={value}
        onChange={onChange}
        isViewMode={isViewMode}
        invalid={invalid}
        describedBy={describedBy}
        error={error}
      />
    );
  }

  if (fc.type === "duration") {
    return (
      <DurationCustomFieldControl
        key={fc.name}
        fc={fc}
        value={value}
        onChange={onChange}
        isViewMode={isViewMode}
        invalid={invalid}
        describedBy={describedBy}
        error={error}
      />
    );
  }

  return null;
}

