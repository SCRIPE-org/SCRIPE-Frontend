/**
 * Custom Field Sub-Feature ViewModels and Permissions
 *
 * Consolidates secondary viewmodels, permission flags, and detail dialog state
 * for the custom field management interface.
 */

import { useState, useCallback } from "react";
import { usePermission } from "@core/hooks/use-permission";
import { CUSTOM_FIELDS_PERMISSIONS } from "../../../../permission-constants";
import { useFieldInsightViewModel } from "./useFieldInsightViewModel";
import { useOptionSetBindingViewModel } from "./useOptionSetBindingViewModel";
import { useFieldVisibilityRulesViewModel } from "./useFieldVisibilityRulesViewModel";
import { useConvertValueTypeViewModel } from "./useConvertValueTypeViewModel";
import { useFieldVersionsViewModel } from "./useFieldVersionsViewModel";

/**
 * Documentation for module export
 */
export function useCustomFieldSubFeatures(isSuperAdmin: boolean) {
  const canViewFieldGroups = usePermission(CUSTOM_FIELDS_PERMISSIONS.FIELD_GROUP_VIEW);
  const canViewOptionSets = usePermission(CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_VIEW) || isSuperAdmin;
  const canViewHistory = usePermission(CUSTOM_FIELDS_PERMISSIONS.VIEW_HISTORY);
  const canViewUsage = usePermission(CUSTOM_FIELDS_PERMISSIONS.VIEW_USAGE);
  const canUpdate = usePermission(CUSTOM_FIELDS_PERMISSIONS.CUSTOM_FIELD_UPDATE);
  const canDelete = usePermission(CUSTOM_FIELDS_PERMISSIONS.CUSTOM_FIELD_DELETE);

  const insight = useFieldInsightViewModel();
  const optionSetBinding = useOptionSetBindingViewModel();
  const visibilityRules = useFieldVisibilityRulesViewModel();
  const convertValueType = useConvertValueTypeViewModel();
  const fieldVersions = useFieldVersionsViewModel();

  const [detailFieldId, setDetailFieldId] = useState<string | null>(null);
  const openDetail = useCallback((id: string) => setDetailFieldId(id), []);
  const closeDetail = useCallback(() => setDetailFieldId(null), []);

  return {
    canViewFieldGroups,
    canViewOptionSets,
    canViewHistory,
    canViewUsage,
    canUpdate,
    canDelete,
    insight,
    optionSetBinding,
    visibilityRules,
    convertValueType,
    fieldVersions,
    detailFieldId,
    openDetail,
    closeDetail,
  };
}
