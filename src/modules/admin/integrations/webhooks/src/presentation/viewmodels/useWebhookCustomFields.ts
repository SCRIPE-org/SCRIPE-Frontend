/**
 * useWebhookCustomFields — Handles custom field configuration and values persistence for webhook subscriptions.
 */

import { useState } from "react";
import {
  useCustomFieldsFormFields,
  getCustomFieldsExtension,
  decodeCustomFieldName,
} from "@core/crud/customFieldsExtension";
import {
  assertSelectCustomFieldValuesValid,
} from "@modules/custom-fields/custom-field";
import { WEBHOOK_ENTITY_TYPE_KEY } from "./webhookFormTypes";

/**
 * Hook orchestrating custom fields state, validation, and storage for webhooks.
 *
 * @param mode Form operational mode ('create' or 'edit').
 * @param webhookId Target subscription ID if editing.
 * @param t Translation helper for client-side validation error messages.
 * @returns Custom fields form configuration and persistence handlers.
 */
export function useWebhookCustomFields(
  mode: "create" | "edit",
  webhookId: string | undefined,
  t: (key: string) => string
) {
  const customFieldsQuery = useCustomFieldsFormFields(
    WEBHOOK_ENTITY_TYPE_KEY,
    mode === "edit" ? webhookId : undefined
  );

  const [customFieldValues, setCustomFieldValues] = useState<Record<string, unknown>>({});

  const updateCustomFieldValue = (name: string, value: unknown) => {
    setCustomFieldValues((prev) => ({ ...prev, [name]: value }));
  };

  const saveCustomFieldValues = async (ownerId: string) => {
    assertSelectCustomFieldValuesValid(customFieldsQuery.fieldConfigs, customFieldValues, t);

    const decoded: Record<string, unknown> = {};
    for (const fc of customFieldsQuery.fieldConfigs) {
      const key = decodeCustomFieldName(fc.name);
      if (key === null) continue;
      const raw = customFieldValues[fc.name] ?? fc.defaultValue ?? "";
      decoded[key] = raw === "" ? null : raw;
    }
    if (Object.keys(decoded).length === 0) return;
    await getCustomFieldsExtension()?.saveValues(WEBHOOK_ENTITY_TYPE_KEY, ownerId, decoded);
  };

  return {
    customFieldsQuery,
    customFieldValues,
    updateCustomFieldValue,
    saveCustomFieldValues,
  };
}
