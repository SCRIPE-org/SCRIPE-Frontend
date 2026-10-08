"use client";

import React from "react";
import { cn } from "@core/common/utils";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Switch } from "@core/ui/switch";
import { Badge } from "@core/ui/badge";
import { Textarea } from "@core/ui/textarea";
import { DatePicker } from "@core/ui/date-picker";
import { PhoneInput } from "@core/ui/phone-input";
import { GenericSelect } from "@core/crud/components/generic-select";
import { Lock, AlertCircle } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { SetupCustomField } from "../../domain/entities";

/**
 * Documentation for module export
 */
export interface DynamicCustomFieldProps {
  field: SetupCustomField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  invalid?: boolean;
}

/**
 * Dynamic Custom Field Input Control with Type Rendering & Searchable Options.
 */
export function DynamicCustomField({
  field,
  value,
  onChange,
  error,
  invalid,
}: DynamicCustomFieldProps) {
  const { direction, t } = useI18n();
  const isAr = direction === "rtl";
  const label = field.label(isAr);
  const placeholder = field.placeholder(isAr);
  const errCls = invalid ? "border-destructive focus-visible:ring-destructive" : "";

  const renderControl = () => {
    if (field.isBoolean) {
      return (
        <div className={cn("flex items-center justify-between rounded-lg border border-border bg-card/40 p-3", invalid && "border-destructive/60")}>
          <span className="text-sm font-medium text-foreground">{label}</span>
          <Switch id={field.key} checked={Boolean(value)} onCheckedChange={onChange} aria-invalid={invalid || undefined} />
        </div>
      );
    }
    if (field.isSelect) {
      return (
        <GenericSelect
          id={field.key}
          aria-label={label}
          options={field.getOptions(isAr)}
          value={value !== undefined && value !== null ? String(value) : ""}
          onValueChange={(val: string | string[]) => onChange(Array.isArray(val) ? val[0] : val)}
          placeholder={placeholder || t("components.select.placeholder")}
          type="searchable"
          searchable={true}
          required={field.isRequired}
          aria-invalid={invalid || undefined}
          className={errCls}
        />
      );
    }
    if (field.isMultiSelect) {
      const multiVal = Array.isArray(value) ? value : value ? [String(value)] : [];
      return (
        <GenericSelect
          id={field.key}
          aria-label={label}
          options={field.getOptions(isAr)}
          value={multiVal}
          onValueChange={(val: string | string[]) => onChange(Array.isArray(val) ? val : [val])}
          placeholder={placeholder || t("components.multiSelect.placeholder")}
          type="multi"
          searchable={true}
          required={field.isRequired}
          aria-invalid={invalid || undefined}
          className={errCls}
        />
      );
    }
    if (field.isDate) {
      return (
        <DatePicker
          id={field.key}
          type="date"
          value={typeof value === "string" ? value.split("T")[0] : ""}
          onChange={(v) => onChange(v)}
          placeholder={placeholder || label}
          required={field.isRequired}
          aria-invalid={invalid || undefined}
          className={errCls}
        />
      );
    }
    if (field.isDateTime) {
      return (
        <DatePicker
          id={field.key}
          type="datetime-local"
          value={typeof value === "string" ? value : ""}
          onChange={(v) => onChange(v)}
          placeholder={placeholder || label}
          required={field.isRequired}
          aria-invalid={invalid || undefined}
          className={errCls}
        />
      );
    }
    if (field.isTextarea) {
      return (
        <Textarea
          id={field.key}
          value={value !== undefined && value !== null ? String(value) : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || ""}
          rows={3}
          aria-invalid={invalid || undefined}
          className={errCls}
        />
      );
    }
    if (field.isPhone) {
      return <PhoneInput value={typeof value === "string" ? value : ""} onChange={(v) => onChange(v)} defaultCountry="SA" />;
    }
    if (field.isNumber) {
      return (
        <Input
          id={field.key}
          type="number"
          value={value !== undefined && value !== null ? String(value) : ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          placeholder={placeholder || ""}
          aria-invalid={invalid || undefined}
          className={errCls}
        />
      );
    }
    if (field.isEmail || field.isUrl) {
      return (
        <Input
          id={field.key}
          type={field.isEmail ? "email" : "url"}
          value={value !== undefined && value !== null ? String(value) : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || (field.isUrl ? "https://..." : "")}
          aria-invalid={invalid || undefined}
          className={errCls}
        />
      );
    }
    return (
      <Input
        id={field.key}
        type="text"
        value={value !== undefined && value !== null ? String(value) : ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || ""}
        aria-invalid={invalid || undefined}
        className={errCls}
      />
    );
  };

  return (
    <div className={cn("space-y-1.5", field.isTextarea && "sm:col-span-2")}>
      {!field.isBoolean && (
        <div className="flex items-center justify-between">
          <Label htmlFor={field.key} className="flex items-center gap-1 text-xs font-medium">
            <span>{label}</span>
            {field.isRequired && <span className="text-destructive">*</span>}
          </Label>
          {field.isSensitive && (
            <Badge variant="secondary" className="gap-1 border border-border bg-muted/40 px-1.5 py-0 text-[10px] text-muted-foreground font-normal">
              <Lock className="h-2.5 w-2.5" />
              <span>Encrypted</span>
            </Badge>
          )}
        </div>
      )}
      {renderControl()}
      {invalid && error && (
        <p className="flex items-center gap-1 text-xs text-destructive mt-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
