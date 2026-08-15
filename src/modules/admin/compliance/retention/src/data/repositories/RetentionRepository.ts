/**
 * Retention Repository — calls service, maps models → domain entities.
 * Implements IRetentionRepository.
 */
import type { IRetentionRepository } from "../../domain/interfaces/IRetentionRepository";
import type { IRetentionService } from "../../domain/interfaces/IRetentionService";
import type { RetentionPolicy } from "../../domain/entities/RetentionPolicy";
import type { UpdateRetentionPolicyRequest } from "../../domain/entities/RetentionPolicy";
import type { CreateRetentionPolicyRequest } from "../../data/models/RetentionModels";
import { RetentionMapper } from "../mappers/RetentionMapper";

/**
 * Repository layer implementing client request queries for retention.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export class RetentionRepository implements IRetentionRepository {
  constructor(private readonly service: IRetentionService) {}

  async getAll(): Promise<RetentionPolicy[]> {
    const models = await this.service.getAll();
    return models.map(RetentionMapper.toEntity);
  }

  create(data: CreateRetentionPolicyRequest): Promise<string> {
    return this.service.create(data);
  }

  update(id: string, data: UpdateRetentionPolicyRequest): Promise<void> {
    return this.service.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.service.delete(id);
  }
}
