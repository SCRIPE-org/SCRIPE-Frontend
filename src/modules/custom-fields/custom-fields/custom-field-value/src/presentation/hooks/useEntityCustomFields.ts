"use client";

import { useCallback, useEffect, useState } from "react";
import { customFieldsContainer } from "../../../../di";
import type { EntityCustomFieldValueData } from "../../data/models/CustomFieldValueModel";

interface UseEntityCustomFieldsResult {
  fields: EntityCustomFieldValueData[];
  isLoading: boolean;
  error: Error | null;
  saveValues: (values: Record<string, unknown>) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Fetches the active custom-field definitions for an entity type, merged with
 * one owner record's stored values when ownerId is supplied (edit-form shape),
 * or definitions-only when it isn't (create-form shape). No screen consumes this
 * yet -- wiring into GenericCrudView is Phase 3, whose exact integration shape
 * (an entityTypeKey prop on CrudConfig) is a separate, not-yet-built design.
 */
export function useEntityCustomFields(
  entityTypeKey: string,
  ownerId?: string
): UseEntityCustomFieldsResult {
  const [state, setState] = useState({
    fields: [] as EntityCustomFieldValueData[],
    isLoading: !!entityTypeKey,
    error: null as Error | null,
    reqEntity: entityTypeKey,
    reqOwner: ownerId,
  });

  if (entityTypeKey !== state.reqEntity || ownerId !== state.reqOwner) {
    setState((s) => ({
      ...s,
      isLoading: !!entityTypeKey,
      error: null,
      reqEntity: entityTypeKey,
      reqOwner: ownerId,
    }));
  }

  const fetchFields = useCallback(async (isRefetch = false) => {
    if (!entityTypeKey) {
      if (isRefetch) {
        setState((s) => ({ ...s, fields: [], isLoading: false, error: null }));
      }
      return;
    }
    if (isRefetch) {
      setState((s) => ({ ...s, isLoading: true, error: null }));
    }
    
    try {
      const result = ownerId
        ? await customFieldsContainer.customFieldValueRepository.getValues(entityTypeKey, ownerId)
        : await customFieldsContainer.customFieldValueRepository.getDefinitions(entityTypeKey);
      setState((s) => ({ ...s, fields: result, isLoading: false }));
    } catch (err) {
      setState((s) => ({ ...s, error: err instanceof Error ? err : new Error(String(err)), isLoading: false }));
    }
  }, [entityTypeKey, ownerId]);

  useEffect(() => {
    void fetchFields(false);
  }, [fetchFields]);

  const saveValues = useCallback(
    async (values: Record<string, unknown>) => {
      if (!entityTypeKey) {
        throw new Error("saveValues requires a non-empty entityTypeKey.");
      }
      if (!ownerId) {
        throw new Error("saveValues requires an ownerId; the record must exist first.");
      }
      await customFieldsContainer.customFieldValueRepository.saveValues(
        entityTypeKey,
        ownerId,
        values
      );
    },
    [entityTypeKey, ownerId]
  );

  return { 
    fields: state.fields, 
    isLoading: state.isLoading, 
    error: state.error, 
    saveValues, 
    refetch: () => fetchFields(true) 
  };
}
