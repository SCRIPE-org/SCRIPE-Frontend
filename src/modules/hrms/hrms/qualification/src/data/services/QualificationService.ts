/**
* Qualification Service
*
* Handles all API calls for Qualification.
* Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
*/
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl, HRMS_ENDPOINTS } from "@core/config/api-endpoints";
import {
QualificationModel,
type QualificationJson,
type QualificationListResponseJson,
} from "../models/QualificationModel";
import type {
IQualificationService,
QualificationListResult,
} from "../../domain/interfaces/IQualificationService";

const BASE_URL = HRMS_ENDPOINTS.QUALIFICATIONS.LIST;

export class QualificationService implements IQualificationService {
constructor(private readonly api: IApiService) {}

async getAll(params: { page: number; pageSize: number; search?: string }): Promise<QualificationListResult> {
      const url = buildUrl(BASE_URL, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      });

      const response = await this.api.get<QualificationListResponseJson>(url);

            return {
            items: response.items.map((json) => QualificationModel.fromJson(json)),
            totalCount: response.totalCount,
            page: response.page,
            pageSize: response.pageSize,
            totalPages: response.totalPages,
            hasNextPage: response.hasNextPage,
            hasPreviousPage: response.hasPreviousPage,
            };
            }

            async getById(id: string): Promise<QualificationModel> {
                  const json = await this.api.get<QualificationJson>(`${BASE_URL}/${id}`);
                        return QualificationModel.fromJson(json);
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