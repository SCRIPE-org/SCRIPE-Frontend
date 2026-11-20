import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { stripHtmlTags } from "@core/common/sanitize";
import type { IApiService } from "@/core/interfaces/api.interface";
import type {
  CrmTenantSettingsPayload,
  CrmUserPreferencePayload,
} from "../../../../shared";
import type { ICrmSettingsService } from "../../domain/interfaces/ICrmSettingsService";
import type {
  CrmAssigneeLookupRawDto,
  CrmGovernanceCatalogRawDto,
  CrmSettingsApiEnvelope,
  CrmSettingsResponseRawDto,
} from "../models/SettingsModel";
import { CRM_SETTINGS_ENDPOINTS } from "./crm-settings.endpoints";

function unwrapEnvelope<T>(res: CrmSettingsApiEnvelope<T> | T): T {
  if (res && typeof res === "object" && "data" in res && res.data !== undefined) {
    return res.data;
  }
  return res as T;
}

/** HTTP service mediating CRM tenant settings, governance catalog, and assignee lookups. */
export class CrmSettingsService implements ICrmSettingsService {
  constructor(private readonly api: IApiService) {}

  /** Retrieves composite tenant + user CRM settings and live exchange rates. */
  async getSettings(): Promise<CrmSettingsResponseRawDto> {
    const res = await this.api.get<
      CrmSettingsApiEnvelope<CrmSettingsResponseRawDto> | CrmSettingsResponseRawDto
    >(CRM_SETTINGS_ENDPOINTS.SETTINGS);
    return unwrapEnvelope(res) ?? {};
  }

  /** Retrieves authoritative backend governance catalog defaults. */
  async getGovernanceCatalog(): Promise<CrmGovernanceCatalogRawDto> {
    const res = await this.api.get<
      CrmSettingsApiEnvelope<CrmGovernanceCatalogRawDto> | CrmGovernanceCatalogRawDto
    >(CRM_SETTINGS_ENDPOINTS.GOVERNANCE_CATALOG);
    return unwrapEnvelope(res) ?? {};
  }

  /** Queries tenant commercial assignees (users/teams). */
  async lookupAssignees(
    query?: string,
    kind: "user" | "team" | "all" = "all",
    limit = 25
  ): Promise<CrmAssigneeLookupRawDto[]> {
    const cleanQuery = stripHtmlTags(query ?? "").trim();
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const url = buildUrl(CRM_SETTINGS_ENDPOINTS.ASSIGNEES, {
      kind,
      limit: safeLimit,
      search: cleanQuery || undefined,
    });
    const res = await this.api.get<
      CrmSettingsApiEnvelope<CrmAssigneeLookupRawDto[]> | CrmAssigneeLookupRawDto[]
    >(url);
    const payload = unwrapEnvelope(res);
    return Array.isArray(payload) ? payload : [];
  }

  /** Updates tenant-wide CRM governance configuration (`crm.settings.manage`). */
  async updateTenantSettings(
    input: Partial<CrmTenantSettingsPayload>
  ): Promise<CrmSettingsResponseRawDto> {
    const idempotencyKey = `crm-set-tenant-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const sanitizedInput: Partial<CrmTenantSettingsPayload> = {
      ...input,
      defaultLeadSource: input.defaultLeadSource
        ? stripHtmlTags(input.defaultLeadSource).trim()
        : undefined,
    };
    const res = await this.api.put<
      CrmSettingsApiEnvelope<CrmSettingsResponseRawDto> | CrmSettingsResponseRawDto
    >(CRM_SETTINGS_ENDPOINTS.TENANT, sanitizedInput, undefined, {
      idempotencyKey,
      headers: {
        "Idempotency-Key": idempotencyKey,
        "X-Idempotency-Key": idempotencyKey,
      },
    });
    return unwrapEnvelope(res) ?? {};
  }

  /** Updates per-user CRM display & currency override preferences. */
  async updateUserPreferences(
    input: Partial<CrmUserPreferencePayload>
  ): Promise<CrmSettingsResponseRawDto> {
    const idempotencyKey = `crm-set-user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const res = await this.api.put<
      CrmSettingsApiEnvelope<CrmSettingsResponseRawDto> | CrmSettingsResponseRawDto
    >(CRM_SETTINGS_ENDPOINTS.USER, input, undefined, {
      idempotencyKey,
      headers: {
        "Idempotency-Key": idempotencyKey,
        "X-Idempotency-Key": idempotencyKey,
      },
    });
    return unwrapEnvelope(res) ?? {};
  }
}
