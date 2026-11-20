"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { qk } from "@core/common/query-keys";
import { getCrmContainer } from "@modules/crm/di";
import {
  DEFAULT_CRM_CUSTOM_FIELDS,
  DEFAULT_NEW_WORKFLOW_META,
  DEFAULT_SETTINGS_BUYING_COMMITTEE_ROLES,
  DEFAULT_SETTINGS_SCOPED_ROLES,
  parseCustomGovernanceConfigJson,
  useCrmTenantScope,
  useSafeQueryClient,
  type CrmBuyingCommitteeRoleOption,
  type CrmCustomFieldDefinition,
  type CrmScopedRoleDefinition,
} from "@modules/crm/shared";
import { hasAuthenticatedCrmSession } from "../utils/crmWorkflowsAuthAndConfigHelpers";

/**
 * TanStack Query hook providing CRM workflow governance dictionaries (custom fields,
 * scoped approval roles, and buying committee roles) directly from `settingsRepository`
 * without relying on any client-persisted Zustand cache.
 */
export function useCrmWorkflowGovernanceQuery() {
  const safeQueryClient = useSafeQueryClient();
  const { tenantId, userId } = useCrmTenantScope();
  const canQueryServer = hasAuthenticatedCrmSession();

  const settingsQuery = useQuery(
    {
      queryKey: qk.crm.settings(tenantId, userId),
      queryFn: () => getCrmContainer().settingsRepository.getSettings(),
      enabled: canQueryServer,
      staleTime: 60_000,
    },
    safeQueryClient
  );

  const [governanceSyncError, setGovernanceSyncError] = useState<string | null>(null);
  const [localAdditions, setLocalAdditions] = useState<{
    customFields: CrmCustomFieldDefinition[];
    crmRoles: CrmScopedRoleDefinition[];
    buyingCommitteeRoles: CrmBuyingCommitteeRoleOption[];
  }>({ customFields: [], crmRoles: [], buyingCommitteeRoles: [] });

  const parsed = parseCustomGovernanceConfigJson(
    settingsQuery.data?.tenantSettings?.customFieldsConfigJson,
    {
      customFields: DEFAULT_CRM_CUSTOM_FIELDS,
      crmRoles: DEFAULT_SETTINGS_SCOPED_ROLES,
      buyingCommitteeRoles: DEFAULT_SETTINGS_BUYING_COMMITTEE_ROLES,
    }
  );

  const crmCustomFields = [
    ...parsed.customFields.filter(
      (f: CrmCustomFieldDefinition) =>
        !localAdditions.customFields.some((a) => a.entityTypeKey === f.entityTypeKey && a.key === f.key)
    ),
    ...localAdditions.customFields,
  ];
  const crmRoles = [
    ...parsed.crmRoles.filter((r: CrmScopedRoleDefinition) => !localAdditions.crmRoles.some((a) => a.key === r.key)),
    ...localAdditions.crmRoles,
  ];
  const buyingCommitteeRoles = [
    ...parsed.buyingCommitteeRoles.filter(
      (r: CrmBuyingCommitteeRoleOption) => !localAdditions.buyingCommitteeRoles.some((a) => a.key === r.key)
    ),
    ...localAdditions.buyingCommitteeRoles,
  ];

  const persistGovernanceMutation = useMutation(
    {
      mutationFn: async (nextConfig: {
        customFields: CrmCustomFieldDefinition[];
        crmRoles: CrmScopedRoleDefinition[];
        buyingCommitteeRoles: CrmBuyingCommitteeRoleOption[];
      }) => {
        const container = getCrmContainer();
        const tenantSettings = settingsQuery.data?.tenantSettings;
        if (!tenantSettings || !container.settingsRepository?.updateTenantSettings) {
          return null;
        }
        return container.settingsRepository.updateTenantSettings({
          baseCurrencyCode: tenantSettings.baseCurrencyCode,
          defaultDealCurrencyCode: tenantSettings.defaultDealCurrencyCode,
          autoConvertAmountsToBase: tenantSettings.autoConvertAmountsToBase,
          showDualCurrencyBadges: tenantSettings.showDualCurrencyBadges,
          allowUserCurrencyOverride: tenantSettings.allowUserCurrencyOverride,
          snapshotExchangeRateOnDealCreation: tenantSettings.snapshotExchangeRateOnDealCreation,
          stageGateStrictness: tenantSettings.stageGateStrictness,
          requireVerifiedPartyOnProposal: tenantSettings.requireVerifiedPartyOnProposal,
          requireCloseNotesOnWin: tenantSettings.requireCloseNotesOnWin,
          defaultLeadSource: tenantSettings.defaultLeadSource,
          slaLeadResponseHours: tenantSettings.slaLeadResponseHours,
          stalledDealThresholdDays: tenantSettings.stalledDealThresholdDays,
          duplicateDetectionMode: tenantSettings.duplicateDetectionMode,
          leadAutoAssignmentRule: tenantSettings.leadAutoAssignmentRule,
          enableCatalogPricingQuoteHandoff: tenantSettings.enableCatalogPricingQuoteHandoff,
          enableVenueAcademyCommercialHandoff: tenantSettings.enableVenueAcademyCommercialHandoff,
          autoCreateWorkItemsOnStageMove: tenantSettings.autoCreateWorkItemsOnStageMove,
          defaultCommunicationChannel: tenantSettings.defaultCommunicationChannel,
          autoSyncPartyKernelOnConvert: tenantSettings.autoSyncPartyKernelOnConvert,
          rowVersion: tenantSettings.rowVersion,
          customFieldsConfigJson: JSON.stringify({
            ...nextConfig,
            configuredLossReasons: parsed.configuredLossReasons,
            configuredActivityTypes: parsed.configuredActivityTypes,
          }),
        });
      },
      onSuccess: () => {
        setGovernanceSyncError(null);
        void safeQueryClient.invalidateQueries({
          queryKey: qk.crm.settings(tenantId, userId),
        });
      },
      onError: (err: unknown) => {
        setGovernanceSyncError(err instanceof Error ? err.message : "Failed to persist governance dictionary changes.");
      },
    },
    safeQueryClient
  );

  const addCrmCustomField = (
    input: Omit<CrmCustomFieldDefinition, "id" | "createdAtIso">
  ): CrmCustomFieldDefinition => {
    const cleanKey = input.key
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, "_")
      .replace(/^_+|_+$/g, "");
    const created: CrmCustomFieldDefinition = {
      ...input,
      id: `cf-${Date.now()}`,
      key: cleanKey || `field_${Date.now()}`,
      createdAtIso: new Date().toISOString(),
    };
    const nextFields = [
      ...crmCustomFields.filter((f) => !(f.entityTypeKey === created.entityTypeKey && f.key === created.key)),
      created,
    ];
    setLocalAdditions((prev) => ({
      ...prev,
      customFields: [...prev.customFields.filter((f) => f.key !== created.key), created],
    }));
    if (canQueryServer) {
      setGovernanceSyncError(null);
      void persistGovernanceMutation.mutateAsync({
        customFields: nextFields,
        crmRoles,
        buyingCommitteeRoles,
      }).catch((err: unknown) => {
        setGovernanceSyncError(err instanceof Error ? err.message : "Failed to persist custom field.");
      });
    }
    return created;
  };

  const addCrmScopedRole = (input: {
    nameEn: string;
    nameAr?: string;
    descriptionEn?: string;
    descriptionAr?: string;
    permissions: string[];
    memberNames?: string[];
    maxApprovalThresholdAmount?: number | null;
    backupRoleKey?: string | null;
  }): CrmScopedRoleDefinition => {
    const slug =
      input.nameEn
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "") || `role_${Date.now()}`;
    const created: CrmScopedRoleDefinition = {
      id: `role-${Date.now()}`,
      key: `pipe_role:${slug}`,
      nameEn: input.nameEn.trim() || DEFAULT_NEW_WORKFLOW_META.roleNameEn,
      nameAr: input.nameAr?.trim() || input.nameEn.trim() || DEFAULT_NEW_WORKFLOW_META.roleNameAr,
      descriptionEn: input.descriptionEn ?? DEFAULT_NEW_WORKFLOW_META.roleDescEn,
      descriptionAr: input.descriptionAr ?? DEFAULT_NEW_WORKFLOW_META.roleDescAr,
      permissions: input.permissions,
      memberNames: input.memberNames,
      maxApprovalThresholdAmount: input.maxApprovalThresholdAmount,
      backupRoleKey: input.backupRoleKey,
    };
    const nextRoles = [...crmRoles.filter((r) => r.key !== created.key), created];
    setLocalAdditions((prev) => ({
      ...prev,
      crmRoles: [...prev.crmRoles.filter((r) => r.key !== created.key), created],
    }));
    if (canQueryServer) {
      setGovernanceSyncError(null);
      void persistGovernanceMutation.mutateAsync({
        customFields: crmCustomFields,
        crmRoles: nextRoles,
        buyingCommitteeRoles,
      }).catch((err: unknown) => {
        setGovernanceSyncError(err instanceof Error ? err.message : "Failed to persist scoped role.");
      });
    }
    return created;
  };

  const addBuyingCommitteeRole = (input: {
    labelEn: string;
    labelAr?: string;
    key?: string;
  }): CrmBuyingCommitteeRoleOption => {
    const slug =
      (input.key || input.labelEn)
        .trim()
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "") || `Role_${Date.now()}`;
    const created: CrmBuyingCommitteeRoleOption = {
      key: slug,
      labelEn: input.labelEn.trim(),
      labelAr: input.labelAr?.trim() || input.labelEn.trim(),
    };
    const nextBc = [...buyingCommitteeRoles.filter((r) => r.key !== created.key), created];
    setLocalAdditions((prev) => ({
      ...prev,
      buyingCommitteeRoles: [...prev.buyingCommitteeRoles.filter((r) => r.key !== created.key), created],
    }));
    if (canQueryServer) {
      setGovernanceSyncError(null);
      void persistGovernanceMutation.mutateAsync({
        customFields: crmCustomFields,
        crmRoles,
        buyingCommitteeRoles: nextBc,
      }).catch((err: unknown) => {
        setGovernanceSyncError(err instanceof Error ? err.message : "Failed to persist buying committee role.");
      });
    }
    return created;
  };

  return {
    isHydrating: canQueryServer ? settingsQuery.isLoading : false,
    governanceSyncError,
    crmCustomFields,
    crmRoles,
    buyingCommitteeRoles,
    addCrmCustomField,
    addCrmScopedRole,
    addBuyingCommitteeRole,
  };
}
