"use client";

import {
  PlatformLead,
  PlatformLeadListItem,
  type PlatformLeadData,
  type PlatformLeadListItemData,
  type LeadStatus,
} from "../../domain/entities/PlatformLead";
import type {
  PlatformLeadResponseModel,
  PlatformLeadListResponseModel,
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
      notes: dto.notes,
      isDuplicate: dto.isDuplicate ?? false,
      convertedAt: dto.convertedAt,
      createdAt: dto.createdAt ?? new Date().toISOString(),
      updatedAt: dto.updatedAt,
    } satisfies PlatformLeadData);
  }

  static toListItem(dto: PlatformLeadListResponseModel): PlatformLeadListItem {
    return new PlatformLeadListItem({
      id: dto.id,
      companyName: dto.companyName ?? "",
      contactName: dto.contactName ?? "",
      email: dto.email ?? "",
      editionKey: dto.editionKey,
      status: (dto.status as LeadStatus) ?? "New",
      createdAt: dto.createdAt ?? new Date().toISOString(),
    } satisfies PlatformLeadListItemData);
  }
}
