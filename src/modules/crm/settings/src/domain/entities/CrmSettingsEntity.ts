import type {
  CrmSettingsResponseData,
  CrmTenantSettingsPayload,
  CrmUserPreferencePayload,
} from "../../../../shared";

/**
 * Rich Domain Entity representing tenant + user CRM governance settings and exchange rates.
 */
export class CrmSettingsEntity implements CrmSettingsResponseData {
  constructor(private readonly data: CrmSettingsResponseData) {}

  /** Effective ISO currency code resolved after tenant and user overrides. */
  get effectiveBaseCurrencyCode(): string {
    return this.data.effectiveBaseCurrencyCode;
  }

  /** Whether monetary amounts automatically convert to the effective base currency. */
  get effectiveAutoConvertToBase(): boolean {
    return this.data.effectiveAutoConvertToBase;
  }

  /** Whether converted monetary values also show the original currency badge. */
  get effectiveShowDualCurrencyBadges(): boolean {
    return this.data.effectiveShowDualCurrencyBadges;
  }

  /** Tenant-wide CRM governance configuration payload. */
  get tenantSettings(): CrmTenantSettingsPayload {
    return this.data.tenantSettings;
  }

  /** Current user's personal CRM display and currency preferences. */
  get userPreferences(): CrmUserPreferencePayload {
    return this.data.userPreferences;
  }

  /** USD-indexed currency exchange rates map used for client conversions. */
  get exchangeRatesUsdBase(): Record<string, number> {
    return this.data.exchangeRatesUsdBase;
  }

  /** UTC timestamp of the last exchange rate refresh, if available. */
  get lastRateUpdatedAtUtc(): string | null | undefined {
    return this.data.lastRateUpdatedAtUtc;
  }

  /** Effective default Opportunities view mode (`Kanban`, `Table`, or `SplitPane`). */
  get effectiveDealViewMode(): "Kanban" | "Table" | "SplitPane" | undefined {
    return this.data.effectiveDealViewMode;
  }

  /** Effective default commercial pipeline code for the current user. */
  get effectivePipelineCode(): string | undefined {
    return this.data.effectivePipelineCode;
  }

  /** Effective CRM card density preference (`Comfortable` or `Compact`). */
  get effectiveCardDensity(): "Comfortable" | "Compact" | undefined {
    return this.data.effectiveCardDensity;
  }

  /** Indicates whether a personal user currency override is active. */
  get isUserOverrideActive(): boolean {
    return Boolean(
      this.data.tenantSettings.allowUserCurrencyOverride &&
      this.data.userPreferences.overrideCurrencyCode
    );
  }

  /** Returns a new `CrmSettingsEntity` with merged partial updates. */
  copyWith(updates: Partial<CrmSettingsResponseData>): CrmSettingsEntity {
    return new CrmSettingsEntity({ ...this.data, ...updates });
  }
}
