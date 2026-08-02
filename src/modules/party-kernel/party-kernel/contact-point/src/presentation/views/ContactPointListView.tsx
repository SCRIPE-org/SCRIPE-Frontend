/**
 * ContactPoint List View
 *
 * Pure UI component for displaying ContactPoint list with CRUD.
 * Uses GenericCrudView for standard CRUD table UI.
 */
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useContactPointViewModel } from "../viewmodels/useContactPointViewModel";
import type { ContactPoint } from "../../domain/entities/ContactPoint";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { resolveIntlLocale } from "@core/common/utils";

// ContactPointType (backend enum, serialized as its string name): Email, Phone, Fax, Other.
// Colour is a light categorical read, not a status signal — unrecognized values still
// render (outline fallback) instead of disappearing.
const TYPE_BADGE_VARIANT: Record<string, "info" | "success" | "secondary" | "outline"> = {
  Email: "info",
  Phone: "success",
  Fax: "secondary",
  Other: "outline",
};

// Party IDs are raw GUIDs with no denormalized name on this entity (or on the backend
// DTO) to fall back to — shorten for table legibility, keep the full value in a tooltip.
function shortId(id: string | undefined): string {
  if (!id) return "-";
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

// P5.4: React.memo prevents unnecessary re-renders
export const ContactPointListView = React.memo(function ContactPointListView() {
  useModuleLocales(() => import("../../../locales"), "party-kernel.contactPoint");
  const { vm } = useContactPointViewModel();
  const { t, language } = useI18n();

  const TYPE_OPTIONS = [
    { value: "Email", label: t("contactPoint.types.Email") },
    { value: "Phone", label: t("contactPoint.types.Phone") },
    { value: "Fax", label: t("contactPoint.types.Fax") },
    { value: "Other", label: t("contactPoint.types.Other") },
  ];

  const config: CrudConfig<ContactPoint> = {
    titleKey: "contactPoint.title",
    subtitleKey: "contactPoint.description",
    resource: "contact-points",
    columns: [
      {
        key: "partyId",
        label: t("contactPoint.columns.partyId"),
        sortable: true,
        render: (value: string) => (
          <span className="font-mono text-xs" title={value}>
            {shortId(value)}
          </span>
        ),
      },
      {
        key: "type",
        label: t("contactPoint.columns.type"),
        sortable: true,
        render: (value: string) => (
          <Badge variant={TYPE_BADGE_VARIANT[value] ?? "outline"}>
            {t(`contactPoint.types.${value}`) || value}
          </Badge>
        ),
      },
      {
        key: "value",
        label: t("contactPoint.columns.value"),
        sortable: true,
      },
      {
        key: "isPrimary",
        label: t("contactPoint.columns.isPrimary"),
        sortable: true,
        render: (value: boolean) => (
          <Badge variant={value ? "active" : "inactive"}>
            {value ? t("contactPoint.badges.primary") : t("contactPoint.badges.secondary")}
          </Badge>
        ),
      },
      {
        key: "createdAt",
        label: t("contactPoint.columns.createdAt"),
        render: (value: string) =>
          value ? new Date(value).toLocaleDateString(resolveIntlLocale(language)) : "-",
      },
    ],
    createFields: [
      {
        name: "partyId",
        label: t("contactPoint.form.partyId"),
        type: "text" as const,
        placeholder: t("contactPoint.form.partyIdPlaceholder"),
        required: true,
      },
      {
        name: "type",
        label: t("contactPoint.form.type"),
        type: "select" as const,
        options: TYPE_OPTIONS,
        placeholder: t("contactPoint.form.typePlaceholder"),
        required: true,
      },
      {
        name: "value",
        label: t("contactPoint.form.value"),
        type: "text" as const,
        placeholder: t("contactPoint.form.valuePlaceholder"),
        required: true,
      },
      {
        name: "isPrimary",
        label: t("contactPoint.form.isPrimary"),
        type: "switch" as const,
        placeholder: t("contactPoint.form.isPrimaryPlaceholder"),
      },
    ],
    editFields: [
      { name: "id", type: "hidden" as const, required: true },
      {
        name: "partyId",
        label: t("contactPoint.form.partyId"),
        type: "text" as const,
        placeholder: t("contactPoint.form.partyIdPlaceholder"),
        required: true,
      },
      {
        name: "type",
        label: t("contactPoint.form.type"),
        type: "select" as const,
        options: TYPE_OPTIONS,
        placeholder: t("contactPoint.form.typePlaceholder"),
        required: true,
      },
      {
        name: "value",
        label: t("contactPoint.form.value"),
        type: "text" as const,
        placeholder: t("contactPoint.form.valuePlaceholder"),
        required: true,
      },
      {
        name: "isPrimary",
        label: t("contactPoint.form.isPrimary"),
        type: "switch" as const,
        placeholder: t("contactPoint.form.isPrimaryPlaceholder"),
      },
    ],
    createInitialValues: {
      partyId: "",
      type: "",
      value: "",
      isPrimary: false,
    },
    editInitialValues: (item: ContactPoint) => ({
      id: item.id,
      partyId: item.partyId,
      type: item.type,
      value: item.value,
      isPrimary: item.isPrimary,
    }),
    getItemDisplayName: (item: ContactPoint) =>
      item.type && item.value ? `${item.type}: ${item.value}` : item.value || item.partyId,
  };

  return <GenericCrudView viewModel={vm} config={config} />;
});
