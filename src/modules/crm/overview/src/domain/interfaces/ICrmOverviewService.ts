import type {
  CrmEntitySearchItem,
  CrmEntitySearchRequest,
  CrmOverviewData,
  CrmPipelineReport,
  CrmQuickCreateEntityInput,
  CrmSettingsResponseData,
  CrmTenantSettingsPayload,
  CrmUserPreferencePayload,
} from "../models/crm-overview.types";

/**
 * Service interface for CRM overview, pipeline analytics, entity search, and server-persisted CRM settings.
 */
export interface ICrmOverviewService {
  getOverviewData(searchQuery?: string): Promise<CrmOverviewData>;
  getPipelineReport(currencyCode?: string): Promise<CrmPipelineReport>;
  getSettings(): Promise<CrmSettingsResponseData>;
  updateTenantSettings(input: Partial<CrmTenantSettingsPayload>): Promise<CrmSettingsResponseData>;
  updateUserPreferences(input: Partial<CrmUserPreferencePayload>): Promise<CrmSettingsResponseData>;
  searchEntities(input: CrmEntitySearchRequest): Promise<CrmEntitySearchItem[]>;
  quickCreateEntity(input: CrmQuickCreateEntityInput): Promise<CrmEntitySearchItem>;
}
