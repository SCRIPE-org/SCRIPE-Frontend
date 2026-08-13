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

import type { FieldConfig } from "@core/ui/forms/generic-form";
import { useCallback, useEffect, useState } from "react";

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
