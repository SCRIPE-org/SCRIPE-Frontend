import type {
  CrmPipelineReport,
  CrmSettingsResponseData,
} from "../../domain/models/crm-overview.types";

/**
 * Normalizes backend CRM tenant + user settings envelope into strongly typed state.
 */
export function normalizeCrmSettingsResponse(res: unknown): CrmSettingsResponseData {
  const raw: Record<string, any> =
    res && typeof res === "object" && "data" in (res as Record<string, any>) && (res as Record<string, any>).data
      ? (res as Record<string, any>).data
      : ((res as Record<string, any>) ?? {});
  const tenant = raw.tenantSettings ?? {};
  const user = raw.userPreferences ?? {};
  const allowOverride = Boolean(tenant.allowUserCurrencyOverride ?? true);

  return {
    effectiveBaseCurrencyCode:
      raw.effectiveBaseCurrencyCode ||
      (allowOverride && user.overrideCurrencyCode ? user.overrideCurrencyCode : tenant.baseCurrencyCode) ||
      "SAR",
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
      defaultDealViewMode:
        user.defaultDealViewMode === "Table"
          ? "Table"
          : user.defaultDealViewMode === "SplitPane"
            ? "SplitPane"
            : "Kanban",
      defaultPipelineCode: user.defaultPipelineCode || "default",
      cardDensity: user.cardDensity === "Compact" ? "Compact" : "Comfortable",
      autoConvertAmountsOverride: user.autoConvertAmountsOverride ?? null,
      showDualCurrencyBadgesOverride: user.showDualCurrencyBadgesOverride ?? null,
      dailyDigestEnabled: Boolean(user.dailyDigestEnabled ?? true),
      stageMoveNotificationsEnabled: Boolean(user.stageMoveNotificationsEnabled ?? true),
      rowVersion: user.rowVersion,
    },
    exchangeRatesUsdBase: raw.exchangeRatesUsdBase ?? {
      USD: 1.0,
      SAR: 3.75,
      AED: 3.6725,
      EGP: 49.5,
      EUR: 0.92,
      GBP: 0.79,
      KWD: 0.307,
      QAR: 3.64,
    },
  };
}

/**
 * Normalizes backend pipeline analytics report response into strict frontend contracts.
 */
export function normalizeCrmPipelineReportResponse(res: unknown): CrmPipelineReport {
  const raw: Record<string, any> =
    res && typeof res === "object" && "data" in (res as Record<string, any>) && (res as Record<string, any>).data
      ? (res as Record<string, any>).data
      : ((res as Record<string, any>) ?? {});

  const currencyBreakdowns = Array.isArray(raw?.currencyBreakdowns)
    ? raw.currencyBreakdowns.map((b: Record<string, any>) => ({
        currencyCode: b.currencyCode || "SAR",
        openDealsCount: b.openDealsCount ?? 0,
        wonDealsCount: b.wonDealsCount ?? 0,
        lostDealsCount: b.lostDealsCount ?? 0,
        totalOpenValue: b.totalOpenValue ?? b.totalOpenAmount ?? 0,
        totalWeightedForecastValue: b.totalWeightedForecastValue ?? b.totalWeightedAmount ?? 0,
        totalWonValue: b.totalWonValue ?? b.totalWonAmount ?? 0,
        totalLostValue: b.totalLostValue ?? b.totalLostAmount ?? 0,
        stages: Array.isArray(b.stages)
          ? b.stages.map((s: Record<string, any>) => ({
              stageKey: s.stageKey,
              labelEn: s.labelEn,
              labelAr: s.labelAr ?? null,
              sortOrder: s.sortOrder ?? 0,
              probabilityPercent: s.probabilityPercent ?? s.winProbabilityPercent ?? 0,
              requiresVerifiedParty: Boolean(s.requiresVerifiedParty),
              dealCount: s.dealCount ?? 0,
              totalAmount: s.totalAmount ?? 0,
              weightedForecastAmount: s.weightedForecastAmount ?? s.weightedAmount ?? 0,
            }))
          : [],
      }))
    : [];

  return {
    pipelineCode: raw?.pipelineCode || "default",
    pipelineNameEn: raw?.pipelineNameEn || "Standard Commercial Pipeline",
    pipelineNameAr: raw?.pipelineNameAr ?? null,
    isAmountMasked: Boolean(raw?.isAmountMasked),
    currencyBreakdowns,
    leadFunnel: {
      totalLeads: raw?.leadFunnel?.totalLeads ?? 0,
      newCount: raw?.leadFunnel?.newCount ?? 0,
      workingCount: raw?.leadFunnel?.workingCount ?? 0,
      qualifiedCount: raw?.leadFunnel?.qualifiedCount ?? 0,
      convertedCount: raw?.leadFunnel?.convertedCount ?? 0,
      disqualifiedCount: raw?.leadFunnel?.disqualifiedCount ?? 0,
      qualificationRatePercent: raw?.leadFunnel?.qualificationRatePercent ?? 0,
      conversionRatePercent: raw?.leadFunnel?.conversionRatePercent ?? 0,
    },
    winLoss: {
      totalClosedDeals:
        raw?.winLoss?.totalClosedDeals ??
        raw?.winLoss?.totalClosedCount ??
        (raw?.winLoss?.wonCount ?? 0) + (raw?.winLoss?.lostCount ?? 0),
      wonCount: raw?.winLoss?.wonCount ?? 0,
      lostCount: raw?.winLoss?.lostCount ?? 0,
      openCount:
        raw?.winLoss?.openCount ??
        currencyBreakdowns.reduce((acc: number, curr: { openDealsCount: number }) => acc + curr.openDealsCount, 0),
      winRatePercent: raw?.winLoss?.winRatePercent ?? 0,
      avgCycleDays: raw?.winLoss?.avgCycleDays ?? raw?.winLoss?.averageDealCycleDays ?? 0,
    },
    activities: {
      totalActivitiesCount: raw?.activities?.totalActivitiesCount ?? 0,
      notesCount: raw?.activities?.notesCount ?? 0,
      callsCount: raw?.activities?.callsCount ?? 0,
      meetingsCount: raw?.activities?.meetingsCount ?? 0,
      communicationsSentCount: raw?.activities?.communicationsSentCount ?? 0,
      followUpsCreatedCount: raw?.activities?.followUpsCreatedCount ?? raw?.activities?.followUpsScheduledCount ?? 0,
    },
    generatedAtUtc: raw?.generatedAtUtc || new Date().toISOString(),
  };
}
