import type {
  CrmAssigneeLookupItem,
  CrmGovernanceCatalogData,
  CrmTenantSettingsPayload,
  CrmUserPreferencePayload,
  ICrmSettingsRepository,
} from "../../../../shared";
import type { CrmSettingsEntity } from "../../domain/entities/CrmSettingsEntity";
import type { ICrmSettingsService } from "../../domain/interfaces/ICrmSettingsService";
import { CrmSettingsMapper } from "../mappers/CrmSettingsMapper";

/**
 * Repository converting CRM settings, catalog, and assignee DTOs into domain models.
 */
export class CrmSettingsRepository implements ICrmSettingsRepository {
  constructor(private readonly service: ICrmSettingsService) {}

  /** Retrieves composite tenant + user CRM settings as a `CrmSettingsEntity`. */
  async getSettings(): Promise<CrmSettingsEntity> {
    const dto = await this.service.getSettings();
    return CrmSettingsMapper.toEntity(dto);
  }

  /** Retrieves the backend CRM governance catalog. */
  async getGovernanceCatalog(): Promise<CrmGovernanceCatalogData> {
    const dto = await this.service.getGovernanceCatalog();
    return CrmSettingsMapper.toGovernanceCatalog(dto);
  }

  /** Queries tenant commercial assignees (users/teams). */
  async lookupAssignees(
    query?: string,
    kind?: "user" | "team" | "all",
    limit?: number
  ): Promise<CrmAssigneeLookupItem[]> {
    const rows = await this.service.lookupAssignees(query, kind, limit);
    return CrmSettingsMapper.toAssigneeList(rows);
  }

  /** Updates tenant-wide CRM governance configuration and returns the refreshed entity. */
  async updateTenantSettings(
    input: Partial<CrmTenantSettingsPayload>
  ): Promise<CrmSettingsEntity> {
    const dto = await this.service.updateTenantSettings(input);
    return CrmSettingsMapper.toEntity(dto);
  }

  /** Updates per-user CRM display & currency preferences and returns the refreshed entity. */
  async updateUserPreferences(
    input: Partial<CrmUserPreferencePayload>
  ): Promise<CrmSettingsEntity> {
    const dto = await this.service.updateUserPreferences(input);
    return CrmSettingsMapper.toEntity(dto);
  }
}
