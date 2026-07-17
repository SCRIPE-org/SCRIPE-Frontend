/**
* StaffCompetency Service
*
* Handles all API calls for StaffCompetency.
* Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
*/
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import {
  StaffCompetencyModel,
  type StaffCompetencyJson,
  type StaffCompetencyListResponseJson,
} from "../models/StaffCompetencyModel";
import type {
  IStaffCompetencyService,
  StaffCompetencyListResult,
} from "../../domain/interfaces/IStaffCompetencyService";
import { STAFF_COMPETENCY_ENDPOINTS } from "./staff-competency.endpoints";

export class StaffCompetencyService implements IStaffCompetencyService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: { page: number; pageSize: number; search?: string }): Promise<StaffCompetencyListResult> {
    const url = buildUrl(STAFF_COMPETENCY_ENDPOINTS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
    });

    const response = await this.api.get<StaffCompetencyListResponseJson>(url);

    return {
      items: response.items.map((json) => StaffCompetencyModel.fromJson(json)),
      totalCount: response.totalCount,
      page: response.page,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<StaffCompetencyModel> {
    const json = await this.api.get<StaffCompetencyJson>(STAFF_COMPETENCY_ENDPOINTS.BY_ID(id));
    return StaffCompetencyModel.fromJson(json);
  }

  async create(data: Record<string, unknown>): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(STAFF_COMPETENCY_ENDPOINTS.CREATE, data);
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.api.put(STAFF_COMPETENCY_ENDPOINTS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(STAFF_COMPETENCY_ENDPOINTS.DELETE(id));
  }
}