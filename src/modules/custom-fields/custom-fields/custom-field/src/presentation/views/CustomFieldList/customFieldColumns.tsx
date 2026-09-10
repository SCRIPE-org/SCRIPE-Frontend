/**
 * Table column definitions and row actions for CustomFieldListView.
 */
"use client";

import React from "react";
import type { CrudAction } from "@core/crud/components/generic-crud-view";
import type { CustomField } from "../../../domain/entities/CustomField";
import { Badge } from "@core/ui/badge";
import { resolveIntlLocale } from "@core/common/utils";
import {
  VALUE_TYPE_CATALOG,
  hasOptionsList,
  type CustomFieldValueTypeName,
} from "../../registries/valueTypeRegistry";
import {
  BarChart3,
  Eye,
  GitBranch,
  History,
  Layers,
  Pencil,
  RefreshCcw,
  Sliders,
  Trash2,
} from "lucide-react";

export interface BuildCustomFieldColumnsArgs {
  t: (key: string) => string;
  language: string;
  isPlatformContext: boolean;
  valueTypeLabelOf: (value: string) => string;
}

export function buildCustomFieldColumns({
  t,
  language,
  isPlatformContext,
  valueTypeLabelOf,
}: BuildCustomFieldColumnsArgs) {
  return [
    { key: "entityTypeKey", label: t("customField.fields.entityTypeKey"), sortable: true },
    { key: "key", label: t("customField.fields.key"), sortable: true },
    { key: "labelEn", label: t("customField.fields.labelEn"), sortable: true },
    {
      key: "isGlobal",
      label: t("customField.fields.scope"),
      render: (value: boolean) => (
        <Badge variant="outline">
          {value
            ? t("customField.scopeOptions.global")
            : isPlatformContext
              ? t("customField.scopeOptions.platformOnly")
              : t("customField.scopeOptions.tenant")}
        </Badge>
      ),
    },
    {
      key: "valueType",
      label: t("customField.fields.valueType"),
      render: (value: string) => (
        <Badge
          variant={
            VALUE_TYPE_CATALOG[value as CustomFieldValueTypeName]?.badgeVariant ?? "secondary"
          }
        >
          {valueTypeLabelOf(value)}
        </Badge>
      ),
    },
    {
      key: "isRequired",
      label: t("customField.fields.isRequired"),
      render: (value: boolean) => (
        <Badge variant={value ? "info" : "secondary"}>
          {value ? t("customField.required") : t("customField.optional")}
        </Badge>
      ),
    },
    { key: "sortOrder", label: t("customField.fields.sortOrder"), sortable: true },
    {
      key: "isActive",
      label: t("customField.fields.isActive"),
      render: (value: boolean) => (
        <Badge variant={value ? "active" : "inactive"}>
          {value ? t("common.yes") : t("common.no")}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: t("common.createdAt"),
      render: (value: string) =>
        value ? new Date(value).toLocaleDateString(resolveIntlLocale(language)) : "-",
    },
  ];
}

export interface BuildCustomFieldActionsArgs {
  openDetail: (id: string) => void;
  openEditModal: (item: CustomField) => void;
  canUpdate: boolean;
  canDelete: boolean;
  canViewHistory: boolean;
  canViewUsage: boolean;
  canViewOptionSets: boolean;
  isPlatformContext: boolean;
  openBinding: (id: string, label: string) => void;
  openUsage: (id: string) => void;
  visibilityRulesCanView: boolean;
  openRules: (item: CustomField) => void;
  convertValueTypeCanUpdate: boolean;
  openConvert: (item: CustomField) => void;
  fieldVersionsCanView: boolean;
  openVersions: (item: CustomField) => void;
  openHistory: (id: string) => void;
  requestDelete: (id: string) => Promise<boolean>;
  refreshItems: () => Promise<void>;
}

export function buildCustomFieldActions(
  tFn: (key: string) => string,
  args: BuildCustomFieldActionsArgs
): CrudAction<CustomField>[] {
  const {
    openDetail,
    openEditModal,
    canUpdate,
    canDelete,
    canViewHistory,
    canViewUsage,
    canViewOptionSets,
    isPlatformContext,
    openBinding,
    openUsage,
    visibilityRulesCanView,
    openRules,
    convertValueTypeCanUpdate,
    openConvert,
    fieldVersionsCanView,
    openVersions,
    openHistory,
    requestDelete,
    refreshItems,
  } = args;

  return [
    {
      label: tFn("customField.details.actionLabel"),
      onClick: (item: CustomField) => openDetail(item.id),
      variant: "ghost" as const,
      icon: <Eye className="h-4 w-4" />,
    },
    {
      label: tFn("common.edit"),
      onClick: (item: CustomField) => openEditModal(item),
      variant: "ghost" as const,
      icon: <Pencil className="h-4 w-4" />,
      show: (item: CustomField) => canUpdate && (isPlatformContext || !item.isGlobal),
    },
    {
      label: tFn("customField.optionSetBinding.actionLabel"),
      onClick: (item: CustomField) => openBinding(item.id, item.labelEn || item.key),
      variant: "ghost" as const,
      icon: <Layers className="h-4 w-4" />,
      show: (item: CustomField) =>
        canViewOptionSets && (isPlatformContext || !item.isGlobal) && hasOptionsList(item.valueType),
    },
    {
      label: tFn("customField.impact.actionLabel"),
      onClick: (item: CustomField) => openUsage(item.id),
      variant: "ghost" as const,
      icon: <BarChart3 className="h-4 w-4" />,
      show: () => canViewUsage,
    },
    {
      label: tFn("customField.visibilityRules.actionLabel"),
      onClick: (item: CustomField) => openRules(item),
      variant: "ghost" as const,
      icon: <Sliders className="h-4 w-4" />,
      show: (item: CustomField) => visibilityRulesCanView && (isPlatformContext || !item.isGlobal),
    },
    {
      label: tFn("customField.convertValueType.actionLabel"),
      onClick: (item: CustomField) => openConvert(item),
      variant: "ghost" as const,
      icon: <RefreshCcw className="h-4 w-4" />,
      show: (item: CustomField) => convertValueTypeCanUpdate && (isPlatformContext || !item.isGlobal),
    },
    {
      label: tFn("customField.versions.actionLabel"),
      onClick: (item: CustomField) => openVersions(item),
      variant: "ghost" as const,
      icon: <GitBranch className="h-4 w-4" />,
      show: () => fieldVersionsCanView,
    },
    {
      label: tFn("customField.history.actionLabel"),
      onClick: (item: CustomField) => openHistory(item.id),
      variant: "ghost" as const,
      icon: <History className="h-4 w-4" />,
      show: () => canViewHistory,
    },
    {
      label: tFn("common.delete"),
      onClick: async (item: CustomField) => {
        const deleted = await requestDelete(item.id);
        if (deleted) await refreshItems();
      },
      variant: "ghost" as const,
      className: "text-destructive hover:text-destructive/80",
      icon: <Trash2 className="h-4 w-4" />,
      show: (item: CustomField) => canDelete && (isPlatformContext || !item.isGlobal),
    },
  ];
}
