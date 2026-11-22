"use client";

import { stripHtmlTags } from "@core/common/sanitize";
import type {
  CrmBuyingCommitteeRoleOption,
  CrmCustomFieldDefinition,
  CrmScopedRoleDefinition,
  CrmStageGateStrictness,
  CrmTenantSettingsPayload,
  CrmUserPreferencePayload,
} from "@modules/crm/shared";
import { serializeCustomGovernanceConfigJson } from "../../domain/utils/crmGovernanceConfigCodec";
import type { CrmSettingsDraftState } from "../../domain/constants/crmSettingsDefaults";
import type { CrmSettingsCardModel } from "../viewmodels/useCrmSettingsViewModel";

/** Builds sanitized tenant settings payload from draft state. */
export function buildTenantSettingsUpdatePayload(next: CrmSettingsDraftState): Partial<CrmTenantSettingsPayload> {
  return {
    baseCurrencyCode: next.tenantBaseCurrency || next.baseCurrency,
    defaultDealCurrencyCode: next.defaultDealCurrency,
    autoConvertAmountsToBase: next.autoConvertToBase,
    showDualCurrencyBadges: next.showOriginalCurrencyOnConverted,
    allowUserCurrencyOverride: next.allowUserCurrencyOverride,
    snapshotExchangeRateOnDealCreation: next.snapshotExchangeRateOnDealCreation,
    stageGateStrictness: next.stageGateStrictness,
    requireVerifiedPartyOnProposal: next.requirePartyOnProposal,
    requireCloseNotesOnWin: next.requireCloseNotesOnWin,
    defaultLeadSource: stripHtmlTags(next.defaultLeadSource).trim(),
    slaLeadResponseHours: next.slaLeadResponseHours,
    stalledDealThresholdDays: next.stalledDealThresholdDays,
    duplicateDetectionMode: next.duplicateDetectionMode,
    leadAutoAssignmentRule: next.leadAutoAssignmentRule,
    enableCatalogPricingQuoteHandoff: next.enableCatalogPricingQuoteHandoff,
    enableVenueAcademyCommercialHandoff: next.enableVenueAcademyCommercialHandoff,
    autoCreateWorkItemsOnStageMove: next.autoCreateWorkItemsOnStageMove,
    defaultCommunicationChannel: next.defaultCommunicationChannel,
    autoSyncPartyKernelOnConvert: next.autoSyncPartyKernelOnConvert,
    defaultDealViewMode: next.defaultDealViewMode,
    defaultPipelineCode: next.defaultPipelineCode,
    cardDensity: next.cardDensity,
    customFieldsConfigJson: serializeCustomGovernanceConfigJson(next),
    rowVersion: next.tenantRowVersion,
  };
}

/** Builds user preference update payload from draft state. */
export function buildUserPreferencesUpdatePayload(next: CrmSettingsDraftState): Partial<CrmUserPreferencePayload> {
  return {
    overrideCurrencyCode: next.userOverrideCurrency,
    defaultDealViewMode: next.defaultDealViewMode,
    defaultPipelineCode: next.defaultPipelineCode,
    cardDensity: next.cardDensity,
    autoConvertAmountsOverride: next.autoConvertToBase,
    showDualCurrencyBadgesOverride: next.showOriginalCurrencyOnConverted,
    dailyDigestEnabled: next.dailyDigestEnabled,
    stageMoveNotificationsEnabled: next.stageMoveNotificationsEnabled,
    rowVersion: next.userRowVersion,
  };
}

/** Constructs a sanitized custom field definition. */
export function buildCustomFieldDefinition(
  fieldInput: Omit<CrmCustomFieldDefinition, "id" | "createdAtIso">
): CrmCustomFieldDefinition {
  const sanitizedKey = fieldInput.key.trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
  return {
    ...fieldInput,
    labelEn: stripHtmlTags(fieldInput.labelEn).trim(),
    labelAr: stripHtmlTags(fieldInput.labelAr || fieldInput.labelEn).trim(),
    id: `cf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    key: sanitizedKey || `field_${Date.now()}`,
    createdAtIso: new Date().toISOString(),
  };
}

/** Constructs a sanitized decoupled CRM pipeline role definition (`pipe_role:*`). */
export function buildScopedRoleDefinition(input: {
  nameEn: string; nameAr?: string; descriptionEn?: string; descriptionAr?: string;
  permissions?: string[]; memberNames?: string[]; maxApprovalThresholdAmount?: number | null; backupRoleKey?: string | null;
}): CrmScopedRoleDefinition {
  const slug = input.nameEn.trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "") || `custom_role_${Date.now()}`;
  const key = slug.startsWith("pipe_role:") || slug.startsWith("role:") ? slug : `pipe_role:${slug}`;
  const scopedPermissions = (input.permissions ?? []).filter((p) => p.startsWith("crm."));
  return {
    id: `pipe-role-${Date.now()}`, key,
    nameEn: stripHtmlTags(input.nameEn).trim(),
    nameAr: stripHtmlTags(input.nameAr || input.nameEn).trim(),
    descriptionEn: stripHtmlTags(input.descriptionEn || "").trim(),
    descriptionAr: stripHtmlTags(input.descriptionAr || "").trim(),
    memberNames: input.memberNames ?? [],
    maxApprovalThresholdAmount: input.maxApprovalThresholdAmount ?? null,
    backupRoleKey: input.backupRoleKey ?? "pipe_role:commercial_director",
    permissions: scopedPermissions.length > 0 ? scopedPermissions : ["crm.opportunities.read", "crm.opportunities.stage"],
    isSystem: false,
  };
}

/** Constructs a sanitized buying committee stakeholder role option. */
export function buildBuyingCommitteeOption(input: { labelEn: string; labelAr?: string; key?: string }): CrmBuyingCommitteeRoleOption {
  const rawKey = (input.key || input.labelEn).trim().replace(/[^a-zA-Z0-9_]+/g, "");
  const key = rawKey || `Stakeholder_${Date.now()}`;
  return {
    key,
    labelEn: stripHtmlTags(input.labelEn).trim() || key,
    labelAr: stripHtmlTags(input.labelAr || input.labelEn).trim() || key,
    isSystem: false,
  };
}

/** Builds interactive `CrmSettingsCardModel` bound to VM state mutators. */
export function buildSettingsCardModel(params: {
  draft: CrmSettingsDraftState;
  isHydrating: boolean;
  updateSettings: (partial: Partial<CrmSettingsDraftState>) => void;
  patchDraft: (partial: Partial<CrmSettingsDraftState>) => void;
  resetCustomRateOverrides: () => void;
  addCrmCustomField: (field: Omit<CrmCustomFieldDefinition, "id" | "createdAtIso">) => CrmCustomFieldDefinition;
}): CrmSettingsCardModel {
  const { draft, isHydrating, updateSettings, patchDraft, resetCustomRateOverrides, addCrmCustomField } = params;
  return {
    ...draft,
    isHydrating,
    setBaseCurrency: (currency: string) => {
      const normalized = (currency || "SAR").toUpperCase();
      updateSettings({ baseCurrency: normalized, tenantBaseCurrency: normalized, defaultDealCurrency: normalized });
    },
    setUserOverrideCurrency: (currency: string | null) => {
      const normalized = currency && currency !== "INHERIT" ? currency.toUpperCase() : null;
      const effective = draft.allowUserCurrencyOverride && normalized ? normalized : draft.tenantBaseCurrency;
      updateSettings({ userOverrideCurrency: normalized, baseCurrency: effective });
    },
    setDefaultDealCurrency: (currency: string) => updateSettings({ defaultDealCurrency: (currency || "SAR").toUpperCase() }),
    setAutoConvertToBase: (enabled: boolean) => updateSettings({ autoConvertToBase: enabled }),
    setShowOriginalCurrencyOnConverted: (enabled: boolean) => updateSettings({ showOriginalCurrencyOnConverted: enabled }),
    setStageGateStrictness: (mode: CrmStageGateStrictness) => patchDraft({ stageGateStrictness: mode }),
    setRequirePartyOnProposal: (required: boolean) => patchDraft({ requirePartyOnProposal: required }),
    setRequireCloseNotesOnWin: (required: boolean) => patchDraft({ requireCloseNotesOnWin: required }),
    setDefaultLeadSource: (source: string) => patchDraft({ defaultLeadSource: source }),
    setSlaLeadResponseHours: (hours: number) => patchDraft({ slaLeadResponseHours: Math.max(1, hours) }),
    setStalledDealThresholdDays: (days: number) => patchDraft({ stalledDealThresholdDays: Math.max(1, days) }),
    resetCustomRateOverrides,
    addCrmCustomField,
    removeCrmCustomField: (id: string) => patchDraft({ crmCustomFields: draft.crmCustomFields.filter((f) => f.id !== id) }),
    addCrmScopedRole: (input) => {
      const created = buildScopedRoleDefinition(input);
      patchDraft({ crmRoles: [...draft.crmRoles.filter((r) => r.key.toLowerCase() !== created.key.toLowerCase()), created] });
      return created;
    },
    removeCrmScopedRole: (keyOrId: string) =>
      patchDraft({ crmRoles: draft.crmRoles.filter((r) => r.isSystem || (r.key !== keyOrId && r.id !== keyOrId)) }),
    addBuyingCommitteeRole: (input) => {
      const created = buildBuyingCommitteeOption(input);
      patchDraft({ buyingCommitteeRoles: [...draft.buyingCommitteeRoles.filter((r) => r.key.toLowerCase() !== created.key.toLowerCase()), created] });
      return created;
    },
    updateSettings,
  };
}
