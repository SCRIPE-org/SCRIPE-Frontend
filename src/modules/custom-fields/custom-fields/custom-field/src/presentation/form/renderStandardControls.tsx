"use client";

import React from "react";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { DatePicker } from "@core/ui/date-picker";
import { GenericSelect } from "@core/crud/components/generic-select";
import { MultiSelectCustomFieldControl } from "../controls/MultiSelect/MultiSelectCustomFieldControl";
import { LongTextCustomFieldControl } from "../controls/LongText/LongTextCustomFieldControl";
import { DateTimeCustomFieldControl } from "../controls/DateTime/DateTimeCustomFieldControl";
import { CurrencyCustomFieldControl } from "../controls/Currency/CurrencyCustomFieldControl";
import { DurationCustomFieldControl } from "../controls/Duration/DurationCustomFieldControl";
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
}: CustomFieldControlProps): React.ReactNode | null {
  if (fc.type === "switch") {
    return (
      <div key={fc.name} className="flex items-center justify-between">
        <Label htmlFor={fc.name} className="text-sm font-medium">
          {fc.label}
        </Label>
        <Switch
          id={fc.name}
          checked={Boolean(value)}
          onCheckedChange={(v) => onChange(v)}
          readOnly={isViewMode}
        />
      </div>
    );
  }

  if (fc.type === "date") {
    return (
      <div key={fc.name} className="space-y-2">
        <Label htmlFor={fc.name} className="text-sm font-medium">
          {fc.label}
        </Label>
        <DatePicker
          id={fc.name}
          type="date"
          value={toFieldInputValue(value)}
          onChange={(v) => onChange(v)}
          required={fc.required}
          disabled={isViewMode}
          placeholder={fc.placeholder || fc.label || fc.name}
        />
      </div>
    );
  }

  if (fc.type === "select") {
    return (
      <div key={fc.name} className="space-y-2">
        <Label htmlFor={fc.name} className="text-sm font-medium">
          {fc.label}
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
          type="single"
          required={fc.required}
          disabled={isViewMode}
        />
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
      />
    );
  }

  return null;
}
