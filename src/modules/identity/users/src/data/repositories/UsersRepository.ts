/**
 * Users Repository — Data Layer
 *
 * Wraps service + uses mapper → returns domain entities.
 * Implements all IUsersRepository methods.
 */

import type { IUsersRepository, UpdateUserRequest } from "../../domain/interfaces/IUsersRepository";
import type { IUsersService } from "../../domain/interfaces/IUsersService";
import { UsersMapper } from "../mappers/UsersMapper";
import type { UsersEntity } from "../../domain/entities/UsersEntity";

export class UsersRepository implements IUsersRepository {
  constructor(private readonly service: IUsersService) {}

  async getAll(
    params?: Record<string, unknown>
  ): Promise<{ items: UsersEntity[]; totalCount: number }> {
    const result = await this.service.getAll(params);
    return {
      items: (result.items || []).map(UsersMapper.toEntity),
      totalCount: result.totalCount ?? 0,
    };
  }

  async getById(id: string): Promise<UsersEntity> {
    const result = await this.service.getById(id);
    return UsersMapper.toDetailEntity(result);
  }

  async update(id: string, data: UpdateUserRequest): Promise<void> {
    await this.service.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.service.delete(id);
  }

  async setActive(id: string, isActive: boolean): Promise<void> {
    await this.service.setActive(id, isActive);
  }

  async unlock(id: string): Promise<void> {
    await this.service.unlock(id);
  }

  async bulkActivate(ids: string[]): Promise<number> {
    return this.service.bulkActivate(ids);
  }

  async bulkDeactivate(ids: string[]): Promise<number> {
    return this.service.bulkDeactivate(ids);
  }

  async bulkDelete(ids: string[]): Promise<number> {
    return this.service.bulkDelete(ids);
  }
}
