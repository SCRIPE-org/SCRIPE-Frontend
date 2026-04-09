import type { UsersEntity } from "../entities/UsersEntity";

export interface IUsersRepository {
  getAll(params?: Record<string, unknown>): Promise<{ items: UsersEntity[]; totalCount: number }>;
  getById(id: string): Promise<UsersEntity>;
}
