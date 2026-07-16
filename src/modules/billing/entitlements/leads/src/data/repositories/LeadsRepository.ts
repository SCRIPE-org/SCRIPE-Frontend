"use client";

import type {
  PlatformLead,
  PlatformLeadListItem,
  LeadActivity,
  LeadCommunicationLog,
} from "../../domain/entities/PlatformLead";
import type {
  ILeadsRepository,
  ILeadsService,
  LeadsListParams,
  UpdateLeadStatusParams,
  CreateLeadParams,
  ConvertLeadParams,
  ConvertLeadResult,
  AssignLeadParams,
  AssignableAdmin,
  BulkLeadStatusResult,
  EditionForConversion,
  EditionFeatureGroup,
  StatusEmailPreview,
} from "../../domain/interfaces";
import type { PagedResult } from "@core/interfaces/common.interface";
import { LeadsMapper } from "../mappers/LeadsMapper";

/**
 * Repository layer implementing client request queries for leads.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export class LeadsRepository implements ILeadsRepository {
  constructor(private readonly service: ILeadsService) {}

  async getAll(params: LeadsListParams): Promise<PagedResult<PlatformLeadListItem>> {
    const model = await this.service.getAll(params);
    return {
      items: model.items.map(LeadsMapper.toListItem),
      totalCount: model.totalCount,
      page: model.page,
      pageSize: model.pageSize,
      totalPages: model.totalPages,
      hasNextPage: model.hasNextPage,
      hasPreviousPage: model.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<PlatformLead> {
    const model = await this.service.getById(id);
    return LeadsMapper.toEntity(model);
  }

  async updateStatus(params: UpdateLeadStatusParams): Promise<void> {
    await this.service.updateStatus(
      params.id,
      params.status,
      params.notes,
      params.sendNotification,
      params.emailSubjectOverride,
      params.emailBodyOverride
    );
  }

  async createLead(params: CreateLeadParams): Promise<string> {
    return this.service.createLead(params);
  }

  async convertToTenant(id: string, params: ConvertLeadParams): Promise<ConvertLeadResult> {
    return this.service.convertToTenant(id, params);
  }

  async assignLead(id: string, params: AssignLeadParams): Promise<void> {
    await this.service.assignLead(id, params);
  }

  async searchAssignableAdmins(search: string): Promise<AssignableAdmin[]> {
    const model = await this.service.searchAssignableAdmins(search);
    return model.items.map(LeadsMapper.toAssignableAdmin);
  }

  async deleteLead(id: string): Promise<void> {
    await this.service.deleteLead(id);
  }

  async getActivity(id: string): Promise<LeadActivity[]> {
    const dtos = await this.service.getActivity(id);
    return dtos.map(LeadsMapper.toActivity);
  }

  async bulkUpdateStatus(
    leadIds: string[],
    status: string,
    notes?: string
  ): Promise<BulkLeadStatusResult> {
    return this.service.bulkUpdateStatus(leadIds, status, notes);
  }

  async addNote(id: string, note: string): Promise<void> {
    await this.service.addNote(id, note);
  }

  async sendEmail(
    leadId: string,
    subject: string,
    bodyHtml: string,
    templateKey?: string
  ): Promise<string> {
    const result = await this.service.sendEmail(leadId, { subject, bodyHtml, templateKey });
    return result.logId;
  }

  async getCommunicationLogs(leadId: string): Promise<LeadCommunicationLog[]> {
    const dtos = await this.service.getCommunicationLogs(leadId);
    return dtos.map((dto) => LeadsMapper.toCommunicationLog(dto));
  }

  // ── Conversion Wizard ─────────────────────────────────────────────────────

  async closeLead(id: string, reason?: string): Promise<void> {
    await this.service.closeLead(id, reason);
  }

  async getEditionsForConversion(): Promise<EditionForConversion[]> {
    const dtos = await this.service.getEditionsForConversion();
    // Passthrough — DTOs and domain types are identical for wizard data
    return dtos as unknown as EditionForConversion[];
  }

  async getEditionFeaturesForConversion(editionId: string): Promise<EditionFeatureGroup[]> {
    const dtos = await this.service.getEditionFeaturesForConversion(editionId);
    return dtos as unknown as EditionFeatureGroup[];
  }

  async getStatusEmailPreview(leadId: string, targetStatus: string): Promise<StatusEmailPreview> {
    const dto = await this.service.getStatusEmailPreview(leadId, targetStatus);
    return dto as unknown as StatusEmailPreview;
  }
}
