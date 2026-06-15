"use client";

import type {
  PagedLeadsModel,
  PlatformLeadResponseModel,
  LeadActivityResponseModel,
  PagedAssignableAdminsModel,
} from "../../data/models/leads.models";
import type {
  LeadsListParams,
  CreateLeadParams,
  ConvertLeadParams,
  ConvertLeadResult,
  AssignLeadParams,
  BulkLeadStatusResult,
} from "./ILeadsRepository";
import type { LeadStatus } from "../entities/PlatformLead";

/**
 * Contract for the Leads HTTP service layer.
 *
 * The service is the ONLY layer allowed to call IApiService directly.
 * It works exclusively with raw API DTOs (models), never domain entities.
 * The repository is responsible for DTO → Entity mapping.
 */
export interface ILeadsService {
  getAll(params: LeadsListParams): Promise<PagedLeadsModel>;
  getById(id: string): Promise<PlatformLeadResponseModel>;
  updateStatus(id: string, status: LeadStatus, notes?: string): Promise<void>;
  createLead(params: CreateLeadParams): Promise<string>;
  convertToTenant(id: string, params: ConvertLeadParams): Promise<ConvertLeadResult>;
  assignLead(id: string, params: AssignLeadParams): Promise<void>;
  searchAssignableAdmins(search: string): Promise<PagedAssignableAdminsModel>;
  deleteLead(id: string): Promise<void>;
  getActivity(id: string): Promise<LeadActivityResponseModel[]>;
  /** Bulk-update status on up to 100 leads in one API round-trip. */
  bulkUpdateStatus(
    leadIds: string[],
    status: string,
    notes?: string
  ): Promise<BulkLeadStatusResult>;
}
