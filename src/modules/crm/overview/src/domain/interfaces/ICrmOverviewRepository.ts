import type {
  CrmOverviewData,
  CrmPipelineReport,
  CrmSettingsResponseData,
  CrmTenantSettingsPayload,
  CrmUserPreferencePayload,
} from "../models/crm-overview.types";

/**
 * Repository interface for CRM overview, pipeline analytics, and server-persisted CRM settings.
 */
export interface ICrmOverviewRepository {
  getOverview(searchQuery?: string): Promise<CrmOverviewData>;
  getPipelineReport(currencyCode?: string): Promise<CrmPipelineReport>;
  getSettings(): Promise<CrmSettingsResponseData>;
  updateTenantSettings(input: Partial<CrmTenantSettingsPayload>): Promise<CrmSettingsResponseData>;
  updateUserPreferences(input: Partial<CrmUserPreferencePayload>): Promise<CrmSettingsResponseData>;
}
