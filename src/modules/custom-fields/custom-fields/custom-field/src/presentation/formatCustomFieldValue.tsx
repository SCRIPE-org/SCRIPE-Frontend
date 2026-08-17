"use client";

/**
 * Shared per-type READ/format function -- Wave 2 Step 2.2, Task 5.
 *
 * Ports the Number/Boolean/Date/Text-and-Select-fallthrough branches of
 * buildCustomFieldColumn's own inline switch (core/crud/customFieldsExtension.tsx)
 * into ONE function, registered against
 * CustomFieldsExtensionApi.formatValueForDisplay (customFieldsCrudIntegration.tsx)
 * the same way getFormFields/saveValues/getBulkColumnValues/InlineAddTrigger are
 * already registered -- the read-side counterpart of renderCustomFieldControl.tsx
 * (Tasks 2-4), which owns the EDIT side of these same 5 value types.
 *
 * ARCHITECTURE DECISION (Option B, of the two the task brief laid out):
 * buildCustomFieldColumn lives in `core`, and `core` cannot import from
 * `src/modules/*` (docs/architecture/01-modularity.md's Dependency Rule;
 * customFieldsExtension.tsx's own header comment describes the one
 * deliberate exception this file exists to contain). That leaves two
 * legitimate homes for the new shared table:
 *   (a) inside `core` itself, keyed on the CustomFieldValueTypeName type
 *       core already redeclares independently (customFieldsExtension.tsx:32);
 *   (b) inside this module, behind a new CustomFieldsExtensionApi member the
 *       module registers -- the exact mechanism this file already uses for
 *       every other piece of per-type CustomFields knowledge core needs
 *       (getFormFields turns a value type into a FieldConfig; saveValues and
 *       getBulkColumnValues round-trip stored values; InlineAddTrigger owns
 *       the create-time UI). Per-type DISPLAY formatting is the same shape
 *       of capability as those four, not a different one, so (b) keeps this
 *       file internally consistent instead of introducing a second, parallel
 *       way for core to get type-aware CustomFields behavior -- one inline
 *       redeclared type for a data SHAPE (CustomFieldColumnDefinition's
 *       wire contract) is not the same thing as duplicating per-type
 *       BEHAVIOR in core, which is exactly what buildCustomFieldColumn's
 *       switch was doing before this task and what option (a) would have
 *       relocated rather than fixed. Formatting logic belongs with the
 *       module that owns the value-type domain (and, per Task 1's own
 *       VALUE_TYPE_CATALOG living here, already keeps the rest of that
 *       domain's presentation metadata in this same directory) -- so this
 *       file was placed flat in presentation/, next to valueTypeRegistry.ts
 *       and renderCustomFieldControl.tsx, matching Task 1-4's own precedent
 *       survey for why no `presentation/registry/` subfolder exists in this
 *       codebase.
 *
 * `formatValueForDisplay`'s signature grew one parameter beyond the task
 * brief's own illustrative sketch (`(valueType, value, language) => ReactNode`):
 * the Boolean branch's Badge label goes through `t("common.yes"/"common.no")`,
 * exactly as it did in the original inline switch, so `t` has to be threaded
 * through as a fourth parameter the same way buildCustomFieldColumn itself
 * already receives it -- dropping it would silently regress Boolean cells to
 * an untranslated hardcoded string.
 */
import React from "react";
import { Badge } from "@core/ui/badge";
import { resolveIntlLocale } from "@core/common/utils";
import { EmptyCustomFieldCell } from "@core/crud/customFieldsExtension";
import type { CustomFieldValueTypeName } from "../../../custom-field-value/src/data/models/CustomFieldValueModel";

/** Matches useI18n()'s own `t` signature, and buildCustomFieldColumn's existing `t` parameter. */
export type FormatTranslateFn = (key: string, params?: Record<string, string | number>) => string;

/**
 * Formats one already-known-non-empty custom-field value for read-only table
 * display. The empty-value gate (`isEmptyCustomFieldValue`/`EmptyCustomFieldCell`
 * for `null`/`undefined`/`""`) stays in buildCustomFieldColumn itself -- it is
 * type-BLIND (applies before this function is ever called, regardless of
 * `valueType`) and is deliberately NOT duplicated or re-implemented here.
 *
 * Number/Date each still render `EmptyCustomFieldCell` for their OWN
 * type-specific reason (a non-empty raw value that nonetheless fails to
 * parse as a finite number / valid date, e.g. a corrupt or manually-edited
 * stored value) -- that is a per-type concern, not the type-blind gate
 * above, so it belongs in this per-type function, ported verbatim from the
 * original switch's own NaN guards.
 */
export function formatCustomFieldValue(
  valueType: CustomFieldValueTypeName,
  value: unknown,
  language: string,
  t: FormatTranslateFn
): React.ReactNode {
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
      const date = new Date(value as string);
      return Number.isNaN(date.getTime()) ? (
        <EmptyCustomFieldCell />
      ) : (
        date.toLocaleDateString(resolveIntlLocale(language))
      );
    }
    case "Text":
    case "Select":
    default:
      return String(value);
  }
}
