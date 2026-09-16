/**
 * `CustomFieldValuesController` value-export route (Wave 6 row 6.4's completion).
 *
 * `{entityTypeKey}/export` is a LITERAL trailing segment on the same collection that serves
 * `{entityTypeKey}/{ownerId}` and `{entityTypeKey}/bulk` — safe for the same route-precedence reason
 * `custom-fields/export` and `custom-fields/schema` are on the definitions controller: ASP.NET Core
 * ranks a literal segment above a parameter segment regardless of declaration order.
 *
 * NOT the same controller as the definitions/schema exports. `CustomFieldsController`'s two export
 * routes are gated on the single admin permission `custom-fields.export`; this one is gated on
 * `{PermissionResource}.view` for whichever entity type the caller names, resolved per request —
 * there is no static permission string for this route, which is why this file (unlike its
 * `definition-export` and `schema` siblings) declares none.
 */
import { V1 } from "@/core/config/api-endpoints/_shared";

export const VALUE_EXPORT_ENDPOINTS = {
  /** `GET /v1/custom-fields/values/{entityTypeKey}/export` — returns an `.xlsx` file, not JSON. */
  EXPORT: (entityTypeKey: string) => `${V1}/custom-fields/values/${entityTypeKey}/export`,
} as const;
