"use client";

import React from "react";
import { Badge } from "@core/ui/badge";
import { EmptyCustomFieldCell } from "@core/crud/customFieldsExtension";
import type { CustomFieldValueTypeName } from "../../../../custom-field-value/src/data/models/CustomFieldValueModel";
import {
  isEntityReferenceValue,
  isRichTextValue,
} from "../../../../custom-field-value/src/data/models/CustomFieldValueModel";
import { VALUE_TYPE_CATALOG } from "../registries/valueTypeRegistry";
import type { FormatTranslateFn } from "./formatStandardValues";

/**
 * Reduces stored rich-text markup to one line of readable text for a table cell.
 */
function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Formats complex reference and rich-text custom field values (EntityReference, UserReference, File, Image, RichText).
 */
export function formatReferenceValues(
  valueType: CustomFieldValueTypeName,
  value: unknown,
  _language: string,
  t: FormatTranslateFn
): React.ReactNode | null {
  switch (valueType) {
    case "EntityReference":
    case "UserReference": {
      if (!isEntityReferenceValue(value) || value.entityTypeKey.trim() === "") {
        return <EmptyCustomFieldCell />;
      }
      return (
        <span className="inline-flex items-center gap-1.5">
          <Badge variant="default">{t(VALUE_TYPE_CATALOG[valueType].labelKey)}</Badge>
          <span className="font-mono text-xs text-nx-ink-3">{value.entityTypeKey}</span>
        </span>
      );
    }
    case "File":
    case "Image": {
      if (!isEntityReferenceValue(value) || value.entityTypeKey.trim() === "") {
        return <EmptyCustomFieldCell />;
      }
      return (
        <span className="inline-flex items-center gap-1.5">
          <Badge variant="default">{t(VALUE_TYPE_CATALOG[valueType].labelKey)}</Badge>
          <span className="font-mono text-xs text-nx-ink-3">{value.entityTypeKey}</span>
        </span>
      );
    }
    case "RichText": {
      const html = isRichTextValue(value) ? value.html : null;
      if (html === null) {
        return <EmptyCustomFieldCell />;
      }
      const text = htmlToPlainText(html);
      return text === "" ? <EmptyCustomFieldCell /> : text;
    }
    default:
      return null;
  }
}
