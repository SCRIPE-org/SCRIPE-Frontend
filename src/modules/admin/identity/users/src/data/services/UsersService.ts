/**
 * Users Service — Data Layer
 *
 * HTTP calls via IApiService using local USERS_ENDPOINTS.
 * Implements all 9 IUsersService methods matching UsersController.
 */

import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IUsersService } from "../../domain/interfaces/IUsersService";
import type { UsersListModel, UsersDetailModel } from "../models/UsersModel";
import type { UpdateUserRequest } from "../../domain/interfaces/IUsersRepository";
import { USERS_ENDPOINTS } from "./users.endpoints";

/**
 * Http API network service for users.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class UsersService implements IUsersService {
  constructor(private readonly api: IApiService) {}

  async getAll(
    params?: Record<string, unknown>
  ): Promise<{ items: UsersListModel[]; totalCount: number }> {
    const url = buildUrl(USERS_ENDPOINTS.LIST, params as Record<string, string>);
    return this.api.get<{ items: UsersListModel[]; totalCount: number }>(url);
  }

  async getById(id: string): Promise<UsersDetailModel> {
    return this.api.get<UsersDetailModel>(USERS_ENDPOINTS.BY_ID(id));
  }

  async update(id: string, data: UpdateUserRequest): Promise<void> {
    await this.api.put(USERS_ENDPOINTS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(USERS_ENDPOINTS.DELETE(id));
  }

  async setActive(id: string, isActive: boolean): Promise<void> {
    await this.api.patch(USERS_ENDPOINTS.SET_ACTIVE(id), isActive);
  }

  async unlock(id: string): Promise<void> {
    await this.api.post(USERS_ENDPOINTS.UNLOCK(id), {});
  }

  async bulkActivate(ids: string[]): Promise<number> {
    return this.api.post<number>(USERS_ENDPOINTS.BULK.ACTIVATE, ids);
  }

  async bulkDeactivate(ids: string[]): Promise<number> {
    return this.api.post<number>(USERS_ENDPOINTS.BULK.DEACTIVATE, ids);
  }

  async bulkDelete(ids: string[]): Promise<number> {
    return this.api.post<number>(USERS_ENDPOINTS.BULK.DELETE, ids);
  }
}
