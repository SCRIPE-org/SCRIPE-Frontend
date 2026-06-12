"use client";

import type { PlatformLead, PlatformLeadListItem } from "../../domain/entities/PlatformLead";
import type {
  ILeadsRepository,
  LeadsListParams,
  UpdateLeadStatusParams,
} from "../../domain/interfaces/ILeadsRepository";
import type { PagedResult } from "@modules/identity/core/domain/types";
import { LeadsService } from "../services/LeadsService";
import { LeadsMapper } from "../mappers/LeadsMapper";

export class LeadsRepository implements ILeadsRepository {
  constructor(private readonly service: LeadsService) {}

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
    await this.service.updateStatus(params.id, params.status, params.notes);
  }
}
