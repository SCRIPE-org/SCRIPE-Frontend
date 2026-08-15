/**
 * Core-owned extension point for the CustomFields module. `src/core` does
 * import from `src/modules/*` in places today — permission constants in
 * common/types/permissions.ts, locale registration in
 * locales/module-registry.ts, component re-exports in auth/index.ts — but none
 * of those is a hook reaching into a feature module's data layer from a
 * universally-shared UI component the way GenericCrudView would need to.
 * This typed extension point keeps that specific, higher-risk boundary clean
 * rather than adding another ad-hoc case: core defines the contract; the
 * CustomFields module implements it and self-registers via one side-effect
 * import wired into src/app/layout.tsx (see the CustomFields module's
 * bootstrap.ts, Task 3) — the single composition root, not core and not a
 * peer module.
 */
"use client";

import type { Column } from "@core/crud/components/generic-table";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { resolveIntlLocale } from "@core/common/utils";
import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Mirrors CustomFields.Domain.Enums.CustomFieldValueType's wire names (the
 * API's global JsonStringEnumConverter serializes every enum as its member
 * name, never its numeric ordinal — see the CustomFields module's own
 * CustomFieldValueModel.ts, which this duplicates rather than imports, for
 * the same "core never imports from modules" reason FieldConfig[] is the
 * boundary type for getFormFields below).
 */
export type CustomFieldValueTypeName = "Text" | "Number" | "Boolean" | "Date" | "Select";

/**
 * One active custom-field definition shaped as a table-column header — thinner
 * than a form field: no isRequired, no per-row value, since those don't vary
 * per column, only per cell (see valuesByOwnerId below).
 */
export interface CustomFieldColumnDefinition {
  key: string;
  labelEn: string;
  labelAr: string | null;
  valueType: CustomFieldValueTypeName;
  options: string[] | null;
  sortOrder: number;
}

export interface BulkColumnValuesResult {
  columns: CustomFieldColumnDefinition[];
  /** Keyed by the exact (encrypted) owner id string the caller requested, then by each column's `key`. An id the server couldn't verify is simply absent — render that row's cells empty, not an error. */
  valuesByOwnerId: Record<string, Record<string, unknown>>;
}

export interface CustomFieldsExtensionApi {
  /** Active definitions for entityTypeKey, merged with ownerId's stored values when given, mapped to already-namespaced FieldConfig[]. */
  getFormFields: (entityTypeKey: string, ownerId?: string) => Promise<FieldConfig[]>;
  /** Full-replace save of one owner record's custom-field values, keyed by the plain (decoded) custom-field key. */
  saveValues: (
    entityTypeKey: string,
    ownerId: string,
    valuesByCustomFieldKey: Record<string, unknown>
  ) => Promise<void>;
  /**
   * Active definitions for entityTypeKey (as table columns) plus every
   * requested owner's stored values, in one round trip — backs a table's
   * dynamic custom-field columns for a page of rows instead of fetching per
   * row. `ownerIds` is capped at 100 server-side (mirrors the page-size cap
   * GenericTable's own pagination already offers, so a single page can never
   * legitimately exceed it).
   */
  getBulkColumnValues: (entityTypeKey: string, ownerIds: string[]) => Promise<BulkColumnValuesResult>;
  /**
   * Self-contained trigger + dialog; internally gates on the custom-fields.create
   * permission via its own usePermission call. `entityDisplayName` is the host
   * screen's already-translated title (e.g. "Party People") shown in the dialog
   * in place of the raw entityTypeKey ("party.person") — optional so a caller
   * with no ready display name (or a test) still gets a working dialog.
   */
  InlineAddTrigger: React.ComponentType<{
    entityTypeKey: string;
    entityDisplayName?: string;
    onCreated: () => void;
  }>;
}

let registeredApi: CustomFieldsExtensionApi | null = null;

export function registerCustomFieldsExtension(api: CustomFieldsExtensionApi): void {
  registeredApi = api;
}

export function getCustomFieldsExtension(): CustomFieldsExtensionApi | null {
  return registeredApi;
}

/**
 * Every FieldConfig this extension contributes to a form is named with this
 * prefix so GenericCrudView can split a submitted form's data back into
 * "real entity fields" vs "custom-field values" without guessing. Never
 * construct this prefix inline elsewhere — always go through these two
 * functions so the encoding has exactly one definition.
 */
const CUSTOM_FIELD_NAME_PREFIX = "__cf__";

export function encodeCustomFieldName(key: string): string {
  return `${CUSTOM_FIELD_NAME_PREFIX}${key}`;
}

export function decodeCustomFieldName(name: string): string | null {
  return name.startsWith(CUSTOM_FIELD_NAME_PREFIX) ? name.slice(CUSTOM_FIELD_NAME_PREFIX.length) : null;
}

/**
 * Always calls the same primitive hooks (useState/useEffect/useCallback)
 * regardless of registration state — it only ever delegates to PLAIN ASYNC
 * FUNCTIONS on the registered extension (getFormFields), never to another
 * hook, so Rules of Hooks holds even if this fires before the CustomFields
 * module's bootstrap import has run (in which case it just returns empty).
 */
export function useCustomFieldsFormFields(
  entityTypeKey: string | undefined,
  ownerId: string | undefined
): {
  fieldConfigs: FieldConfig[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [fieldConfigs, setFieldConfigs] = useState<FieldConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // getFormFields rejects for real reasons a user can hit — a 403 from a
  // screen the caller lacks the custom-fields view permission on, a network
  // drop mid-modal. Without this the rejection escaped `fetchFields` as an
  // unhandled promise (both call sites are fire-and-forget) and the section
  // just stayed empty with nothing to explain why. Captured here the same way
  // useEntityCustomFields already does it; surfacing it in the UI is a
  // follow-up, but it is no longer swallowed.
  const [error, setError] = useState<Error | null>(null);

  const fetchFields = useCallback(async () => {
    const api = getCustomFieldsExtension();
    if (!entityTypeKey || !api) {
      setFieldConfigs([]);
      setIsLoading(false);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      setFieldConfigs(await api.getFormFields(entityTypeKey, ownerId));
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [entityTypeKey, ownerId]);

  useEffect(() => {
    void fetchFields();
  }, [fetchFields]);

  return { fieldConfigs, isLoading, error, refetch: fetchFields };
}

/** "No value set" — matches GenericTable's own formatCellValue em dash, muted since this is normal, not an error/loading state. */
function EmptyCustomFieldCell() {
  return <span className="text-nx-ink-3">—</span>;
}

function isEmptyCustomFieldValue(value: unknown): value is null | undefined | "" {
  return value === null || value === undefined || value === "";
}

/**
 * One synthesized Column<T> for a custom field, ready to spread onto a
 * screen's own columns. `render` deliberately ignores both of its arguments
 * (`value`, the raw `row[key]` lookup GenericTable always performs, and
 * `row` beyond its `id`) and instead closes over `valuesByOwnerId`, looked up
 * by `row.id` — every row type in this system has one. See the `key` cast
 * below for why `row[column.key]` being meaningless here is safe.
 */
function buildCustomFieldColumn(
  definition: CustomFieldColumnDefinition,
  valuesByOwnerId: Record<string, Record<string, unknown>>,
  language: string,
  t: (key: string, params?: Record<string, string | number>) => string
): Column<any> {
  return {
    // Synthetic key: no row type in the host screen has a real property
    // named after a custom field's machine key. GenericTable evaluates
    // `row[column.key]` unconditionally before calling `render` (even though
    // `render` is supplied here), so the `undefined` this produces is simply
    // discarded — `render` below never reads its `value` argument. The cast
    // exists to satisfy `Column<T>`'s `key: keyof T` constraint at the call
    // site, the same "synthetic key + cast" shape used for dynamic keys
    // elsewhere in this codebase (e.g. `as keyof Settings` in
    // core/settings/merge-engine.ts).
    key: definition.key as keyof any,
    label: language === "ar" && definition.labelAr ? definition.labelAr : definition.labelEn,
    // Matches the numeric-column convention already established across this
    // table (end-aligned, tabular figures) rather than inventing a new one.
    className: definition.valueType === "Number" ? "text-end tabular-nums" : undefined,
    render: (_value: unknown, row: any) => {
      const raw = valuesByOwnerId[row?.id]?.[definition.key];
      if (isEmptyCustomFieldValue(raw)) {
        return <EmptyCustomFieldCell />;
      }
      switch (definition.valueType) {
        case "Number": {
          const num = typeof raw === "number" ? raw : Number(raw);
          return Number.isNaN(num) ? (
            <EmptyCustomFieldCell />
          ) : (
            num.toLocaleString(resolveIntlLocale(language))
          );
        }
        case "Boolean": {
          const bool = Boolean(raw);
          return (
            <Badge variant={bool ? "info" : "secondary"}>
              {bool ? t("common.yes") : t("common.no")}
            </Badge>
          );
        }
        case "Date": {
          const date = new Date(raw as string);
          return Number.isNaN(date.getTime()) ? (
            <EmptyCustomFieldCell />
          ) : (
            date.toLocaleDateString(resolveIntlLocale(language))
          );
        }
        case "Text":
        case "Select":
        default:
          return String(raw);
      }
    },
  };
}

/**
 * Active custom-field definitions for entityTypeKey, synthesized into
 * ready-to-spread table Columns whose cells are pre-resolved from a single
 * bulk fetch over `ownerIds` (the caller's current page of row ids) — backs
 * GenericCrudView's dynamic custom-field table columns, the table-column
 * counterpart of useCustomFieldsFormFields above. Same unconditional-hooks
 * contract: always calls the same primitive hooks regardless of registration
 * state or entityTypeKey, so Rules of Hooks holds even before the
 * CustomFields module's bootstrap import has run (in which case it just
 * returns no columns).
 */
export function useCustomFieldColumns(
  entityTypeKey: string | undefined,
  ownerIds: string[]
): {
  columns: Column<any>[];
  isLoading: boolean;
  error: Error | null;
} {
  const { t, language } = useI18n();
  const [definitions, setDefinitions] = useState<CustomFieldColumnDefinition[]>([]);
  const [valuesByOwnerId, setValuesByOwnerId] = useState<Record<string, Record<string, unknown>>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // `ownerIds` is a fresh array reference on every render (a new page of
  // viewModel.items, a new sort/filter/search) even when its CONTENTS are
  // unchanged. Depending on the array itself would refetch on every render;
  // joining it into one string reduces the dependency to a primitive that
  // only changes when the actual SET of ids changes — pagination, sort,
  // filter, search, whatever changed the page. "," cannot appear inside
  // an encrypted id, so two different id lists never collide onto one key.
  const ownerIdsKey = ownerIds.join(",");

  const fetchColumns = useCallback(async () => {
    const api = getCustomFieldsExtension();
    if (!entityTypeKey || !api || ownerIds.length === 0) {
      setDefinitions([]);
      setValuesByOwnerId({});
      setIsLoading(false);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.getBulkColumnValues(entityTypeKey, ownerIds);
      setDefinitions(result.columns.slice().sort((a, b) => a.sortOrder - b.sortOrder));
      setValuesByOwnerId(result.valuesByOwnerId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      // Deliberately not clearing definitions/valuesByOwnerId here — a failed
      // background refresh (e.g. a page-change round trip that dropped) keeps
      // showing the last successfully loaded page's custom-field data instead
      // of blanking a table that was working a moment ago.
    } finally {
      setIsLoading(false);
    }
    // ownerIdsKey stands in for ownerIds' contents (see above); the array
    // reference itself is intentionally excluded from these deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityTypeKey, ownerIdsKey]);

  useEffect(() => {
    void fetchColumns();
  }, [fetchColumns]);

  const columns = useMemo<Column<any>[]>(
    () =>
      definitions.map((definition) =>
        buildCustomFieldColumn(definition, valuesByOwnerId, language, t)
      ),
    [definitions, valuesByOwnerId, language, t]
  );

  return { columns, isLoading, error };
}
