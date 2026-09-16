import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * FieldGroupsController routes (Wave 5 row 5.2).
 *
 * Note REORDER is a sibling of the collection, not `{id}/reorder`: it takes
 * the full reordered set in one call. There is no id/verb ambiguity to work
 * around here, but NOT because of declaration order -- `[HttpPut("reorder")]`
 * is actually declared AFTER `[HttpPut("{id}")]` in `FieldGroupsController`.
 * What protects it is ASP.NET Core route precedence: a literal segment always
 * outranks a parameter segment regardless of the order the actions appear in.
 * Reordering the actions in that controller is therefore safe; renaming this
 * route to something a `{id}` value could also be is not.
 */
export const FIELD_GROUP_ENDPOINTS = {
  LIST: `${V1}/custom-fields/field-groups`,
  CREATE: `${V1}/custom-fields/field-groups`,
  UPDATE: (id: string) => `${V1}/custom-fields/field-groups/${id}`,
  DELETE: (id: string) => `${V1}/custom-fields/field-groups/${id}`,
  REORDER: `${V1}/custom-fields/field-groups/reorder`,
} as const;
