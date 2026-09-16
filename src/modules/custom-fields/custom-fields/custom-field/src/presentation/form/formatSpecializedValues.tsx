"use client";

import React from "react";
import { resolveIntlLocale } from "@core/common/utils";
import { EmptyCustomFieldCell } from "@core/crud/customFieldsExtension";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import type {
  CustomFieldCurrencyValue,
  CustomFieldValueTypeName,
} from "../../../../custom-field-value/src/data/models/CustomFieldValueModel";
import { RATING_MAX } from "../registries/valueTypeRegistry";
import type { FormatTranslateFn } from "./formatStandardValues";

/**
 * Formats specialized custom field values (Email, Url, Phone, Percent, Rating, Currency, Duration, Time, Color).
 */
export function formatSpecializedValues(
  valueType: CustomFieldValueTypeName,
  value: unknown,
  language: string,
  t: FormatTranslateFn
): React.ReactNode | null {
  switch (valueType) {
    case "Email": {
      const text = typeof value === "string" ? value : String(value);
      if (!text) return <EmptyCustomFieldCell />;
      return (
        <a href={`mailto:${text}`} className="text-nx-accent hover:underline">
          {text}
        </a>
      );
    }
    case "Url": {
      const text = typeof value === "string" ? value : String(value);
      if (!text) return <EmptyCustomFieldCell />;
      let isSafeScheme = false;
      try {
        const parsed = new URL(text);
        isSafeScheme = parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        isSafeScheme = false;
      }
      if (!isSafeScheme) {
        return text;
      }
      return (
        <a
          href={text}
          target="_blank"
          rel="noopener noreferrer"
          className="text-nx-accent hover:underline"
        >
          {text}
        </a>
      );
    }
    case "Phone": {
      const text = typeof value === "string" ? value : String(value);
      if (!text) return <EmptyCustomFieldCell />;
      try {
        const parsed = parsePhoneNumberFromString(text);
        return parsed ? parsed.formatInternational() : text;
      } catch {
        return text;
      }
    }
    case "Percent": {
      const num = typeof value === "number" ? value : Number(value);
      if (Number.isNaN(num)) return <EmptyCustomFieldCell />;
      return `${num.toLocaleString(resolveIntlLocale(language), { maximumFractionDigits: 6 })}%`;
    }
    case "Rating": {
      const num = typeof value === "number" ? value : Number(value);
      if (Number.isNaN(num)) return <EmptyCustomFieldCell />;
      return `${num} / ${RATING_MAX}`;
    }
    case "Currency": {
      const currency =
        value && typeof value === "object" ? (value as Partial<CustomFieldCurrencyValue>) : null;
      const amountNum =
        typeof currency?.amount === "number" ? currency.amount : Number(currency?.amount);
      if (!currency || Number.isNaN(amountNum) || !currency.currencyCode) {
        return <EmptyCustomFieldCell />;
      }
      try {
        return new Intl.NumberFormat(resolveIntlLocale(language), {
          style: "currency",
          currency: currency.currencyCode,
          currencyDisplay: "code",
        }).format(amountNum);
      } catch {
        return `${currency.currencyCode} ${amountNum.toLocaleString(resolveIntlLocale(language), { maximumFractionDigits: 6 })}`;
      }
    }
    case "Duration": {
      const num = typeof value === "number" ? value : Number(value);
      if (Number.isNaN(num)) return <EmptyCustomFieldCell />;
      return `${num.toLocaleString(resolveIntlLocale(language), { maximumFractionDigits: 6 })} ${t("customField.duration.unitLabel")}`;
    }
    case "Time": {
      const match = typeof value === "string" ? /^(\d{2}):(\d{2}):(\d{2})$/.exec(value) : null;
      if (!match) return <EmptyCustomFieldCell />;
      const [, h, m, s] = match;
      const hours = Number(h);
      const minutes = Number(m);
      const seconds = Number(s);
      if (hours > 23 || minutes > 59 || seconds > 59) return <EmptyCustomFieldCell />;
      const date = new Date(2000, 0, 1, hours, minutes, seconds);
      return new Intl.DateTimeFormat(resolveIntlLocale(language), { timeStyle: "medium" }).format(
        date
      );
    }
    case "Color": {
      const text = typeof value === "string" ? value : String(value);
      if (!text) return <EmptyCustomFieldCell />;
      const isValidHex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(text);
      return (
        <span className="inline-flex items-center gap-1.5">
          {isValidHex && (
            <span
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0 rounded-nx-sm border border-nx-line"
              style={{ backgroundColor: text }}
            />
          )}
          <span className="font-mono text-xs">{text}</span>
        </span>
      );
    }
    default:
      return null;
  }
}
