/**
 * useRestrictedFields Hook
 *
 * Returns the list of restricted field names for a given resource.
 * Used by GenericCrudView to hide columns that the current user's role
 * is not allowed to see.
 *
 * @example
 * const restrictedFields = useRestrictedFields("admins");
 * // Returns ["email", "phoneNumber"] if those fields are restricted
 */

import { useMemo } from "react";
import { useAppStore } from "@core/store/useAppStore";

const EMPTY: string[] = [];

/**
 * Get the restricted field names for a specific resource.
 * Returns a stable empty array if no resource is provided or no restrictions exist.
 */
export function useRestrictedFields(resource?: string): string[] {
  const allRestrictedFields = useAppStore((state) => state.restrictedFields);
  return useMemo(() => {
    if (!resource) return EMPTY;
    return allRestrictedFields[resource] ?? EMPTY;
  }, [allRestrictedFields, resource]);
}
