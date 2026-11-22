import type {
  CrmAssigneeLookupItem,
  CrmGovernanceCatalogData,
  CrmSettingsResponseData,
} from "@modules/crm/shared";
import {
  DEFAULT_RECORD_PRINCIPALS,
  DEFAULT_SETTINGS_BUYING_COMMITTEE_ROLES,
  DEFAULT_SETTINGS_SCOPED_ROLES,
  type CrmSettingsDraftState,
} from "../../domain/constants/crmSettingsDefaults";
import { CrmSettingsEntity } from "../../domain/entities/CrmSettingsEntity";
import type {
  CrmAssigneeLookupRawDto,
  CrmGovernanceCatalogRawDto,
  CrmSettingsResponseRawDto,
} from "../models/SettingsModel";
import {
  mapSettingsResponseToDraftState,
  parseCustomGovernanceConfigJson,
  serializeCustomGovernanceConfigJson,
  type ParsedGovernanceConfig,
} from "../../domain/utils/crmGovernanceConfigCodec";

/** Parsed tenant custom governance configuration payload. */
export type { ParsedGovernanceConfig };

function normalizeViewMode(mode?: string): "Kanban" | "Table" | "SplitPane" {
  if (mode === "Table") return "Table";
  if (mode === "SplitPane") return "SplitPane";
  return "Kanban";
}

function normalizeDensity(density?: string): "Comfortable" | "Compact" {
  return density === "Compact" ? "Compact" : "Comfortable";
}

/**
 * Mapper converting CRM Settings DTOs into `CrmSettingsEntity` and serialized JSON configs.
 */
export class CrmSettingsMapper {
  /** Maps raw backend settings DTO to a normalized `CrmSettingsEntity`. */
  static toEntity(raw: CrmSettingsResponseRawDto): CrmSettingsEntity {
    const tenant = raw.tenantSettings ?? {};
    const user = raw.userPreferences ?? {};
    const allowOverride = Boolean(tenant.allowUserCurrencyOverride ?? true);
    const effectiveBaseCurrencyCode =
      raw.effectiveBaseCurrencyCode ||
      (allowOverride && user.overrideCurrencyCode
        ? user.overrideCurrencyCode
        : tenant.baseCurrencyCode) ||
      "SAR";

    return new CrmSettingsEntity({
      effectiveBaseCurrencyCode,
      effectiveAutoConvertToBase: Boolean(
        raw.effectiveAutoConvertToBase ?? user.autoConvertAmountsOverride ?? tenant.autoConvertAmountsToBase ?? true
      ),
      effectiveShowDualCurrencyBadges: Boolean(
        raw.effectiveShowDualCurrencyBadges ?? user.showDualCurrencyBadgesOverride ?? tenant.showDualCurrencyBadges ?? true
      ),
      tenantSettings: {
        baseCurrencyCode: tenant.baseCurrencyCode || "SAR",
        defaultDealCurrencyCode: tenant.defaultDealCurrencyCode || "SAR",
        autoConvertAmountsToBase: Boolean(tenant.autoConvertAmountsToBase ?? true),
        showDualCurrencyBadges: Boolean(tenant.showDualCurrencyBadges ?? true),
        allowUserCurrencyOverride: allowOverride,
        snapshotExchangeRateOnDealCreation: Boolean(tenant.snapshotExchangeRateOnDealCreation ?? true),
        stageGateStrictness: tenant.stageGateStrictness || "strict",
        requireVerifiedPartyOnProposal: Boolean(tenant.requireVerifiedPartyOnProposal ?? true),
        requireCloseNotesOnWin: Boolean(tenant.requireCloseNotesOnWin ?? true),
        defaultLeadSource: tenant.defaultLeadSource || "Inbound",
        slaLeadResponseHours: Number(tenant.slaLeadResponseHours ?? 4),
        stalledDealThresholdDays: Number(tenant.stalledDealThresholdDays ?? 14),
        duplicateDetectionMode: tenant.duplicateDetectionMode || "strict",
        leadAutoAssignmentRule: tenant.leadAutoAssignmentRule || "round_robin",
        enableCatalogPricingQuoteHandoff: Boolean(tenant.enableCatalogPricingQuoteHandoff ?? true),
        enableVenueAcademyCommercialHandoff: Boolean(tenant.enableVenueAcademyCommercialHandoff ?? true),
        autoCreateWorkItemsOnStageMove: Boolean(tenant.autoCreateWorkItemsOnStageMove ?? true),
        defaultCommunicationChannel: tenant.defaultCommunicationChannel || "email",
        autoSyncPartyKernelOnConvert: Boolean(tenant.autoSyncPartyKernelOnConvert ?? true),
        customFieldsConfigJson: tenant.customFieldsConfigJson ?? null,
        workflowCanvasConfigJson: tenant.workflowCanvasConfigJson ?? null,
        rowVersion: tenant.rowVersion,
      },
      userPreferences: {
        overrideCurrencyCode: user.overrideCurrencyCode ?? null,
        defaultDealViewMode: normalizeViewMode(user.defaultDealViewMode),
        defaultPipelineCode: user.defaultPipelineCode || "default",
        cardDensity: normalizeDensity(user.cardDensity),
        autoConvertAmountsOverride: user.autoConvertAmountsOverride ?? null,
        showDualCurrencyBadgesOverride: user.showDualCurrencyBadgesOverride ?? null,
        dailyDigestEnabled: Boolean(user.dailyDigestEnabled ?? true),
        stageMoveNotificationsEnabled: Boolean(user.stageMoveNotificationsEnabled ?? true),
        rowVersion: user.rowVersion,
      },
      exchangeRatesUsdBase:
        raw.exchangeRatesUsdBase ??
        raw.exchangeRatesPerUsd ?? {
          USD: 1.0, SAR: 3.75, AED: 3.6725, EGP: 50.85, EUR: 0.92, GBP: 0.79, KWD: 0.308, QAR: 3.64,
        },
      lastRateUpdatedAtUtc: raw.lastRateUpdatedAtUtc ?? raw.ratesLastUpdatedUtc ?? null,
      effectiveDealViewMode: raw.effectiveDealViewMode ? normalizeViewMode(raw.effectiveDealViewMode) : undefined,
      effectivePipelineCode: raw.effectivePipelineCode,
      effectiveCardDensity: raw.effectiveCardDensity ? normalizeDensity(raw.effectiveCardDensity) : undefined,
    });
  }

  /** Maps raw governance catalog DTO into normalized catalog lists. */
  static toGovernanceCatalog(raw: CrmGovernanceCatalogRawDto): CrmGovernanceCatalogData {
    return {
      defaultScopedRoles:
        Array.isArray(raw.defaultScopedRoles) && raw.defaultScopedRoles.length > 0
          ? raw.defaultScopedRoles
          : DEFAULT_SETTINGS_SCOPED_ROLES,
      defaultBuyingCommitteeRoles:
        Array.isArray(raw.defaultBuyingCommitteeRoles) && raw.defaultBuyingCommitteeRoles.length > 0
          ? raw.defaultBuyingCommitteeRoles
          : DEFAULT_SETTINGS_BUYING_COMMITTEE_ROLES,
      recordPrincipals:
        Array.isArray(raw.recordPrincipals) && raw.recordPrincipals.length > 0
          ? raw.recordPrincipals
          : DEFAULT_RECORD_PRINCIPALS,
      scopedPermissions: Array.isArray(raw.scopedPermissions) ? raw.scopedPermissions : [],
    };
  }

  /** Maps raw assignee DTOs into normalized `CrmAssigneeLookupItem` records. */
  static toAssigneeList(rows: CrmAssigneeLookupRawDto[]): CrmAssigneeLookupItem[] {
    const items: CrmAssigneeLookupItem[] = [];
    for (const raw of rows) {
      const id = String(raw.id ?? raw.userId ?? raw.teamId ?? "").trim();
      const displayName = String(
        raw.displayName ?? raw.fullNameEn ?? raw.nameEn ?? raw.name ?? raw.email ?? ""
      ).trim();
      if (!id || !displayName) continue;
      const kind: "user" | "team" = String(raw.kind ?? "").toLowerCase() === "team" ? "team" : "user";
      const subtitle =
        raw.subtitle ??
        ([raw.roleName || raw.role, raw.department || raw.teamName, raw.email].filter(Boolean).join(" · ") || null);
      items.push({
        id,
        kind,
        displayName,
        displayNameAr: raw.displayNameAr ?? raw.fullNameAr ?? raw.nameAr ?? null,
        subtitle: subtitle ? String(subtitle) : null,
        email: raw.email ?? null,
      });
    }
    return items;
  }

  /** Parses server `CustomFieldsConfigJson` while respecting authoritative empty arrays. */
  static parseCustomGovernanceConfigJson = parseCustomGovernanceConfigJson;

  /** Serializes tenant custom governance JSON without `dealCommercialPackages`. */
  static serializeCustomGovernanceConfigJson = serializeCustomGovernanceConfigJson;

  /** Maps a `CrmSettingsResponseData` or `CrmSettingsEntity` into an editable `CrmSettingsDraftState`. */
  static toDraftState(
    entity: CrmSettingsResponseData,
    fallback?: Partial<ParsedGovernanceConfig>
  ): CrmSettingsDraftState {
    return mapSettingsResponseToDraftState(entity, fallback);
  }
}
