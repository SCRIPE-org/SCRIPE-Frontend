import type { FieldConfig } from "@core/ui/forms/generic-form";

export type CustomFieldCreationScope = "global" | "platformOnly" | "tenant";

export const CUSTOM_FIELD_SCOPE_FIELD_NAME = "isGlobal";

/**
 * Builds the isGlobal switch control shared by the standalone definitions page
 * and inline host-form drawers.
 *
 * When in Platform Context (Super Admin without an active tenant):
 *   Renders a Switch for `isGlobal`.
 *   - Checked (true): Global across all tenants
 *   - Unchecked (false): Platform records only
 *
 * When in Tenant Context (managing custom fields for a specific tenant):
 *   The switch is completely HIDDEN from the form, because definitions created
 *   inside a tenant are automatically scoped to that tenant only.
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
      isVisible: () => false,
      defaultValue: false,
    };
  }

  return {
    name: CUSTOM_FIELD_SCOPE_FIELD_NAME,
    label: t("customField.fields.isGlobal"),
    type: "switch",
    description: t("customField.hints.isGlobal") || t("customField.scopeDescription.platform"),
    isVisible: () => true,
  };
}

/** Default is false (platform-only in platform context; tenant-only in tenant context). */
export function getInitialCustomFieldScope(_isPlatformContext: boolean): boolean {
  return false;
}

/**
 * Normalizes form state to ensure isGlobal boolean is cleanly extracted and submitted.
 */
export function normalizeCustomFieldCreateScope(
  data: Record<string, unknown>
): Record<string, unknown> {
  const { scope, ...request } = data;
  const isGlobal = Boolean(data.isGlobal ?? (scope === "global"));
  return {
    ...request,
    isGlobal,
  };
}

