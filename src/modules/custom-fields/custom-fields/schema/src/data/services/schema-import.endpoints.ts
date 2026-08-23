import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * `CustomFieldsController` schema-import route (Wave 6 row 6.5's import half).
 *
 * A SEPARATE endpoints file from `schema-export.endpoints.ts` beside it, rather than an added
 * constant in that one -- the export route is gated on `custom-fields.export`, a single permission
 * this file's own constant already duplicates for its own reasons; the import route needs TWO
 * different permissions (`custom-field-groups.create` and `custom-fields.create`), and both of
 * those already have one canonical home in this module's shared `permission-constants.ts`
 * (`CUSTOM_FIELDS_PERMISSIONS.FIELD_GROUP_CREATE` / `.CUSTOM_FIELD_CREATE`), so this file declares
 * no permission constant of its own at all.
 */
export const SCHEMA_IMPORT_ENDPOINTS = {
  /** `POST /v1/custom-fields/schema/import` — body is the bundle itself, unwrapped. */
  IMPORT: `${V1}/custom-fields/schema/import`,
} as const;
