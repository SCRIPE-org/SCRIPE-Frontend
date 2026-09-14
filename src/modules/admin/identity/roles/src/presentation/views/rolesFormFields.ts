/**
 * rolesFormFields — Form field configurations for creating and editing roles.
 */

import type { FieldConfig } from "@core/ui/forms/generic-form";

/**
 * Returns field definitions for creating a role.
 *
 * @param t Translation function.
 * @returns Array of form field configurations for role creation.
 */
export function getRoleCreateFields(t: (key: string) => string): FieldConfig[] {
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
  ];
}

/**
 * Returns field definitions for updating an existing role.
 *
 * @param t Translation function.
 * @returns Array of form field configurations for role updates.
 */
export function getRoleEditFields(t: (key: string) => string): FieldConfig[] {
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
  ];
}
