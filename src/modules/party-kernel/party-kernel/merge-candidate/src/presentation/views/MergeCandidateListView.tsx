/**
 * MergeCandidate List View
 *
 * Pure UI component for displaying MergeCandidate list with CRUD.
 * Uses GenericCrudView for standard CRUD table UI.
 */
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useMergeCandidateViewModel } from "../viewmodels/useMergeCandidateViewModel";
import type { MergeCandidate } from "../../domain/entities/MergeCandidate";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { resolveIntlLocale } from "@core/common/utils";

// MergeCandidateStatus (backend enum, serialized as its string name): Pending, Confirmed,
// Rejected, Merged — this is a genuine workflow state, so it gets the semantic status ramp.
const STATUS_BADGE_VARIANT: Record<
  string,
  "pending" | "success" | "destructive" | "info" | "secondary"
> = {
  Pending: "pending",
  Confirmed: "success",
  Rejected: "destructive",
  Merged: "info",
};

// Party IDs are raw GUIDs with no denormalized name on this entity (or on the backend
// DTO) to fall back to — shorten for table legibility, keep the full value in a tooltip.
function shortId(id: string | undefined): string {
  if (!id) return "-";
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

// P5.4: React.memo prevents unnecessary re-renders
export const MergeCandidateListView = React.memo(function MergeCandidateListView() {
  useModuleLocales(() => import("../../../locales"), "party-kernel.mergeCandidate");
  const { vm } = useMergeCandidateViewModel();
  const { t, language } = useI18n();

  const STATUS_OPTIONS = [
    { value: "Pending", label: t("mergeCandidate.statuses.Pending") },
    { value: "Confirmed", label: t("mergeCandidate.statuses.Confirmed") },
    { value: "Rejected", label: t("mergeCandidate.statuses.Rejected") },
    { value: "Merged", label: t("mergeCandidate.statuses.Merged") },
  ];

  const config: CrudConfig<MergeCandidate> = {
    titleKey: "mergeCandidate.title",
    subtitleKey: "mergeCandidate.description",
    resource: "merge-candidates",
    columns: [
      {
        key: "primaryPartyId",
        label: t("mergeCandidate.columns.primaryPartyId"),
        sortable: true,
        render: (value: string) => (
          <span className="font-mono text-xs" title={value}>
            {shortId(value)}
          </span>
        ),
      },
      {
        key: "duplicatePartyId",
        label: t("mergeCandidate.columns.duplicatePartyId"),
        sortable: true,
        render: (value: string) => (
          <span className="font-mono text-xs" title={value}>
            {shortId(value)}
          </span>
        ),
      },
      {
        key: "matchScore",
        label: t("mergeCandidate.columns.matchScore"),
        sortable: true,
        render: (value: number | undefined) =>
          value === undefined ? (
            "-"
          ) : (
            <Badge variant={value >= 0.9 ? "active" : value >= 0.7 ? "pending" : "secondary"}>
              {Math.round(value * 100)}%
            </Badge>
          ),
      },
      {
        key: "status",
        label: t("mergeCandidate.columns.status"),
        sortable: true,
        render: (value: string) => (
          <Badge variant={STATUS_BADGE_VARIANT[value] ?? "secondary"}>
            {t(`mergeCandidate.statuses.${value}`) || value}
          </Badge>
        ),
      },
      {
        key: "reason",
        label: t("mergeCandidate.columns.reason"),
        sortable: true,
        render: (value: string) => value || "-",
      },
      {
        key: "createdAt",
        label: t("mergeCandidate.columns.createdAt"),
        render: (value: string) =>
          value ? new Date(value).toLocaleDateString(resolveIntlLocale(language)) : "-",
      },
    ],
    createFields: [
      {
        name: "primaryPartyId",
        label: t("mergeCandidate.form.primaryPartyId"),
        type: "text" as const,
        placeholder: t("mergeCandidate.form.primaryPartyIdPlaceholder"),
        required: true,
      },
      {
        name: "duplicatePartyId",
        label: t("mergeCandidate.form.duplicatePartyId"),
        type: "text" as const,
        placeholder: t("mergeCandidate.form.duplicatePartyIdPlaceholder"),
        required: true,
      },
      {
        name: "status",
        label: t("mergeCandidate.form.status"),
        type: "select" as const,
        options: STATUS_OPTIONS,
        placeholder: t("mergeCandidate.form.statusPlaceholder"),
        required: true,
      },
      {
        name: "reason",
        label: t("mergeCandidate.form.reason"),
        type: "text" as const,
        placeholder: t("mergeCandidate.form.reasonPlaceholder"),
      },
    ],
    editFields: [
      { name: "id", type: "hidden" as const, required: true },
      {
        name: "primaryPartyId",
        label: t("mergeCandidate.form.primaryPartyId"),
        type: "text" as const,
        placeholder: t("mergeCandidate.form.primaryPartyIdPlaceholder"),
        required: true,
      },
      {
        name: "duplicatePartyId",
        label: t("mergeCandidate.form.duplicatePartyId"),
        type: "text" as const,
        placeholder: t("mergeCandidate.form.duplicatePartyIdPlaceholder"),
        required: true,
      },
      {
        name: "status",
        label: t("mergeCandidate.form.status"),
        type: "select" as const,
        options: STATUS_OPTIONS,
        placeholder: t("mergeCandidate.form.statusPlaceholder"),
        required: true,
      },
      {
        name: "reason",
        label: t("mergeCandidate.form.reason"),
        type: "text" as const,
        placeholder: t("mergeCandidate.form.reasonPlaceholder"),
      },
    ],
    createInitialValues: {
      primaryPartyId: "",
      duplicatePartyId: "",
      status: "",
      reason: "",
    },
    editInitialValues: (item: MergeCandidate) => ({
      id: item.id,
      primaryPartyId: item.primaryPartyId,
      duplicatePartyId: item.duplicatePartyId,
      status: item.status,
      reason: item.reason,
    }),
    // MergeCandidate is a dedup-workflow join entity — no name field exists on either the
    // frontend entity or the backend DTO. `reason` (e.g. "Same email address") is the most
    // human-identifying text available; falls back to the primary party's id if empty.
    getItemDisplayName: (item: MergeCandidate) => item.reason || item.primaryPartyId,
  };

  return <GenericCrudView viewModel={vm} config={config} />;
});
