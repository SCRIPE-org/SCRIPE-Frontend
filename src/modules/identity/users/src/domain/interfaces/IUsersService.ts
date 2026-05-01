/**
 * IUsersService — Domain Interface
 *
 * Contract for all HTTP operations on the Users resource.
 * Matches the backend UsersController endpoints 1:1.
 */

import type {
  UsersListModel,
  UsersDetailModel,
  UpdateUserModel,
} from "../../data/models/UsersModel";

export interface IUsersService {
  /** GET /api/v1/Users — paginated list */
  getAll(
    params?: Record<string, unknown>
  ): Promise<{ items: UsersListModel[]; totalCount: number }>;

  /** GET /api/v1/Users/{id} — full detail */
  getById(id: string): Promise<UsersDetailModel>;

  /** PUT /api/v1/Users/{id} — update profile */
  update(id: string, data: UpdateUserModel): Promise<void>;

  /** DELETE /api/v1/Users/{id} — soft delete */
  delete(id: string): Promise<void>;

  /** PATCH /api/v1/Users/{id}/active — toggle active status */
  setActive(id: string, isActive: boolean): Promise<void>;

  /** POST /api/v1/Users/{id}/unlock — unlock locked account */
  unlock(id: string): Promise<void>;

  /** POST /api/v1/Users/bulk/activate — activate selected */
  bulkActivate(ids: string[]): Promise<number>;

  /** POST /api/v1/Users/bulk/deactivate — deactivate selected */
  bulkDeactivate(ids: string[]): Promise<number>;

  /** POST /api/v1/Users/bulk/delete — delete selected */
  bulkDelete(ids: string[]): Promise<number>;
}
