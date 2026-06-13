"use client";

import {
  PlatformLead,
  PlatformLeadListItem,
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
} from "../models/leads.models";

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
      updatedAt: dto.updatedAt ?? new Date().toISOString(),
      convertedAt: dto.convertedAt,
      convertedToTenantId: dto.convertedToTenantId,
      assignedToAdminId: dto.assignedToAdminId,
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
}
