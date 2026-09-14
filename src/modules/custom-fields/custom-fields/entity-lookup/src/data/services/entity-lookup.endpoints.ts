import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * EntityLookupController routes (Wave 4 — EntityReference / UserReference).
 *
 * NOT under `/custom-fields/...` like every sibling in this module, and that is deliberate on the
 * server: `EntityLookupController` is a separate controller precisely because these endpoints read
 * OTHER modules' data and are gated on the target entity type's own `view` permission, not on
 * `custom-fields.view`. Renaming this prefix to match the module's other routes would put the paths
 * back in the family whose permission story does not apply to them.
 *
 * TYPES is a literal sibling of the `{entityTypeKey}` parameter route, so `GET /entity-lookup/types`
 * reaches `GetAvailableTypes` rather than searching an entity type called "types". ASP.NET Core
 * route precedence puts a literal segment ahead of a parameter segment regardless of declaration
 * order, so this is safe today — but it does mean no entity type may ever be registered under the
 * key `types`, since its search route would be permanently shadowed.
 *
 * Neither path segment is URL-encoded, for two separate reasons worth recording rather than
 * rediscovering:
 *  - `entityTypeKey` is a registry key of the form `hrms.staff-member` — dots and hyphens only.
 *  - `encryptedId` is URL-SAFE base64 with the padding stripped (`IdEncryptionService.ToUrlSafeBase64`
 *    maps `+`/`/` to `-`/`_` and trims `=`), so it contains nothing a path segment would mangle.
 *    Encoding it anyway would be harmless, but asserting the raw form in tests documents the
 *    guarantee we depend on: any future change to the id encoding that reintroduces `/` breaks this
 *    route, not just its readability.
 */
export const ENTITY_LOOKUP_ENDPOINTS = {
  TYPES: `${V1}/entity-lookup/types`,
  SEARCH: (entityTypeKey: string) => `${V1}/entity-lookup/${entityTypeKey}`,
  RESOLVE: (entityTypeKey: string, encryptedId: string) =>
    `${V1}/entity-lookup/${entityTypeKey}/${encryptedId}`,
} as const;
