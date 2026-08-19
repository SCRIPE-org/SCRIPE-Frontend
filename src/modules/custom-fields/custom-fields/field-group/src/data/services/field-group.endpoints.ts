import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * FieldGroupsController routes (Wave 5 row 5.2).
 *
 * Note REORDER is a sibling of the collection, not `{id}/reorder`: it takes
 * the full reordered set in one call. It is declared BEFORE any `{id}` route
 * would match it on the server ([HttpPut("reorder")] is a literal segment), so
 * there is no id/verb ambiguity to work around here.
 */
export const FIELD_GROUP_ENDPOINTS = {
  LIST: `${V1}/custom-fields/field-groups`,
  CREATE: `${V1}/custom-fields/field-groups`,
  UPDATE: (id: string) => `${V1}/custom-fields/field-groups/${id}`,
  DELETE: (id: string) => `${V1}/custom-fields/field-groups/${id}`,
  REORDER: `${V1}/custom-fields/field-groups/reorder`,
} as const;
