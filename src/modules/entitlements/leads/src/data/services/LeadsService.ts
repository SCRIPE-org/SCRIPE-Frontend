"use client";

import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type {
  PagedLeadsModel,
  PlatformLeadResponseModel,
} from "../models/leads.models";
import type { LeadsListParams } from "../../domain/interfaces/ILeadsRepository";
import type { LeadStatus } from "../../domain/entities/PlatformLead";

export class LeadsService {
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
    return this.api.get<PlatformLeadResponseModel>(
      API_ENDPOINTS.ENTITLEMENTS.LEADS.BY_ID(id)
    );
  }

  async updateStatus(id: string, status: LeadStatus, notes?: string): Promise<void> {
    await this.api.put(API_ENDPOINTS.ENTITLEMENTS.LEADS.UPDATE_STATUS(id), {
      status,
      notes,
    });
  }
}
