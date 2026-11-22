/**
 * rolesFormFields — Form field configurations for creating and editing roles,
 * including structured Landing Policy configuration (`defaultLandingTarget` & `isLandingEnforced`).
 */

import {
  buildStructuredLandingTargetOptions,
  canEnforceLandingTarget,
  type LandingTargetCatalog,
  type NavigationData,
  type WorkspaceGroup,
} from "@core/navigation";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import type { Role } from "../../domain/entities/Role";

/**
 * Context passed into `getRoleLandingFields` to render scope-filtered startup landing options.
 */
export interface RoleLandingFieldsContext {
  language?: string;
  workspaceGroups?: WorkspaceGroup[];
  cachedWorkspaces?: Map<string, NavigationData>;
  catalog?: LandingTargetCatalog | null;
  isCatalogLoading?: boolean;
  isTenantRole?: boolean;
  isSystemRole?: boolean;
  currentTarget?: string | null;
}

/**
 * Builds the Role Landing Policy fields (`defaultLandingTarget`, `isLandingEnforced`,
 * and hidden `rowVersion` concurrency token for edits).
 */
export function getRoleLandingFields(
  t: (key: string) => string,
  context: RoleLandingFieldsContext = {},
  includeRowVersion = false
): FieldConfig[] {
  const {
    language = "en",
    workspaceGroups = [],
    cachedWorkspaces,
    catalog = null,
    isCatalogLoading = false,
    isTenantRole = false,
    isSystemRole = false,
    currentTarget = null,
  } = context;

  const targetOptions = buildStructuredLandingTargetOptions({
    language,
    workspaceGroups,
    cachedWorkspaces,
    catalog,
    scopeMode: isTenantRole ? "tenant_role" : "platform_role",
    currentTarget,
    labels: {
      defaultLabel: t("roles.landingTargetDefault"),
      overviewLabel: t("roles.landingTargetOverview"),
      hubLabel: t("roles.landingTargetHub"),
      workspacePrefix: t("roles.landingTargetWorkspacePrefix"),
      menuPrefix: t("roles.landingTargetMenuPrefix"),
      unavailablePageLabel: t("roles.landingTargetUnavailablePage"),
      systemGroupLabel: t("roles.landingTargetSystemGroup"),
    },
  });

  const fields: FieldConfig[] = [
    {
      name: "defaultLandingTarget",
      label: t("roles.defaultLandingTarget"),
      type: "grouped-select",
      options: targetOptions,
      defaultValue: "default",
      placeholder: t("roles.defaultLandingTargetPlaceholder"),
      searchPlaceholder: t("roles.landingTargetSearchPlaceholder"),
      noResultsText: t("roles.landingTargetNoResults"),
      loading: isCatalogLoading,
      disabled: isSystemRole,
      description: isSystemRole
        ? t("roles.landingTargetSystemLocked")
        : t("roles.defaultLandingTargetHint"),
      onChange: (value) => {
        if (!canEnforceLandingTarget(value)) {
          return { isLandingEnforced: false };
        }
      },
    },
    {
      name: "isLandingEnforced",
      label: t("roles.isLandingEnforced"),
      type: "switch",
      defaultValue: false,
      disabled: (formData) =>
        isSystemRole || !canEnforceLandingTarget(formData.defaultLandingTarget),
      description: t("roles.isLandingEnforcedHint"),
    },
  ];

  if (includeRowVersion) {
    fields.push({
      name: "rowVersion",
      type: "hidden",
    });
  }

  return fields;
}

/** Builds initial form values for editing an existing `Role`, preserving `rowVersion`. */
export function getRoleEditInitialValues(role: Role): Record<string, unknown> {
  return {
    nameEn: role.nameEn,
    nameAr: role.nameAr,
    descriptionEn: role.descriptionEn ?? "",
    descriptionAr: role.descriptionAr ?? "",
    priority: role.priority,
    defaultLandingTarget: role.defaultLandingTarget || "default",
    isLandingEnforced: Boolean(role.isLandingEnforced),
    rowVersion: role.rowVersion ?? undefined,
  };
}

/**
 * Returns field definitions for creating a role.
 */
export function getRoleCreateFields(
  t: (key: string) => string,
  context: RoleLandingFieldsContext = {}
): FieldConfig[] {
  return [
    {
      name: "nameEn",
      label: t("roles.nameEn"),
      type: "text",
      required: true,
      placeholder: t("roles.namePlaceholder"),
    },
    {
      name: "nameAr",
      label: t("roles.nameAr"),
      type: "text",
      required: true,
      placeholder: t("roles.nameArPlaceholder"),
    },
    {
      name: "code",
      label: t("roles.code"),
      type: "text",
      required: true,
      placeholder: t("roles.codePlaceholder"),
      description: t("roles.codeHint"),
    },
    {
      name: "descriptionEn",
      label: t("roles.descriptionEn"),
      type: "textarea",
      placeholder: t("roles.descriptionPlaceholder"),
    },
    {
      name: "descriptionAr",
      label: t("roles.descriptionAr"),
      type: "textarea",
      placeholder: t("roles.descriptionArPlaceholder"),
    },
    {
      name: "priority",
      label: t("roles.priority"),
      type: "number",
      defaultValue: 100,
      description: t("roles.priorityHint"),
    },
    ...getRoleLandingFields(t, context, false),
  ];
}

/**
 * Returns field definitions for updating an existing role.
 */
export function getRoleEditFields(
  t: (key: string) => string,
  context: RoleLandingFieldsContext = {}
): FieldConfig[] {
  return [
    {
      name: "nameEn",
      label: t("roles.nameEn"),
      type: "text",
      required: true,
    },
    {
      name: "nameAr",
      label: t("roles.nameAr"),
      type: "text",
      required: true,
    },
    {
      name: "descriptionEn",
      label: t("roles.descriptionEn"),
      type: "textarea",
    },
    {
      name: "descriptionAr",
      label: t("roles.descriptionAr"),
      type: "textarea",
    },
    {
      name: "priority",
      label: t("roles.priority"),
      type: "number",
      description: t("roles.priorityHint"),
    },
    ...getRoleLandingFields(t, context, true),
  ];
}
