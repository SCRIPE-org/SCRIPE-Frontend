/**
 * Scope vocabulary — one reading of a stored scope value for the whole surface.
 *
 * The matrix cell, the flat row and the config dialog all have to name the SAME
 * stored value; when each did its own mapping they drifted (one showed the raw
 * "Tenant" seed value, another showed "Default"). Introduces ZERO locale keys —
 * every branch resolves an existing `role.*` label.
 *
 * @module roles/presentation/components
 */

/** Scopes an operator explicitly picked. The seed default ("Tenant") is NOT one. */
export const EXPLICIT_SCOPES = new Set(["own", "own_tenant", "hierarchy", "all_tenants"]);

/** Map a stored scope value to an existing locale label (no new keys). */
export function scopeLabel(t: (key: string) => string, scope?: string | null): string {
  switch (scope) {
    case "own":
      return t("role.scopeOwn");
    case "own_tenant":
      return t("role.scopeOwnTenant");
    case "hierarchy":
      return t("role.scopeHierarchy");
    case "all_tenants":
      return t("role.scopeAllTenants");
    case "Tenant":
    case "tenant":
      return t("role.scopeTenant");
    default:
      return t("role.scopeDefault");
  }
}
