/**
 * `CustomFieldsController` definition-export route (Wave 6 row 6.4).
 *
 * `export` is a LITERAL segment on the same collection that serves `{id}`, and it is safe for the
 * same reason `field-groups/reorder` and `custom-fields/schema` are: ASP.NET Core route precedence
 * ranks a literal segment above a parameter segment regardless of the order the actions are
 * declared in. Renaming this to something an encrypted id could also spell is what would break it.
 *
 * NOT the same route as `custom-fields/schema`. That one is the PORTABLE JSON bundle and returns a
 * response body; this one is the SPREADSHEET of definitions and returns a `FileContentResult` — an
 * `.xlsx` byte stream. Both are gated on `custom-fields.export`, which is exactly why the two are
 * easy to conflate: the difference is not the permission, it is what comes back.
 */
import { V1 } from "@/core/config/api-endpoints/_shared";

export const DEFINITION_EXPORT_ENDPOINTS = {
  /** `GET /v1/custom-fields/export?entityTypeKey=...` — returns an `.xlsx` file, not JSON. */
  EXPORT: `${V1}/custom-fields/export`,
} as const;

/**
 * The permission both custom-field export routes are gated on — `CustomFieldsPermissionProvider`,
 * resource `custom-fields`, action `export`.
 *
 * Declared here rather than added to the module's `CUSTOM_FIELDS_PERMISSIONS` map because this
 * change's file ownership does not extend to `permission-constants.ts`. The schema submodule
 * declared its own copy for the same reason, so the string now exists in three places — that map is
 * the right home for all of them and folding them in is a one-line follow-up.
 */
export const CUSTOM_FIELDS_EXPORT_PERMISSION = "custom-fields.export";
