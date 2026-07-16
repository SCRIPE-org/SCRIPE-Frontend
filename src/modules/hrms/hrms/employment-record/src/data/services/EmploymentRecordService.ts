/**
* EmploymentRecord Service
*
* Handles all API calls for EmploymentRecord.
* Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
*/
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl, HRMS_ENDPOINTS } from "@core/config/api-endpoints";
import {
EmploymentRecordModel,
type EmploymentRecordJson,
type EmploymentRecordListResponseJson,
} from "../models/EmploymentRecordModel";
import type {
IEmploymentRecordService,
EmploymentRecordListResult,
} from "../../domain/interfaces/IEmploymentRecordService";

const BASE_URL = HRMS_ENDPOINTS.EMPLOYMENT_RECORDS.LIST;

export class EmploymentRecordService implements IEmploymentRecordService {
constructor(private readonly api: IApiService) {}

async getAll(params: { page: number; pageSize: number; search?: string }): Promise<EmploymentRecordListResult> {
      const url = buildUrl(BASE_URL, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      });

      const response = await this.api.get<EmploymentRecordListResponseJson>(url);

            return {
            items: response.items.map((json) => EmploymentRecordModel.fromJson(json)),
            totalCount: response.totalCount,
            page: response.page,
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