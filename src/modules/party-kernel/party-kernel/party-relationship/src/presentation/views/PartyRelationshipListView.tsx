/**
 * PartyRelationship List View
 *
 * Pure UI component for displaying PartyRelationship list with CRUD.
 * Uses GenericCrudView for standard CRUD table UI.
 */
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { usePartyRelationshipViewModel } from "../viewmodels/usePartyRelationshipViewModel";
import type { PartyRelationship } from "../../domain/entities/PartyRelationship";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";

// PartyRelationshipType (backend enum, serialized as its string name): Guardian,
// EmergencyContact.
const TYPE_BADGE_VARIANT: Record<string, "info" | "warning"> = {
  Guardian: "info",
  EmergencyContact: "warning",
};

// The two linked parties are raw GUIDs — neither this entity nor the backend DTO carries
// a denormalized name for either side, so a shortened, tooltip-bearing id is the most
// identifying value available. Full ids are always in the title attribute.
function shortId(id: string | undefined): string {
  if (!id) return "-";
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

// P5.4: React.memo prevents unnecessary re-renders
export const PartyRelationshipListView = React.memo(function PartyRelationshipListView() {
  useModuleLocales(() => import("../../../locales"), "party-kernel.partyRelationship");
  const { vm } = usePartyRelationshipViewModel();
  const { t, language } = useI18n();

  const TYPE_OPTIONS = [
    { value: "Guardian", label: t("partyRelationship.types.Guardian") },
    { value: "EmergencyContact", label: t("partyRelationship.types.EmergencyContact") },
  ];

  const config: CrudConfig<PartyRelationship> = {
    titleKey: "partyRelationship.title",
    subtitleKey: "partyRelationship.description",
    resource: "party-relationships",
    columns: [
      {
        key: "sourcePartyId",
        label: t("partyRelationship.columns.sourcePartyId"),
        sortable: true,
        render: (value: string) => (
          <span className="font-mono text-xs" title={value}>
            {shortId(value)}
          </span>
        ),
      },
      {
        key: "targetPartyId",
        label: t("partyRelationship.columns.targetPartyId"),
        sortable: true,
        render: (value: string) => (
          <span className="font-mono text-xs" title={value}>
            {shortId(value)}
          </span>
        ),
      },
      {
        key: "relationshipType",
        label: t("partyRelationship.columns.relationshipType"),
        sortable: true,
        render: (value: string) => (
          <Badge variant={TYPE_BADGE_VARIANT[value] ?? "secondary"}>
            {t(`partyRelationship.types.${value}`) || value}
          </Badge>
        ),
      },
      {
        key: "createdAt",
        label: t("partyRelationship.columns.createdAt"),
        render: (value: string) =>
          value
            ? new Date(value).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")
            : "-",
      },
    ],
    createFields: [
      {
        name: "sourcePartyId",
        label: t("partyRelationship.form.sourcePartyId"),
        type: "text" as const,
        placeholder: t("partyRelationship.form.sourcePartyIdPlaceholder"),
        required: true,
      },
      {
        name: "targetPartyId",
        label: t("partyRelationship.form.targetPartyId"),
        type: "text" as const,
        placeholder: t("partyRelationship.form.targetPartyIdPlaceholder"),
        required: true,
      },
      {
        name: "relationshipType",
        label: t("partyRelationship.form.relationshipType"),
        type: "select" as const,
        options: TYPE_OPTIONS,
        placeholder: t("partyRelationship.form.relationshipTypePlaceholder"),
        required: true,
      },
    ],
    editFields: [
      { name: "id", type: "hidden" as const, required: true },
      {
        name: "sourcePartyId",
        label: t("partyRelationship.form.sourcePartyId"),
        type: "text" as const,
        placeholder: t("partyRelationship.form.sourcePartyIdPlaceholder"),
        required: true,
      },
      {
        name: "targetPartyId",
        label: t("partyRelationship.form.targetPartyId"),
        type: "text" as const,
        placeholder: t("partyRelationship.form.targetPartyIdPlaceholder"),
        required: true,
      },
      {
        name: "relationshipType",
        label: t("partyRelationship.form.relationshipType"),
        type: "select" as const,
        options: TYPE_OPTIONS,
        placeholder: t("partyRelationship.form.relationshipTypePlaceholder"),
        required: true,
      },
    ],
    createInitialValues: {
      sourcePartyId: "",
      targetPartyId: "",
      relationshipType: "",
    },
    editInitialValues: (item: PartyRelationship) => ({
      id: item.id,
      sourcePartyId: item.sourcePartyId,
      targetPartyId: item.targetPartyId,
      relationshipType: item.relationshipType,
    }),
    getItemDisplayName: (item: PartyRelationship) =>
      `${t(`partyRelationship.types.${item.relationshipType}`) || item.relationshipType}: ${shortId(
        item.sourcePartyId
      )} → ${shortId(item.targetPartyId)}`,
  };

  return <GenericCrudView viewModel={vm} config={config} />;
});
