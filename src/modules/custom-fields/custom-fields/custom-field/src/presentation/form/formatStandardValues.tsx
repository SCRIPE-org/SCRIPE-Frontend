"use client";

import React from "react";
import { Badge } from "@core/ui/badge";
import { resolveIntlLocale } from "@core/common/utils";
import { EmptyCustomFieldCell } from "@core/crud/customFieldsExtension";
import { formatInTimeZone, isValidTimeZoneId } from "@core/utils/timezone";
import type {
  CustomFieldDateTimeValue,
  CustomFieldValueTypeName,
} from "../../../../custom-field-value/src/data/models/CustomFieldValueModel";

/**
 * Documentation for string
 */
export type FormatTranslateFn = (key: string, params?: Record<string, string | number>) => string;

/**
 * Formats standard custom field values (Number, Boolean, Date, LongText, Text, Select, MultiSelect, DateTime).
 */
export function formatStandardValues(
  valueType: CustomFieldValueTypeName,
  value: unknown,
  language: string,
  t: FormatTranslateFn
): React.ReactNode | null {
  switch (valueType) {
    case "Number": {
      const num = typeof value === "number" ? value : Number(value);
      return Number.isNaN(num) ? (
        <EmptyCustomFieldCell />
      ) : (
        num.toLocaleString(resolveIntlLocale(language))
      );
    }
    case "Boolean": {
      const bool = Boolean(value);
      return (
        <Badge variant={bool ? "info" : "secondary"}>
          {bool ? t("common.yes") : t("common.no")}
        </Badge>
      );
    }
    case "Date": {
      const match = typeof value === "string" ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null;
      if (!match) {
        return <EmptyCustomFieldCell />;
      }
      const [, y, m, d] = match;
      const date = new Date(Number(y), Number(m) - 1, Number(d));
      return Number.isNaN(date.getTime()) ? (
        <EmptyCustomFieldCell />
      ) : (
        date.toLocaleDateString(resolveIntlLocale(language))
      );
    }
    case "LongText":
    case "Text":
    case "Select":
      return String(value);
    case "MultiSelect": {
      const labels = Array.isArray(value) ? (value as unknown[]) : [];
      if (labels.length === 0) {
        return <EmptyCustomFieldCell />;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {labels.map((label, index) => (
            <Badge key={`${index}-${String(label)}`} variant="secondary">
              {String(label)}
            </Badge>
          ))}
        </div>
      );
    }
    case "DateTime": {
      const dt =
        value && typeof value === "object" ? (value as Partial<CustomFieldDateTimeValue>) : null;
      if (!dt?.value || !dt.timeZoneId || !isValidTimeZoneId(dt.timeZoneId)) {
        return <EmptyCustomFieldCell />;
      }
      try {
        const formatted = formatInTimeZone(dt.value, dt.timeZoneId, {
          dateStyle: "medium",
          timeStyle: "short",
        });
        return `${formatted} · ${dt.timeZoneId}`;
      } catch {
        return <EmptyCustomFieldCell />;
      }
    }
    default:
      return null;
  }
}
