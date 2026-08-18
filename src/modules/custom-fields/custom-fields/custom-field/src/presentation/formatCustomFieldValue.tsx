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
 *
 * CATALOG-DRIVEN OR MANUAL CASES (Wave 3.1 Task 10 decision): this switch
 * stays a hand-maintained `switch (valueType)`, matching Wave 2's own
 * carried-forward structural exception, rather than growing a `format`
 * function field on `ValueTypeCatalogEntry`. Reasoning:
 *   1. `valueTypeRegistry.ts` is pure data today (strings/booleans) with no
 *      React import at all -- every entry mirrors a backend
 *      `ValueTypeDescriptor`, itself pure data (LabelKey/BadgeVariant/
 *      HasPlaceholder/HasOptions/FieldConfigType, no formatter). Keeping the
 *      frontend catalog data-only preserves that parallel structure, which
 *      several ValueTypeDescriptor doc comments explicitly lean on ("Mirrors
 *      VALUE_TYPE_CATALOG.LongText exactly").
 *   2. The completeness gate below (`it.each(ALL_VALUE_TYPES)`, extended in
 *      this task to all 8 members) is exactly as strong against a manual
 *      switch as it would be against a catalog-owned formatter -- the
 *      vacuousness risk Step 2.2's review found was a testing-discipline gap
 *      (a fallthrough that never got its own assertion), not a structural
 *      one a catalog would have prevented by itself.
 *   3. MultiSelect's and DateTime's read-side presentation (chips vs. a
 *      richer removable-token display; the DateTime zone disclosure's exact
 *      visual treatment) is still Task 11/12's to design. Locking a
 *      catalog-owned formatter shape in now, before those land, risks
 *      redesigning this same abstraction twice. Revisit once Tasks 11/12
 *      ship if the manual switch has grown unwieldy.
 */
import React from "react";
import { Badge } from "@core/ui/badge";
import { resolveIntlLocale } from "@core/common/utils";
import { EmptyCustomFieldCell } from "@core/crud/customFieldsExtension";
import { formatInTimeZone, isValidTimeZoneId } from "@core/utils/timezone";
import type {
  CustomFieldDateTimeValue,
  CustomFieldValueTypeName,
} from "../../../custom-field-value/src/data/models/CustomFieldValueModel";

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
    // LongText deliberately shares Text/Select's plain-string fallthrough --
    // it is a genuinely separate WRITE-side capability (its own unbounded
    // column, R8) but there is no read-side transformation a longer string
    // needs that a shorter one doesn't already skip. Truncation/expand-in-
    // place for a very long value is a table-cell layout concern, not a
    // formatting one, and is left to Task 12 if it turns out to matter.
    case "LongText":
    case "Text":
    case "Select":
      return String(value);
    // MultiSelect: chips, not a joined string -- pre-plan analysis §5.2
    // names `String(["a","b"])` producing "a,b" as indistinguishable from a
    // Text value that happens to contain a comma, so this renders each
    // selected label as its own Badge instead. Non-interactive (no remove
    // affordance) -- this is the READ side; Task 11 owns the edit-side
    // token/keyboard behaviour. An empty array reaches here only if a row
    // was ever persisted with zero selections (defensive, not the expected
    // shape -- IsEmpty([]) means no row is written at all), so it gets the
    // same EmptyCustomFieldCell every other type's own "technically present
    // but nothing to show" case uses.
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
    // DateTime: renders both the instant AND its stored zone, per the
    // pre-plan analysis's §5.3 ruling ("Always render the resolved zone on
    // the read side, so a stored DateTime is never ambiguous") -- a bare
    // `toLocaleString()` would silently reinterpret the instant in the
    // VIEWER's own local zone, which is a different moment-in-context than
    // the zone the value was actually entered in. `formatInTimeZone` is
    // `core/utils/timezone.ts`'s existing render-only helper (this module
    // must not hand-roll zone math) -- its own contract does not accept a
    // locale parameter (always the runtime's default), a known, narrower-
    // than-ideal limitation left for Task 12 to revisit if it matters enough
    // to matter, not silently worked around here.
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
      return String(value);
  }
}
