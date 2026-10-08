/* eslint-disable @typescript-eslint/no-explicit-any */
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

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MaskedCustomFieldCell,
  type MaskedCustomFieldCellProps,
} from "./components/MaskedCustomFieldCell";

/**
 * Custom validation error thrown when a custom field value violates validation constraints.
 * Allows save workflows to distinguish validation errors from API failure states.
 */
export class CustomFieldValidationError extends Error {}

/**
 * Mirrors CustomFields.Domain.Enums.CustomFieldValueType's wire names (the
 * API's global JsonStringEnumConverter serializes every enum as its member
 * name, never its numeric ordinal — see the CustomFields module's own
 * CustomFieldValueModel.ts, which this duplicates rather than imports, for
 * the same "core never imports from modules" reason FieldConfig[] is the
 * boundary type for getFormFields below). Wave 3.1 Task 10 added
 * LongText/DateTime/MultiSelect to both declarations of this union in
 * lockstep — this file's own header comment documents why there are exactly
 * two, not one. Wave 3.2 Batch 3 adds Email/Url/Phone/Percent/Rating the
 * same way (verified against the real backend enum: Email=8, Url=9,
 * Phone=10, Percent=11, Rating=12). Wave 3.3 Batch C adds
 * Currency/Duration/Time/Color the same way (Currency=13, Duration=14,
 * Time=15, Color=16). Wave 4 adds EntityReference=17/UserReference=18 the
 * same way, read off the real backend enum. Wave 3.4 adds
 * File=19/Image=20/RichText=21, likewise. That lockstep is not optional
 * here: `BulkColumnValuesResult.columns` is typed against THIS union while
 * the module's `getBulkColumnValues` returns columns typed against ITS
 * union, so a member present there and missing here is an outright build
 * error, not a silently narrower type.
 *
 * The build error is worth naming, because it is the whole safety mechanism and
 * it reads as unrelated when you hit it: adding a member to the module's union
 * alone fails at
 * `customFieldsCrudIntegration.tsx`'s `getBulkColumnValues` return with
 * "Type 'CustomFieldColumnData[]' is not assignable to
 * 'CustomFieldColumnDefinition[]'". That is this union being narrower, not a
 * data-layer fault, and the fix is here.
 */
export type CustomFieldValueTypeName =
  | "Text"
  | "Number"
  | "Boolean"
  | "Date"
  | "Select"
  | "LongText"
  | "DateTime"
  | "MultiSelect"
  | "Email"
  | "Url"
  | "Phone"
  | "Percent"
  | "Rating"
  | "Currency"
  | "Duration"
  | "Time"
  | "Color"
  | "EntityReference"
  | "UserReference"
  | "File"
  | "Image"
  | "RichText";

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
  sensitivity?: number;
}

export interface BulkColumnValuesResult {
  columns: CustomFieldColumnDefinition[];
  /** Keyed by the exact (encrypted) owner id string the caller requested, then by each column's `key`. An id the server couldn't verify is simply absent — render that row's cells empty, not an error. */
  valuesByOwnerId: Record<string, Record<string, unknown>>;
  /**
   * Wave 5 row 5.3. Per owner, the field keys a visibility rule hides for THAT record.
   *
   * A parallel channel, because visibility varies per ROW while a column exists once per result set —
   * so this can never be expressed by dropping a column, and expressing it as a missing key inside
   * `valuesByOwnerId` would overload an absence that already means two other things.
   *
   * Optional: a server predating row 5.3 omits it, and the server has already nulled the value
   * regardless, so a client ignoring this renders an empty cell — correct, just without knowing why.
   */
  hiddenKeysByOwnerId?: Record<string, string[]> | null;
}

/**
 * Everything a host form hands a custom-field control that `core` itself
 * cannot draw. Consumed by `CustomFieldsExtensionApi.FieldControl` below.
 *
 * WHY THIS SHAPE, AND WHY NOTHING MORE. The five props are exactly the facts
 * the host owns and the control cannot derive:
 *   - `field` carries everything definition-shaped (name/label/placeholder/
 *     required/options/`referenceTargetEntityTypeKey`). It is passed whole
 *     rather than as unpacked scalars precisely so the NEXT type admitted here
 *     needs no new prop: a type whose control reads `options` or `min`/`max`
 *     already has them.
 *   - `value` + `onChange` are the controlled-input contract, `unknown` in both
 *     directions because the whole point of this member is types whose form
 *     value is not a scalar. The host merges the reported value into its own
 *     form state; it never interprets it.
 *   - `invalid` / `describedBy` / `disabled` are the three host-owned facts a
 *     control cannot see for itself: whether the host's own validation pass
 *     rejected this field, which node the host rendered the hint or error into,
 *     and whether the whole form is read-only. Without them the control cannot
 *     honour the same `aria-invalid`/`aria-describedby` contract the host's own
 *     branches provide, which is the difference between an accessible field and
 *     one that merely looks right.
 *
 * Deliberately ABSENT: `required` (already on `field`), `id`/`label`/
 * `placeholder` (already on `field`), and anything reference-specific. A member
 * only one value type can ever use would have to be replaced the first time a
 * second object-valued type needs drawing; this one just gets a second arm in
 * the implementation's own dispatch.
 */
export interface CustomFieldFormControlProps {
  /** The already-namespaced FieldConfig this extension itself produced (see getFormFields). */
  field: FieldConfig;
  /** Current form value for `field.name`, exactly as the host holds it — never coerced on the way in. */
  value: unknown;
  /** Report a new value. The host merges it into its own form state verbatim. */
  onChange: (next: unknown) => void;
  /** The host's read-only/disabled state for this field (a view dialog, or `field.disabled`). */
  disabled?: boolean;
  /** True when the host's own validation pass rejected this field — drives `aria-invalid`. */
  invalid?: boolean;
  /** Id of the hint or error node the host renders below the control, for `aria-describedby`. */
  describedBy?: string;
  /** Validation error message for the field when invalid. */
  error?: string;
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
  getBulkColumnValues: (
    entityTypeKey: string,
    ownerIds: string[]
  ) => Promise<BulkColumnValuesResult>;
  assertValuesValid?: (
    fieldConfigs: FieldConfig[],
    values: Record<string, unknown>,
    t: any
  ) => void;
  /** Decrypts and reveals a sensitive custom field value for an authorized user. */
  revealValue?: (entityTypeKey: string, ownerId: string, fieldKey: string) => Promise<unknown>;
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
  /**
   * Draws the whole field — label, control, and any hint the control owns — for
   * one FieldConfig whose `type` `core` declares for typing but cannot render
   * itself. The EDIT-side counterpart of `formatValueForDisplay` below, and the
   * component-valued sibling of `InlineAddTrigger` above.
   *
   * WHY THIS MEMBER EXISTS AT ALL. `getFormFields` hands `core` a
   * `FieldConfig[]` that GenericCrudView concatenates straight into
   * `<GenericForm fields={...}>`, so those fields genuinely reach GenericForm's
   * render switch — and a type with no arm there fell through to the plain
   * `<Input type={field.type} value={formData[field.name] ?? ""}>` default.
   * For an object-valued type that renders as `[object Object]` in a text box
   * the operator can type over, replacing the object with a string the server
   * refuses. That is 30 CrudConfig sites declaring `entityTypeKey:` against 8
   * that call the module's own dispatcher directly.
   *
   * The fix could NOT be an import: the control needs the CustomFields module
   * (its entity-lookup hooks reach that module's DI container) and `core` must
   * not import from `src/modules/*` — docs/architecture/01-modularity.md's
   * Dependency Rule, the same constraint that makes this whole file a registry.
   * A direct import would additionally close a runtime cycle (generic-form →
   * control → module DI → valueTypeRegistry → generic-form) and pull the entire
   * CustomFields data layer into every form in the product. So the control
   * arrives the way every other module capability here does: core states the
   * contract, the module registers the implementation.
   *
   * Deliberately OPTIONAL, for exactly the reason `formatValueForDisplay`
   * below is: making it required would force every hand-built
   * `CustomFieldsExtensionApi` test double across this codebase's other suites
   * (leads/webhooks/dsr/templates/generic-crud-view) to add a throwaway
   * component just to keep compiling. What must NOT happen when it is absent is
   * the silent text-box fallthrough — GenericForm renders an explicit, inert,
   * explanatory field instead. See `CustomFieldExtensionControl` in
   * generic-form.tsx.
   */
  FieldControl?: React.ComponentType<CustomFieldFormControlProps>;
  /**
   * Read-side per-type cell formatter for buildCustomFieldColumn's dynamic
   * table columns below — the read counterpart of getFormFields (which
   * produces the EDIT-side FieldConfig per type). Wave 2 Step 2.2 Task 5:
   * moves buildCustomFieldColumn's own inline Number/Boolean/Date/
   * Text-and-Select-fallthrough switch out of `core` and into the
   * CustomFields module (formatCustomFieldValue.tsx), the same
   * "core defines the contract, the module implements it" shape already used
   * for every other member of this interface, rather than adding a second,
   * differently-keyed dispatch table that lives directly in `core`.
   *
   * Deliberately OPTIONAL, unlike the members above: making it required would
   * force every hand-built `CustomFieldsExtensionApi` test double across this
   * codebase's other suites (leads/webhooks/dsr/templates/generic-crud-view,
   * none of which render a Number/Boolean/Date custom-field column today) to
   * add a throwaway implementation just to keep compiling — churn with no
   * connection to this task. buildCustomFieldColumn falls back to a plain
   * `String(raw)` when this is absent, matching this switch's own pre-Task-5
   * Text/Select default branch; the one real implementation
   * (customFieldsCrudIntegration.tsx) always supplies it, so that fallback is
   * only ever exercised by a test double that doesn't care about formatting.
   */
  formatValueForDisplay?: (
    valueType: CustomFieldValueTypeName,
    value: unknown,
    language: string,
    t: (key: string, params?: Record<string, string | number>) => string
  ) => React.ReactNode;
  /**
   * Reusable section component for rendering custom fields inside any host form
   * (e.g. Webhook Form, Lead Form, Template Form, Theme Modal, etc.).
   */
  Section?: React.ComponentType<CustomFieldsSectionProps>;
  /**
   * Lists the custom-field keys an admin could restrict for one permission resource.
   */
  useRestrictableCustomFieldKeys?: UseRestrictableCustomFieldKeysHook;
}

export interface RestrictableCustomFieldKey {
  key: string;
  labelEn: string;
  isRequired: boolean;
}

export interface UseRestrictableCustomFieldKeysArgs {
  enabled?: boolean;
}

export interface UseRestrictableCustomFieldKeysResult {
  keys: RestrictableCustomFieldKey[];
  isLoading: boolean;
  isError: boolean;
  isTruncated: boolean;
  isAvailable: boolean;
}

export type UseRestrictableCustomFieldKeysHook = (
  permissionResource: string | undefined,
  args?: UseRestrictableCustomFieldKeysArgs
) => UseRestrictableCustomFieldKeysResult;

export interface CustomFieldsSectionProps {
  /** The field configuration schemas (from useEntityCustomFields or ViewModel). */
  configs: readonly FieldConfig[];
  /** Current custom field values dictionary. */
  values: Record<string, unknown>;
  /** Callback fired whenever any custom field value changes. */
  onChange: (key: string, value: unknown) => void;
  /** Whether custom field definitions are currently loading. */
  isLoading?: boolean;
  /** Message displayed when no custom fields are defined for this entity type. */
  emptyMessage?: string;
  /** Entity type key (e.g. 'integrations.webhook-subscription') for inline creation. */
  entityTypeKey?: string;
  /** Localized entity display name for the inline creation modal title. */
  entityDisplayName?: string;
  /** Callback to refetch custom fields when an inline field is created. */
  onFieldCreated?: () => void;
  /** Whether the controls are in read-only / view mode. */
  isViewMode?: boolean;
  /** Optional validation errors dictionary keyed by field name. */
  errors?: Record<string, string>;
  /** Whether the parent form or step has been touched. */
  touched?: boolean;
  /** Optional container CSS class name. */
  className?: string;
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
  return name.startsWith(CUSTOM_FIELD_NAME_PREFIX)
    ? name.slice(CUSTOM_FIELD_NAME_PREFIX.length)
    : null;
}

/**
 * Always calls the same primitive hooks (useState/useEffect/useCallback)
 * regardless of registration state — it only ever delegates to PLAIN ASYNC
 * FUNCTIONS on the registered extension (getFormFields), never to another
 * hook, so Rules of Hooks holds even if this fires before the CustomFields
 * module's bootstrap import has run (in which case it just returns empty).
 *
 * KNOWN INEFFICIENCY (design doc recon finding #5, verified and deliberately
 * deferred to Wave 2): GenericCrudView mounts up to THREE independent
 * instances of this hook for the same entityTypeKey (create/edit/view), each
 * with its own useState/useEffect and no cache between them. create's
 * instance calls getFormFields(key, undefined) -> getDefinitions(key); edit
 * and view's instances call getFormFields(key, ownerId) -> getValues(key,
 * ownerId) -- a different endpoint, so this is NOT three identical requests,
 * but all three independently carry overlapping definition metadata (label,
 * placeholder, options, valueType, required) with no sharing. The correct
 * fix is a shared cache, which belongs in Wave 2 once the IValueTypeHandler
 * registry (design doc §8) restructures this contract anyway --
 * building a cache against the current shape now would likely be thrown
 * away. customFieldsExtension.fetchCount.test.tsx pins today's call count so
 * Wave 2 has a concrete before/after baseline.
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

/**
 * "No value set" — matches GenericTable's own formatCellValue em dash, muted
 * since this is normal, not an error/loading state. Exported (Wave 2 Step
 * 2.2 Task 5) so the CustomFields module's formatCustomFieldValue.tsx can
 * reuse the exact same empty-state markup for its own Number/Date NaN
 * guards instead of duplicating this span — modules importing a component
 * from `core` is the normal, permitted dependency direction (see
 * docs/architecture/01-modularity.md's Dependency Rule), unlike the
 * core-importing-modules direction this file's own extension point exists to
 * avoid.
 */
export function EmptyCustomFieldCell() {
  return <span className="text-muted-foreground/60">—</span>;
}

function isEmptyCustomFieldValue(value: unknown): value is null | undefined | "" {
  return value === null || value === undefined || value === "";
}

export { MaskedCustomFieldCell, type MaskedCustomFieldCellProps };

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
  t: (key: string, params?: Record<string, string | number>) => string,
  /** Wave 5 row 5.3 — per owner, the keys a rule hides for that record. */
  hiddenKeysByOwnerId?: Record<string, string[]> | null,
  entityTypeKey?: string
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
      // ── Wave 5 row 5.3 ──────────────────────────────────────────────────────────────────────
      //
      // PER ROW, not per column: the same field can be hidden for one record and shown for the next,
      // which is exactly why the column itself is never dropped. Rendered as the ordinary empty cell
      // rather than a distinct "hidden" marker — a field that does not apply to this record reads as
      // having no value, and a special marker would draw attention to precisely the thing the rule
      // exists to keep out of the way.
      //
      // Defence in depth only: the server has already nulled the value, so removing this changes
      // nothing about what is transmitted.
      const hiddenForRow = hiddenKeysByOwnerId?.[row?.id];
      if (hiddenForRow?.some((key) => key.toLowerCase() === definition.key.toLowerCase())) {
        return <EmptyCustomFieldCell />;
      }

      const raw = valuesByOwnerId[row?.id]?.[definition.key];
      if (isEmptyCustomFieldValue(raw)) {
        return <EmptyCustomFieldCell />;
      }

      if (
        raw === "••••••••" ||
        (definition.sensitivity !== undefined && definition.sensitivity >= 2)
      ) {
        return (
          <MaskedCustomFieldCell
            entityTypeKey={entityTypeKey}
            ownerId={row?.id}
            fieldKey={definition.key}
            initialMaskedValue={typeof raw === "string" && raw.includes("•") ? raw : "••••••••"}
            valueType={definition.valueType}
            language={language}
            t={t}
          />
        );
      }

      // Wave 2 Step 2.2 Task 5: the former inline Number/Boolean/Date/
      // Text-and-Select-fallthrough switch now lives in the CustomFields
      // module (formatCustomFieldValue.tsx) behind this extension point —
      // see formatValueForDisplay's own doc comment above for why it is
      // optional and what the String(raw) fallback below covers.
      const formatted = getCustomFieldsExtension()?.formatValueForDisplay?.(
        definition.valueType,
        raw,
        language,
        t
      );
      return formatted !== undefined ? formatted : String(raw);
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
  const [hiddenKeysByOwnerId, setHiddenKeysByOwnerId] = useState<Record<string, string[]>>({});
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
    const targetOwnerIds = ownerIdsKey ? ownerIdsKey.split(",") : [];
    if (!entityTypeKey || !api || targetOwnerIds.length === 0) {
      setDefinitions([]);
      setValuesByOwnerId({});
      setHiddenKeysByOwnerId({});
      setIsLoading(false);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.getBulkColumnValues(entityTypeKey, targetOwnerIds);
      setDefinitions(result.columns.slice().sort((a, b) => a.sortOrder - b.sortOrder));
      setValuesByOwnerId(result.valuesByOwnerId);
      // Reset to {} rather than left alone when the server sends nothing: a previous page whose rows
      // had hidden fields must not leave stale keys hiding cells on the next page.
      setHiddenKeysByOwnerId(result.hiddenKeysByOwnerId ?? {});
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      // Deliberately not clearing definitions/valuesByOwnerId here — a failed
      // background refresh (e.g. a page-change round trip that dropped) keeps
      // showing the last successfully loaded page's custom-field data instead
      // of blanking a table that was working a moment ago.
    } finally {
      setIsLoading(false);
    }
  }, [entityTypeKey, ownerIdsKey]);

  useEffect(() => {
    void fetchColumns();
  }, [fetchColumns]);

  const columns = useMemo<Column<any>[]>(
    () =>
      definitions.map((definition) =>
        buildCustomFieldColumn(
          definition,
          valuesByOwnerId,
          language,
          t,
          hiddenKeysByOwnerId,
          entityTypeKey
        )
      ),
    [definitions, valuesByOwnerId, hiddenKeysByOwnerId, language, t, entityTypeKey]
  );

  return { columns, isLoading, error };
}
