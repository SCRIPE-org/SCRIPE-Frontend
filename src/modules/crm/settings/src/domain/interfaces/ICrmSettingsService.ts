import type {
  CrmTenantSettingsPayload,
  CrmUserPreferencePayload,
} from "../../../../shared";
import type {
  CrmAssigneeLookupRawDto,
  CrmGovernanceCatalogRawDto,
  CrmSettingsResponseRawDto,
} from "../../data/models/SettingsModel";

/** Service contract for CRM tenant settings, governance catalog, and assignee lookups. */
export interface ICrmSettingsService {
  getSettings(): Promise<CrmSettingsResponseRawDto>;
  getGovernanceCatalog(): Promise<CrmGovernanceCatalogRawDto>;
  lookupAssignees(
    query?: string,
    kind?: "user" | "team" | "all",
    limit?: number
  ): Promise<CrmAssigneeLookupRawDto[]>;
  updateTenantSettings(input: Partial<CrmTenantSettingsPayload>): Promise<CrmSettingsResponseRawDto>;
  updateUserPreferences(input: Partial<CrmUserPreferencePayload>): Promise<CrmSettingsResponseRawDto>;
}
