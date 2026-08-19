/**
 * useRestrictedFields / useIsFieldRestricted
 *
 * Field-level security, client side. Answers "may the current caller see this
 * field on this resource" so a column is never rendered for a field the server
 * would refuse to send.
 *
 * The restricted-field map arrives on the `/me` response and is held in
 * `useAppStore.restrictedFields` (`Record<resource, fieldName[]>`).
 *
 * @example
 * const isRestricted = useIsFieldRestricted("admins");
 * columns.filter((col) => !isRestricted(col.key));
 */

import { useMemo } from "react";
import { useAppStore } from "@core/store/useAppStore";

const EMPTY: string[] = [];

/**
 * Get the restricted field names for a specific resource, verbatim as configured.
 * Returns a stable empty array if no resource is provided or no restrictions exist.
 *
 * Prefer {@link useIsFieldRestricted} for filtering: comparing these strings
 * yourself invites the case-sensitivity bug described there.
 */
export function useRestrictedFields(resource?: string): string[] {
  const allRestrictedFields = useAppStore((state) => state.restrictedFields);
  return useMemo(() => {
    if (!resource) return EMPTY;
    // The map's KEYS are lowercased server-side when the token data is built
    // (`AdminSecurityService.ExtractTokenData` lowercases the permission resource,
    // and the group-restriction merge lowercases its own key too). Every screen's
    // `resource` string happens to be lowercase today, so an exact-match index
    // works by luck; lowercasing here means one screen declaring `"Admins"` cannot
    // silently make the whole filter inert.
    return allRestrictedFields[resource.toLowerCase()] ?? EMPTY;
  }, [allRestrictedFields, resource]);
}

/**
 * Returns a predicate that reports whether one field name is restricted for this
 * resource. **Case-insensitive**, and that is load-bearing rather than tidy:
 *
 * - the names are typed by hand into a free-text tag input, so `Salary`, `salary`
 *   and `SALARY` all occur in practice;
 * - the server compares them with `OrdinalIgnoreCase` on all three of its
 *   enforcement surfaces (the response middleware, the authorization filter, and
 *   `CustomFieldRestrictionResolver`).
 *
 * A case-SENSITIVE client filter therefore disagrees with the server: an admin who
 * restricts `Salary` gets a column that still renders, against a server that has
 * already stopped sending the value. Nulled cells look like missing data, not like
 * security. The two tiers have to agree.
 *
 * **This predicate is not a substitute for the server's enforcement**, and must
 * never be treated as one — it exists so the UI does not draw a column the server
 * will not fill. One known asymmetry, harmless today: the response middleware also
 * matches dotted paths (`profile.email`), which can never equal a flat column key,
 * so this predicate is structurally blind to that form.
 */
export function useIsFieldRestricted(resource?: string): (fieldName: unknown) => boolean {
  const restrictedFields = useRestrictedFields(resource);

  return useMemo(() => {
    if (restrictedFields.length === 0) {
      // Stable identity for the overwhelmingly common no-restriction case, so a
      // consumer's own useMemo over this predicate is not invalidated per render.
      return NEVER_RESTRICTED;
    }
    const lookup = new Set(restrictedFields.map((name) => name.toLowerCase()));
    // `unknown` rather than `string`: a table Column's key is typed `keyof T`,
    // which widens to string | number | symbol, so callers would otherwise have to
    // cast at every site.
    return (fieldName: unknown) =>
      typeof fieldName === "string" && lookup.has(fieldName.toLowerCase());
  }, [restrictedFields]);
}

const NEVER_RESTRICTED = () => false;
