/**
 * Identity Provider Repository Implementation
 *
 * Implements IIdentityProviderRepository using IdentityProviderService.
 * Uses IdentityProviderMapper to convert between Models (DTOs) and Entities.
 *
 * @module identity-providers/data
 */
import type { IIdentityProviderRepository } from "../../domain/interfaces/IIdentityProviderRepository";
import type { IIdentityProviderService } from "../../domain/interfaces/IIdentityProviderService";
import type {
  IdentityProvider,
  IdentityProviderListItem,
  TestConnectionResult,
  CreateIdentityProviderRequest,
  UpdateIdentityProviderRequest,
} from "../../domain/entities/IdentityProvider";
import { IdentityProviderMapper } from "../mappers/IdentityProviderMapper";

/**
 * Repository implementation for managing database operations on IdentityProvider resources.
 */
export class IdentityProviderRepository implements IIdentityProviderRepository {
  constructor(private readonly service: IIdentityProviderService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<{ items: IdentityProviderListItem[]; totalCount: number }> {
    const result = await this.service.getAll(params);
    return {
      items: result.items.map((json) => IdentityProviderMapper.fromListItemJsonToEntity(json)),
      totalCount: result.totalCount,
    };
  }

  async getById(id: string): Promise<IdentityProvider> {
    const json = await this.service.getById(id);
    return IdentityProviderMapper.fromJsonToEntity(json);
  }

  async create(data: CreateIdentityProviderRequest): Promise<{ id: string }> {
    const createJson = IdentityProviderMapper.toCreateJson(data);
    return this.service.create(createJson);
  }

  async update(id: string, data: UpdateIdentityProviderRequest): Promise<void> {
    const updateJson = IdentityProviderMapper.toUpdateJson(data);
    await this.service.update(id, updateJson);
  }

  async remove(id: string): Promise<void> {
    await this.service.remove(id);
  }

  async testConnection(id: string): Promise<TestConnectionResult> {
    const json = await this.service.testConnection(id);
    return IdentityProviderMapper.toTestResultEntity(json);
  }
}
