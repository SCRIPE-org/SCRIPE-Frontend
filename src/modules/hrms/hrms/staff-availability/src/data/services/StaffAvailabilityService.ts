/**
 * StaffAvailability Service
 *
 * Handles all API calls for StaffAvailability.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import {
  StaffAvailabilityModel,
  type StaffAvailabilityJson,
  type StaffAvailabilityListResponseJson,
} from "../models/StaffAvailabilityModel";
import type {
  IStaffAvailabilityService,
  StaffAvailabilityListResult,
} from "../../domain/interfaces/IStaffAvailabilityService";
import { STAFF_AVAILABILITY_ENDPOINTS } from "./staff-availability.endpoints";

/**
 * Documentation for module export
 */
export class StaffAvailabilityService implements IStaffAvailabilityService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
  }): Promise<StaffAvailabilityListResult> {
    const url = buildUrl(STAFF_AVAILABILITY_ENDPOINTS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
    });

    const response = await this.api.get<StaffAvailabilityListResponseJson>(url);

    return {
      items: response.items.map((json) => StaffAvailabilityModel.fromJson(json)),
      totalCount: response.totalCount,
      page: response.pageNumber,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<StaffAvailabilityModel> {
    const json = await this.api.get<StaffAvailabilityJson>(STAFF_AVAILABILITY_ENDPOINTS.BY_ID(id));
    return StaffAvailabilityModel.fromJson(json);
  }

  async create(data: Record<string, unknown>): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(STAFF_AVAILABILITY_ENDPOINTS.CREATE, data);
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.api.put(STAFF_AVAILABILITY_ENDPOINTS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(STAFF_AVAILABILITY_ENDPOINTS.DELETE(id));
  }
}
