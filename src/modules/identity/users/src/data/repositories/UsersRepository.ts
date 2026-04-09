import type { IUsersRepository } from "../../domain/interfaces/IUsersRepository";
import type { IUsersService } from "../../domain/interfaces/IUsersService";
import { UsersMapper } from "../mappers/UsersMapper";
import { UsersEntity } from "../../domain/entities/UsersEntity";

export class UsersRepository implements IUsersRepository {
  constructor(private readonly service: IUsersService) {}

  async getAll(params?: Record<string, unknown>): Promise<{ items: UsersEntity[]; totalCount: number }> {
    const result = await this.service.getAll(params) as { items?: unknown[]; totalCount?: number; [key: string]: unknown };
    const items = (result.items || []).map((item: unknown) => UsersMapper.toEntity(item as Parameters<typeof UsersMapper.toEntity>[0]));
    return { items, totalCount: result.totalCount ?? items.length };
  }

  async getById(id: string): Promise<UsersEntity> {
    const result = await this.service.getById(id);
    return UsersMapper.toEntity(result as Parameters<typeof UsersMapper.toEntity>[0]);
  }
}
