import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import {
  FacilityModel,
  type FacilityJson,
  type FacilityListResponseJson,
} from "../models/FacilityModel";
import type { IFacilityService, FacilityListResult } from "../../domain/interfaces/IFacilityService";
import { FACILITY_ENDPOINTS } from "./facility.endpoints";

export class FacilityService implements IFacilityService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: { page: number; pageSize: number; search?: string }): Promise<FacilityListResult> {
    const url = buildUrl(FACILITY_ENDPOINTS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
    });
    const response = await this.api.get<FacilityListResponseJson>(url);
    return {
      items: response.items.map((json) => FacilityModel.fromJson(json)),
      totalCount: response.totalCount,
      page: response.pageNumber,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<FacilityModel> {
    const json = await this.api.get<FacilityJson>(FACILITY_ENDPOINTS.BY_ID(id));
    return FacilityModel.fromJson(json);
  }

  async create(data: Record<string, unknown>): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(FACILITY_ENDPOINTS.CREATE, data);
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.api.put(FACILITY_ENDPOINTS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(FACILITY_ENDPOINTS.DELETE(id));
  }
}
