/**
* MergeCandidate Service
*
* Handles all API calls for MergeCandidate.
* Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
*/
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl, PARTYKERNEL_ENDPOINTS } from "@core/config/api-endpoints";
import {
MergeCandidateModel,
type MergeCandidateJson,
type MergeCandidateListResponseJson,
} from "../models/MergeCandidateModel";
import type {
IMergeCandidateService,
MergeCandidateListResult,
} from "../../domain/interfaces/IMergeCandidateService";

const BASE_URL = PARTYKERNEL_ENDPOINTS.MERGE_CANDIDATES.LIST;

export class MergeCandidateService implements IMergeCandidateService {
constructor(private readonly api: IApiService) {}

async getAll(params: { page: number; pageSize: number; search?: string }): Promise<MergeCandidateListResult> {
      const url = buildUrl(BASE_URL, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      });

      const response = await this.api.get<MergeCandidateListResponseJson>(url);

            return {
            items: response.items.map((json) => MergeCandidateModel.fromJson(json)),
            totalCount: response.totalCount,
            page: response.page,
            pageSize: response.pageSize,
            totalPages: response.totalPages,
            hasNextPage: response.hasNextPage,
            hasPreviousPage: response.hasPreviousPage,
            };
            }

            async getById(id: string): Promise<MergeCandidateModel> {
                  const json = await this.api.get<MergeCandidateJson>(`${BASE_URL}/${id}`);
                        return MergeCandidateModel.fromJson(json);
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