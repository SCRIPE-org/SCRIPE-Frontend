import type { IIntegrationsRepository } from "../../domain/interfaces/IIntegrationsRepository";
import type { IIntegrationsService } from "../../domain/interfaces/IIntegrationsService";
import { IntegrationsMapper } from "../mappers/IntegrationsMapper";
import { IntegrationsEntity } from "../../domain/entities/IntegrationsEntity";

export class IntegrationsRepository implements IIntegrationsRepository {
  constructor(private readonly service: IIntegrationsService) {}

  async getAll(params?: Record<string, unknown>): Promise<{ items: IntegrationsEntity[]; totalCount: number }> {
    const result = await this.service.getAll(params) as { items?: unknown[]; totalCount?: number; [key: string]: unknown };
    const items = (result.items || []).map((item: unknown) => IntegrationsMapper.toEntity(item as Parameters<typeof IntegrationsMapper.toEntity>[0]));
    return { items, totalCount: result.totalCount ?? items.length };
  }

  async getById(id: string): Promise<IntegrationsEntity> {
    const result = await this.service.getById(id);
    return IntegrationsMapper.toEntity(result as Parameters<typeof IntegrationsMapper.toEntity>[0]);
  }
}
