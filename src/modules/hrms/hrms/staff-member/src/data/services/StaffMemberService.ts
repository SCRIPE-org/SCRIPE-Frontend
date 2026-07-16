/**
* StaffMember Service
*
* Handles all API calls for StaffMember.
* Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
*/
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl, HRMS_ENDPOINTS } from "@core/config/api-endpoints";
import {
StaffMemberModel,
type StaffMemberJson,
type StaffMemberListResponseJson,
} from "../models/StaffMemberModel";
import type {
IStaffMemberService,
StaffMemberListResult,
} from "../../domain/interfaces/IStaffMemberService";

const BASE_URL = HRMS_ENDPOINTS.STAFF_MEMBERS.LIST;

export class StaffMemberService implements IStaffMemberService {
constructor(private readonly api: IApiService) {}

async getAll(params: { page: number; pageSize: number; search?: string }): Promise<StaffMemberListResult> {
      const url = buildUrl(BASE_URL, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      });

      const response = await this.api.get<StaffMemberListResponseJson>(url);

            return {
            items: response.items.map((json) => StaffMemberModel.fromJson(json)),
            totalCount: response.totalCount,
            page: response.page,
            pageSize: response.pageSize,
            totalPages: response.totalPages,
            hasNextPage: response.hasNextPage,
            hasPreviousPage: response.hasPreviousPage,
            };
            }

            async getById(id: string): Promise<StaffMemberModel> {
                  const json = await this.api.get<StaffMemberJson>(`${BASE_URL}/${id}`);
                        return StaffMemberModel.fromJson(json);
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