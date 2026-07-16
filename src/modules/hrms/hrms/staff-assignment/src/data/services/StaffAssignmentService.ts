/**
* StaffAssignment Service
*
* Handles all API calls for StaffAssignment.
* Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
*/
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl, HRMS_ENDPOINTS } from "@core/config/api-endpoints";
import {
StaffAssignmentModel,
type StaffAssignmentJson,
type StaffAssignmentListResponseJson,
} from "../models/StaffAssignmentModel";
import type {
IStaffAssignmentService,
StaffAssignmentListResult,
} from "../../domain/interfaces/IStaffAssignmentService";

const BASE_URL = HRMS_ENDPOINTS.STAFF_ASSIGNMENTS.LIST;

export class StaffAssignmentService implements IStaffAssignmentService {
constructor(private readonly api: IApiService) {}

async getAll(params: { page: number; pageSize: number; search?: string }): Promise<StaffAssignmentListResult> {
      const url = buildUrl(BASE_URL, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      });

      const response = await this.api.get<StaffAssignmentListResponseJson>(url);

            return {
            items: response.items.map((json) => StaffAssignmentModel.fromJson(json)),
            totalCount: response.totalCount,
            page: response.page,
            pageSize: response.pageSize,
            totalPages: response.totalPages,
            hasNextPage: response.hasNextPage,
            hasPreviousPage: response.hasPreviousPage,
            };
            }

            async getById(id: string): Promise<StaffAssignmentModel> {
                  const json = await this.api.get<StaffAssignmentJson>(`${BASE_URL}/${id}`);
                        return StaffAssignmentModel.fromJson(json);
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