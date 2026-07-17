"use client";

import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { LEADS_ENDPOINTS } from "./leads.endpoints";
import type {
  PagedLeadsModel,
  PlatformLeadResponseModel,
  LeadActivityResponseModel,
  PagedAssignableAdminsModel,
  SendLeadEmailRequest,
  LeadCommunicationLogDto,
  EditionForConversionDto,
  EditionFeatureGroupDto,
  StatusEmailPreviewDto,
} from "../models/leads.models";
import type {
  LeadsListParams,
  CreateLeadParams,
  ConvertLeadParams,
  ConvertLeadResult,
  AssignLeadParams,
  BulkLeadStatusResult,
} from "../../domain/interfaces/ILeadsRepository";
import type { ILeadsService } from "../../domain/interfaces/ILeadsService";
import type { LeadStatus } from "../../domain/entities/PlatformLead";

/**
 * Http API network service for leads.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class LeadsService implements ILeadsService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: LeadsListParams): Promise<PagedLeadsModel> {
    const url = buildUrl(LEADS_ENDPOINTS.LIST, {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
      ...(params.status ? { status: params.status } : {}),
      ...(params.search ? { search: params.search } : {}),
    });
    return this.api.get<PagedLeadsModel>(url);
  }

  async getById(id: string): Promise<PlatformLeadResponseModel> {
    return this.api.get<PlatformLeadResponseModel>(LEADS_ENDPOINTS.BY_ID(id));
  }

  async updateStatus(
    id: string,
    status: LeadStatus,
    notes?: string,
    sendNotification?: boolean,
    emailSubjectOverride?: string,
    emailBodyOverride?: string
  ): Promise<void> {
    await this.api.put(LEADS_ENDPOINTS.UPDATE_STATUS(id), {
      status,
      notes,
      sendNotification: sendNotification ?? false,
      emailSubjectOverride,
      emailBodyOverride,
    });
  }

  async createLead(params: CreateLeadParams): Promise<string> {
    const result = await this.api.post<{ id: string }>(
      LEADS_ENDPOINTS.CREATE,
      params
    );
    return result.id;
  }

  async convertToTenant(id: string, params: ConvertLeadParams): Promise<ConvertLeadResult> {
    return this.api.post<ConvertLeadResult>(
      LEADS_ENDPOINTS.CONVERT_TO_TENANT(id),
      {
        editionId: params.editionId,
        tenantCode: params.tenantCode,
        adminEmail: params.adminEmail,
        subscriptionType: params.subscriptionType,
        currency: params.currency,
        conversionNote: params.conversionNote,
        negotiatedAmount: params.negotiatedAmount,
        negotiatedCurrency: params.negotiatedCurrency,
        featureOverrides: params.featureOverrides,
      }
    );
  }

  async assignLead(id: string, params: AssignLeadParams): Promise<void> {
    await this.api.put(LEADS_ENDPOINTS.ASSIGN(id), {
      adminId: params.adminId,
      note: params.note,
    });
  }

  async searchAssignableAdmins(search: string): Promise<PagedAssignableAdminsModel> {
    const url = buildUrl(LEADS_ENDPOINTS.ADMINS_LIST, {
      page: 1,
      pageSize: 10,
      search: search.trim() || undefined,
      isActive: true,
    });
    return this.api.get<PagedAssignableAdminsModel>(url);
  }

  async deleteLead(id: string): Promise<void> {
    await this.api.delete(LEADS_ENDPOINTS.DELETE(id));
  }

  async getActivity(id: string): Promise<LeadActivityResponseModel[]> {
    return this.api.get<LeadActivityResponseModel[]>(LEADS_ENDPOINTS.ACTIVITY(id));
  }

  async bulkUpdateStatus(
    leadIds: string[],
    status: string,
    notes?: string
  ): Promise<BulkLeadStatusResult> {
    return this.api.post<BulkLeadStatusResult>(LEADS_ENDPOINTS.BULK_STATUS, {
      leadIds,
      status,
      notes,
    });
  }

  async addNote(id: string, note: string): Promise<void> {
    await this.api.post(LEADS_ENDPOINTS.ADD_NOTE(id), { note });
  }

  async sendEmail(leadId: string, data: SendLeadEmailRequest): Promise<{ logId: string }> {
    return this.api.post<{ logId: string }>(
      `${LEADS_ENDPOINTS.LIST}/${leadId}/send-email`,
      data
    );
  }

  async getCommunicationLogs(leadId: string): Promise<LeadCommunicationLogDto[]> {
    return this.api.get<LeadCommunicationLogDto[]>(
      `${LEADS_ENDPOINTS.LIST}/${leadId}/communications`
    );
  }

  // ── Conversion Wizard Methods ───────────────────────────────────────────────

  async closeLead(id: string, reason?: string): Promise<void> {
    await this.api.post(LEADS_ENDPOINTS.CLOSE(id), { reason });
  }

  async getEditionsForConversion(): Promise<EditionForConversionDto[]> {
    return this.api.get<EditionForConversionDto[]>(
      LEADS_ENDPOINTS.EDITIONS_FOR_CONVERSION
    );
  }

  async getEditionFeaturesForConversion(editionId: string): Promise<EditionFeatureGroupDto[]> {
    return this.api.get<EditionFeatureGroupDto[]>(
      LEADS_ENDPOINTS.EDITION_FEATURES(editionId)
    );
  }

  async getStatusEmailPreview(
    leadId: string,
    targetStatus: string
  ): Promise<StatusEmailPreviewDto> {
    const url = buildUrl(LEADS_ENDPOINTS.STATUS_EMAIL_PREVIEW(leadId), {
      targetStatus,
    });
    return this.api.get<StatusEmailPreviewDto>(url);
  }
}
