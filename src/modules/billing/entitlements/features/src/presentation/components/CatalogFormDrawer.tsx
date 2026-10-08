/**
 * CatalogFormDrawer Component
 *
 * Renders the slide-over drawer containing the dynamic form for creating or editing feature definitions.
 * Configures field definitions for localized display names, modules, value types, default values, and marketing flags.
 */
"use client";

import { DetailSheet, DetailSheetHeader, DetailSheetBody } from "@core/ui/detail-sheet";
import { GenericForm, type FieldConfig } from "@core/ui/forms/generic-form";
import type { Feature } from "../../domain/entities/Feature";

/**
 * Builds the field configuration array for creating a new feature.
 *
 * @param t - Localization translation function.
 * @param modules - Available module identifiers for the module dropdown.
 * @returns Array of field configuration objects.
 */
export function getCreateFields(t: (key: string) => string, modules: string[]): FieldConfig[] {
  return [
    {
      name: "name",
      label: t("entitlements.features.featureName"),
      type: "text",
      required: true,
      placeholder: t("entitlements.features.namePlaceholder"),
      description: t("entitlements.features.featureKeyHelp"),
    },
    {
      name: "module",
      label: t("entitlements.features.module"),
      type: "searchable-select",
      required: true,
      options: modules.map((module) => ({ value: module, label: module })),
    },
    {
      name: "valueType",
      label: t("entitlements.features.valueType"),
      type: "select",
      required: true,
      options: [
        { value: "Boolean", label: t("entitlements.features.boolean") },
        { value: "Numeric", label: t("entitlements.features.numeric") },
        { value: "String", label: t("entitlements.features.string") },
      ],
    },
    {
      name: "defaultValue",
      label: t("entitlements.features.defaultValue"),
      type: "text",
      required: true,
      placeholder: t("entitlements.features.defaultValuePlaceholder"),
      description: t("entitlements.features.defaultValueHelp"),
    },
    {
      name: "displayNameEn",
      label: t("entitlements.features.displayNameEn"),
      type: "text",
    },
    {
      name: "displayNameAr",
      label: t("entitlements.features.displayNameAr"),
      type: "text",
    },
    {
      name: "category",
      label: t("entitlements.features.category"),
      type: "text",
    },
    {
      name: "description",
      label: t("common.description"),
      type: "textarea",
    },
    {
      name: "isMarketingOnly",
      label: t("entitlements.features.marketingOnly"),
      type: "switch",
      defaultValue: false,
      description: t("entitlements.features.marketingOnlyHelp"),
    },
  ];
}

/**
 * Builds the field configuration array for editing an existing feature.
 *
 * @param t - Localization translation function.
 * @param feature - The current feature entity being updated.
 * @returns Array of field configuration objects.
 */
export function getEditFields(t: (key: string) => string, feature: Feature): FieldConfig[] {
  return [
    {
      name: "displayNameEn",
      label: t("entitlements.features.displayNameEn"),
      type: "text",
      defaultValue: feature.displayNameEn ?? "",
    },
    {
      name: "displayNameAr",
      label: t("entitlements.features.displayNameAr"),
      type: "text",
      defaultValue: feature.displayNameAr ?? "",
    },
    {
      name: "defaultValue",
      label: t("entitlements.features.defaultValue"),
      type: "text",
      required: true,
      defaultValue: feature.defaultValue,
      description: t("entitlements.features.defaultValueHelp"),
    },
    {
      name: "category",
      label: t("entitlements.features.category"),
      type: "text",
      defaultValue: feature.category ?? "",
    },
    {
      name: "description",
      label: t("common.description"),
      type: "textarea",
      defaultValue: feature.description ?? "",
    },
    {
      name: "isMarketingOnly",
      label: t("entitlements.features.marketingOnly"),
      type: "switch",
      defaultValue: feature.isMarketingOnly,
      description: t("entitlements.features.marketingOnlyHelp"),
    },
  ];
}

/**
 * Properties for the CatalogFormDrawer component.
 */
export interface CatalogFormDrawerProps {
  /** Whether the detail sheet drawer is open. */
  open: boolean;
  /** Active feature being edited, or null if creating a new feature. */
  activeFeature: Feature | null;
  /** Available module identifiers for the module dropdown. */
  modules: string[];
  /** Localization dictionary lookup function. */
  t: (key: string) => string;
  /** Callback fired when form submission succeeds. */
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  /** Callback fired when the drawer should close. */
  onClose: () => void;
}

/**
 * Renders the create/edit slide-over drawer with dynamic validation and submit states.
 */
export function CatalogFormDrawer({
  open,
  activeFeature,
  modules,
  t,
  onSubmit,
  onClose,
}: CatalogFormDrawerProps) {
  const formFields = activeFeature ? getEditFields(t, activeFeature) : getCreateFields(t, modules);

  return (
    <DetailSheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      title={activeFeature ? t("entitlements.features.edit") : t("entitlements.features.create")}
      description={
        activeFeature ? t("entitlements.features.editDesc") : t("entitlements.features.createDesc")
      }
      width="md"
    >
      <DetailSheetHeader className="pe-12">
        <h2 className="text-lg font-semibold text-nx-ink">
          {activeFeature ? t("entitlements.features.edit") : t("entitlements.features.create")}
        </h2>
        <p className="mt-1 text-sm text-nx-ink-2">
          {activeFeature
            ? t("entitlements.features.editDesc")
            : t("entitlements.features.createDesc")}
        </p>
      </DetailSheetHeader>
      <DetailSheetBody className="px-6 py-5">
        <GenericForm
          key={activeFeature?.id ?? "create-feature"}
          fields={formFields}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </DetailSheetBody>
    </DetailSheet>
  );
}
