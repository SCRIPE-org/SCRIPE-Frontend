/**
* StaffAvailability Service
*
* Handles all API calls for StaffAvailability.
* Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
*/
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@core/config/api-endpoints";
import {
StaffAvailabilityModel,
type StaffAvailabilityJson,
type StaffAvailabilityListResponseJson,
} from "../models/StaffAvailabilityModel";
import type {
IStaffAvailabilityService,
StaffAvailabilityListResult,
} from "../../domain/interfaces/IStaffAvailabilityService";

const BASE_URL = "/v1/StaffAvailabilities";

export class StaffAvailabilityService implements IStaffAvailabilityService {
constructor(private readonly api: IApiService) {}

async getAll(params: { page: number; pageSize: number; search?: string }): Promise<StaffAvailabilityListResult> {
      const url = buildUrl(BASE_URL, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      });

      const response = await this.api.get<StaffAvailabilityListResponseJson>(url);

            return {
            items: response.items.map((json) => StaffAvailabilityModel.fromJson(json)),
            totalCount: response.totalCount,
            page: response.page,
            pageSize: response.pageSize,
            totalPages: response.totalPages,
            hasNextPage: response.hasNextPage,
            hasPreviousPage: response.hasPreviousPage,
            };
            }

            async getById(id: string): Promise<StaffAvailabilityModel> {
                  const json = await this.api.get<StaffAvailabilityJson>(`${BASE_URL}/${id}`);
                        return StaffAvailabilityModel.fromJson(json);
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