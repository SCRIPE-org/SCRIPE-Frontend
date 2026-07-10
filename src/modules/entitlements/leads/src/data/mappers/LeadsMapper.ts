"use client";

import {
  PlatformLead,
  PlatformLeadListItem,
  LeadCommunicationLog,
  type PlatformLeadData,
  type PlatformLeadListItemData,
  type LeadStatus,
  type LeadSource,
  type LeadActivity,
  type LeadActivityType,
} from "../../domain/entities/PlatformLead";
import type {
  PlatformLeadResponseModel,
  PlatformLeadListResponseModel,
  LeadActivityResponseModel,
  AssignableAdminResponseModel,
  LeadCommunicationLogDto,
} from "../models/leads.models";
import type { AssignableAdmin } from "../../domain/interfaces/ILeadsRepository";

/**
 * Bidirectional data mapper orchestrating conversion between database DTO formats and frontend domain entities, enforcing null-safe defaults.
 */
export class LeadsMapper {
  static toEntity(dto: PlatformLeadResponseModel): PlatformLead {
    return new PlatformLead({
      id: dto.id,
      companyName: dto.companyName ?? "",
      contactName: dto.contactName ?? "",
      email: dto.email ?? "",
      phone: dto.phone,
      editionKey: dto.editionKey,
      message: dto.message,
      status: (dto.status as LeadStatus) ?? "New",
      source: (dto.source as LeadSource) ?? "Website",
      requestedAt: dto.requestedAt ?? new Date().toISOString(),
      modifiedAt: dto.modifiedAt,
      convertedAt: dto.convertedAt,
      convertedToTenantId: dto.convertedToTenantId,
      assignedToAdminId: dto.assignedToAdminId,
      assignedAdminName: dto.assignedAdminName,
      notes: dto.notes,
      businessType: dto.businessType,
      teamSize: dto.teamSize,
      primaryPriority: dto.primaryPriority,
    } satisfies PlatformLeadData);
  }

  static toListItem(dto: PlatformLeadListResponseModel): PlatformLeadListItem {
    return new PlatformLeadListItem({
      id: dto.id,
      companyName: dto.companyName ?? "",
      contactName: dto.contactName ?? "",
      email: dto.email ?? "",
      phone: dto.phone,
      editionKey: dto.editionKey,
      status: (dto.status as LeadStatus) ?? "New",
      source: (dto.source as LeadSource) ?? "Website",
      requestedAt: dto.requestedAt ?? new Date().toISOString(),
      businessType: dto.businessType,
      teamSize: dto.teamSize,
      primaryPriority: dto.primaryPriority,
    } satisfies PlatformLeadListItemData);
  }

  static toActivity(dto: LeadActivityResponseModel): LeadActivity {
    return {
      id: dto.id,
      leadId: dto.leadId,
      type: (dto.type as LeadActivityType) ?? "Submitted",
      summary: dto.summary ?? "",
      note: dto.note,
      fromStatus: dto.fromStatus as LeadStatus | undefined,
      toStatus: dto.toStatus as LeadStatus | undefined,
      actorAdminId: dto.actorAdminId,
      actorName: dto.actorName,
      occurredAt: dto.occurredAt ?? new Date().toISOString(),
    };
  }

  static toAssignableAdmin(dto: AssignableAdminResponseModel): AssignableAdmin {
    const displayName = `${dto.firstName ?? ""} ${dto.lastName ?? ""}`.trim() || dto.username;

    return {
      id: dto.id,
      username: dto.username ?? "",
      displayName,
      email: dto.email,
      tenantName: dto.tenantName,
      isPlatformAdmin: Boolean(dto.isSuperAdmin || !dto.tenantId),
    };
  }

  static toCommunicationLog(dto: LeadCommunicationLogDto): LeadCommunicationLog {
    return new LeadCommunicationLog({
      id: dto.id,
      subject: dto.subject,
      bodyHtml: dto.bodyHtml,
      bodyText: dto.bodyText ?? "",
      sentByAdminName: dto.sentByAdminName ?? "",
      sentAt: dto.sentAt,
      status: (dto.status as "Pending" | "Sent" | "Failed") ?? "Sent",
      templateKey: dto.templateKey,
      recipientEmail: dto.recipientEmail ?? "",
      recipientName: dto.recipientName ?? "",
    });
  }
}
