/**
 * Users Service — Data Layer
 *
 * HTTP calls via IApiService using centralized API_ENDPOINTS.
 * Implements all 9 IUsersService methods matching UsersController.
 */

import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { IUsersService } from "../../domain/interfaces/IUsersService";
import type { UsersListModel, UsersDetailModel, UpdateUserModel } from "../models/UsersModel";

export class UsersService implements IUsersService {
  constructor(private readonly api: IApiService) {}

  async getAll(params?: Record<string, unknown>): Promise<{ items: UsersListModel[]; totalCount: number }> {
    const url = buildUrl(API_ENDPOINTS.USERS.LIST, params as Record<string, string>);
    return this.api.get<{ items: UsersListModel[]; totalCount: number }>(url);
  }

  async getById(id: string): Promise<UsersDetailModel> {
    return this.api.get<UsersDetailModel>(API_ENDPOINTS.USERS.BY_ID(id));
  }

  async update(id: string, data: UpdateUserModel): Promise<void> {
    await this.api.put(API_ENDPOINTS.USERS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.USERS.DELETE(id));
  }

  async setActive(id: string, isActive: boolean): Promise<void> {
    await this.api.patch(API_ENDPOINTS.USERS.SET_ACTIVE(id), isActive);
  }

  async unlock(id: string): Promise<void> {
    await this.api.post(API_ENDPOINTS.USERS.UNLOCK(id), {});
  }

  async bulkActivate(ids: string[]): Promise<number> {
    return this.api.post<number>(API_ENDPOINTS.USERS.BULK.ACTIVATE, ids);
  }

  async bulkDeactivate(ids: string[]): Promise<number> {
    return this.api.post<number>(API_ENDPOINTS.USERS.BULK.DEACTIVATE, ids);
  }

  async bulkDelete(ids: string[]): Promise<number> {
    return this.api.post<number>(API_ENDPOINTS.USERS.BULK.DELETE, ids);
  }
}
