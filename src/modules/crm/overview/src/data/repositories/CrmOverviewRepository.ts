import type { ICrmOverviewRepository } from "../../domain/interfaces/ICrmOverviewRepository";
import type { ICrmOverviewService } from "../../domain/interfaces/ICrmOverviewService";
import type {
  CrmOverviewData,
  CrmPipelineReport,
  CrmSettingsResponseData,
  CrmTenantSettingsPayload,
  CrmUserPreferencePayload,
} from "../../domain/models/crm-overview.types";

/**
 * Concrete repository mediating CRM overview, analytics, and server-side settings persistence.
 */
export class CrmOverviewRepository implements ICrmOverviewRepository {
  constructor(private readonly service: ICrmOverviewService) {}

  async getOverview(searchQuery?: string): Promise<CrmOverviewData> {
    return this.service.getOverviewData(searchQuery);
  }

  async getPipelineReport(currencyCode?: string): Promise<CrmPipelineReport> {
    return this.service.getPipelineReport(currencyCode);
  }

  async getSettings(): Promise<CrmSettingsResponseData> {
    return this.service.getSettings();
  }

  async updateTenantSettings(input: Partial<CrmTenantSettingsPayload>): Promise<CrmSettingsResponseData> {
    return this.service.updateTenantSettings(input);
  }

  async updateUserPreferences(input: Partial<CrmUserPreferencePayload>): Promise<CrmSettingsResponseData> {
    return this.service.updateUserPreferences(input);
  }
}
