"use client";

import type { PlatformLead, PlatformLeadListItem, LeadStatus } from "../entities/PlatformLead";
import type { PagedResult } from "@modules/identity/core/domain/types";

export interface LeadsListParams {
  page?: number;
  pageSize?: number;
  status?: LeadStatus;
  search?: string;
}

export interface UpdateLeadStatusParams {
  id: string;
  status: LeadStatus;
  notes?: string;
}

export interface ILeadsRepository {
  getAll(params: LeadsListParams): Promise<PagedResult<PlatformLeadListItem>>;
  getById(id: string): Promise<PlatformLead>;
  updateStatus(params: UpdateLeadStatusParams): Promise<void>;
}
