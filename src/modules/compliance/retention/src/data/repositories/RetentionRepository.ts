/**
 * Retention Repository — calls service, maps models → domain entities.
 * Implements IRetentionRepository.
 */
import type { IRetentionRepository } from "../../domain/interfaces/IRetentionRepository";
import type { IRetentionService } from "../../domain/interfaces/IRetentionService";
import type { RetentionPolicy } from "../../domain/entities/RetentionPolicy";
import type { UpdateRetentionPolicyRequest } from "../../domain/entities/RetentionPolicy";
import { RetentionMapper } from "../mappers/RetentionMapper";

export class RetentionRepository implements IRetentionRepository {
  constructor(private readonly service: IRetentionService) {}

  async getAll(): Promise<RetentionPolicy[]> {
    const models = await this.service.getAll();
    return models.map(RetentionMapper.toEntity);
  }

  update(id: string, data: UpdateRetentionPolicyRequest): Promise<void> {
    return this.service.update(id, data);
  }
}
