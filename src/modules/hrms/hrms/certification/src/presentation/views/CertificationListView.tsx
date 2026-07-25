/**
 * Certification List View
 *
 * Pure UI component for displaying Certification list with CRUD.
 * Uses GenericCrudView for standard CRUD table UI.
 */
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useCertificationViewModel } from "../viewmodels/useCertificationViewModel";
import type { Certification } from "../../domain/entities/Certification";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { resolveIntlLocale } from "@core/common/utils";

// P5.4: React.memo prevents unnecessary re-renders
export const CertificationListView = React.memo(function CertificationListView() {
  useModuleLocales(() => import("../../../locales"), "hrms");
  const { vm } = useCertificationViewModel();
  const { t, language } = useI18n();
  const locale = resolveIntlLocale(language);

  const config: CrudConfig<Certification> = {
    titleKey: "certification.title",
    subtitleKey: "certification.description",
    resource: "certifications",
    columns: [
      {
        key: "name",
        label: t("certification.fields.name"),
        sortable: true,
      },
      {
        key: "issuer",
        label: t("certification.fields.issuer"),
        sortable: true,
      },
      {
        key: "staffMemberId",
        label: t("certification.fields.staffMemberId"),
        sortable: true,
      },
      {
        key: "issuedOn",
        label: t("certification.fields.issuedOn"),
        render: (value: string) => (value ? new Date(value).toLocaleDateString(locale) : "-"),
        sortable: true,
      },
      {
        key: "expiresOn",
        label: t("certification.fields.expiresOn"),
        render: (value: string) => (value ? new Date(value).toLocaleDateString(locale) : "-"),
        sortable: true,
      },
      {
        key: "createdAt",
        label: t("common.createdAt"),
        render: (value: string) => (value ? new Date(value).toLocaleDateString(locale) : "-"),
      },
    ],
    createFields: [
      {
        name: "staffMemberId",
        label: t("certification.fields.staffMemberId"),
        type: "text" as const,
        placeholder: t("certification.placeholders.staffMemberId"),
        required: true,
      },
      {
        name: "name",
        label: t("certification.fields.name"),
        type: "text" as const,
        placeholder: t("certification.placeholders.name"),
        required: true,
      },
      {
        name: "issuer",
        label: t("certification.fields.issuer"),
        type: "text" as const,
        placeholder: t("certification.placeholders.issuer"),
      },
      {
        name: "issuedOn",
        label: t("certification.fields.issuedOn"),
        type: "date" as const,
        placeholder: t("certification.placeholders.issuedOn"),
        required: true,
      },
      {
        name: "expiresOn",
        label: t("certification.fields.expiresOn"),
        type: "date" as const,
        placeholder: t("certification.placeholders.expiresOn"),
      },
    ],
    editFields: [
      { name: "id", type: "hidden" as const, required: true },
      {
        name: "staffMemberId",
        label: t("certification.fields.staffMemberId"),
        type: "text" as const,
        placeholder: t("certification.placeholders.staffMemberId"),
        required: true,
      },
      {
        name: "name",
        label: t("certification.fields.name"),
        type: "text" as const,
        placeholder: t("certification.placeholders.name"),
        required: true,
      },
      {
        name: "issuer",
        label: t("certification.fields.issuer"),
        type: "text" as const,
        placeholder: t("certification.placeholders.issuer"),
      },
      {
        name: "issuedOn",
        label: t("certification.fields.issuedOn"),
        type: "date" as const,
        placeholder: t("certification.placeholders.issuedOn"),
        required: true,
      },
      {
        name: "expiresOn",
        label: t("certification.fields.expiresOn"),
        type: "date" as const,
        placeholder: t("certification.placeholders.expiresOn"),
      },
    ],
    createInitialValues: {
      staffMemberId: "",
      name: "",
      issuer: "",
      issuedOn: "",
      expiresOn: "",
    },
    editInitialValues: (item: Certification) => ({
      id: item.id,
      staffMemberId: item.staffMemberId,
      name: item.name,
      issuer: item.issuer,
      issuedOn: item.issuedOn,
      expiresOn: item.expiresOn,
    }),
    getItemDisplayName: (item: Certification) => item.name,
  };

  return <GenericCrudView viewModel={vm} config={config} />;
});
