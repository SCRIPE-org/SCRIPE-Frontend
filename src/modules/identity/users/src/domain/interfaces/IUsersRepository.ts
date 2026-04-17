/**
 * IUsersRepository — Domain Interface
 *
 * Repository contract returning domain entities (not DTOs).
 * Used by the presentation layer via DI.
 */

import type { UsersEntity } from "../entities/UsersEntity";
import type { UpdateUserModel } from "../../data/models/UsersModel";

export interface IUsersRepository {
  /** Get paginated list of users */
  getAll(params?: Record<string, unknown>): Promise<{ items: UsersEntity[]; totalCount: number }>;

  /** Get full user detail by ID */
  getById(id: string): Promise<UsersEntity>;

  /** Update user profile */
  update(id: string, data: UpdateUserModel): Promise<void>;

  /** Soft delete user */
  delete(id: string): Promise<void>;

  /** Toggle active status */
  setActive(id: string, isActive: boolean): Promise<void>;

  /** Unlock locked account */
  unlock(id: string): Promise<void>;

  /** Bulk activate selected users */
  bulkActivate(ids: string[]): Promise<number>;

  /** Bulk deactivate selected users */
  bulkDeactivate(ids: string[]): Promise<number>;

  /** Bulk delete selected users */
  bulkDelete(ids: string[]): Promise<number>;
}
