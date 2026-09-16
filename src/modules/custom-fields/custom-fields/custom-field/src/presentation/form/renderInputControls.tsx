"use client";

import React from "react";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Slider } from "@core/ui/slider";
import { PhoneInput } from "@core/ui/phone-input";
import { ColorPickerField } from "@core/ui/rich-text-editor/ColorPickerField";
import { RATING_MIN, RATING_MAX } from "../registries/valueTypeRegistry";
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
}: CustomFieldControlProps): React.ReactNode {
  if (fc.type === "email") {
    return (
      <div key={fc.name} className="space-y-2">
        <Label htmlFor={fc.name} className="text-sm font-medium">
          {fc.label ?? fc.name}
        </Label>
        <Input
          id={fc.name}
          type="email"
          value={toFieldInputValue(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={fc.placeholder}
          required={fc.required}
          disabled={isViewMode}
          className="text-sm"
        />
      </div>
    );
  }

  if (fc.type === "url") {
    return (
      <div key={fc.name} className="space-y-2">
        <Label htmlFor={fc.name} className="text-sm font-medium">
          {fc.label ?? fc.name}
        </Label>
        <Input
          id={fc.name}
          type="url"
          value={toFieldInputValue(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={fc.placeholder}
          required={fc.required}
          disabled={isViewMode}
          className="text-sm"
        />
      </div>
    );
  }

  if (fc.type === "tel") {
    return (
      <div key={fc.name} className="space-y-2">
        <Label htmlFor={fc.name} className="text-sm font-medium">
          {fc.label ?? fc.name}
        </Label>
        <PhoneInput
          id={fc.name}
          value={toFieldInputValue(value)}
          onChange={(v) => onChange(v)}
          disabled={isViewMode}
        />
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
          className="w-full"
        />
        <div className="flex items-baseline justify-between text-xs text-nx-ink-3">
          <span>{fc.label}</span>
          <span className="font-medium tabular-nums text-nx-ink-2">
            {numericValue} / {RATING_MAX}
          </span>
        </div>
      </div>
    );
  }

  if (fc.type === "time") {
    return (
      <div key={fc.name} className="space-y-2">
        <Label htmlFor={fc.name} className="text-sm font-medium">
          {fc.label ?? fc.name}
        </Label>
        <Input
          id={fc.name}
          type="time"
          step={1}
          value={toFieldInputValue(value)}
          onChange={(e) => onChange(e.target.value)}
          required={fc.required}
          disabled={isViewMode}
          className="text-sm"
        />
      </div>
    );
  }

  if (fc.type === "color") {
    return (
      <ColorPickerField
        key={fc.name}
        label={fc.label ?? fc.name}
        value={typeof value === "string" && value ? value : "#000000"}
        onChange={(color) => onChange(color)}
        disabled={isViewMode}
        i18nKeyPrefix="customField.color"
      />
    );
  }

  return (
    <div key={fc.name} className="space-y-2">
      <Label htmlFor={fc.name} className="text-sm font-medium">
        {fc.label}
      </Label>
      <Input
        id={fc.name}
        type={fc.type === "number" ? "number" : "text"}
        value={toFieldInputValue(value)}
        onChange={(e) => onChange(e.target.value)}
        placeholder={fc.placeholder}
        required={fc.required}
        disabled={isViewMode}
        className="text-sm"
      />
    </div>
  );
}
