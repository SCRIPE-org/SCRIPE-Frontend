/**
 * Hrms Service
 *
 * Handles all API calls for the Hrms module.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@core/config/api-endpoints";
import {
  HrmsModel,
  type HrmsJson,
  type HrmsListResponseJson,
} from "../models/HrmsModel";
import type {
  IHrmsService,
  HrmsListResult,
} from "../../domain/interfaces/IHrmsService";

const BASE_URL = "/v1/Hrms";

export class HrmsService implements IHrmsService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: { page: number; pageSize: number; search?: string }): Promise<HrmsListResult> {
    const url = buildUrl(BASE_URL, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
    });

    const response = await this.api.get<HrmsListResponseJson>(url);

    return {
      items: response.items.map((json) => HrmsModel.fromJson(json)),
      totalCount: response.totalCount,
      page: response.page,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<HrmsModel> {
    const json = await this.api.get<HrmsJson>(`${BASE_URL}/${id}`);
    return HrmsModel.fromJson(json);
  }

  async create(data: Record<string, unknown>): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(BASE_URL, data);
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.api.put(`${BASE_URL}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`${BASE_URL}/${id}`);
  }
}
