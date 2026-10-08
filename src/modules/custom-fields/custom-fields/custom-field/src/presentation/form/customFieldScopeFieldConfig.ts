import type { FieldConfig } from "@core/ui/forms/generic-form";

/**
 * Documentation for boolean
 */
export type CustomFieldCreationScope = "global" | "platformOnly" | "tenant" | boolean;

/**
 * Documentation for "scope"
 */
export const CUSTOM_FIELD_SCOPE_FIELD_NAME = "scope";

/**
 * Builds the one scope control shared by the standalone definitions page and
 * inline host-form drawers.
 *
 * For Platform SuperAdmins (outside tenant context):
 * - Renders a clean Switch "Global (all tenants)" allowing SuperAdmin to choose
 *   whether the definition is global across all tenants or platform-only.
 *
 * For Tenant context:
 * - Hidden from the form (`isVisible: () => false`) so tenant users are not
 *   confused by a disabled dummy dropdown with no selectable choices.
 */
export function buildCustomFieldScopeField({
  t,
  isPlatformContext,
}: {
  t: (key: string) => string;
  isPlatformContext: boolean;
}): FieldConfig {
  if (!isPlatformContext) {
    return {
      name: CUSTOM_FIELD_SCOPE_FIELD_NAME,
      type: "hidden",
      defaultValue: "tenant",
      isVisible: () => false,
    };
  }

  return {
    name: CUSTOM_FIELD_SCOPE_FIELD_NAME,
    label: t("customField.fields.isGlobal"),
    type: "switch",
    description: t("customField.isGlobalDescription.platformContext") || t("customField.scopeDescription.platform"),
    isVisible: () => true,
  };
}

/** Platform-only is default (false for isGlobal switch); Tenant is "tenant" */
export function getInitialCustomFieldScope(isPlatformContext: boolean): CustomFieldCreationScope {
  return isPlatformContext ? false : "tenant";
}

/**
 * Removes UI-only scope state and maps the explicit platform choice to the
 * request property the backend already accepts. Tenant-scoped authors always
 * submit false; the backend remains the authorization boundary.
 */
export function normalizeCustomFieldCreateScope(
  data: Record<string, unknown>
): Record<string, unknown> {
  const { [CUSTOM_FIELD_SCOPE_FIELD_NAME]: scope, isGlobal: rawIsGlobal, ...request } = data;
  let isGlobal = false;
  if (typeof scope === "boolean") {
    isGlobal = scope;
  } else if (scope === "global") {
    isGlobal = true;
  } else if (typeof rawIsGlobal === "boolean") {
    isGlobal = rawIsGlobal;
  }

  return {
    ...request,
    isGlobal,
  };
}

