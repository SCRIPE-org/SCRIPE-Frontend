/**
 * IUsersRepository — Domain Interface
 *
 * Repository contract returning domain entities (not DTOs).
 * Used by the presentation layer via DI.
 */

import type { UsersEntity } from "../entities/UsersEntity";

/**
 * Interface structure detailing the properties and attributes of Update User Request.
 */
export interface UpdateUserRequest {
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  birthDate?: string | null;
  gender?: number | null;
  country?: string | null;
  government?: string | null;
  city?: string | null;
  notes?: string | null;
}

/**
 * Interface defining repository methods for managing Users data access.
 */
export interface IUsersRepository {
  /** Get paginated list of users */
  getAll(params?: Record<string, unknown>): Promise<{ items: UsersEntity[]; totalCount: number }>;

  /** Get full user detail by ID */
  getById(id: string): Promise<UsersEntity>;

  /** Update user profile */
  update(id: string, data: UpdateUserRequest): Promise<void>;

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
