/**
 * useTemplateCustomFields Hook
 *
 * Encapsulates custom field definitions retrieval, state tracking of user modifications,
 * client-side selection validations, and persistence for message template entities.
 */
"use client";

import { useState, useCallback } from "react";
import {
  useCustomFieldsFormFields,
  getCustomFieldsExtension,
  decodeCustomFieldName,
} from "@core/crud/customFieldsExtension";
import {
  assertSelectCustomFieldValuesValid,
} from "@modules/custom-fields/custom-field";
import {
  MESSAGE_TEMPLATE_ENTITY_TYPE_KEY,
  type TemplateFormMode,
} from "./templateFormTypes";

/**
 * Hook coordinating custom fields state and full-resubmit persistence for template forms.
 *
 * @param mode - Operating form mode ("create" or "edit").
 * @param templateId - Existing template identifier when editing, or undefined in create mode.
 * @param t - Localization translation function.
 * @returns Custom fields state, field updater, persistence handler, and query metadata.
 */
export function useTemplateCustomFields(
  mode: TemplateFormMode,
  templateId: string | undefined,
  t: (key: string) => string
) {
  const customFieldsQuery = useCustomFieldsFormFields(
    MESSAGE_TEMPLATE_ENTITY_TYPE_KEY,
    mode === "edit" ? templateId : undefined
  );

  const [customFieldValues, setCustomFieldValues] = useState<Record<string, unknown>>({});

  const updateCustomFieldValue = useCallback((name: string, value: unknown) => {
    setCustomFieldValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const saveCustomFieldValues = useCallback(
    async (ownerId: string) => {
      assertSelectCustomFieldValuesValid(customFieldsQuery.fieldConfigs, customFieldValues, t);

      const decoded: Record<string, unknown> = {};
      for (const fc of customFieldsQuery.fieldConfigs) {
        const key = decodeCustomFieldName(fc.name);
        if (key === null) continue;
        const raw = customFieldValues[fc.name] ?? fc.defaultValue ?? "";
        decoded[key] = raw === "" ? null : raw;
      }
      if (Object.keys(decoded).length === 0) return;
      await getCustomFieldsExtension()?.saveValues(
        MESSAGE_TEMPLATE_ENTITY_TYPE_KEY,
        ownerId,
        decoded
      );
    },
    [customFieldsQuery.fieldConfigs, customFieldValues, t]
  );

  return {
    customFieldValues,
    updateCustomFieldValue,
    saveCustomFieldValues,
    customFieldConfigs: customFieldsQuery.fieldConfigs,
    customFieldsLoading: customFieldsQuery.isLoading,
    refetchCustomFields: customFieldsQuery.refetch,
  };
}
