/**
 * StaffAssignment Service
 *
 * Handles all API calls for StaffAssignment.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import {
  StaffAssignmentModel,
  type StaffAssignmentJson,
  type StaffAssignmentListResponseJson,
} from "../models/StaffAssignmentModel";
import type {
  IStaffAssignmentService,
  StaffAssignmentListResult,
} from "../../domain/interfaces/IStaffAssignmentService";
import { STAFF_ASSIGNMENT_ENDPOINTS } from "./staff-assignment.endpoints";

export class StaffAssignmentService implements IStaffAssignmentService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
  }): Promise<StaffAssignmentListResult> {
    const url = buildUrl(STAFF_ASSIGNMENT_ENDPOINTS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
    });

    const response = await this.api.get<StaffAssignmentListResponseJson>(url);

    return {
      items: response.items.map((json) => StaffAssignmentModel.fromJson(json)),
      totalCount: response.totalCount,
      page: response.pageNumber,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<StaffAssignmentModel> {
    const json = await this.api.get<StaffAssignmentJson>(STAFF_ASSIGNMENT_ENDPOINTS.BY_ID(id));
    return StaffAssignmentModel.fromJson(json);
  }

  async create(data: Record<string, unknown>): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(STAFF_ASSIGNMENT_ENDPOINTS.CREATE, data);
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.api.put(STAFF_ASSIGNMENT_ENDPOINTS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(STAFF_ASSIGNMENT_ENDPOINTS.DELETE(id));
  }
}
