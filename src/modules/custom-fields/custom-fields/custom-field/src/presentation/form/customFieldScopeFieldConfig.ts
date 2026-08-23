import type { FieldConfig } from "@core/ui/forms/generic-form";

export type CustomFieldCreationScope = "global" | "platformOnly" | "tenant";

export const CUSTOM_FIELD_SCOPE_FIELD_NAME = "scope";

/**
 * Builds the one scope control shared by the standalone definitions page and
 * inline host-form drawers. The API never trusts this value: it is normalized
 * to the existing isGlobal request flag and the server re-derives ownership
 * from the authenticated tenant context.
 */
export function buildCustomFieldScopeField({
  t,
  isPlatformContext,
}: {
  t: (key: string) => string;
  isPlatformContext: boolean;
}): FieldConfig {
  const options = isPlatformContext
    ? [
        { value: "global", label: t("customField.scopeOptions.global") },
        { value: "platformOnly", label: t("customField.scopeOptions.platformOnly") },
      ]
    : [{ value: "tenant", label: t("customField.scopeOptions.tenant") }];

  return {
    name: CUSTOM_FIELD_SCOPE_FIELD_NAME,
    label: t("customField.fields.scope"),
    type: "select",
    options,
    required: isPlatformContext,
    disabled: !isPlatformContext,
    description: isPlatformContext
      ? t("customField.scopeDescription.platform")
      : t("customField.scopeDescription.tenant"),
  };
}

/** Platform-only is safe by default; Global requires an affirmative choice. */
export function getInitialCustomFieldScope(isPlatformContext: boolean): CustomFieldCreationScope {
  return isPlatformContext ? "platformOnly" : "tenant";
}

/**
 * Removes UI-only scope state and maps the explicit platform choice to the
 * request property the backend already accepts. Tenant-scoped authors always
 * submit false; the backend remains the authorization boundary.
 */
export function normalizeCustomFieldCreateScope(
  data: Record<string, unknown>
): Record<string, unknown> {
  const { [CUSTOM_FIELD_SCOPE_FIELD_NAME]: scope, ...request } = data;
  return {
    ...request,
    isGlobal: scope === "global",
  };
}
