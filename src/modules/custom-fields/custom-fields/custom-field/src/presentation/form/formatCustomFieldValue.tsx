"use client";

import React from "react";
import type { CustomFieldValueTypeName } from "../../../../custom-field-value/src/data/models/CustomFieldValueModel";
import { formatStandardValues, type FormatTranslateFn } from "./formatStandardValues";
import { formatSpecializedValues } from "./formatSpecializedValues";
import { formatReferenceValues } from "./formatReferenceValues";

/**
 * Documentation for module export
 */
export type { FormatTranslateFn };

/**
 * Formats one already-known-non-empty custom-field value for read-only table display.
 * Dispatches to specialized formatting routines for standard, specialized, and reference values.
 */
export function formatCustomFieldValue(
  valueType: CustomFieldValueTypeName,
  value: unknown,
  language: string,
  t: FormatTranslateFn
): React.ReactNode {
  return (
    formatStandardValues(valueType, value, language, t) ??
    formatSpecializedValues(valueType, value, language, t) ??
    formatReferenceValues(valueType, value, language, t) ??
    String(value)
  );
}
