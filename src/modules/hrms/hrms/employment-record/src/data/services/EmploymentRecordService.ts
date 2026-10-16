/**
 * EmploymentRecord Service
 *
 * Handles all API calls for EmploymentRecord.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { EMPLOYMENT_RECORD_ENDPOINTS } from "./employment-record.endpoints";
import {
  EmploymentRecordModel,
  type EmploymentRecordJson,
  type EmploymentRecordListResponseJson,
} from "../models/EmploymentRecordModel";
import type {
  IEmploymentRecordService,
  EmploymentRecordListResult,
} from "../../domain/interfaces/IEmploymentRecordService";

const BASE_URL = EMPLOYMENT_RECORD_ENDPOINTS.LIST;

/**
 * Documentation for module export
 */
export class EmploymentRecordService implements IEmploymentRecordService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
  }): Promise<EmploymentRecordListResult> {
    const url = buildUrl(BASE_URL, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
    });

    const response = await this.api.get<EmploymentRecordListResponseJson>(url);

    return {
      items: response.items.map((json) => EmploymentRecordModel.fromJson(json)),
      totalCount: response.totalCount,
      page: response.pageNumber,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<EmploymentRecordModel> {
    const json = await this.api.get<EmploymentRecordJson>(`${BASE_URL}/${id}`);
    return EmploymentRecordModel.fromJson(json);
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
