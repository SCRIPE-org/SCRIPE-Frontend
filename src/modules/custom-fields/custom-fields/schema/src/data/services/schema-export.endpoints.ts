import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * `CustomFieldsController` schema-export route (Wave 6 row 6.5).
 *
 * `schema` is a LITERAL segment on the same collection that serves `{id}`, and it is safe for the
 * same reason `field-groups/reorder` is: ASP.NET Core route precedence ranks a literal segment above
 * a parameter segment regardless of the order the actions are declared in. Renaming this to
 * something an encrypted id could also spell is what would break it.
 *
 * NOT the same route as `custom-fields/export`. That one is the spreadsheet export of DEFINITIONS
 * and returns a file; this one returns a portable JSON bundle. Both are gated on
 * `custom-fields.export`, which is why the two are easy to conflate.
 */
export const SCHEMA_EXPORT_ENDPOINTS = {
  SCHEMA: `${V1}/custom-fields/schema`,
} as const;

/**
 * The permission both custom-field export routes are gated on — `CustomFieldsPermissionProvider`,
 * resource `custom-fields`, action `export`.
 *
 * Declared here rather than added to the module's `CUSTOM_FIELDS_PERMISSIONS` map because this
 * change's file ownership does not extend to `permission-constants.ts`. Folding it into that map is
 * a one-line follow-up and the right home for it.
 */
export const CUSTOM_FIELDS_EXPORT_PERMISSION = "custom-fields.export";
