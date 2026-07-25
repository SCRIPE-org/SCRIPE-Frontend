/**
 * Hrms Service
 *
 * Handles all API calls for the Hrms module.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { HrmsModel, type HrmsJson, type HrmsListResponseJson } from "../models/HrmsModel";
import type { IHrmsService, HrmsListResult } from "../../domain/interfaces/IHrmsService";
import { HRMS_ENDPOINTS } from "./hrms.endpoints";

export class HrmsService implements IHrmsService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<HrmsListResult> {
    const url = buildUrl(HRMS_ENDPOINTS.LIST, {
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
    const json = await this.api.get<HrmsJson>(HRMS_ENDPOINTS.BY_ID(id));
    return HrmsModel.fromJson(json);
  }

  async create(data: Record<string, unknown>): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(HRMS_ENDPOINTS.CREATE, data);
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.api.put(HRMS_ENDPOINTS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(HRMS_ENDPOINTS.DELETE(id));
  }
}
