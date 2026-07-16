/**
* ContactPoint Service
*
* Handles all API calls for ContactPoint.
* Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
*/
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl, PARTYKERNEL_ENDPOINTS } from "@core/config/api-endpoints";
import {
ContactPointModel,
type ContactPointJson,
type ContactPointListResponseJson,
} from "../models/ContactPointModel";
import type {
IContactPointService,
ContactPointListResult,
} from "../../domain/interfaces/IContactPointService";

const BASE_URL = PARTYKERNEL_ENDPOINTS.CONTACT_POINTS.LIST;

export class ContactPointService implements IContactPointService {
constructor(private readonly api: IApiService) {}

async getAll(params: { page: number; pageSize: number; search?: string }): Promise<ContactPointListResult> {
      const url = buildUrl(BASE_URL, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      });

      const response = await this.api.get<ContactPointListResponseJson>(url);

            return {
            items: response.items.map((json) => ContactPointModel.fromJson(json)),
            totalCount: response.totalCount,
            page: response.page,
            pageSize: response.pageSize,
            totalPages: response.totalPages,
            hasNextPage: response.hasNextPage,
            hasPreviousPage: response.hasPreviousPage,
            };
            }

            async getById(id: string): Promise<ContactPointModel> {
                  const json = await this.api.get<ContactPointJson>(`${BASE_URL}/${id}`);
                        return ContactPointModel.fromJson(json);
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