/**
 * PartyKernel Service
 *
 * Handles all API calls for the PartyKernel module.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import {
  PartyKernelModel,
  type PartyKernelJson,
  type PartyKernelListResponseJson,
} from "../models/PartyKernelModel";
import type {
  IPartyKernelService,
  PartyKernelListResult,
} from "../../domain/interfaces/IPartyKernelService";

const BASE_URL = "/v1/PartyKernel";

export class PartyKernelService implements IPartyKernelService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<PartyKernelListResult> {
    const url = buildUrl(BASE_URL, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
    });

    const response = await this.api.get<PartyKernelListResponseJson>(url);

    return {
      items: response.items.map((json) => PartyKernelModel.fromJson(json)),
      totalCount: response.totalCount,
      page: response.page,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<PartyKernelModel> {
    const json = await this.api.get<PartyKernelJson>(`${BASE_URL}/${id}`);
    return PartyKernelModel.fromJson(json);
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
