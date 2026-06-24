"use client";

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
  updateStatus(
    id: string,
    status: LeadStatus,
    notes?: string,
    sendNotification?: boolean,
    emailSubjectOverride?: string,
    emailBodyOverride?: string
  ): Promise<void>;
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
  /** Append a standalone CRM note to the lead's activity timeline. */
  addNote(id: string, note: string): Promise<void>;
  /** Send an email to a lead and log the communication. */
  sendEmail(leadId: string, data: SendLeadEmailRequest): Promise<{ logId: string }>;
  /** Retrieve all communication logs for a lead. */
  getCommunicationLogs(leadId: string): Promise<LeadCommunicationLogDto[]>;
  /** Close a lead (CRM soft-close — sets status to Closed). */
  closeLead(id: string, reason?: string): Promise<void>;
  /** Get all editions available for the conversion wizard step 1. */
  getEditionsForConversion(): Promise<EditionForConversionDto[]>;
  /** Get all configurable features for a specific edition (wizard step 3). */
  getEditionFeaturesForConversion(editionId: string): Promise<EditionFeatureGroupDto[]>;
  /** Get a pre-populated branded email preview for a status transition. */
  getStatusEmailPreview(leadId: string, targetStatus: string): Promise<StatusEmailPreviewDto>;
}
