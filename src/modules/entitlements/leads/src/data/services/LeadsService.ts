"use client";

import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
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
 * API service for executing HTTP calls related to Leads endpoints.
 */
export class LeadsService implements ILeadsService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: LeadsListParams): Promise<PagedLeadsModel> {
    const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.LEADS.LIST, {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
      ...(params.status ? { status: params.status } : {}),
      ...(params.search ? { search: params.search } : {}),
    });
    return this.api.get<PagedLeadsModel>(url);
  }

  async getById(id: string): Promise<PlatformLeadResponseModel> {
    return this.api.get<PlatformLeadResponseModel>(API_ENDPOINTS.ENTITLEMENTS.LEADS.BY_ID(id));
  }

  async updateStatus(
    id: string,
    status: LeadStatus,
    notes?: string,
    sendNotification?: boolean,
    emailSubjectOverride?: string,
    emailBodyOverride?: string
  ): Promise<void> {
    await this.api.put(API_ENDPOINTS.ENTITLEMENTS.LEADS.UPDATE_STATUS(id), {
      status,
      notes,
      sendNotification: sendNotification ?? false,
      emailSubjectOverride,
      emailBodyOverride,
    });
  }

  async createLead(params: CreateLeadParams): Promise<string> {
    const result = await this.api.post<{ id: string }>(
      API_ENDPOINTS.ENTITLEMENTS.LEADS.CREATE,
      params
    );
    return result.id;
  }

  async convertToTenant(id: string, params: ConvertLeadParams): Promise<ConvertLeadResult> {
    return this.api.post<ConvertLeadResult>(
      API_ENDPOINTS.ENTITLEMENTS.LEADS.CONVERT_TO_TENANT(id),
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
    await this.api.put(API_ENDPOINTS.ENTITLEMENTS.LEADS.ASSIGN(id), {
      adminId: params.adminId,
      note: params.note,
    });
  }

  async searchAssignableAdmins(search: string): Promise<PagedAssignableAdminsModel> {
    const url = buildUrl(API_ENDPOINTS.ADMINS.LIST, {
      page: 1,
      pageSize: 10,
      search: search.trim() || undefined,
      isActive: true,
    });
    return this.api.get<PagedAssignableAdminsModel>(url);
  }

  async deleteLead(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.ENTITLEMENTS.LEADS.DELETE(id));
  }

  async getActivity(id: string): Promise<LeadActivityResponseModel[]> {
    return this.api.get<LeadActivityResponseModel[]>(API_ENDPOINTS.ENTITLEMENTS.LEADS.ACTIVITY(id));
  }

  async bulkUpdateStatus(
    leadIds: string[],
    status: string,
    notes?: string
  ): Promise<BulkLeadStatusResult> {
    return this.api.post<BulkLeadStatusResult>(API_ENDPOINTS.ENTITLEMENTS.LEADS.BULK_STATUS, {
      leadIds,
      status,
      notes,
    });
  }

  async addNote(id: string, note: string): Promise<void> {
    await this.api.post(API_ENDPOINTS.ENTITLEMENTS.LEADS.ADD_NOTE(id), { note });
  }

  async sendEmail(leadId: string, data: SendLeadEmailRequest): Promise<{ logId: string }> {
    return this.api.post<{ logId: string }>(
      `${API_ENDPOINTS.ENTITLEMENTS.LEADS.LIST}/${leadId}/send-email`,
      data
    );
  }

  async getCommunicationLogs(leadId: string): Promise<LeadCommunicationLogDto[]> {
    return this.api.get<LeadCommunicationLogDto[]>(
      `${API_ENDPOINTS.ENTITLEMENTS.LEADS.LIST}/${leadId}/communications`
    );
  }

  // ── Conversion Wizard Methods ───────────────────────────────────────────────

  async closeLead(id: string, reason?: string): Promise<void> {
    await this.api.post(API_ENDPOINTS.ENTITLEMENTS.LEADS.CLOSE(id), { reason });
  }

  async getEditionsForConversion(): Promise<EditionForConversionDto[]> {
    return this.api.get<EditionForConversionDto[]>(
      API_ENDPOINTS.ENTITLEMENTS.LEADS.EDITIONS_FOR_CONVERSION
    );
  }

  async getEditionFeaturesForConversion(editionId: string): Promise<EditionFeatureGroupDto[]> {
    return this.api.get<EditionFeatureGroupDto[]>(
      API_ENDPOINTS.ENTITLEMENTS.LEADS.EDITION_FEATURES(editionId)
    );
  }

  async getStatusEmailPreview(
    leadId: string,
    targetStatus: string
  ): Promise<StatusEmailPreviewDto> {
    const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.LEADS.STATUS_EMAIL_PREVIEW(leadId), {
      targetStatus,
    });
    return this.api.get<StatusEmailPreviewDto>(url);
  }
}
