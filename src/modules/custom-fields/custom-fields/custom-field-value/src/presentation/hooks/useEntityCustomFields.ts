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
  const [fields, setFields] = useState<EntityCustomFieldValueData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFields = useCallback(async () => {
    if (!entityTypeKey) {
      setFields([]);
      setIsLoading(false);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = ownerId
        ? await customFieldsContainer.customFieldValueRepository.getValues(entityTypeKey, ownerId)
        : await customFieldsContainer.customFieldValueRepository.getDefinitions(entityTypeKey);
      setFields(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [entityTypeKey, ownerId]);

  useEffect(() => {
    void fetchFields();
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

  return { fields, isLoading, error, saveValues, refetch: fetchFields };
}
