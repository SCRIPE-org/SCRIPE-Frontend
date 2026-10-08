/**
 * PartyRole List View
 *
 * Pure UI component for displaying PartyRole list with CRUD.
 * Uses GenericCrudView for standard CRUD table UI.
 */
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { Pencil, Trash2 } from "lucide-react";
import { usePartyRoleViewModel } from "../viewmodels/usePartyRoleViewModel";
import type { PartyRole } from "../../domain/entities/PartyRole";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { resolveIntlLocale } from "@core/common/utils";

// PartyRoleType (backend enum, serialized as its string name): Customer, Booker, Payer,
// Partner, Vendor, AcademyOrganization.
const TYPE_BADGE_VARIANT: Record<string, "secondary" | "info" | "success"> = {
  Customer: "secondary",
  Booker: "info",
  Payer: "success",
  Partner: "secondary",
  Vendor: "secondary",
  AcademyOrganization: "info",
};

// The party this role belongs to is a raw GUID — neither this entity nor the backend
// DTO carries a denormalized party name, so a shortened, tooltip-bearing id is the most
// identifying value available. Full id is always in the title attribute.
function shortId(id: string | undefined): string {
  if (!id) return "-";
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

// P5.4: React.memo prevents unnecessary re-renders
/**
 * Documentation for module export
 */
export const PartyRoleListView = React.memo(function PartyRoleListView() {
  useModuleLocales(() => import("../../../locales"), "party-kernel.partyRole");
  const { vm } = usePartyRoleViewModel();
  const { t, language } = useI18n();

  const TYPE_OPTIONS = [
    { value: "Customer", label: t("partyRole.types.Customer") },
    { value: "Booker", label: t("partyRole.types.Booker") },
    { value: "Payer", label: t("partyRole.types.Payer") },
    { value: "Partner", label: t("partyRole.types.Partner") },
    { value: "Vendor", label: t("partyRole.types.Vendor") },
    { value: "AcademyOrganization", label: t("partyRole.types.AcademyOrganization") },
  ];

  const config: CrudConfig<PartyRole> = {
    titleKey: "partyRole.title",
    subtitleKey: "partyRole.description",
    resource: "party-roles",
    entityTypeKey: "party.role",
    columns: [
      {
        key: "partyId",
        label: t("partyRole.columns.partyId"),
        sortable: true,
        render: (value: string) => (
          <span className="font-mono text-xs" title={value}>
            {shortId(value)}
          </span>
        ),
      },
      {
        key: "roleType",
        label: t("partyRole.columns.roleType"),
        sortable: true,
        render: (value: string) => (
          <Badge variant={TYPE_BADGE_VARIANT[value] ?? "secondary"}>
            {t(`partyRole.types.${value}`) || value}
          </Badge>
        ),
      },
      {
        key: "createdAt",
        label: t("partyRole.columns.createdAt"),
        render: (value: string) =>
          value ? new Date(value).toLocaleDateString(resolveIntlLocale(language)) : "-",
      },
    ],
    createFields: [
      {
        name: "partyId",
        label: t("partyRole.form.partyId"),
        type: "text" as const,
        placeholder: t("partyRole.form.partyIdPlaceholder"),
        required: true,
      },
      {
        name: "roleType",
        label: t("partyRole.form.roleType"),
        type: "select" as const,
        options: TYPE_OPTIONS,
        placeholder: t("partyRole.form.roleTypePlaceholder"),
        required: true,
      },
    ],
    editFields: [
      { name: "id", type: "hidden" as const, required: true },
      {
        name: "partyId",
        label: t("partyRole.form.partyId"),
        type: "text" as const,
        placeholder: t("partyRole.form.partyIdPlaceholder"),
        required: true,
      },
      {
        name: "roleType",
        label: t("partyRole.form.roleType"),
        type: "select" as const,
        options: TYPE_OPTIONS,
        placeholder: t("partyRole.form.roleTypePlaceholder"),
        required: true,
      },
    ],
    createInitialValues: {
      partyId: "",
      roleType: "",
    },
    editInitialValues: (item: PartyRole) => ({
      id: item.id,
      partyId: item.partyId,
      roleType: item.roleType,
    }),
    getItemDisplayName: (item: PartyRole) =>
      `${t(`partyRole.types.${item.roleType}`) || item.roleType} — ${shortId(item.partyId)}`,
    deleteService: (id: string) => vm.deleteItem(id),
    getActions: (_vmInstance, tFn, handleDeleteFn): CrudAction<PartyRole>[] => [
      {
        label: tFn("common.edit"),
        onClick: (item: PartyRole) => vm.openEditModal(item),
        variant: "ghost" as const,
        icon: <Pencil className="h-4 w-4" />,
      },
      {
        label: tFn("common.delete"),
        onClick: (item: PartyRole) => handleDeleteFn?.(item),
        variant: "ghost" as const,
        className: "text-destructive hover:text-destructive/80",
        icon: <Trash2 className="h-4 w-4" />,
      },
    ],
  };

  return <GenericCrudView viewModel={vm} config={config} />;
});
