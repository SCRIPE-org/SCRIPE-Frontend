/**
 * Party Service
 *
 * Handles all API calls for Party.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { PARTYKERNEL_ENDPOINTS } from "@modules/party-kernel/party-kernel.endpoints";
import { PartyModel, type PartyJson, type PartyListResponseJson } from "../models/PartyModel";
import type { IPartyService, PartyListResult } from "../../domain/interfaces/IPartyService";

const BASE_URL = PARTYKERNEL_ENDPOINTS.PARTIES.LIST;

/**
 * Documentation for module export
 */
export class PartyService implements IPartyService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<PartyListResult> {
    const url = buildUrl(BASE_URL, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
    });

    const response = await this.api.get<PartyListResponseJson>(url);

    return {
      items: response.items.map((json) => PartyModel.fromJson(json)),
      totalCount: response.totalCount,
      page: response.pageNumber,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<PartyModel> {
    const json = await this.api.get<PartyJson>(`${BASE_URL}/${id}`);
    return PartyModel.fromJson(json);
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
